from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, case
from decimal import Decimal

from app.models.goal import Goal, GoalContribution, GoalMilestone
from app.models.user import User
from app.models.category import Category
from app.schemas.goal import (
    GoalCreate, GoalUpdate, GoalResponse, GoalWithDetails, GoalSummary,
    ContributionCreate, ContributionResponse, GoalStatus
)


class GoalService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_goals_by_user(
        self, 
        user_id: UUID, 
        status: Optional[GoalStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[GoalResponse]:
        query = self.db.query(Goal).filter(Goal.user_id == user_id)
        
        if status:
            query = query.filter(Goal.status == status)
        
        goals = query.offset(skip).limit(limit).all()
        return [self._to_response(goal) for goal in goals]
    
    def get_goal_by_id(self, goal_id: UUID, user_id: UUID) -> Optional[GoalWithDetails]:
        goal = self.db.query(Goal).options(
            joinedload(Goal.contributions),
            joinedload(Goal.milestones),
            joinedload(Goal.category)
        ).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return None
        
        return self._to_detailed_response(goal)
    
    def create_goal(self, goal_data: GoalCreate, user_id: UUID) -> GoalResponse:
        # Check for duplicate goal name
        existing = self.db.query(Goal).filter(
            and_(
                Goal.user_id == user_id,
                Goal.name == goal_data.name,
                Goal.status.in_(['DRAFT', 'IN_PROGRESS', 'PAUSED'])
            )
        ).first()
        
        if existing:
            raise ValueError(f"Goal with name '{goal_data.name}' already exists")
        
        # Validate category belongs to user if provided
        if goal_data.category_id:
            category = self.db.query(Category).filter(
                and_(
                    Category.id == goal_data.category_id,
                    Category.user_id == user_id
                )
            ).first()
            
            if not category:
                raise ValueError("Invalid category")
        
        # Create goal
        db_goal = Goal(
            user_id=user_id,
            **goal_data.model_dump()
        )
        
        self.db.add(db_goal)
        self.db.commit()
        self.db.refresh(db_goal)
        
        # Create default milestones
        self._create_default_milestones(db_goal.id)
        
        return self._to_response(db_goal)
    
    def update_goal(self, goal_id: UUID, goal_data: GoalUpdate, user_id: UUID) -> Optional[GoalResponse]:
        goal = self.db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return None
        
        # Validate status transitions
        if goal_data.status and goal_data.status != goal.status:
            if not self._is_valid_status_transition(goal.status, goal_data.status):
                raise ValueError(f"Invalid status transition from {goal.status} to {goal_data.status}")
        
        # Update fields
        update_data = goal_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(goal, field, value)
        
        # Set pause/resume timestamps
        if goal_data.status == GoalStatus.PAUSED and goal.status != GoalStatus.PAUSED:
            goal.paused_at = datetime.now()
        elif goal.status == GoalStatus.PAUSED and goal_data.status == GoalStatus.IN_PROGRESS:
            goal.paused_at = None
        
        goal.updated_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(goal)
        
        return self._to_response(goal)
    
    def delete_goal(self, goal_id: UUID, user_id: UUID) -> bool:
        goal = self.db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return False
        
        self.db.delete(goal)
        self.db.commit()
        
        return True
    
    def add_contribution(self, contribution_data: ContributionCreate, user_id: UUID) -> ContributionResponse:
        # Validate goal belongs to user
        goal = self.db.query(Goal).filter(
            and_(
                Goal.id == contribution_data.goal_id,
                Goal.user_id == user_id
            )
        ).first()
        
        if not goal:
            raise ValueError("Goal not found")
        
        if goal.status not in [GoalStatus.IN_PROGRESS, GoalStatus.DRAFT]:
            raise ValueError("Cannot add contributions to inactive goals")
        
        # Create contribution
        db_contribution = GoalContribution(
            created_by=user_id,
            **contribution_data.model_dump()
        )
        
        self.db.add(db_contribution)
        self.db.commit()
        self.db.refresh(db_contribution)
        
        return ContributionResponse.model_validate(db_contribution)
    
    def get_goal_summary(self, user_id: UUID) -> GoalSummary:
        # Base query for user's goals
        base_query = self.db.query(Goal).filter(Goal.user_id == user_id)
        
        # Count totals
        total_goals = base_query.count()
        active_goals = base_query.filter(Goal.status == GoalStatus.IN_PROGRESS).count()
        completed_goals = base_query.filter(Goal.status == GoalStatus.COMPLETED).count()
        
        # Sum amounts
        totals = base_query.with_entities(
            func.sum(Goal.current_amount).label('total_saved'),
            func.sum(Goal.target_amount).label('total_target')
        ).first()
        
        total_saved = totals.total_saved or Decimal(0)
        total_target = totals.total_target or Decimal(0)
        
        # Calculate overall progress
        overall_progress = 0
        if total_target > 0:
            overall_progress = float(total_saved / total_target * 100)
        
        # Count goals by pace (simplified calculation)
        active_goals_list = base_query.filter(Goal.status == GoalStatus.IN_PROGRESS).all()
        goals_on_track = sum(1 for goal in active_goals_list if goal.progress_percentage >= 50)
        goals_behind = sum(1 for goal in active_goals_list if goal.progress_percentage < 30)
        goals_ahead = sum(1 for goal in active_goals_list if goal.progress_percentage >= 80)
        
        return GoalSummary(
            total_goals=total_goals,
            active_goals=active_goals,
            completed_goals=completed_goals,
            total_saved=total_saved,
            total_target=total_target,
            overall_progress=overall_progress,
            goals_on_track=goals_on_track,
            goals_behind=goals_behind,
            goals_ahead=goals_ahead
        )
    
    def get_upcoming_deadlines(self, user_id: UUID, days: int = 30) -> List[GoalResponse]:
        cutoff_date = date.today() + timedelta(days=days)
        
        goals = self.db.query(Goal).filter(
            and_(
                Goal.user_id == user_id,
                Goal.status == GoalStatus.IN_PROGRESS,
                Goal.deadline <= cutoff_date
            )
        ).order_by(Goal.deadline).all()
        
        return [self._to_response(goal) for goal in goals]
    
    def _create_default_milestones(self, goal_id: UUID):
        """Create default milestones for a new goal"""
        default_milestones = [
            (25, "Um Quarto do Caminho!", "Você está progredindo bem!"),
            (50, "Metade Alcançada!", "Estamos na metade da jornada!"),
            (75, "Quase Lá!", "Falta pouco para conquistar sua meta!"),
            (100, "Meta Conquistada!", "Parabéns! Você conseguiu!")
        ]
        
        for percentage, title, description in default_milestones:
            milestone = GoalMilestone(
                goal_id=goal_id,
                percentage=percentage,
                title=title,
                description=description
            )
            self.db.add(milestone)
        
        self.db.commit()
    
    def _is_valid_status_transition(self, current: str, new: str) -> bool:
        """Validate status transitions"""
        valid_transitions = {
            GoalStatus.DRAFT: [GoalStatus.IN_PROGRESS, GoalStatus.CANCELLED],
            GoalStatus.IN_PROGRESS: [GoalStatus.PAUSED, GoalStatus.COMPLETED, GoalStatus.CANCELLED],
            GoalStatus.PAUSED: [GoalStatus.IN_PROGRESS, GoalStatus.CANCELLED],
            GoalStatus.COMPLETED: [],  # Terminal state
            GoalStatus.CANCELLED: [],  # Terminal state
            GoalStatus.OVERDUE: [GoalStatus.IN_PROGRESS, GoalStatus.CANCELLED]
        }
        
        return new in valid_transitions.get(current, [])
    
    def _to_response(self, goal: Goal) -> GoalResponse:
        """Convert Goal model to response schema"""
        return GoalResponse.model_validate(goal)
    
    def _to_detailed_response(self, goal: Goal) -> GoalWithDetails:
        """Convert Goal model to detailed response with related data"""
        response_data = goal.__dict__.copy()
        
        # Add computed properties
        response_data['progress_percentage'] = goal.progress_percentage
        response_data['days_remaining'] = goal.days_remaining
        response_data['monthly_contribution_needed'] = goal.monthly_contribution_needed
        
        # Add category info if exists
        if goal.category:
            response_data['category_name'] = goal.category.name
            response_data['category_color'] = goal.category.color
            response_data['category_icon'] = goal.category.icon
        
        # Add contributions and milestones
        response_data['contributions'] = [
            ContributionResponse.model_validate(contrib) for contrib in goal.contributions
        ]
        response_data['milestones'] = goal.milestones
        
        return GoalWithDetails.model_validate(response_data)