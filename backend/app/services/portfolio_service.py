from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from backend.app.models.models import User, Portfolio, Position, TradeTransaction, Watchlist, UserMemoryFact
from backend.app.schemas.schemas import PortfolioSummary, PositionOut, TradeOrderCreate, TradeApprovalRequest, TradeTransactionOut
from backend.app.services.market_data import get_stock_quote, normalize_symbol
from backend.app.config import settings

def get_or_create_user_and_portfolio(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(
            username="trader_alpha",
            email="trader@simulator.ai",
            risk_tolerance="Moderate",
            investment_horizon="Medium-term"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        portfolio = Portfolio(
            user_id=user.id,
            cash_balance=settings.INITIAL_CASH_BALANCE,
            realized_pnl=0.0,
            currency="INR"
        )
        db.add(portfolio)

        watchlist = Watchlist(user_id=user.id, name="Primary Watchlist")
        db.add(watchlist)

        # Prepopulate sample memory facts
        db.add(UserMemoryFact(user_id=user.id, category="preference", fact="Prefers blue-chip tech stocks with strong cash flow"))
        db.add(UserMemoryFact(user_id=user.id, category="risk", fact="Moderate risk profile, max 15% allocation in any single stock"))

        db.commit()
        db.refresh(user)

    if not user.portfolio:
        portfolio = Portfolio(
            user_id=user.id,
            cash_balance=settings.INITIAL_CASH_BALANCE,
            realized_pnl=0.0,
            currency="INR"
        )
        db.add(portfolio)
        db.commit()
        db.refresh(user)

    return user

def get_portfolio_summary(db: Session, user_id: int) -> PortfolioSummary:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    portfolio = user.portfolio
    positions_db = db.query(Position).filter(Position.portfolio_id == portfolio.id).all()
    
    positions_out = []
    total_equity = 0.0
    total_cost = 0.0
    
    for pos in positions_db:
        if pos.quantity <= 0:
            continue
        try:
            quote = get_stock_quote(pos.symbol)
            cur_price = quote.price
        except Exception:
            cur_price = pos.average_buy_price
            
        market_val = round(pos.quantity * cur_price, 2)
        cost_basis = round(pos.total_cost_basis, 2)
        unrealized = round(market_val - cost_basis, 2)
        unrealized_pct = round((unrealized / cost_basis) * 100, 2) if cost_basis > 0 else 0.0
        
        total_equity += market_val
        total_cost += cost_basis
        
        positions_out.append(PositionOut(
            symbol=pos.symbol,
            company_name=pos.company_name or pos.symbol,
            quantity=pos.quantity,
            average_buy_price=round(pos.average_buy_price, 2),
            current_price=cur_price,
            market_value=market_val,
            unrealized_pnl=unrealized,
            unrealized_pnl_percent=unrealized_pct,
            total_cost_basis=cost_basis,
            weight_percent=0.0, # Computed below
            asset_class=pos.asset_class or "Equities"
        ))
        
    total_portfolio_value = round(portfolio.cash_balance + total_equity, 2)
    total_unrealized_pnl = round(total_equity - total_cost, 2)
    total_unrealized_pnl_percent = round((total_unrealized_pnl / total_cost) * 100, 2) if total_cost > 0 else 0.0
    
    total_pnl = round(total_unrealized_pnl + portfolio.realized_pnl, 2)
    total_return_pct = round((total_pnl / settings.INITIAL_CASH_BALANCE) * 100, 2)

    # Compute weights
    for p in positions_out:
        if total_portfolio_value > 0:
            p.weight_percent = round((p.market_value / total_portfolio_value) * 100, 1)

    return PortfolioSummary(
        cash_balance=round(portfolio.cash_balance, 2),
        total_equity=round(total_equity, 2),
        total_portfolio_value=total_portfolio_value,
        total_unrealized_pnl=total_unrealized_pnl,
        total_unrealized_pnl_percent=total_unrealized_pnl_percent,
        realized_pnl=round(portfolio.realized_pnl, 2),
        initial_balance=settings.INITIAL_CASH_BALANCE,
        total_pnl=total_pnl,
        total_return_percent=total_return_pct,
        positions=positions_out,
        currency=portfolio.currency
    )

def execute_trade_order(db: Session, user_id: int, order: TradeOrderCreate) -> TradeTransaction:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    portfolio = user.portfolio
    symbol = normalize_symbol(order.symbol)
    quote = get_stock_quote(symbol)
    exec_price = order.price if order.price and order.price > 0 else quote.price
    total_amount = round(exec_price * order.quantity, 2)
    
    action = order.action.upper()
    if action == "BUY":
        if portfolio.cash_balance < total_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient funds. Required: ₹{total_amount:,.2f}, Available Cash: ₹{portfolio.cash_balance:,.2f}"
            )
        # Deduct cash
        portfolio.cash_balance -= total_amount
        
        # Update or create position
        pos = db.query(Position).filter(Position.portfolio_id == portfolio.id, Position.symbol == symbol).first()
        if not pos:
            pos = Position(
                portfolio_id=portfolio.id,
                symbol=symbol,
                company_name=quote.company_name,
                quantity=order.quantity,
                average_buy_price=exec_price,
                total_cost_basis=total_amount,
                asset_class="Equities"
            )
            db.add(pos)
        else:
            new_qty = pos.quantity + order.quantity
            new_cost = pos.total_cost_basis + total_amount
            pos.average_buy_price = new_cost / new_qty
            pos.quantity = new_qty
            pos.total_cost_basis = new_cost
            
    elif action == "SELL":
        pos = db.query(Position).filter(Position.portfolio_id == portfolio.id, Position.symbol == symbol).first()
        if not pos or pos.quantity < order.quantity:
            avail = pos.quantity if pos else 0
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient shares to sell. Owned: {avail}, Requested: {order.quantity}"
            )
        # Realized PnL
        cost_basis_sold = pos.average_buy_price * order.quantity
        realized_gain = total_amount - cost_basis_sold
        portfolio.realized_pnl += realized_gain
        portfolio.cash_balance += total_amount
        
        pos.quantity -= order.quantity
        pos.total_cost_basis -= cost_basis_sold
        if pos.quantity <= 0:
            db.delete(pos)
    else:
        raise HTTPException(status_code=400, detail="Invalid order action. Must be BUY or SELL.")

    tx = TradeTransaction(
        portfolio_id=portfolio.id,
        symbol=symbol,
        action=action,
        quantity=order.quantity,
        price=exec_price,
        total_amount=total_amount,
        status="EXECUTED",
        order_type=order.order_type,
        ai_rationale=order.notes,
        executed_at=datetime.utcnow()
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def reset_portfolio(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    portfolio = user.portfolio
    # Delete positions
    db.query(Position).filter(Position.portfolio_id == portfolio.id).delete()
    # Delete transactions
    db.query(TradeTransaction).filter(TradeTransaction.portfolio_id == portfolio.id).delete()
    
    portfolio.cash_balance = settings.INITIAL_CASH_BALANCE
    portfolio.realized_pnl = 0.0
    db.commit()
    return {"message": "Portfolio reset to initial balance ₹10,00,000.00"}
