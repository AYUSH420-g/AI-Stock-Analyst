import React, { useState } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Search,
  PieChart,
  Bot,
  MessageSquareCode,
  Shield,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { PortfolioSummary, UserProfileOut } from '../types';
import { formatINR } from '../utils/format';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portfolio: PortfolioSummary | null;
  profile: UserProfileOut | null;
  onOpenRiskSettings: () => void;
  onOpenTradeModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  portfolio,
  profile,
  onOpenRiskSettings,
  onOpenTradeModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Stock Explorer', icon: Search },
    { id: 'portfolio', label: 'Virtual Portfolio', icon: PieChart },
    { id: 'agents', label: 'Multi-Agent Hub', icon: Bot, badge: '5 Agents' },
    { id: 'chat', label: 'AI Advisor', icon: MessageSquareCode, badge: 'HITL' },
  ];

  const totalValue = portfolio?.total_portfolio_value ?? 1000000;
  const cash = portfolio?.cash_balance ?? 1000000;
  const unrealized = portfolio?.total_unrealized_pnl ?? 0;
  const unrealizedPct = portfolio?.total_unrealized_pnl_percent ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">AlphaAgent</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  NSE / BSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Virtual Paper Trading & Multi-Agent AI</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-indigo-400 text-slate-900' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side Portfolio Ticker & Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Live Ticker Card */}
            <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Net Worth</span>
                <span className="font-bold text-slate-900">{formatINR(totalValue)}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                  <Wallet className="w-2.5 h-2.5" /> Cash
                </span>
                <span className="font-semibold text-slate-700">{formatINR(cash)}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Unrealized</span>
                <span className={`font-bold ${unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {unrealized >= 0 ? '+' : ''}{formatINR(unrealized)} ({unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Quick Trade Button */}
            <button
              onClick={onOpenTradeModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Paper Trade
            </button>

            {/* Risk Profile Modal Trigger */}
            <button
              onClick={onOpenRiskSettings}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition shadow-xs"
              title="Edit Risk Settings and View Persistent Memory"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>{profile?.risk_tolerance || 'Moderate'}</span>
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenTradeModal}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Trade
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs mb-3">
            <div>
              <span className="text-slate-400 block text-[10px]">Net Worth</span>
              <span className="font-bold text-slate-900">{formatINR(totalValue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Liquid Cash</span>
              <span className="font-semibold text-slate-700">{formatINR(cash)}</span>
            </div>
            <button
              onClick={() => {
                onOpenRiskSettings();
                setMobileMenuOpen(false);
              }}
              className="text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
            >
              <Shield className="w-3 h-3" /> {profile?.risk_tolerance || 'Moderate'}
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
