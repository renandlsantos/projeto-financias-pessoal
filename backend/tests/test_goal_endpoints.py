import pytest
from datetime import date, timedelta
from decimal import Decimal
from fastapi.testclient import TestClient
from fastapi import status
from uuid import uuid4
import json

from app.main import app
from app.models.goal import Goal
from app.models.user import User
from app.models.category import Category, TransactionTypeEnum
from app.schemas.goal import GoalStatus


class TestGoalEndpoints:
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    @pytest.fixture
    def test_user(self, db):
        """Create test user."""
        user = User(
            id=uuid4(),
            email="goals_test@example.com",
            password_hash="hashed_password",
            full_name="Goals Test User"
        )
        db.add(user)
        db.commit()
        return user
    
    @pytest.fixture
    def test_category(self, db, test_user):
        """Create test category."""
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
    def auth_headers(self, test_user):
        """Create authentication headers for test user."""
        # In a real scenario, you would generate a proper JWT token
        # For testing, we'll mock the authentication
        return {"Authorization": f"Bearer mock_token_for_{test_user.id}"}
    
    @pytest.fixture
    def sample_goal_data(self, test_category):
        """Sample goal data for API tests."""
        return {
            "name": "Viagem Europa",
            "description": "Economizar para viagem de férias",
            "target_amount": 15000.00,
            "deadline": (date.today() + timedelta(days=365)).isoformat(),
            "category_id": str(test_category.id),
            "color": "#4CAF50",
            "icon": "🏖️",
            "priority": 3
        }
    
    def test_create_goal_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test successful goal creation via API."""
        response = client.post(
            "/api/v1/goals/",
            json=sample_goal_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        goal_data = response.json()
        
        assert goal_data["name"] == sample_goal_data["name"]
        assert goal_data["target_amount"] == sample_goal_data["target_amount"]
        assert goal_data["status"] == GoalStatus.DRAFT
        assert goal_data["current_amount"] == 0
        assert goal_data["progress_percentage"] == 0
    
    def test_create_goal_validation_error(self, client: TestClient, auth_headers, sample_goal_data):
        """Test goal creation with validation errors."""
        # Remove required field
        del sample_goal_data["name"]
        
        response = client.post(
            "/api/v1/goals/",
            json=sample_goal_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_goal_past_deadline(self, client: TestClient, auth_headers, sample_goal_data):
        """Test goal creation with past deadline."""
        sample_goal_data["deadline"] = (date.today() - timedelta(days=1)).isoformat()
        
        response = client.post(
            "/api/v1/goals/",
            json=sample_goal_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "future" in response.json()["detail"].lower()
    
    def test_get_goals_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test getting user's goals."""
        # Create a goal first
        client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        
        response = client.get("/api/v1/goals/", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        goals = response.json()
        assert len(goals) >= 1
        assert goals[0]["name"] == sample_goal_data["name"]
    
    def test_get_goals_with_status_filter(self, client: TestClient, auth_headers, sample_goal_data):
        """Test getting goals filtered by status."""
        # Create goal and update its status
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        client.put(
            f"/api/v1/goals/{goal_id}/status?new_status=IN_PROGRESS",
            headers=auth_headers
        )
        
        # Get active goals
        response = client.get("/api/v1/goals/?status=IN_PROGRESS", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        goals = response.json()
        assert len(goals) == 1
        assert goals[0]["status"] == GoalStatus.IN_PROGRESS
    
    def test_get_goal_by_id_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test getting goal details by ID."""
        # Create goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        response = client.get(f"/api/v1/goals/{goal_id}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        goal = response.json()
        
        assert goal["id"] == goal_id
        assert goal["name"] == sample_goal_data["name"]
        assert "contributions" in goal
        assert "milestones" in goal
        assert len(goal["milestones"]) == 4  # Default milestones
    
    def test_get_goal_by_id_not_found(self, client: TestClient, auth_headers):
        """Test getting non-existent goal."""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/goals/{fake_id}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_goal_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test successful goal update."""
        # Create goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        # Update goal
        update_data = {
            "name": "Viagem Europa Atualizada",
            "target_amount": 20000.00,
            "status": GoalStatus.IN_PROGRESS
        }
        
        response = client.put(
            f"/api/v1/goals/{goal_id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        updated_goal = response.json()
        
        assert updated_goal["name"] == update_data["name"]
        assert updated_goal["target_amount"] == update_data["target_amount"]
        assert updated_goal["status"] == update_data["status"]
    
    def test_update_goal_invalid_status_transition(self, client: TestClient, auth_headers, sample_goal_data):
        """Test invalid status transition."""
        # Create and complete goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=COMPLETED", headers=auth_headers)
        
        # Try invalid transition
        response = client.put(
            f"/api/v1/goals/{goal_id}",
            json={"status": GoalStatus.IN_PROGRESS},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid status transition" in response.json()["detail"]
    
    def test_delete_goal_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test successful goal deletion."""
        # Create goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        # Delete goal
        response = client.delete(f"/api/v1/goals/{goal_id}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify goal is deleted
        get_response = client.get(f"/api/v1/goals/{goal_id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_goal_status_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test goal status update endpoint."""
        # Create goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        # Update status
        response = client.put(
            f"/api/v1/goals/{goal_id}/status?new_status=IN_PROGRESS",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        updated_goal = response.json()
        assert updated_goal["status"] == GoalStatus.IN_PROGRESS
    
    def test_add_contribution_success(self, client: TestClient, auth_headers, sample_goal_data):
        """Test adding contribution to goal."""
        # Create and activate goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=IN_PROGRESS", headers=auth_headers)
        
        # Add contribution
        contribution_data = {
            "amount": 1000.00,
            "description": "Primeira contribuição",
            "contribution_date": date.today().isoformat()
        }
        
        response = client.post(
            f"/api/v1/goals/{goal_id}/contributions",
            json=contribution_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        contribution = response.json()
        
        assert contribution["amount"] == contribution_data["amount"]
        assert contribution["goal_id"] == goal_id
        assert contribution["description"] == contribution_data["description"]
    
    def test_add_contribution_to_inactive_goal(self, client: TestClient, auth_headers, sample_goal_data):
        """Test adding contribution to inactive goal fails."""
        # Create completed goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=COMPLETED", headers=auth_headers)
        
        # Try to add contribution
        contribution_data = {
            "amount": 1000.00,
            "description": "Should fail"
        }
        
        response = client.post(
            f"/api/v1/goals/{goal_id}/contributions",
            json=contribution_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "inactive" in response.json()["detail"].lower()
    
    def test_get_goals_summary(self, client: TestClient, auth_headers, sample_goal_data):
        """Test getting goals summary."""
        # Create multiple goals
        client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        
        sample_goal_data["name"] = "Goal 2"
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=COMPLETED", headers=auth_headers)
        
        response = client.get("/api/v1/goals/summary", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        summary = response.json()
        
        assert summary["total_goals"] == 2
        assert summary["completed_goals"] == 1
        assert summary["total_target"] == 30000.00  # 2 goals * 15000 each
    
    def test_get_upcoming_deadlines(self, client: TestClient, auth_headers, sample_goal_data):
        """Test getting upcoming deadlines."""
        # Create goal with near deadline
        sample_goal_data["deadline"] = (date.today() + timedelta(days=15)).isoformat()
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=IN_PROGRESS", headers=auth_headers)
        
        response = client.get("/api/v1/goals/upcoming?days=30", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        upcoming = response.json()
        
        assert len(upcoming) == 1
        assert upcoming[0]["name"] == sample_goal_data["name"]
    
    def test_get_goals_pagination(self, client: TestClient, auth_headers, sample_goal_data):
        """Test goals pagination."""
        # Create multiple goals
        for i in range(5):
            sample_goal_data["name"] = f"Goal {i}"
            client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        
        # Test pagination
        first_page = client.get("/api/v1/goals/?skip=0&limit=3", headers=auth_headers)
        second_page = client.get("/api/v1/goals/?skip=3&limit=3", headers=auth_headers)
        
        assert first_page.status_code == status.HTTP_200_OK
        assert second_page.status_code == status.HTTP_200_OK
        
        first_goals = first_page.json()
        second_goals = second_page.json()
        
        assert len(first_goals) == 3
        assert len(second_goals) == 2
    
    def test_unauthorized_access(self, client: TestClient, sample_goal_data):
        """Test that endpoints require authentication."""
        # Try to access without auth headers
        response = client.get("/api/v1/goals/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        response = client.post("/api/v1/goals/", json=sample_goal_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_goal_ownership_enforcement(self, client: TestClient, auth_headers, sample_goal_data, db):
        """Test that users can only access their own goals."""
        # Create goal with first user
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        
        # Create second user
        other_user = User(
            id=uuid4(),
            email="other_user@example.com",
            password_hash="hashed_password",
            full_name="Other User"
        )
        db.add(other_user)
        db.commit()
        
        other_auth_headers = {"Authorization": f"Bearer mock_token_for_{other_user.id}"}
        
        # Try to access first user's goal with second user's auth
        response = client.get(f"/api/v1/goals/{goal_id}", headers=other_auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_contribution_validation(self, client: TestClient, auth_headers, sample_goal_data):
        """Test contribution validation."""
        # Create and activate goal
        create_response = client.post("/api/v1/goals/", json=sample_goal_data, headers=auth_headers)
        goal_id = create_response.json()["id"]
        client.put(f"/api/v1/goals/{goal_id}/status?new_status=IN_PROGRESS", headers=auth_headers)
        
        # Try to add contribution with invalid amount
        invalid_contribution = {
            "amount": -100.00,  # Negative amount
            "description": "Invalid contribution"
        }
        
        response = client.post(
            f"/api/v1/goals/{goal_id}/contributions",
            json=invalid_contribution,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY