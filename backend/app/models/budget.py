from sqlalchemy import Column, Boolean, DateTime, Integer, Numeric, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class Budget(Base):
    __tablename__ = "budgets"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    
    # Budget Period
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    # Financial Data
    limit_amount = Column(Numeric(15, 2), nullable=False)
    
    # Alert Settings
    alert_percentage_1 = Column(Integer, default=80, nullable=False)
    alert_percentage_2 = Column(Integer, default=95, nullable=False)
    alerts_enabled = Column(Boolean, default=True, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
    
    # Table constraints
    __table_args__ = (
        # Unique constraint
        UniqueConstraint('user_id', 'category_id', 'year', 'month', name='uix_user_category_period'),
        
        # Check constraints
        CheckConstraint('limit_amount > 0', name='ck_budgets_positive_limit'),
        CheckConstraint('month >= 1 AND month <= 12', name='ck_budgets_valid_month'),
        CheckConstraint('year >= 2020 AND year <= 2030', name='ck_budgets_valid_year'),
        CheckConstraint('alert_percentage_1 >= 1 AND alert_percentage_1 <= 100', name='ck_budgets_valid_alert1'),
        CheckConstraint('alert_percentage_2 >= 1 AND alert_percentage_2 <= 100', name='ck_budgets_valid_alert2'),
        CheckConstraint('alert_percentage_2 > alert_percentage_1', name='ck_budgets_alert2_greater'),
    )
    
    @property
    def period_display(self) -> str:
        """Retorna período no formato 'Janeiro/2025'"""
        months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return f"{months[self.month]}/{self.year}"
    
    def __repr__(self):
        return f"<Budget(category_id='{self.category_id}', period='{self.period_display}', limit={self.limit_amount})>"
