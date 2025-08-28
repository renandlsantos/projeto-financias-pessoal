from sqlalchemy import Column, String, Numeric, Date, Boolean, Integer, ForeignKey, CheckConstraint, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), nullable=False, default=0)
    deadline = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="DRAFT")
    
    color = Column(String(7), nullable=True)
    icon = Column(String(50), nullable=True)
    priority = Column(Integer, default=1)
    is_recurring = Column(Boolean, default=False)
    recurrence_day = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    achieved_at = Column(DateTime(timezone=True), nullable=True)
    paused_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    category = relationship("Category", back_populates="goals")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete-orphan")
    milestones = relationship("GoalMilestone", back_populates="goal", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('target_amount > 0', name='check_positive_target'),
        CheckConstraint('current_amount >= 0', name='check_non_negative_current'),
        CheckConstraint("status IN ('DRAFT', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'OVERDUE')", name='valid_status'),
        CheckConstraint('priority BETWEEN 1 AND 5', name='valid_priority'),
        CheckConstraint('recurrence_day BETWEEN 1 AND 31', name='valid_recurrence_day'),
    )
    
    @property
    def progress_percentage(self) -> float:
        if self.target_amount and self.target_amount > 0:
            return min(float(self.current_amount / self.target_amount * 100), 100)
        return 0
    
    @property
    def days_remaining(self) -> int:
        if self.deadline:
            delta = self.deadline - datetime.now().date()
            return max(delta.days, 0)
        return 0
    
    @property
    def monthly_contribution_needed(self) -> float:
        if self.deadline and self.current_amount < self.target_amount:
            from dateutil.relativedelta import relativedelta
            months_remaining = relativedelta(self.deadline, datetime.now().date()).months
            if months_remaining > 0:
                return float((self.target_amount - self.current_amount) / months_remaining)
        return 0


class GoalContribution(Base):
    __tablename__ = "goal_contributions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(20), nullable=False, default="MANUAL")
    description = Column(String, nullable=True)
    contribution_date = Column(Date, nullable=False, default=datetime.now().date)
    is_recurring = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    goal = relationship("Goal", back_populates="contributions")
    transaction = relationship("Transaction", back_populates="goal_contribution")
    creator = relationship("User")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('amount > 0', name='check_positive_amount'),
        CheckConstraint("type IN ('MANUAL', 'AUTOMATIC', 'TRANSACTION', 'RECURRING')", name='valid_contribution_type'),
    )


class GoalMilestone(Base):
    __tablename__ = "goal_milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    
    percentage = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    reward_type = Column(String(20), nullable=True)
    achieved = Column(Boolean, default=False)
    achieved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    goal = relationship("Goal", back_populates="milestones")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('percentage BETWEEN 1 AND 100', name='valid_percentage'),
    )