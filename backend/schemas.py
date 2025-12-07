from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    model: str
    imei: str

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

class ServiceRequestCreate(BaseModel):
    customer_id: str
    product_imei: str
    issue_description: str

class ServiceRequestResponse(ServiceRequestCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class LogisticsUpdate(BaseModel):
    request_id: int
    status: str # SCHEDULED, IN_TRANSIT, COMPLETED
    agent_id: Optional[str] = None

class RepairUpdate(BaseModel):
    request_id: int
    status: str # PENDING, IN_PROGRESS, COMPLETED
    technician_id: Optional[str] = None
    notes: Optional[str] = None
