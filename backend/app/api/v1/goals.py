from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.goal_service import GoalService
from app.schemas.goal import (
    GoalCreate, GoalUpdate, GoalResponse, GoalWithDetails, GoalSummary,
    ContributionCreate, ContributionResponse, GoalStatus
)

router = APIRouter()


@router.get("/", response_model=List[GoalResponse])
def get_goals(
    status: Optional[GoalStatus] = Query(None, description="Filter by goal status"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of items to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all goals for the current user.
    
    - **status**: Optional filter by goal status
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return
    """
    service = GoalService(db)
    return service.get_goals_by_user(
        user_id=current_user.id,
        status=status,
        skip=skip,
        limit=limit
    )


@router.get("/summary", response_model=GoalSummary)
def get_goals_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for user's goals.
    
    Returns aggregated data including:
    - Total goals count
    - Active/completed goals
    - Total saved vs target amounts
    - Overall progress percentage
    - Goals performance (on track, behind, ahead)
    """
    service = GoalService(db)
    return service.get_goal_summary(current_user.id)


@router.get("/upcoming", response_model=List[GoalResponse])
def get_upcoming_deadlines(
    days: int = Query(30, ge=1, le=365, description="Days ahead to look for deadlines"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get goals with upcoming deadlines.
    
    - **days**: Number of days ahead to check for deadlines
    """
    service = GoalService(db)
    return service.get_upcoming_deadlines(current_user.id, days)


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new financial goal.
    
    - **name**: Descriptive name for the goal (required)
    - **target_amount**: Target amount to save (required, > 0)
    - **deadline**: Target date to achieve the goal (required, future date)
    - **category_id**: Optional category to associate with
    - **description**: Optional description/motivation
    - **color**: Optional hex color code (#RRGGBB)
    - **icon**: Optional icon identifier
    - **priority**: Priority level 1-5 (default: 1)
    """
    service = GoalService(db)
    try:
        return service.create_goal(goal_data, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{goal_id}", response_model=GoalWithDetails)
def get_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific goal.
    
    Returns goal details including:
    - Basic goal information
    - All contributions made
    - Milestone progress
    - Category information
    - Calculated progress metrics
    """
    service = GoalService(db)
    goal = service.get_goal_by_id(goal_id, current_user.id)
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: UUID,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing goal.
    
    All fields are optional. Only provided fields will be updated.
    
    Status transitions are validated:
    - DRAFT → IN_PROGRESS, CANCELLED
    - IN_PROGRESS → PAUSED, COMPLETED, CANCELLED
    - PAUSED → IN_PROGRESS, CANCELLED
    - OVERDUE → IN_PROGRESS, CANCELLED
    - COMPLETED, CANCELLED are terminal states
    """
    service = GoalService(db)
    try:
        updated_goal = service.update_goal(goal_id, goal_data, current_user.id)
        
        if not updated_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )
        
        return updated_goal
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a goal and all its associated data.
    
    This action is irreversible and will also delete:
    - All contributions to the goal
    - All milestone records
    - Any linked transaction references
    """
    service = GoalService(db)
    deleted = service.delete_goal(goal_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )


@router.post("/{goal_id}/contributions", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
def add_contribution(
    goal_id: UUID,
    contribution_data: ContributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a contribution to a goal.
    
    - **amount**: Amount to contribute (required, > 0)
    - **type**: Type of contribution (MANUAL, AUTOMATIC, TRANSACTION, RECURRING)
    - **description**: Optional description
    - **contribution_date**: Date of contribution (default: today)
    - **transaction_id**: Optional link to existing transaction
    """
    # Ensure goal_id in path matches payload
    contribution_data.goal_id = goal_id
    
    service = GoalService(db)
    try:
        return service.add_contribution(contribution_data, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{goal_id}/status", response_model=GoalResponse)
def update_goal_status(
    goal_id: UUID,
    new_status: GoalStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update only the status of a goal.
    
    Convenience endpoint for common status changes:
    - Start tracking (DRAFT → IN_PROGRESS)
    - Pause/Resume (IN_PROGRESS ↔ PAUSED)  
    - Complete goal (IN_PROGRESS → COMPLETED)
    - Cancel goal (any → CANCELLED)
    """
    service = GoalService(db)
    try:
        goal_update = GoalUpdate(status=new_status)
        updated_goal = service.update_goal(goal_id, goal_update, current_user.id)
        
        if not updated_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )
        
        return updated_goal
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )