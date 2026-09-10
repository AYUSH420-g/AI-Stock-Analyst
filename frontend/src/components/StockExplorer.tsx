import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Bot,
  DollarSign,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  StockQuote,
  StockHistory,
  TechnicalIndicators,
  FinancialMetrics,
  NewsItem,
  WatchlistItemOut
} from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  initialSymbol?: string;
  onOpenTradeModal: (symbol: string) => void;
  onNavigateToAgents: (symbol: string) => void;
}

const POPULAR_CHIPS = [
  { symbol: 'TCS.NS', label: 'TCS' },
  { symbol: 'RELIANCE.NS', label: 'Reliance' },
  { symbol: 'INFY.NS', label: 'Infosys' },
  { symbol: 'HDFCBANK.NS', label: 'HDFC Bank' },
  { symbol: 'TATAMOTORS.NS', label: 'Tata Motors' },
  { symbol: 'ICICIBANK.NS', label: 'ICICI Bank' },
  { symbol: 'ITC.NS', label: 'ITC' },
  { symbol: 'AAPL', label: 'Apple' },
  { symbol: 'NVDA', label: 'NVIDIA' },
];

export const StockExplorer: React.FC<Props> = ({
  initialSymbol = 'TCS.NS',
  onOpenTradeModal,
  onNavigateToAgents
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistory | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [fundamentals, setFundamentals] = useState<FinancialMetrics | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItemOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getWatchlist().then(setWatchlist).catch(() => {});
  }, []);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setErrorMsg(null);

    Promise.all([
      api.getQuote(symbol),
      api.getHistory(symbol, timeframe),
      api.getIndicators(symbol),
      api.getFundamentals(symbol),
      api.getNews(symbol),
    ])
      .then(([q, h, ind, f, n]) => {
        if (!isCurrent) return;
        setQuote(q);
        setHistory(h);
        setIndicators(ind);
        setFundamentals(f);
        setNews(n);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setErrorMsg(err.message || 'Failed to load stock data');
      })
      .finally(() => {
        if (!isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [symbol, timeframe]);

  const isWatchlisted = watchlist.some(
    (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
  );

  const toggleWatchlist = async () => {
    try {
      if (isWatchlisted) {
        await api.removeFromWatchlist(symbol);
        setWatchlist((prev) => prev.filter((i) => i.symbol.toUpperCase() !== symbol.toUpperCase()));
      } else {
        const added = await api.addToWatchlist(symbol);
        setWatchlist((prev) => [added, ...prev]);
      }
    } catch (err: any) {
      alert(`Watchlist error: ${err.message}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Chips Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stock (e.g. TCS, RELIANCE, INFY)..."
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Popular Equities:
          </span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.symbol}
              onClick={() => setSymbol(chip.symbol)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex-shrink-0 ${
                symbol === chip.symbol
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Stock Overview Card */}
      {quote && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">{quote.symbol}</h1>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {quote.sector || 'Indian Equities'}
                </span>
                <span className="text-xs font-bold text-slate-400">NSE / BSE</span>
                <button
                  onClick={toggleWatchlist}
                  className={`p-1.5 rounded-xl border transition ${
                    isWatchlisted
                      ? 'bg-amber-50 border-amber-300 text-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500">{quote.company_name}</p>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatINR(quote.price)}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-bold ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {isPositive ? '+' : ''}{formatINR(quote.change)} ({isPositive ? '+' : ''}
                    {quote.change_percent}%)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenTradeModal(quote.symbol)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  Paper Trade
                </button>
                <button
                  onClick={() => onNavigateToAgents(quote.symbol)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Bot className="w-4 h-4" />
                  5-Agent Audit
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Day Open</span>
              <span className="font-extrabold text-slate-800">{formatINR(quote.open)}</span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Day High / Low</span>
              <span className="font-extrabold text-slate-800">
                {formatINR(quote.high)} / {formatINR(quote.low)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Volume</span>
              <span className="font-extrabold text-slate-800">{quote.volume.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Market Cap</span>
              <span className="font-extrabold text-slate-800">
                {quote.market_cap ? `₹${(quote.market_cap / 1e7).toFixed(1)} Cr` : 'N/A'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">P/E Multiple</span>
              <span className="font-extrabold text-slate-800">
                {quote.pe_ratio ? `${quote.pe_ratio.toFixed(1)}x` : 'N/A'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">52-Week Range</span>
              <span className="font-extrabold text-slate-800">
                {formatINR(quote.fifty_two_week_low)} - {formatINR(quote.fifty_two_week_high)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-slate-900 text-sm">Historical Price Trajectory (INR ₹)</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['1D', '1W', '1M', '6M', '1Y', '5Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  timeframe === tf
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          {history && history.candles.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.candles}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v.length > 10 ? v.substring(5, 10) : v)}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v.toFixed(0)}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="text-slate-400">{data.timestamp}</div>
                          <div className="text-sm font-extrabold text-emerald-400">Close: {formatINR(data.close)}</div>
                          <div className="text-slate-300">
                            High: {formatINR(data.high)} | Low: {formatINR(data.low)}
                          </div>
                          <div className="text-slate-400">Vol: {data.volume?.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading price candles...
            </div>
          )}
        </div>
      </div>

      {/* Technical Indicators & Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Indicators */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Technical Indicators</h3>
            </div>
            {indicators && (
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  indicators.current_trend === 'Bullish'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : indicators.current_trend === 'Bearish'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Trend: {indicators.current_trend} ({indicators.signal_summary})
              </span>
            )}
          </div>

          {indicators && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">RSI (14-Day)</span>
                <span className="text-base font-black text-slate-900">{indicators.rsi}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {indicators.rsi && indicators.rsi > 70 ? 'Overbought (>70)' : indicators.rsi && indicators.rsi < 30 ? 'Oversold (<30)' : 'Neutral Range'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">SMA 20 / 50</span>
                <span className="font-extrabold text-slate-900">
                  {formatINR(indicators.sma20)} / {indicators.sma50 ? formatINR(indicators.sma50) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">Moving Averages</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">MACD Line</span>
                <span className="font-extrabold text-slate-900">{indicators.macd}</span>
                <span className="text-[10px] text-slate-500 block font-medium">Signal: {indicators.macd_signal}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-3">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
                  <span>Bollinger Lower: {formatINR(indicators.lower_band)}</span>
                  <span className="font-extrabold text-slate-700">Volatility Band Range</span>
                  <span>Bollinger Upper: {formatINR(indicators.upper_band)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fundamental Metrics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Fundamental Health & Valuation</h3>
            </div>
          </div>

          {fundamentals && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Trailing P/E</span>
                <span className="font-black text-slate-900">
                  {fundamentals.pe_ratio ? `${fundamentals.pe_ratio.toFixed(1)}x` : 'N/A'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Forward P/E</span>
                <span className="font-black text-slate-900">
                  {fundamentals.forward_pe ? `${fundamentals.forward_pe.toFixed(1)}x` : 'N/A'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Beta (Volatility)</span>
                <span className="font-black text-slate-900">
                  {fundamentals.beta ? fundamentals.beta.toFixed(2) : '1.00'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Profit Margin</span>
                <span className="font-black text-slate-900">
                  {fundamentals.profit_margins ? `${(fundamentals.profit_margins * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Debt to Equity</span>
                <span className="font-black text-slate-900">
                  {fundamentals.debt_to_equity ? `${fundamentals.debt_to_equity.toFixed(1)}` : 'Low'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Dividend Yield</span>
                <span className="font-black text-slate-900">
                  {fundamentals.dividend_yield ? `${(fundamentals.dividend_yield * 100).toFixed(2)}%` : '0.00%'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* News & Market Sentiment Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Company Headlines & Sentiment</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Analyzed by Sentiment Agent</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-medium">
                  <span>{item.publisher}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      item.sentiment === 'Bullish'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.sentiment === 'Bearish'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition line-clamp-2">
                  {item.title}
                </h4>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/50">
                <span>{item.published_at}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
