export interface StockQuote {
  symbol: string;
  company_name: string;
  price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  currency: string;
  sector?: string;
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistory {
  symbol: string;
  timeframe: string;
  candles: CandleData[];
}

export interface TechnicalIndicators {
  sma20?: number;
  sma50?: number;
  sma200?: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  macd_hist?: number;
  upper_band?: number;
  lower_band?: number;
  current_trend: string;
  signal_summary: string;
}

export interface FinancialMetrics {
  pe_ratio?: number;
  forward_pe?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  eps?: number;
  beta?: number;
  profit_margins?: number;
  roe?: number;
  debt_to_equity?: number;
  free_cash_flow?: number;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  published_at: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface PositionOut {
  symbol: string;
  company_name: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  total_cost_basis: number;
  weight_percent: number;
  asset_class: string;
}

export interface PortfolioSummary {
  cash_balance: number;
  total_equity: number;
  total_portfolio_value: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percent: number;
  realized_pnl: number;
  initial_balance: number;
  total_pnl: number;
  total_return_percent: number;
  positions: PositionOut[];
  currency: string;
}

export interface TradeOrderCreate {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  order_type?: 'MARKET' | 'LIMIT';
  price?: number;
  notes?: string;
}

export interface TradeProposal {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  estimated_price: number;
  total_estimated_cost: number;
  rationale: string;
  risk_level: string;
  status: 'PENDING_APPROVAL' | 'EXECUTED' | 'REJECTED';
}

export interface TradeTransactionOut {
  id: number;
  symbol: string;
  action: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  order_type: string;
  ai_rationale?: string;
  executed_at: string;
}

export interface WatchlistItemOut {
  id: number;
  symbol: string;
  company_name?: string;
  current_price?: number;
  change_percent?: number;
  notes?: string;
  added_at: string;
}

export interface TechnicalAnalystReport {
  trend: string;
  rsi_signal: string;
  ma_alignment: string;
  key_support: number;
  key_resistance: number;
  score: number;
  bullet_points: string[];
}

export interface FundamentalAnalystReport {
  valuation_verdict: string;
  growth_health: string;
  balance_sheet: string;
  score: number;
  bullet_points: string[];
}

export interface SentimentAnalystReport {
  sentiment: string;
  news_momentum: string;
  score: number;
  bullet_points: string[];
}

export interface RiskAnalystReport {
  risk_tier: string;
  volatility_assessment: string;
  suggested_stop_loss: number;
  risk_score: number;
  bullet_points: string[];
}

export interface PortfolioRecommendation {
  suggested_action: string;
  portfolio_fit: string;
  suggested_max_allocation_pct: number;
  proposed_trade?: TradeProposal;
}

export interface MultiAgentReportOut {
  id?: number;
  symbol: string;
  company_name: string;
  current_price: number;
  overall_rating: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  target_price?: number;
  stop_loss?: number;
  risk_score: number;
  confidence_score: number;
  summary: string;
  technical: TechnicalAnalystReport;
  fundamental: FundamentalAnalystReport;
  sentiment: SentimentAnalystReport;
  risk: RiskAnalystReport;
  recommendation: PortfolioRecommendation;
  created_at?: string;
}

export interface ChatMessageOut {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<{ tool: string; args: any }>;
  trade_proposal?: TradeProposal;
  created_at: string;
}

export interface UserProfileOut {
  id: number;
  username: string;
  email: string;
  risk_tolerance: string;
  investment_horizon: string;
  cash_balance: number;
  total_portfolio_value: number;
  currency: string;
  memory_facts: string[];
}
