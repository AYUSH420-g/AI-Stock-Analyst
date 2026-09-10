import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react';
import { StockQuote, PortfolioSummary } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultAction?: 'BUY' | 'SELL';
  portfolio: PortfolioSummary | null;
  onTradeExecuted: () => void;
}

export const TradeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultSymbol = 'TCS.NS',
  defaultAction = 'BUY',
  portfolio,
  onTradeExecuted
}) => {
  if (!isOpen) return null;

  const [symbol, setSymbol] = useState(defaultSymbol);
  const [action, setAction] = useState<'BUY' | 'SELL'>(defaultAction);
  const [quantity, setQuantity] = useState<number>(10);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSymbol(defaultSymbol);
    setAction(defaultAction);
  }, [defaultSymbol, defaultAction]);

  useEffect(() => {
    if (!symbol) return;
    let isCurrent = true;
    setLoadingQuote(true);
    setErrorMsg(null);
    api.getQuote(symbol)
      .then((q) => {
        if (isCurrent) {
          setQuote(q);
          setLimitPrice(q.price);
        }
      })
      .catch((err) => {
        if (isCurrent) setErrorMsg(err.message);
      })
      .finally(() => {
        if (isCurrent) setLoadingQuote(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [symbol]);

  const execPrice = orderType === 'LIMIT' && limitPrice > 0 ? limitPrice : (quote?.price || 0);
  const totalCost = Math.round(execPrice * quantity * 100) / 100;
  const cashAvailable = portfolio?.cash_balance || 0;

  const currentPosition = portfolio?.positions.find(
    (p) => p.symbol.toUpperCase() === symbol.toUpperCase()
  );
  const sharesOwned = currentPosition?.quantity || 0;

  const canAfford = action === 'BUY' ? cashAvailable >= totalCost : sharesOwned >= quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero');
      return;
    }
    if (!canAfford) {
      if (action === 'BUY') {
        setErrorMsg(`Insufficient virtual cash. Required: ${formatINR(totalCost)}, Available: ${formatINR(cashAvailable)}`);
      } else {
        setErrorMsg(`Insufficient shares. Owned: ${sharesOwned}, Trying to sell: ${quantity}`);
      }
      return;
    }

    setExecuting(true);
    setErrorMsg(null);
    try {
      await api.placeTrade({
        symbol,
        action,
        quantity,
        order_type: orderType,
        price: orderType === 'LIMIT' ? limitPrice : undefined,
        notes: `Manual simulated ${action.toLowerCase()} order in virtual portfolio.`
      });
      onTradeExecuted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Paper Trade Order</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Zero Risk
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAction('BUY')}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                action === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              BUY (Go Long)
            </button>
            <button
              type="button"
              onClick={() => setAction('SELL')}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                action === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              SELL (Liquidate)
            </button>
          </div>

          {/* Symbol input & Live Quote Banner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stock Ticker Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. TCS.NS, RELIANCE.NS, INFY.NS"
              className="w-full px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {loadingQuote ? (
              <div className="text-xs text-slate-400 mt-1">Fetching live quote...</div>
            ) : quote ? (
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-1 font-medium">
                <span>{quote.company_name}</span>
                <span className="font-extrabold text-slate-900">
                  {formatINR(quote.price)}{' '}
                  <span className={quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ({quote.change_percent >= 0 ? '+' : ''}{quote.change_percent}%)
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          {/* Order Type & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Shares</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Limit Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Balance Context */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                Available Virtual Cash
              </span>
              <span className="font-extrabold text-slate-800">{formatINR(cashAvailable)}</span>
            </div>
            {action === 'SELL' && (
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Owned Shares:</span>
                <span className="font-extrabold text-slate-800">{sharesOwned} shares</span>
              </div>
            )}
            <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-slate-900 font-bold">
              <span>Estimated Order Value:</span>
              <span className="text-sm font-black text-indigo-600">{formatINR(totalCost)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={executing || !quote || !canAfford}
              className={`w-full py-3 rounded-xl text-xs font-extrabold text-white shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {executing ? (
                'Executing Paper Trade...'
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Confirm & Execute {action} {quantity} {symbol}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
