from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from backend.app.schemas.schemas import StockQuote, StockHistory, TechnicalIndicators, FinancialMetrics, NewsItem
from backend.app.services.market_data import (
    get_stock_quote,
    get_stock_history,
    get_technical_indicators,
    get_financial_metrics,
    get_company_news,
    search_symbols
)

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/search", response_model=List[Dict[str, str]])
def search(q: str = Query("", description="Symbol or company query")):
    return search_symbols(q)

@router.get("/quote/{symbol}", response_model=StockQuote)
def get_quote(symbol: str):
    try:
        return get_stock_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{symbol}", response_model=StockHistory)
def get_history(symbol: str, timeframe: str = Query("1M", regex="^(1D|1W|1M|6M|1Y|5Y)$")):
    try:
        return get_stock_history(symbol, timeframe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicators/{symbol}", response_model=TechnicalIndicators)
def get_indicators(symbol: str):
    try:
        return get_technical_indicators(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fundamentals/{symbol}", response_model=FinancialMetrics)
def get_fundamentals(symbol: str):
    try:
        return get_financial_metrics(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/{symbol}", response_model=List[NewsItem])
def get_news(symbol: str):
    try:
        return get_company_news(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
