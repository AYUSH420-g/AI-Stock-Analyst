import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  LineChart,
  Newspaper,
  ShieldAlert,
  Briefcase,
  Play,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Target,
  Compass,
  AlertTriangle,
  History
} from 'lucide-react';
import { MultiAgentReportOut } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  initialSymbol?: string;
  onOpenTradeModal: (symbol: string, action?: 'BUY' | 'SELL') => void;
}

const AGENT_STEPS = [
  { id: 'technical', name: 'Technical Analyst', icon: LineChart, desc: 'RSI, SMA 20/50/200, MACD & chart levels' },
  { id: 'fundamental', name: 'Fundamental Analyst', icon: Activity, desc: 'Valuation multiples, margins & balance sheet' },
  { id: 'sentiment', name: 'News & Sentiment Analyst', icon: Newspaper, desc: 'Media coverage, headline sentiment & momentum' },
  { id: 'risk', name: 'Risk & Volatility Analyst', icon: ShieldAlert, desc: 'Market beta, drawdown risk & stop-loss' },
  { id: 'portfolio', name: 'Portfolio Manager', icon: Briefcase, desc: 'Synthesizes consensus rating & allocation sizing' },
];

export const MultiAgentHub: React.FC<Props> = ({
  initialSymbol = 'TCS.NS',
  onOpenTradeModal
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [running, setRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [report, setReport] = useState<MultiAgentReportOut | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [pastReports, setPastReports] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getReports().then(setPastReports).catch(() => {});
  }, []);

  const handleRunAnalysis = async (targetSym: string = symbol) => {
    if (!targetSym.trim()) return;
    const clean = targetSym.trim().toUpperCase();
    setSymbol(clean);
    setRunning(true);
    setErrorMsg(null);
    setReport(null);
    setAgentLogs([]);
    setActiveStepIndex(0);

    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await api.runAnalysis(clean);
      clearInterval(stepInterval);
      setActiveStepIndex(4);
      setReport(res.report);
      setAgentLogs(res.agent_logs);
      api.getReports().then(setPastReports).catch(() => {});
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'LangGraph analysis failed');
    } finally {
      setRunning(false);
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'STRONG_BUY':
        return 'bg-emerald-600 text-white shadow-emerald-500/20';
      case 'BUY':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'HOLD':
        return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'SELL':
        return 'bg-rose-500 text-white shadow-rose-500/20';
      case 'STRONG_SELL':
        return 'bg-rose-700 text-white shadow-rose-700/20';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            LangGraph Multi-Agent Orchestration
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
            Collaborative AI Investment Committee
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            5 specialized AI analyst agents analyze technical charts, balance sheets, news sentiment, and portfolio risk in an orchestrated state graph to generate an institutional-grade research memo with price targets in INR (₹).
          </p>
        </div>

        {/* Search & Trigger Input */}
        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. TCS, RELIANCE, INFY"
            className="bg-white/10 text-white placeholder-slate-400 px-3.5 py-2 text-xs font-bold tracking-wider rounded-xl focus:outline-none border border-transparent focus:border-indigo-400 w-44"
          />
          <button
            onClick={() => handleRunAnalysis()}
            disabled={running}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running Agents...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Orchestration Visual Pipeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span>LangGraph Multi-Agent Workflow State</span>
          <span className="text-slate-400 font-medium">Stateful Execution Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {AGENT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = report !== null || idx < activeStepIndex;
            const isCurrent = running && idx === activeStepIndex;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      isCurrent
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{step.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-medium">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Execution Logs Stream */}
        {agentLogs.length > 0 && (
          <div className="mt-3 bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
            <div className="text-slate-400 font-sans font-bold text-[10px] uppercase tracking-wider mb-1">
              LangGraph State Transitions:
            </div>
            {agentLogs.map((log, i) => (
              <div key={i} className="text-emerald-400">
                &gt; {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Synthesized Research Report */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Rating Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <span>Synthesized Multi-Agent Research Memo</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                  {report.company_name} ({report.symbol})
                </h3>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consensus Verdict</span>
                  <span
                    className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase shadow-xs inline-block mt-0.5 ${getRatingBadge(
                      report.overall_rating
                    )}`}
                  >
                    {report.overall_rating.replace('_', ' ')}
                  </span>
                </div>

                {report.target_price && (
                  <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">12M Target Price</span>
                    <span className="text-base font-black text-slate-900">
                      {formatINR(report.target_price)}
                    </span>
                  </div>
                )}

                {report.stop_loss && (
                  <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Stop-Loss Level</span>
                    <span className="text-base font-black text-rose-600">
                      {formatINR(report.stop_loss)}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onOpenTradeModal(report.symbol, report.overall_rating.includes('BUY') ? 'BUY' : 'SELL')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Execute Trade on Signal
                </button>
              </div>
            </div>

            {/* Confidence & Risk Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Agent Committee Confidence
                  </span>
                  <span>{report.confidence_score}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${report.confidence_score}%` }}
                    className="h-full bg-indigo-600 rounded-full transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Quantified Risk Score
                  </span>
                  <span>{report.risk_score} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${report.risk_score}%` }}
                    className={`h-full rounded-full transition-all ${
                      report.risk_score > 65
                        ? 'bg-rose-500'
                        : report.risk_score > 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-900 block mb-1 font-bold">Executive Committee Synthesis:</strong>
              {report.summary}
            </div>
          </div>

          {/* 4 Specialized Analyst Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Analyst Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Technical Analyst Memo
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Score: {report.technical.score}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Trend</span>
                  <span className="font-extrabold text-slate-800">{report.technical.trend}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">RSI Signal</span>
                  <span className="font-extrabold text-slate-800">{report.technical.rsi_signal}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                {report.technical.bullet_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Fundamental Analyst Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Fundamental Analyst Memo
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Score: {report.fundamental.score}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Valuation</span>
                  <span className="font-extrabold text-slate-800">{report.fundamental.valuation_verdict}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Balance Sheet</span>
                  <span className="font-extrabold text-slate-800">{report.fundamental.balance_sheet}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                {report.fundamental.bullet_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Sentiment Analyst Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Sentiment & News Analyst Memo
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Score: {report.sentiment.score}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Headline Sentiment</span>
                  <span className="font-extrabold text-slate-800">{report.sentiment.sentiment}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">News Momentum</span>
                  <span className="font-extrabold text-slate-800">{report.sentiment.news_momentum}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                {report.sentiment.bullet_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Risk Analyst Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Risk & Volatility Memo
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tier: {report.risk.risk_tier}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Volatility Exposure</span>
                  <span className="font-extrabold text-slate-800">{report.risk.volatility_assessment}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-medium">Stop-Loss Target</span>
                  <span className="font-black text-rose-600">{formatINR(report.risk.suggested_stop_loss)}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                {report.risk.bullet_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Portfolio Manager Recommendation */}
          <div className="bg-indigo-50/60 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
                <Compass className="w-4 h-4" />
                Portfolio Manager Sizing Guidance
              </div>
              <p className="text-xs text-slate-700 font-medium">
                {report.recommendation.portfolio_fit}. Recommended maximum position limit is{' '}
                <strong className="text-slate-900 font-extrabold">{report.recommendation.suggested_max_allocation_pct}%</strong> of portfolio.
              </p>
            </div>

            {report.recommendation.proposed_trade && (
              <button
                onClick={() =>
                  onOpenTradeModal(
                    report.recommendation.proposed_trade!.symbol,
                    report.recommendation.proposed_trade!.action
                  )
                }
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex-shrink-0"
              >
                Execute Proposed Trade ({report.recommendation.proposed_trade.action}{' '}
                {report.recommendation.proposed_trade.quantity} shs)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Past Reports History */}
      {pastReports.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Previous Multi-Agent Reports
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pastReports.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRunAnalysis(r.symbol)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-left transition space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900 group-hover:text-indigo-600">{r.symbol}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.overall_rating?.includes('BUY')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.overall_rating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{r.summary}</p>
                <div className="text-[10px] text-slate-400 font-semibold">
                  Target: {r.target_price ? formatINR(r.target_price) : 'N/A'} • Risk: {r.risk_score}/100
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
