from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.schemas import UserProfileOut, UserProfileUpdate
from backend.app.models.models import User, UserMemoryFact
from backend.app.services.portfolio_service import get_or_create_user_and_portfolio, get_portfolio_summary

router = APIRouter(prefix="/user", tags=["User Profile & Preferences"])

@router.get("/profile", response_model=UserProfileOut)
def get_profile(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    summary = get_portfolio_summary(db, user.id)
    facts = db.query(UserMemoryFact).filter(UserMemoryFact.user_id == user.id).all()
    
    return UserProfileOut(
        id=user.id,
        username=user.username,
        email=user.email,
        risk_tolerance=user.risk_tolerance,
        investment_horizon=user.investment_horizon,
        cash_balance=summary.cash_balance,
        total_portfolio_value=summary.total_portfolio_value,
        currency=summary.currency,
        memory_facts=[f"{f.category.title()}: {f.fact}" for f in facts]
    )

@router.put("/profile", response_model=UserProfileOut)
def update_profile(update_data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    if update_data.risk_tolerance:
        user.risk_tolerance = update_data.risk_tolerance
    if update_data.investment_horizon:
        user.investment_horizon = update_data.investment_horizon
        
    db.commit()
    db.refresh(user)
    
    summary = get_portfolio_summary(db, user.id)
    facts = db.query(UserMemoryFact).filter(UserMemoryFact.user_id == user.id).all()
    
    return UserProfileOut(
        id=user.id,
        username=user.username,
        email=user.email,
        risk_tolerance=user.risk_tolerance,
        investment_horizon=user.investment_horizon,
        cash_balance=summary.cash_balance,
        total_portfolio_value=summary.total_portfolio_value,
        currency=summary.currency,
        memory_facts=[f"{f.category.title()}: {f.fact}" for f in facts]
    )
