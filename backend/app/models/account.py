from sqlalchemy import Column, String, Boolean, DateTime, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Account(Base):
    __tablename__ = "accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    bank = Column(String(100))
    agency = Column(String(10))
    account_number = Column(String(20))
    initial_balance = Column(DECIMAL(12,2), default=0)
    current_balance = Column(DECIMAL(12,2), default=0)
    currency = Column(String(3), default="BRL")
    color = Column(String(7))
    icon = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
