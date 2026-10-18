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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setNotificationsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d121c] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-cyan">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Notifications Center</h3>
                <p className="text-[11px] text-slate-400 font-mono">Real-time SecOps alert feed</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter */}
          <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between text-xs">
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
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-cyan shrink-0" />
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
          <div className="p-3 bg-[#0a0e16] border-t border-slate-800 text-center">
            <p className="text-[11px] font-mono text-slate-400">
              VulnCope Security Event Stream • Local Dispatcher
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
