from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas.schemas import (
    PortfolioSummary,
    TradeOrderCreate,
    TradeApprovalRequest,
    TradeTransactionOut
)
from backend.app.models.models import TradeTransaction
from backend.app.services.portfolio_service import (
    get_or_create_user_and_portfolio,
    get_portfolio_summary,
    execute_trade_order,
    reset_portfolio
)

router = APIRouter(prefix="/portfolio", tags=["Virtual Portfolio"])

@router.get("/summary", response_model=PortfolioSummary)
def summary(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    return get_portfolio_summary(db, user.id)

@router.post("/trade", response_model=TradeTransactionOut)
def place_order(order: TradeOrderCreate, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    tx = execute_trade_order(db, user.id, order)
    return tx

@router.post("/approve-proposal", response_model=TradeTransactionOut)
def approve_proposal(request: TradeApprovalRequest, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    if not request.approved:
        # Create rejected audit transaction
        tx = TradeTransaction(
            portfolio_id=user.portfolio.id,
            symbol=request.symbol,
            action=request.action,
            quantity=request.quantity,
            price=0.0,
            total_amount=0.0,
            status="REJECTED",
            order_type="AI_PROPOSED",
            ai_rationale="User declined AI proposed trade."
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    # Execute approved trade
    order = TradeOrderCreate(
        symbol=request.symbol,
        action=request.action,
        quantity=request.quantity,
        order_type="AI_PROPOSED",
        notes="AI trade recommendation approved and confirmed by user."
    )
    return execute_trade_order(db, user.id, order)

@router.get("/transactions", response_model=List[TradeTransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    txs = db.query(TradeTransaction).filter(
        TradeTransaction.portfolio_id == user.portfolio.id
    ).order_by(TradeTransaction.executed_at.desc()).all()
    return txs

@router.post("/reset")
def reset(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    return reset_portfolio(db, user.id)
