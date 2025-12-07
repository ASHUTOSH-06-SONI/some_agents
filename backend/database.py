from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from datetime import datetime
import os

DATABASE_URL = "sqlite+aiosqlite:///./warranty.db"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    model = Column(String)
    imei = Column(String, unique=True, index=True)
    
    warranty = relationship("Warranty", back_populates="product", uselist=False)
    service_requests = relationship("ServiceRequest", back_populates="product")

class Warranty(Base):
    __tablename__ = "warranties"
    id = Column(Integer, primary_key=True, index=True)
    product_imei = Column(String, ForeignKey("products.imei"), unique=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    terms = Column(Text)
    
    product = relationship("Product", back_populates="warranty")

class ServiceRequest(Base):
    __tablename__ = "service_requests"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True) # Simplified for demo
    product_imei = Column(String, ForeignKey("products.imei"))
    issue_description = Column(Text)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="service_requests")
    logistics_orders = relationship("LogisticsOrder", back_populates="request")
    repairs = relationship("Repair", back_populates="request")

class LogisticsOrder(Base):
    __tablename__ = "logistics_orders"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"))
    type = Column(String) # PICKUP, DELIVERY
    status = Column(String, default="SCHEDULED") # SCHEDULED, IN_TRANSIT, COMPLETED
    agent_id = Column(String, nullable=True)
    
    request = relationship("ServiceRequest", back_populates="logistics_orders")

class Repair(Base):
    __tablename__ = "repairs"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"))
    technician_id = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, COMPLETED
    notes = Column(Text, nullable=True)
    
    request = relationship("ServiceRequest", back_populates="repairs")

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
