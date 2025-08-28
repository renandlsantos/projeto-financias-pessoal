from sqlalchemy import Column, String, Boolean, DateTime, DECIMAL, ForeignKey, Integer, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"))
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    type = Column(String(20), nullable=False)
    amount = Column(DECIMAL(12,2), nullable=False)
    description = Column(Text)
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_id = Column(UUID(as_uuid=True))
    installment_number = Column(Integer)
    total_installments = Column(Integer)
    tags = Column(ARRAY(String))
    notes = Column(Text)
    attachments = Column(String)  # JSONB pode ser tratado depois
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relacionamentos
    category = relationship("Category", back_populates="transactions")
    goal_contribution = relationship("GoalContribution", back_populates="transaction", uselist=False)
