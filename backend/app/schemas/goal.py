from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from enum import Enum


class GoalStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    OVERDUE = "OVERDUE"


class ContributionType(str, Enum):
    MANUAL = "MANUAL"
    AUTOMATIC = "AUTOMATIC"
    TRANSACTION = "TRANSACTION"
    RECURRING = "RECURRING"


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    target_amount: Decimal = Field(..., gt=0, decimal_places=2)
    deadline: date
    category_id: Optional[UUID] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    priority: int = Field(default=1, ge=1, le=5)
    is_recurring: bool = False
    recurrence_day: Optional[int] = Field(None, ge=1, le=31)
    
    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v):
        if v <= date.today():
            raise ValueError('Deadline must be in the future')
        return v
    
    @field_validator('recurrence_day')
    @classmethod
    def validate_recurrence_day(cls, v, values):
        if 'is_recurring' in values and values['is_recurring'] and v is None:
            raise ValueError('Recurrence day is required when is_recurring is True')
        return v


class GoalCreate(GoalBase):
    status: GoalStatus = GoalStatus.DRAFT


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    target_amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    deadline: Optional[date] = None
    category_id: Optional[UUID] = None
    status: Optional[GoalStatus] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    priority: Optional[int] = Field(None, ge=1, le=5)
    is_recurring: Optional[bool] = None
    recurrence_day: Optional[int] = Field(None, ge=1, le=31)


class GoalResponse(GoalBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    current_amount: Decimal = 0
    status: GoalStatus
    created_at: datetime
    updated_at: datetime
    achieved_at: Optional[datetime] = None
    paused_at: Optional[datetime] = None
    progress_percentage: float = Field(default=0)
    days_remaining: int = Field(default=0)
    monthly_contribution_needed: float = Field(default=0)


class ContributionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    type: ContributionType = ContributionType.MANUAL
    description: Optional[str] = None
    contribution_date: date = Field(default_factory=date.today)
    is_recurring: bool = False
    transaction_id: Optional[UUID] = None


class ContributionCreate(ContributionBase):
    goal_id: UUID


class ContributionResponse(ContributionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    goal_id: UUID
    created_by: UUID
    created_at: datetime


class MilestoneBase(BaseModel):
    percentage: int = Field(..., ge=1, le=100)
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    reward_type: Optional[str] = Field(None, max_length=20)


class MilestoneCreate(MilestoneBase):
    goal_id: UUID


class MilestoneResponse(MilestoneBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    goal_id: UUID
    achieved: bool = False
    achieved_at: Optional[datetime] = None
    created_at: datetime


class GoalWithDetails(GoalResponse):
    contributions: List[ContributionResponse] = []
    milestones: List[MilestoneResponse] = []
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    category_icon: Optional[str] = None


class GoalSummary(BaseModel):
    total_goals: int = 0
    active_goals: int = 0
    completed_goals: int = 0
    total_saved: Decimal = Decimal(0)
    total_target: Decimal = Decimal(0)
    overall_progress: float = 0
    goals_on_track: int = 0
    goals_behind: int = 0
    goals_ahead: int = 0