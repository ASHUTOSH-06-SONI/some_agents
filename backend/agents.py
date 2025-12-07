from typing import TypedDict, Annotated, List, Union, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from backend.database import AsyncSessionLocal, Product, Warranty, ServiceRequest, LogisticsOrder, Repair
from sqlalchemy.future import select
from sqlalchemy import update
import json
import asyncio

# --- State Definition ---
class AgentState(TypedDict):
    messages: List[BaseMessage]
    request_id: int
    imei: str
    issue_description: str
    status: str 
    warranty_valid: bool
    repair_notes: str

# --- Helpers ---
async def update_request_status(request_id: int, status: str):
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(ServiceRequest)
            .where(ServiceRequest.id == request_id)
            .values(status=status)
        )
        await session.commit()

async def check_warranty(imei: str) -> Dict[str, Any]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Warranty).where(Warranty.product_imei == imei))
        warranty = result.scalars().first()
        if not warranty:
            return {"valid": False, "reason": "No warranty found"}
        
        from datetime import datetime
        if warranty.end_date < datetime.utcnow():
            return {"valid": False, "reason": "Warranty expired"}
            
        return {"valid": True, "terms": warranty.terms}

async def create_logistics_order(request_id: int, type: str) -> int:
    async with AsyncSessionLocal() as session:
        order = LogisticsOrder(request_id=request_id, type=type, status="SCHEDULED")
        session.add(order)
        await session.commit()
        await session.refresh(order)
        return order.id

async def create_repair_order(request_id: int) -> int:
    async with AsyncSessionLocal() as session:
        repair = Repair(request_id=request_id, status="PENDING")
        session.add(repair)
        await session.commit()
        await session.refresh(repair)
        return repair.id

# --- Nodes ---

async def service_agent_node(state: AgentState):
    print(f"--- Service Agent Processing Request {state.get('request_id')} ---")
    imei = state['imei']
    
    # 1. Validate Warranty
    warranty_info = await check_warranty(imei)
    
    if warranty_info['valid']:
        print(f"Warranty Valid: {warranty_info['terms']}")
        await update_request_status(state['request_id'], "APPROVED")
        return {
            "warranty_valid": True, 
            "status": "APPROVED",
            "messages": [AIMessage(content="Warranty approved. Proceeding to logistics.")]
        }
    else:
        print(f"Warranty Invalid: {warranty_info['reason']}")
        await update_request_status(state['request_id'], "REJECTED")
        return {
            "warranty_valid": False, 
            "status": "REJECTED",
            "messages": [AIMessage(content=f"Warranty rejected: {warranty_info['reason']}")]
        }

async def logistics_pickup_node(state: AgentState):
    print("--- Logistics Agent: Scheduling Pickup ---")
    await create_logistics_order(state['request_id'], "PICKUP")
    await update_request_status(state['request_id'], "PICKUP_SCHEDULED")
    return {
        "status": "PICKUP_SCHEDULED",
        "messages": [AIMessage(content="Pickup scheduled.")]
    }

async def repair_node(state: AgentState):
    print("--- Repair Agent: Processing Repair ---")
    await create_repair_order(state['request_id'])
    await update_request_status(state['request_id'], "REPAIR_INITIATED")
    return {
        "status": "REPAIR_INITIATED",
        "messages": [AIMessage(content="Repair order created.")]
    }

async def logistics_return_node(state: AgentState):
    print("--- Logistics Agent: Scheduling Return ---")
    await create_logistics_order(state['request_id'], "DELIVERY")
    await update_request_status(state['request_id'], "RETURN_SCHEDULED")
    return {
        "status": "RETURN_SCHEDULED",
        "messages": [AIMessage(content="Return delivery scheduled.")]
    }

# --- Workflows ---

# 1. Initial Request Workflow
workflow_init = StateGraph(AgentState)
workflow_init.add_node("service_agent", service_agent_node)
workflow_init.add_node("logistics_pickup", logistics_pickup_node)
workflow_init.set_entry_point("service_agent")

def route_service(state: AgentState):
    if state['warranty_valid']:
        return "logistics_pickup"
    return END

workflow_init.add_conditional_edges("service_agent", route_service)
workflow_init.add_edge("logistics_pickup", END)
app_graph_init = workflow_init.compile()

# 2. Repair Workflow (Triggered after Pickup)
workflow_repair = StateGraph(AgentState)
workflow_repair.add_node("repair_agent", repair_node)
workflow_repair.set_entry_point("repair_agent")
workflow_repair.add_edge("repair_agent", END)
app_graph_repair = workflow_repair.compile()

# 3. Return Workflow (Triggered after Repair)
workflow_return = StateGraph(AgentState)
workflow_return.add_node("logistics_return", logistics_return_node)
workflow_return.set_entry_point("logistics_return")
workflow_return.add_edge("logistics_return", END)
app_graph_return = workflow_return.compile()
