'use client';

import React, { useState } from 'react';
import {
  History,
  Filter,
  Search,
  Activity,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Smartphone,
  Bot,
  User,
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function ActivityPage() {
  const { activityEvents } = useAppState();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = activityEvents.filter(evt => {
    if (filterType !== 'all' && evt.type !== filterType) return false;
    if (searchTerm && !evt.title.toLowerCase().includes(searchTerm.toLowerCase()) && !evt.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Activity & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable audit log of all scans, finding status updates, AI consultations, and report generations.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          {activityEvents.length} Events Logged
        </span>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'analysis_complete', label: 'Scans' },
            { id: 'finding_resolved', label: 'Resolutions' },
            { id: 'finding_detected', label: 'Detections' },
            { id: 'report_generated', label: 'Reports' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === t.id
                  ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative pl-10">
              {/* Timeline Dot */}
              <div className="absolute left-2.5 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand-cyan border-4 border-[#07090e] shadow-md" />

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-100 font-mono">{evt.title}</h3>
                    {evt.metadata?.severity && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {evt.metadata.severity}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
                  <img
                    src={evt.user.avatar}
                    alt={evt.user.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{evt.user.name} ({evt.user.email})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
