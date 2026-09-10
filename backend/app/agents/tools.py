from typing import Dict, Any, Optional
from langchain_core.tools import tool
from backend.app.services.market_data import (
    get_stock_quote,
    get_technical_indicators,
    get_financial_metrics,
    get_company_news,
    normalize_symbol
)
from backend.app.database import SessionLocal
from backend.app.services.portfolio_service import get_or_create_user_and_portfolio, get_portfolio_summary

@tool
def get_stock_quote_tool(symbol: str) -> Dict[str, Any]:
    """Fetch current real-time or recent market quote for a stock symbol (e.g. 'AAPL', 'TCS.NS', 'NVDA')."""
    clean_sym = normalize_symbol(symbol)
    quote = get_stock_quote(clean_sym)
    return quote.dict()

@tool
def get_technical_indicators_tool(symbol: str) -> Dict[str, Any]:
    """Calculate moving averages (SMA 20, 50, 200), RSI, MACD, and Bollinger Bands for a stock ticker."""
    clean_sym = normalize_symbol(symbol)
    indicators = get_technical_indicators(clean_sym)
    return indicators.dict()

@tool
def get_company_fundamentals_tool(symbol: str) -> Dict[str, Any]:
    """Retrieve fundamental financial metrics such as P/E ratio, P/B, EPS, Beta, Profit Margins, and Debt-to-Equity."""
    clean_sym = normalize_symbol(symbol)
    metrics = get_financial_metrics(clean_sym)
    return metrics.dict()

@tool
def get_recent_news_tool(symbol: str) -> list:
    """Fetch recent headlines, publisher information, and sentiment tag for a given stock symbol."""
    clean_sym = normalize_symbol(symbol)
    news = get_company_news(clean_sym)
    return [item.dict() for item in news]

@tool
def get_portfolio_summary_tool() -> Dict[str, Any]:
    """Retrieve the current user virtual portfolio, cash balance, current positions, and total unrealized/realized P&L."""
    db = SessionLocal()
    try:
        user = get_or_create_user_and_portfolio(db)
        summary = get_portfolio_summary(db, user.id)
        return summary.dict()
    finally:
        db.close()

@tool
def propose_simulated_trade_tool(symbol: str, action: str, quantity: float, rationale: str) -> Dict[str, Any]:
    """
    Propose a virtual paper trade (BUY or SELL) for user human approval.
    Does NOT immediately execute the trade until the user confirms.
    """
    clean_sym = normalize_symbol(symbol)
    quote = get_stock_quote(clean_sym)
    est_price = quote.price
    total_cost = round(est_price * quantity, 2)
    
    return {
        "proposal_type": "HUMAN_APPROVAL_REQUIRED",
        "symbol": clean_sym,
        "action": action.upper(),
        "quantity": quantity,
        "estimated_price": est_price,
        "total_estimated_cost": total_cost,
        "rationale": rationale,
        "risk_level": "Medium" if quantity * est_price < 20000 else "High",
        "status": "PENDING_APPROVAL"
    }

ALL_TOOLS = [
    get_stock_quote_tool,
    get_technical_indicators_tool,
    get_company_fundamentals_tool,
    get_recent_news_tool,
    get_portfolio_summary_tool,
    propose_simulated_trade_tool
]
