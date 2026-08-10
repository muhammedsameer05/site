import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No information available at this time.', icon: Icon = Inbox }) {
  return (
    <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-slate-200 bg-white/95 shadow-sm max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-700">{message}</h4>
    </div>
  );
}
