import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Trash2,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { ChatMessageOut, UserProfileOut, PortfolioSummary, TradeProposal } from '../types';
import { api } from '../api/client';
import { formatINR } from '../utils/format';

interface Props {
  profile: UserProfileOut | null;
  portfolio: PortfolioSummary | null;
  onTradeExecuted: () => void;
  onSelectStock: (symbol: string) => void;
}

const QUICK_PROMPTS = [
  'Analyze TCS',
  'Why did my portfolio fall today?',
  'Compare TCS and INFY',
  'Suggest how I should diversify my virtual portfolio',
  'Buy 15 shares of RELIANCE'
];

export const AIChatInterface: React.FC<Props> = ({
  profile,
  portfolio,
  onTradeExecuted,
  onSelectStock
}) => {
  const [messages, setMessages] = useState<ChatMessageOut[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [processingProposalId, setProcessingProposalId] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const cash = portfolio?.cash_balance ?? 1000000;

  useEffect(() => {
    api.getChatHistory().then((hist) => {
      if (hist.length > 0) {
        setMessages(hist);
      } else {
        setMessages([
          {
            id: 0,
            role: 'assistant',
            content: `Namaste! I am your **AI Market & Portfolio Research Advisor**. I maintain active memory of your profile (**${
              profile?.risk_tolerance || 'Moderate'
            } Risk**, **${formatINR(cash)} Available Virtual Cash**).\n\nYou can ask me to analyze Indian equities (TCS, Reliance, Infosys, HDFC Bank), explain portfolio movements, compare stocks, or propose simulated trades. When I recommend a trade, I will ask for your explicit confirmation before executing.`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    }).catch(() => {});
  }, [profile, portfolio]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim() || sending) return;
    const userText = textToSend.trim();
    setInput('');
    setSending(true);

    const tempUserMsg: ChatMessageOut = {
      id: Date.now(),
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.sendMessage(userText);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `⚠️ Error executing request: ${err.message || 'Server error'}`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleProposalAction = async (msgId: number, proposal: TradeProposal, approved: boolean) => {
    setProcessingProposalId(msgId);
    try {
      await api.approveProposal({
        symbol: proposal.symbol,
        action: proposal.action,
        quantity: proposal.quantity,
        approved
      });
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId && m.trade_proposal) {
            return {
              ...m,
              trade_proposal: {
                ...m.trade_proposal,
                status: approved ? 'EXECUTED' : 'REJECTED'
              }
            };
          }
          return m;
        })
      );
      if (approved) {
        onTradeExecuted();
      }
    } catch (err: any) {
      alert(`Trade action failed: ${err.message}`);
    } finally {
      setProcessingProposalId(null);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear conversational chat history?')) return;
    try {
      await api.clearChat();
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: 'Chat history cleared. What stock or portfolio query would you like to explore?',
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      alert(`Clear failed: ${err}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-9.5rem)] flex flex-col space-y-4">
      {/* Memory Context Banner */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">Synchronized Conversational & Long-Term Memory</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Profile: <strong>{profile?.risk_tolerance || 'Moderate'}</strong> • Cash:{' '}
              <strong>{formatINR(cash)}</strong> • Active Positions:{' '}
              <strong>{portfolio?.positions.length || 0}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 self-end sm:self-center transition font-semibold"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Tool Call Pills */}
                  {m.tool_calls && m.tool_calls.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block w-full">
                        Tools Executed:
                      </span>
                      {m.tool_calls.map((t, i) => (
                        <span
                          key={i}
                          className="bg-white border border-slate-200 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold shadow-xs"
                        >
                          ⚙️ {t.tool}({JSON.stringify(t.args)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Human-in-the-Loop Trade Proposal Card */}
                {m.trade_proposal && (
                  <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-md space-y-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                        <AlertCircle className="w-4 h-4 text-indigo-600" />
                        <span>Simulated Paper Trade Proposal</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          m.trade_proposal.status === 'EXECUTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.trade_proposal.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {m.trade_proposal.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Action</span>
                        <span
                          className={`font-black ${
                            m.trade_proposal.action === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {m.trade_proposal.action}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Stock</span>
                        <button
                          onClick={() => onSelectStock(m.trade_proposal!.symbol)}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 underline"
                        >
                          {m.trade_proposal.symbol}
                        </button>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Shares</span>
                        <span className="font-extrabold text-slate-900">{m.trade_proposal.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium">Total Value</span>
                        <span className="font-black text-indigo-600">
                          {formatINR(m.trade_proposal.total_estimated_cost)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">"{m.trade_proposal.rationale}"</p>

                    {/* Action buttons if still pending */}
                    {m.trade_proposal.status === 'PENDING_APPROVAL' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleProposalAction(m.id, m.trade_proposal!, true)}
                          disabled={processingProposalId === m.id}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & Execute Paper Trade
                        </button>
                        <button
                          onClick={() => handleProposalAction(m.id, m.trade_proposal!, false)}
                          disabled={processingProposalId === m.id}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    ) : m.trade_proposal.status === 'EXECUTED' ? (
                      <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Simulated order was executed and added to virtual portfolio holdings!
                      </div>
                    ) : (
                      <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Trade proposal was declined by user.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 font-medium">
            <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>AI Advisor is consulting market tools and memory...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Suggestions:
        </span>
        {QUICK_PROMPTS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={sending}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition flex-shrink-0 disabled:opacity-50 shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question: e.g. 'Analyze TCS' or 'Buy 15 shares of RELIANCE'..."
          disabled={sending}
          className="w-full pl-4 pr-12 py-3.5 text-xs font-semibold bg-white rounded-2xl border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="absolute right-2.5 top-2.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-xs disabled:opacity-30"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
