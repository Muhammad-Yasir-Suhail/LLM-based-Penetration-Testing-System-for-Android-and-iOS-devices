'use client';

import React from 'react';
import { X, Bell, Check, AlertTriangle, ShieldCheck, Activity, FileText } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { formatSeverityColor } from '@/lib/utils';

export const NotificationDrawer: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, activityEvents, findings } = useAppState();

  if (!notificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in"
        onClick={() => setNotificationsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="slide-in-right w-screen max-w-md bg-[linear-gradient(180deg,#111214,#0a0b0d)] border-l border-white/[0.08] shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          {/* Header */}
          <div className="p-4 h-16 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="keycap p-1.5 text-[#ff6363]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Notifications Center</h3>
                <p className="text-[11px] text-slate-400 font-mono">Real-time SecOps alert feed</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] hover:rotate-90 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter */}
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">{activityEvents.length} updates logged</span>
            <button className="text-brand-cyan hover:underline text-[11px] font-mono">
              Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activityEvents.map((evt) => {
              return (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] hover:-translate-y-px transition-all duration-200 space-y-2 animate-in"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff6363] shadow-glow shrink-0" />
                      <h4 className="text-xs font-semibold text-slate-200">{evt.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">{evt.description}</p>
                  
                  <div className="flex items-center justify-between pl-4 pt-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
                    <span>{evt.user.name}</span>
                    {evt.metadata?.severity && (
                      <span className="text-rose-400 font-bold uppercase text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/30">
                        {evt.metadata.severity}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/[0.06] text-center">
            <p className="text-[11px] font-mono text-slate-400">
              VulnScope Security Event Stream • Local Dispatcher
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
