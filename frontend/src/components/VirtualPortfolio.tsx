import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { PortfolioSummary, TradeTransactionOut } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  portfolio: PortfolioSummary | null;
  onRefresh: () => void;
  onOpenTradeModal: (symbol?: string, action?: 'BUY' | 'SELL') => void;
  onSelectStock: (symbol: string) => void;
}

export const VirtualPortfolio: React.FC<Props> = ({
  portfolio,
  onRefresh,
  onOpenTradeModal,
  onSelectStock
}) => {
  const [transactions, setTransactions] = useState<TradeTransactionOut[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'positions' | 'transactions'>('positions');

  useEffect(() => {
    setLoadingTx(true);
    api.getTransactions()
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoadingTx(false));
  }, []);

  const totalValue = portfolio?.total_portfolio_value || 1000000;
  const cash = portfolio?.cash_balance || 1000000;
  const equity = portfolio?.total_equity || 0;
  const unrealized = portfolio?.total_unrealized_pnl || 0;
  const unrealizedPct = portfolio?.total_unrealized_pnl_percent || 0;
  const realized = portfolio?.realized_pnl || 0;
  const totalPnl = portfolio?.total_pnl || 0;
  const totalReturn = portfolio?.total_return_percent || 0;

  const positions = portfolio?.positions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Total Virtual Net Worth</span>
            <PieChart className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(totalValue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
            <span className={totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)} ({totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%)
            </span>
            <span className="text-slate-400 font-medium">total return</span>
          </div>
        </div>

        {/* Liquid Cash */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Liquid Virtual Cash</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(cash)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            <strong>{((cash / totalValue) * 100).toFixed(1)}%</strong> of total assets in cash
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Unrealized P&L (Open)</span>
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
            Active equity value: <strong>{formatINR(equity)}</strong>
          </div>
        </div>

        {/* Realized P&L */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Realized P&L (Closed Trades)</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              realized >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {realized >= 0 ? '+' : ''}{formatINR(realized)}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Locked from completed paper sales
          </div>
        </div>
      </div>

      {/* Asset Allocation Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span>Asset Allocation & Weighting</span>
          <span className="text-slate-400 font-medium">
            {positions.length} Active Positions + Liquid Cash Reserve
          </span>
        </div>

        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {positions.map((p, idx) => {
            const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
            const colorClass = colors[idx % colors.length];
            return (
              <div
                key={p.symbol}
                style={{ width: `${Math.max(1, p.weight_percent)}%` }}
                className={`${colorClass} hover:opacity-90 transition`}
                title={`${p.symbol}: ${p.weight_percent}%`}
              />
            );
          })}
          <div
            style={{ width: `${Math.max(1, (cash / totalValue) * 100)}%` }}
            className="bg-slate-300 hover:opacity-90 transition"
            title={`Cash: ${((cash / totalValue) * 100).toFixed(1)}%`}
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600 pt-1">
          {positions.map((p, idx) => {
            const dotColors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
            return (
              <div key={p.symbol} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                <span className="font-bold text-slate-900">{p.symbol}</span>
                <span className="text-slate-400">({p.weight_percent}%)</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="font-bold text-slate-900">Cash Reserve</span>
            <span className="text-slate-400">({((cash / totalValue) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('positions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'positions'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Open Holdings ({positions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Trade Audit History ({transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTradeModal()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Paper Trade
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition"
              title="Refresh Portfolio"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeSubTab === 'positions' ? (
          positions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Active Stock Holdings</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your portfolio is currently 100% in virtual cash ({formatINR(cash)}). Explore Indian or global stocks in Stock Explorer or ask the AI Advisor to execute paper trades!
              </p>
              <button
                onClick={() => onOpenTradeModal('TCS.NS', 'BUY')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                Buy First Paper Stock (e.g. TCS)
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-4 py-3 text-right">Shares</th>
                    <th className="px-4 py-3 text-right">Avg Cost</th>
                    <th className="px-4 py-3 text-right">Live Price</th>
                    <th className="px-4 py-3 text-right">Market Value</th>
                    <th className="px-4 py-3 text-right">Unrealized P&L</th>
                    <th className="px-4 py-3 text-center">Weight %</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {positions.map((p) => {
                    const isGain = p.unrealized_pnl >= 0;
                    return (
                      <tr key={p.symbol} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => onSelectStock(p.symbol)}
                            className="font-bold text-slate-900 hover:text-indigo-600 block text-left"
                          >
                            {p.symbol}
                          </button>
                          <span className="text-[11px] text-slate-400">{p.company_name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                          {p.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-600">
                          {formatINR(p.average_buy_price)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                          {formatINR(p.current_price)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-900">
                          {formatINR(p.market_value)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold">
                          <span className={isGain ? 'text-emerald-600' : 'text-rose-600'}>
                            {isGain ? '+' : ''}{formatINR(p.unrealized_pnl)} ({isGain ? '+' : ''}{p.unrealized_pnl_percent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {p.weight_percent}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => onOpenTradeModal(p.symbol, 'BUY')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => onOpenTradeModal(p.symbol, 'SELL')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total (₹)</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3 text-slate-400 text-[11px]">
                      {tx.executed_at?.substring(0, 16).replace('T', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                          tx.action === 'BUY'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tx.action === 'BUY' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {tx.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">{tx.symbol}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {tx.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatINR(tx.price)}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      {formatINR(tx.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {tx.order_type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'EXECUTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
