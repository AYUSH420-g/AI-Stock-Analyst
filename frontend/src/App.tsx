import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StockExplorer } from './components/StockExplorer';
import { VirtualPortfolio } from './components/VirtualPortfolio';
import { MultiAgentHub } from './components/MultiAgentHub';
import { AIChatInterface } from './components/AIChatInterface';
import { TradeModal } from './components/TradeModal';
import { RiskSettingsModal } from './components/RiskSettingsModal';
import { PortfolioSummary, UserProfileOut } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TCS.NS');
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [profile, setProfile] = useState<UserProfileOut | null>(null);

  // Modals
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('AAPL');
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [riskModalOpen, setRiskModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [port, prof] = await Promise.all([
        api.getPortfolioSummary(),
        api.getUserProfile()
      ]);
      setPortfolio(port);
      setProfile(prof);
    } catch (err) {
      console.error('Failed to load portfolio or profile:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTradeModal = (symbol?: string, action: 'BUY' | 'SELL' = 'BUY') => {
    setTradeSymbol(symbol || selectedSymbol || 'AAPL');
    setTradeAction(action);
    setTradeModalOpen(true);
  };

  const handleNavigateToStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('explorer');
  };

  const handleNavigateToAgents = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('agents');
  };

  const handleDashboardNavigate = (tab: string, symbol?: string) => {
    if (symbol) setSelectedSymbol(symbol);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Top Educational Disclaimer */}
      <DisclaimerBanner />

      {/* Main Header & Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portfolio={portfolio}
        profile={profile}
        onOpenRiskSettings={() => setRiskModalOpen(true)}
        onOpenTradeModal={() => handleOpenTradeModal()}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            portfolio={portfolio}
            onNavigate={handleDashboardNavigate}
            onOpenTradeModal={(sym) => handleOpenTradeModal(sym)}
          />
        )}

        {activeTab === 'explorer' && (
          <StockExplorer
            initialSymbol={selectedSymbol}
            onOpenTradeModal={(sym) => handleOpenTradeModal(sym)}
            onNavigateToAgents={(sym) => handleNavigateToAgents(sym)}
          />
        )}

        {activeTab === 'portfolio' && (
          <VirtualPortfolio
            portfolio={portfolio}
            onRefresh={loadData}
            onOpenTradeModal={(sym, act) => handleOpenTradeModal(sym, act)}
            onSelectStock={handleNavigateToStock}
          />
        )}

        {activeTab === 'agents' && (
          <MultiAgentHub
            initialSymbol={selectedSymbol}
            onOpenTradeModal={(sym, act) => handleOpenTradeModal(sym, act)}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatInterface
            profile={profile}
            portfolio={portfolio}
            onTradeExecuted={loadData}
            onSelectStock={handleNavigateToStock}
          />
        )}
      </main>

      {/* Modals */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        defaultSymbol={tradeSymbol}
        defaultAction={tradeAction}
        portfolio={portfolio}
        onTradeExecuted={loadData}
      />

      <RiskSettingsModal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        profile={profile}
        onProfileUpdated={(p) => setProfile(p)}
        onPortfolioReset={loadData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap text-slate-600 font-medium">
          <span>React 18</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>FastAPI</span>
          <span>•</span>
          <span>LangGraph Multi-Agent Architecture</span>
          <span>•</span>
          <span>PostgreSQL / SQLite</span>
          <span>•</span>
          <span>yfinance Real-time Quotes</span>
        </div>
        <p>
          AlphaAgent is an educational stock market simulator and multi-agent research platform. Simulated paper-trading only.
        </p>
      </footer>
    </div>
  );
};

export default App;
