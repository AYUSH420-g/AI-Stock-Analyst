from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Market & Stock Schemas ---
class StockQuote(BaseModel):
    symbol: str
    company_name: str
    price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    previous_close: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    currency: str = "USD"
    sector: Optional[str] = "Technology"

class CandleData(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class StockHistory(BaseModel):
    symbol: str
    timeframe: str
    candles: List[CandleData]

class TechnicalIndicators(BaseModel):
    sma20: Optional[float] = None
    sma50: Optional[float] = None
    sma200: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    upper_band: Optional[float] = None
    lower_band: Optional[float] = None
    current_trend: str = "Neutral" # Bullish, Bearish, Neutral
    signal_summary: str = "Hold"

class FinancialMetrics(BaseModel):
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    eps: Optional[float] = None
    beta: Optional[float] = None
    profit_margins: Optional[float] = None
    roe: Optional[float] = None
    debt_to_equity: Optional[float] = None
    free_cash_flow: Optional[float] = None

class NewsItem(BaseModel):
    title: str
    publisher: str
    link: str
    published_at: str
    sentiment: str = "Neutral" # Bullish, Bearish, Neutral

# --- Portfolio & Trading Schemas ---
class PositionOut(BaseModel):
    symbol: str
    company_name: str
    quantity: float
    average_buy_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    total_cost_basis: float
    weight_percent: float
    asset_class: str

class PortfolioSummary(BaseModel):
    cash_balance: float
    total_equity: float
    total_portfolio_value: float
    total_unrealized_pnl: float
    total_unrealized_pnl_percent: float
    realized_pnl: float
    initial_balance: float
    total_pnl: float
    total_return_percent: float
    positions: List[PositionOut]
    currency: str = "USD"

class TradeOrderCreate(BaseModel):
    symbol: str
    action: str # BUY, SELL
    quantity: float = Field(gt=0)
    order_type: str = "MARKET" # MARKET, LIMIT
    price: Optional[float] = None
    notes: Optional[str] = None

class TradeProposal(BaseModel):
    symbol: str
    action: str # BUY, SELL
    quantity: float
    estimated_price: float
    total_estimated_cost: float
    rationale: str
    risk_level: str # Low, Medium, High
    status: str = "PENDING_APPROVAL" # PENDING_APPROVAL, EXECUTED, REJECTED

class TradeApprovalRequest(BaseModel):
    proposal_id: Optional[int] = None
    symbol: str
    action: str
    quantity: float
    approved: bool

class TradeTransactionOut(BaseModel):
    id: int
    symbol: str
    action: str
    quantity: float
    price: float
    total_amount: float
    status: str
    order_type: str
    ai_rationale: Optional[str] = None
    executed_at: datetime

    class Config:
        from_attributes = True

# --- Watchlist Schemas ---
class WatchlistItemCreate(BaseModel):
    symbol: str
    notes: Optional[str] = None

class WatchlistItemOut(BaseModel):
    id: int
    symbol: str
    company_name: Optional[str] = None
    current_price: Optional[float] = None
    change_percent: Optional[float] = None
    notes: Optional[str] = None
    added_at: datetime

# --- Multi-Agent Analysis Schemas ---
class TechnicalAnalystReport(BaseModel):
    trend: str # Bullish, Bearish, Neutral
    rsi_signal: str # Oversold, Neutral, Overbought
    ma_alignment: str
    key_support: float
    key_resistance: float
    score: int # 1 to 100
    bullet_points: List[str]

class FundamentalAnalystReport(BaseModel):
    valuation_verdict: str # Undervalued, Fairly Valued, Overvalued
    growth_health: str # Robust, Stable, Weak
    balance_sheet: str # Pristine, Acceptable, Leveraged
    score: int # 1 to 100
    bullet_points: List[str]

class SentimentAnalystReport(BaseModel):
    sentiment: str # Positive, Neutral, Negative
    news_momentum: str # High, Moderate, Low
    score: int # 1 to 100
    bullet_points: List[str]

class RiskAnalystReport(BaseModel):
    risk_tier: str # Low, Moderate, High, Extreme
    volatility_assessment: str
    suggested_stop_loss: float
    risk_score: int # 1 to 100
    bullet_points: List[str]

class PortfolioRecommendation(BaseModel):
    suggested_action: str # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    portfolio_fit: str # Fits moderate growth, Overweighted, High risk for portfolio
    suggested_max_allocation_pct: float # e.g. 5.0%
    proposed_trade: Optional[TradeProposal] = None

class MultiAgentReportOut(BaseModel):
    id: Optional[int] = None
    symbol: str
    company_name: str
    current_price: float
    overall_rating: str # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    risk_score: int
    confidence_score: int
    summary: str
    technical: TechnicalAnalystReport
    fundamental: FundamentalAnalystReport
    sentiment: SentimentAnalystReport
    risk: RiskAnalystReport
    recommendation: PortfolioRecommendation
    created_at: Optional[datetime] = None

# --- Chat & Memory Schemas ---
class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    trade_proposal: Optional[TradeProposal] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileOut(BaseModel):
    id: int
    username: str
    email: str
    risk_tolerance: str
    investment_horizon: str
    cash_balance: float
    total_portfolio_value: float
    currency: str
    memory_facts: List[str]

class UserProfileUpdate(BaseModel):
    risk_tolerance: Optional[str] = None
    investment_horizon: Optional[str] = None
