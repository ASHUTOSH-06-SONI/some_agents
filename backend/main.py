from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.database import get_db, ServiceRequest, LogisticsOrder, Repair, Product, Warranty
import backend.schemas as schemas
from langchain_core.messages import HumanMessage

app = FastAPI(title="Warranty Service System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/request", response_model=schemas.ServiceRequestResponse)
async def create_service_request(request: schemas.ServiceRequestCreate, db: AsyncSession = Depends(get_db)):
    # 1. Validate Product & Warranty (Simple check here, Agent will do deep dive)
    result = await db.execute(select(Product).where(Product.imei == request.product_imei))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Create Request
    db_request = ServiceRequest(
        customer_id=request.customer_id,
        product_imei=request.product_imei,
        issue_description=request.issue_description,
        status="PENDING"
    )
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    
    # Trigger Initial Agent Workflow
    from backend.agents import app_graph_init
    initial_state = {
        "messages": [HumanMessage(content=f"New request for IMEI {request.product_imei}: {request.issue_description}")],
        "request_id": db_request.id,
        "imei": request.product_imei,
        "issue_description": request.issue_description,
        "status": "PENDING",
        "warranty_valid": False, 
        "repair_notes": ""
    }
    
    # Run the graph
    await app_graph_init.ainvoke(initial_state)
    
    return db_request

@app.get("/api/request/{request_id}", response_model=schemas.ServiceRequestResponse)
async def get_service_request(request_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == request_id))
    request = result.scalars().first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@app.post("/api/delivery/update")
async def update_logistics(update: schemas.LogisticsUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LogisticsOrder).where(LogisticsOrder.request_id == update.request_id))
    orders = result.scalars().all()
    if not orders:
        raise HTTPException(status_code=404, detail="Logistics Order not found for this request")
    
    order = orders[-1] 
    order.status = update.status
    if update.agent_id:
        order.agent_id = update.agent_id
        
    await db.commit()
    
    # Trigger Next Step if Pickup Completed
    if update.status == "COMPLETED" and order.type == "PICKUP":
        from backend.agents import app_graph_repair
        state = {
            "messages": [HumanMessage(content="Pickup completed. Initiating repair.")],
            "request_id": update.request_id,
            "imei": "", # Not needed for this step
            "issue_description": "",
            "status": "PICKUP_COMPLETED",
            "warranty_valid": True,
            "repair_notes": ""
        }
        await app_graph_repair.ainvoke(state)

    return {"status": "updated", "order_id": order.id}

@app.post("/api/repair/update")
async def update_repair(update: schemas.RepairUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repair).where(Repair.request_id == update.request_id))
    repairs = result.scalars().all()
    if not repairs:
        raise HTTPException(status_code=404, detail="Repair Order not found")
        
    repair = repairs[-1]
    repair.status = update.status
    if update.technician_id:
        repair.technician_id = update.technician_id
    if update.notes:
        repair.notes = update.notes
        
    await db.commit()
    
    # Trigger Next Step if Repair Completed
    if update.status == "COMPLETED":
        from backend.agents import app_graph_return
        state = {
            "messages": [HumanMessage(content="Repair completed. Initiating return.")],
            "request_id": update.request_id,
            "imei": "",
            "issue_description": "",
            "status": "REPAIR_COMPLETED",
            "warranty_valid": True,
            "repair_notes": repair.notes or ""
        }
        await app_graph_return.ainvoke(state)

    return {"status": "updated", "repair_id": repair.id}

@app.get("/")
async def root():
    return {"message": "Warranty Service System API is running"}
