import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2 shadow-xs">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong className="font-bold text-amber-950">Educational Paper Trading Simulator:</strong> All data, trade executions, and AI multi-agent recommendations are virtual simulations. Designed for quantitative learning, not real-money advice.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        <span>Virtual Balance: ₹10,00,000 (10 Lakhs INR)</span>
      </div>
    </div>
  );
};
