'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Code2,
  Terminal,
  Zap,
  Radio,
  Settings,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
  Sparkles
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { SecurityEngine } from '@/types';

export default function SecurityEnginesPage() {
  const { engines } = useAppState();
  const [selectedEngine, setSelectedEngine] = useState<SecurityEngine | null>(null);

  const getEngineIcon = (iconType: SecurityEngine['iconType']) => {
    switch (iconType) {
      case 'shield': return Shield;
      case 'code': return Code2;
      case 'terminal': return Terminal;
      case 'zap': return Zap;
      case 'radio': return Radio;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Security Engines & Integrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Simulation Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Underlying mobile security analysis analyzers orchestrated by the SentinelX intelligence layer.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Engines executed in deterministic simulation for FYP prototype.</span>
        </div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engines.map((engine) => {
          const Icon = getEngineIcon(engine.iconType);
          return (
            <div
              key={engine.id}
              className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {engine.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{engine.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{engine.tagline}</p>
                </div>

                {/* Capabilities list */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Orchestrated Capabilities:
                  </span>
                  {engine.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engine Metadata & Config Action */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Version: {engine.version}</span>
                  <span>Checks: {engine.totalChecks}</span>
                </div>

                <button
                  onClick={() => setSelectedEngine(engine)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure Rules & Parameters</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engine Configuration Modal */}
      {selectedEngine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#0d121c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden glass-panel-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white font-mono">
                  Configure {selectedEngine.name} Engine
                </h3>
              </div>
              <button
                onClick={() => setSelectedEngine(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Engine is currently running in FYP Simulation Sandbox. Changes will be saved to local state.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">ENABLED SECURITY RULES</label>
                  <input
                    type="number"
                    defaultValue={selectedEngine.config.enabledRules}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">EXECUTION TIMEOUT (SECONDS)</label>
                  <input
                    type="number"
                    defaultValue={selectedEngine.config.timeoutSeconds}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" defaultChecked={selectedEngine.config.deepDecompilation} className="rounded bg-slate-900 border-slate-700 text-brand-cyan" />
                    <span>Deep Smali/AST decompilation pass</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" defaultChecked={selectedEngine.config.aiPostProcessing} className="rounded bg-slate-900 border-slate-700 text-brand-cyan" />
                    <span>AI Copilot finding deduplication and correlation</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0a0e16] border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEngine(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedEngine(null)}
                className="px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 text-xs font-mono font-bold"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
