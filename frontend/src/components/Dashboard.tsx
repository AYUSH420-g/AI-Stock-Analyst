import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { PortfolioSummary, StockQuote, WatchlistItemOut } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  portfolio: PortfolioSummary | null;
  onNavigate: (tab: string, symbol?: string) => void;
  onOpenTradeModal: (symbol?: string) => void;
}

const FEATURED_TICKERS = ['TCS.NS', 'RELIANCE.NS', 'INFY.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS', 'ICICIBANK.NS'];

export const Dashboard: React.FC<Props> = ({
  portfolio,
  onNavigate,
  onOpenTradeModal
}) => {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    Promise.all(FEATURED_TICKERS.map((t) => api.getQuote(t)))
      .then((res) => {
        if (isCurrent) setQuotes(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) setLoadingQuotes(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const totalValue = portfolio?.total_portfolio_value || 1000000;
  const cash = portfolio?.cash_balance || 1000000;
  const unrealized = portfolio?.total_unrealized_pnl || 0;
  const unrealizedPct = portfolio?.total_unrealized_pnl_percent || 0;
  const positions = portfolio?.positions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Indian Equities & Quantitative Research
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
            Institutional Research & Virtual Paper Trading
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Explore live NSE/BSE stock technicals, test virtual portfolio strategies with ₹10,00,000 in paper cash, and collaborate with our 5-agent LangGraph committee before executing simulated trades.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('agents', 'TCS.NS')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Launch 5-Agent Audit
          </button>
          <button
            onClick={() => onOpenTradeModal('TCS.NS')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Paper Trade
          </button>
        </div>
      </div>

      {/* Portfolio Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('portfolio')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Portfolio Value</span>
            <PieChart className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(totalValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between font-medium">
            <span>{positions.length} active holdings</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('portfolio')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Available Paper Cash</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(cash)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between font-medium">
            <span>{((cash / totalValue) * 100).toFixed(0)}% cash buffer</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('portfolio')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Unrealized P&L</span>
            {unrealized >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {unrealized >= 0 ? '+' : ''}{formatINR(unrealized)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Return: <strong className={unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(2)}%
            </strong>
          </div>
        </div>

        <div
          onClick={() => onNavigate('chat')}
          className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-indigo-100 mb-1">
            <span className="font-semibold">AI Advisor Memory</span>
            <Bot className="w-4 h-4 text-white group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-extrabold tracking-tight">Active Memory</div>
          <div className="text-xs text-indigo-100 mt-2 flex items-center justify-between font-medium">
            <span>Ask "Why did my portfolio move?"</span>
            <ArrowRight className="w-3 h-3 text-white group-hover:translate-x-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Market Watch: Indian Bluechip Leaders */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Nifty 50 & Indian Bluechip Leaders
            </h3>
            <p className="text-xs text-slate-500 font-medium">Live market data tracked by the LangGraph multi-agent system</p>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Explore All Equities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingQuotes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotes.map((q) => {
              const isUp = q.change >= 0;
              return (
                <div
                  key={q.symbol}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition bg-white flex items-center justify-between group"
                >
                  <div
                    onClick={() => onNavigate('explorer', q.symbol)}
                    className="cursor-pointer space-y-0.5 flex-1 mr-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 group-hover:text-indigo-600 transition text-sm">
                        {q.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">NSE</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{q.company_name}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm font-black text-slate-900">
                      {formatINR(q.price)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isUp ? '+' : ''}{q.change_percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Agent Committee Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl w-fit">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">Technical & Fundamental Agents</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Calculates moving averages (SMA 20/50/200), RSI 14, MACD, and checks Indian corporate balance sheets, quarterly profit margins, and P/E valuations.
          </p>
          <button
            onClick={() => onNavigate('agents', 'TCS.NS')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 pt-1"
          >
            Audit TCS Technicals <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">Sentiment & Risk Agents</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Monitors Indian financial press (ET, Mint) and calculates Beta to generate tailored stop-loss recommendations and position caps.
          </p>
          <button
            onClick={() => onNavigate('agents', 'RELIANCE.NS')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-1"
          >
            Audit Reliance Sentiment <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">Human-in-the-Loop Safeguards</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            No agent executes trades autonomously. The AI prepares an interactive order card in the chat where you retain full authority to confirm or reject.
          </p>
          <button
            onClick={() => onNavigate('chat')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-1"
          >
            Open AI Chat Advisor <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
