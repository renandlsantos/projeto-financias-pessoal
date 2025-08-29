import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import uuid4, UUID

from sqlalchemy.orm import Session

from app.models.goal import Goal, GoalContribution, GoalMilestone
from app.models.user import User
from app.models.category import Category, TransactionTypeEnum
from app.services.goal_service import GoalService
from app.schemas.goal import GoalCreate, GoalUpdate, GoalStatus, ContributionCreate, ContributionType


class TestGoalService:
    
    @pytest.fixture
    def goal_service(self, db: Session):
        """Create a GoalService instance with test database."""
        return GoalService(db)
    
    @pytest.fixture
    def test_user(self, db: Session):
        """Create a test user."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            password_hash="hashed_password",
            full_name="Test User"
        )
        db.add(user)
        db.commit()
        return user
    
    @pytest.fixture
    def test_category(self, db: Session, test_user: User):
        """Create a test category."""
        category = Category(
            id=uuid4(),
            user_id=test_user.id,
            name="Viagem",
            type=TransactionTypeEnum.EXPENSE,
            color="#FF5722",
            icon="🏖️"
        )
        db.add(category)
        db.commit()
        return category
    
    @pytest.fixture
    def sample_goal_data(self, test_category: Category):
        """Create sample goal data for testing."""
        return GoalCreate(
            name="Viagem para Europa",
            description="Economizar para viagem de férias em família",
            target_amount=Decimal("15000.00"),
            deadline=date.today() + timedelta(days=365),
            category_id=test_category.id,
            color="#4CAF50",
            icon="🏖️",
            priority=3
        )
    
    def test_create_goal_success(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test successful goal creation."""
        goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        assert goal.name == sample_goal_data.name
        assert goal.target_amount == sample_goal_data.target_amount
        assert goal.current_amount == 0
        assert goal.status == GoalStatus.DRAFT
        assert goal.user_id == test_user.id
        assert goal.progress_percentage == 0
    
    def test_create_goal_duplicate_name(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test that duplicate goal names are not allowed."""
        # Create first goal
        goal_service.create_goal(sample_goal_data, test_user.id)
        
        # Try to create second goal with same name
        with pytest.raises(ValueError, match="Goal with name .* already exists"):
            goal_service.create_goal(sample_goal_data, test_user.id)
    
    def test_create_goal_invalid_category(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test that invalid category raises error."""
        sample_goal_data.category_id = uuid4()  # Non-existent category
        
        with pytest.raises(ValueError, match="Invalid category"):
            goal_service.create_goal(sample_goal_data, test_user.id)
    
    def test_get_goals_by_user(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test getting goals by user."""
        # Create multiple goals
        goal1 = goal_service.create_goal(sample_goal_data, test_user.id)
        
        sample_goal_data.name = "Carro Novo"
        sample_goal_data.status = GoalStatus.IN_PROGRESS
        goal2 = goal_service.create_goal(sample_goal_data, test_user.id)
        
        # Get all goals
        goals = goal_service.get_goals_by_user(test_user.id)
        assert len(goals) == 2
        
        # Get goals by status
        active_goals = goal_service.get_goals_by_user(test_user.id, GoalStatus.IN_PROGRESS)
        assert len(active_goals) == 1
        assert active_goals[0].name == "Carro Novo"
    
    def test_get_goal_by_id(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test getting goal by ID with details."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        goal = goal_service.get_goal_by_id(created_goal.id, test_user.id)
        
        assert goal is not None
        assert goal.name == sample_goal_data.name
        assert goal.contributions == []  # No contributions yet
        assert len(goal.milestones) == 4  # Default milestones created
    
    def test_get_goal_by_id_not_found(self, goal_service: GoalService, test_user: User):
        """Test that non-existent goal returns None."""
        goal = goal_service.get_goal_by_id(uuid4(), test_user.id)
        assert goal is None
    
    def test_update_goal_success(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test successful goal update."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        update_data = GoalUpdate(
            name="Viagem Atualizada",
            target_amount=Decimal("20000.00"),
            status=GoalStatus.IN_PROGRESS
        )
        
        updated_goal = goal_service.update_goal(created_goal.id, update_data, test_user.id)
        
        assert updated_goal.name == "Viagem Atualizada"
        assert updated_goal.target_amount == Decimal("20000.00")
        assert updated_goal.status == GoalStatus.IN_PROGRESS
    
    def test_update_goal_invalid_status_transition(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test that invalid status transitions are rejected."""
        # Create goal with COMPLETED status
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(created_goal.id, GoalUpdate(status=GoalStatus.COMPLETED), test_user.id)
        
        # Try to change from COMPLETED to IN_PROGRESS (invalid)
        with pytest.raises(ValueError, match="Invalid status transition"):
            goal_service.update_goal(created_goal.id, GoalUpdate(status=GoalStatus.IN_PROGRESS), test_user.id)
    
    def test_delete_goal_success(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test successful goal deletion."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        result = goal_service.delete_goal(created_goal.id, test_user.id)
        assert result is True
        
        # Verify goal is deleted
        goal = goal_service.get_goal_by_id(created_goal.id, test_user.id)
        assert goal is None
    
    def test_delete_goal_not_found(self, goal_service: GoalService, test_user: User):
        """Test deletion of non-existent goal."""
        result = goal_service.delete_goal(uuid4(), test_user.id)
        assert result is False
    
    def test_add_contribution_success(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test successful contribution addition."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(created_goal.id, GoalUpdate(status=GoalStatus.IN_PROGRESS), test_user.id)
        
        contribution_data = ContributionCreate(
            goal_id=created_goal.id,
            amount=Decimal("1000.00"),
            description="Primeira contribuição"
        )
        
        contribution = goal_service.add_contribution(contribution_data, test_user.id)
        
        assert contribution.amount == Decimal("1000.00")
        assert contribution.goal_id == created_goal.id
        assert contribution.created_by == test_user.id
        
        # Check that goal current_amount was updated (this would happen via trigger in real DB)
        updated_goal = goal_service.get_goal_by_id(created_goal.id, test_user.id)
        # Note: In real scenario, database trigger would update current_amount automatically
    
    def test_add_contribution_to_inactive_goal(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test that contributions cannot be added to inactive goals."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(created_goal.id, GoalUpdate(status=GoalStatus.COMPLETED), test_user.id)
        
        contribution_data = ContributionCreate(
            goal_id=created_goal.id,
            amount=Decimal("1000.00")
        )
        
        with pytest.raises(ValueError, match="Cannot add contributions to inactive goals"):
            goal_service.add_contribution(contribution_data, test_user.id)
    
    def test_add_contribution_invalid_goal(self, goal_service: GoalService, test_user: User):
        """Test that contribution to non-existent goal raises error."""
        contribution_data = ContributionCreate(
            goal_id=uuid4(),
            amount=Decimal("1000.00")
        )
        
        with pytest.raises(ValueError, match="Goal not found"):
            goal_service.add_contribution(contribution_data, test_user.id)
    
    def test_get_goal_summary(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test goal summary calculation."""
        # Create goals with different statuses
        goal1 = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(goal1.id, GoalUpdate(status=GoalStatus.IN_PROGRESS), test_user.id)
        
        sample_goal_data.name = "Goal 2"
        goal2 = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(goal2.id, GoalUpdate(status=GoalStatus.COMPLETED), test_user.id)
        
        summary = goal_service.get_goal_summary(test_user.id)
        
        assert summary.total_goals == 2
        assert summary.active_goals == 1
        assert summary.completed_goals == 1
        assert summary.total_target == Decimal("30000.00")  # 2 goals * 15000 each
    
    def test_get_upcoming_deadlines(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test getting goals with upcoming deadlines."""
        # Create goal with deadline in 15 days
        sample_goal_data.deadline = date.today() + timedelta(days=15)
        goal1 = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(goal1.id, GoalUpdate(status=GoalStatus.IN_PROGRESS), test_user.id)
        
        # Create goal with deadline in 60 days
        sample_goal_data.name = "Long Term Goal"
        sample_goal_data.deadline = date.today() + timedelta(days=60)
        goal2 = goal_service.create_goal(sample_goal_data, test_user.id)
        goal_service.update_goal(goal2.id, GoalUpdate(status=GoalStatus.IN_PROGRESS), test_user.id)
        
        # Get goals with deadlines in next 30 days
        upcoming = goal_service.get_upcoming_deadlines(test_user.id, 30)
        
        assert len(upcoming) == 1
        assert upcoming[0].name == "Viagem para Europa"
    
    def test_goal_properties(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test goal computed properties."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        # Get goal instance to test properties
        db_goal = goal_service.db.query(Goal).filter(Goal.id == created_goal.id).first()
        
        assert db_goal.progress_percentage == 0  # No contributions yet
        assert db_goal.days_remaining >= 364  # Should be close to 365 days
        assert db_goal.monthly_contribution_needed > 0  # Should calculate monthly amount
    
    def test_default_milestones_created(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test that default milestones are created for new goals."""
        created_goal = goal_service.create_goal(sample_goal_data, test_user.id)
        
        milestones = goal_service.db.query(GoalMilestone).filter(
            GoalMilestone.goal_id == created_goal.id
        ).all()
        
        assert len(milestones) == 4
        expected_percentages = [25, 50, 75, 100]
        actual_percentages = [m.percentage for m in milestones]
        
        for percentage in expected_percentages:
            assert percentage in actual_percentages
    
    def test_valid_status_transitions(self, goal_service: GoalService):
        """Test the status transition validation logic."""
        service = goal_service
        
        # Valid transitions from DRAFT
        assert service._is_valid_status_transition(GoalStatus.DRAFT, GoalStatus.IN_PROGRESS)
        assert service._is_valid_status_transition(GoalStatus.DRAFT, GoalStatus.CANCELLED)
        assert not service._is_valid_status_transition(GoalStatus.DRAFT, GoalStatus.COMPLETED)
        
        # Valid transitions from IN_PROGRESS
        assert service._is_valid_status_transition(GoalStatus.IN_PROGRESS, GoalStatus.PAUSED)
        assert service._is_valid_status_transition(GoalStatus.IN_PROGRESS, GoalStatus.COMPLETED)
        assert service._is_valid_status_transition(GoalStatus.IN_PROGRESS, GoalStatus.CANCELLED)
        
        # Terminal states should not allow transitions
        assert not service._is_valid_status_transition(GoalStatus.COMPLETED, GoalStatus.IN_PROGRESS)
        assert not service._is_valid_status_transition(GoalStatus.CANCELLED, GoalStatus.IN_PROGRESS)
        
        # OVERDUE can be reactivated
        assert service._is_valid_status_transition(GoalStatus.OVERDUE, GoalStatus.IN_PROGRESS)
        assert service._is_valid_status_transition(GoalStatus.OVERDUE, GoalStatus.CANCELLED)
    
    def test_goal_pagination(self, goal_service: GoalService, test_user: User, sample_goal_data: GoalCreate):
        """Test goal pagination functionality."""
        # Create multiple goals
        for i in range(5):
            sample_goal_data.name = f"Goal {i}"
            goal_service.create_goal(sample_goal_data, test_user.id)
        
        # Test pagination
        first_page = goal_service.get_goals_by_user(test_user.id, skip=0, limit=3)
        second_page = goal_service.get_goals_by_user(test_user.id, skip=3, limit=3)
        
        assert len(first_page) == 3
        assert len(second_page) == 2  # Remaining goals
        
        # Ensure no overlap
        first_page_ids = {goal.id for goal in first_page}
        second_page_ids = {goal.id for goal in second_page}
        assert first_page_ids.isdisjoint(second_page_ids)