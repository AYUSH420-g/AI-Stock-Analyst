import React, { useState } from 'react';
import { X, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfileOut } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileOut | null;
  onProfileUpdated: (p: UserProfileOut) => void;
  onPortfolioReset: () => void;
}

export const RiskSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onPortfolioReset
}) => {
  if (!isOpen || !profile) return null;

  const [riskTolerance, setRiskTolerance] = useState(profile.risk_tolerance);
  const [horizon, setHorizon] = useState(profile.investment_horizon);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateUserProfile({
        risk_tolerance: riskTolerance,
        investment_horizon: horizon
      });
      onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      alert(`Failed to save settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your virtual portfolio? All current positions and transaction history will be cleared, and virtual cash balance restored to ₹10,00,000 (10 Lakhs INR).')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetPortfolio();
      onPortfolioReset();
      onClose();
    } catch (err) {
      alert(`Reset failed: ${err}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Investor Profile & Memory</h3>
              <p className="text-xs text-slate-500">Configures AI reasoning and agent allocation limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Risk Tolerance */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Risk Tolerance Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Conservative', 'Moderate', 'Aggressive'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskTolerance(level)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center ${
                    riskTolerance === level
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {riskTolerance === 'Conservative' && 'Prioritizes capital preservation, blue-chip large caps (TCS, Reliance), and strict stop-losses.'}
              {riskTolerance === 'Moderate' && 'Balances growth and defensives, max 8% allocation per single stock.'}
              {riskTolerance === 'Aggressive' && 'Focuses on high-beta growth stocks, tech innovators, and maximum capital appreciation.'}
            </p>
          </div>

          {/* Investment Horizon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Investment Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Short-term', 'Medium-term', 'Long-term'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center ${
                    horizon === h
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Active Persistent Memory Facts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Active Long-Term AI Memory Context
            </label>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 max-h-32 overflow-y-auto text-xs text-slate-600 space-y-1">
              {profile.memory_facts.map((fact, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Portfolio */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Virtual Cash: <strong className="text-slate-800 font-bold">{formatINR(profile.cash_balance)}</strong>
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              Reset to ₹10,00,000
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Preferences Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
