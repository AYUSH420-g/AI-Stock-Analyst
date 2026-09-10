import {
  StockQuote,
  StockHistory,
  TechnicalIndicators,
  FinancialMetrics,
  NewsItem,
  PortfolioSummary,
  TradeOrderCreate,
  TradeTransactionOut,
  WatchlistItemOut,
  MultiAgentReportOut,
  ChatMessageOut,
  UserProfileOut
} from '../types';

const BASE_URL = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text();
    let msg = `HTTP Error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      msg = errJson.detail || msg;
    } catch {
      msg = errText || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // Market
  searchSymbols: (q: string) => fetchJson<Array<{ symbol: string; name: string; sector: string; currency: string }>>(`/market/search?q=${encodeURIComponent(q)}`),
  getQuote: (symbol: string) => fetchJson<StockQuote>(`/market/quote/${encodeURIComponent(symbol)}`),
  getHistory: (symbol: string, timeframe: string = '1M') => fetchJson<StockHistory>(`/market/history/${encodeURIComponent(symbol)}?timeframe=${timeframe}`),
  getIndicators: (symbol: string) => fetchJson<TechnicalIndicators>(`/market/indicators/${encodeURIComponent(symbol)}`),
  getFundamentals: (symbol: string) => fetchJson<FinancialMetrics>(`/market/fundamentals/${encodeURIComponent(symbol)}`),
  getNews: (symbol: string) => fetchJson<NewsItem[]>(`/market/news/${encodeURIComponent(symbol)}`),

  // Portfolio & Paper Trades
  getPortfolioSummary: () => fetchJson<PortfolioSummary>('/portfolio/summary'),
  placeTrade: (order: TradeOrderCreate) => fetchJson<TradeTransactionOut>('/portfolio/trade', {
    method: 'POST',
    body: JSON.stringify(order)
  }),
  approveProposal: (data: { symbol: string; action: string; quantity: number; approved: boolean }) => fetchJson<TradeTransactionOut>('/portfolio/approve-proposal', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getTransactions: () => fetchJson<TradeTransactionOut[]>('/portfolio/transactions'),
  resetPortfolio: () => fetchJson<{ message: string }>('/portfolio/reset', { method: 'POST' }),

  // Watchlist
  getWatchlist: () => fetchJson<WatchlistItemOut[]>('/watchlist'),
  addToWatchlist: (symbol: string, notes?: string) => fetchJson<WatchlistItemOut>('/watchlist/add', {
    method: 'POST',
    body: JSON.stringify({ symbol, notes })
  }),
  removeFromWatchlist: (symbol: string) => fetchJson<{ success: boolean; symbol: string }>(`/watchlist/${encodeURIComponent(symbol)}`, {
    method: 'DELETE'
  }),

  // Multi-Agent Analysis
  runAnalysis: (symbol: string) => fetchJson<{ report: MultiAgentReportOut; agent_logs: string[] }>(`/analysis/run?symbol=${encodeURIComponent(symbol)}`, {
    method: 'POST'
  }),
  getReports: () => fetchJson<Array<Partial<MultiAgentReportOut>>>('/analysis/reports'),

  // AI Chat & Memory
  getChatHistory: () => fetchJson<ChatMessageOut[]>('/chat/history'),
  sendMessage: (message: string) => fetchJson<ChatMessageOut>('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),
  clearChat: () => fetchJson<{ message: string }>('/chat/clear', { method: 'DELETE' }),

  // User Profile
  getUserProfile: () => fetchJson<UserProfileOut>('/user/profile'),
  updateUserProfile: (data: { risk_tolerance?: string; investment_horizon?: string }) => fetchJson<UserProfileOut>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
