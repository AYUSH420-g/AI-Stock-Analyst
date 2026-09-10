from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.app.database import get_db
from backend.app.schemas.schemas import WatchlistItemCreate, WatchlistItemOut
from backend.app.models.models import Watchlist, WatchlistItem
from backend.app.services.portfolio_service import get_or_create_user_and_portfolio
from backend.app.services.market_data import get_stock_quote, normalize_symbol

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistItemOut])
def get_watchlist(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    wl = db.query(Watchlist).filter(Watchlist.user_id == user.id).first()
    if not wl:
        return []
    
    items = db.query(WatchlistItem).filter(WatchlistItem.watchlist_id == wl.id).order_by(WatchlistItem.added_at.desc()).all()
    results = []
    for item in items:
        try:
            quote = get_stock_quote(item.symbol)
            price = quote.price
            chg = quote.change_percent
            cname = quote.company_name
        except Exception:
            price, chg, cname = None, None, item.symbol
            
        results.append(WatchlistItemOut(
            id=item.id,
            symbol=item.symbol,
            company_name=cname,
            current_price=price,
            change_percent=chg,
            notes=item.notes,
            added_at=item.added_at
        ))
    return results

@router.post("/add", response_model=WatchlistItemOut)
def add_to_watchlist(item_in: WatchlistItemCreate, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    wl = db.query(Watchlist).filter(Watchlist.user_id == user.id).first()
    clean_sym = normalize_symbol(item_in.symbol)
    
    # Check if already exists
    existing = db.query(WatchlistItem).filter(WatchlistItem.watchlist_id == wl.id, WatchlistItem.symbol == clean_sym).first()
    if existing:
        quote = get_stock_quote(clean_sym)
        return WatchlistItemOut(
            id=existing.id,
            symbol=existing.symbol,
            company_name=quote.company_name,
            current_price=quote.price,
            change_percent=quote.change_percent,
            notes=existing.notes,
            added_at=existing.added_at
        )

    new_item = WatchlistItem(
        watchlist_id=wl.id,
        symbol=clean_sym,
        notes=item_in.notes,
        added_at=datetime.utcnow()
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    quote = get_stock_quote(clean_sym)
    return WatchlistItemOut(
        id=new_item.id,
        symbol=new_item.symbol,
        company_name=quote.company_name,
        current_price=quote.price,
        change_percent=quote.change_percent,
        notes=new_item.notes,
        added_at=new_item.added_at
    )

@router.delete("/{symbol}")
def remove_from_watchlist(symbol: str, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    wl = db.query(Watchlist).filter(Watchlist.user_id == user.id).first()
    clean_sym = normalize_symbol(symbol)
    
    deleted = db.query(WatchlistItem).filter(WatchlistItem.watchlist_id == wl.id, WatchlistItem.symbol == clean_sym).delete()
    db.commit()
    return {"success": deleted > 0, "symbol": clean_sym}
