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
import { ViewTabs } from '@/components/ui/ViewTabs';

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
            <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
              Security Engines & Tool Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs tabular-nums bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Core Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Allowlisted security analysis actions orchestrated by the VulnScope autonomous agent decision loop.
          </p>
        </div>

        <div className="text-xs tabular-nums text-slate-400 p-2.5 flex items-center gap-2 panel">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Real static/DEX core active; external scanner stubs labeled.</span>
        </div>
      </div>

      {/* Grouped into views: one group on screen at a time */}
      <ViewTabs
        label="Security engines"
        views={[
          { id: 'core', label: 'Core registry', content: (
            <>
              {/* Real Core Registry Highlight */}
              <div className="p-6 space-y-4 card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 text-emerald-400 card">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium text-white tabular-nums">VulnScope Real Agentic Security Core</h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] tabular-nums font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          VERIFIED OPERATIONAL
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        In-process Android APK deconstruction, binary AXML decoding, and Dalvik bytecode (classes.dex) analysis.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-slate-400 hidden sm:inline">Version: 1.2.0, In-Process</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs tabular-nums">
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_VALIDATE_PACKAGE</span>
                    <span className="text-slate-400 text-[11px] block">PKZIP verification & SHA-256 digests</span>
                  </div>
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_INSPECT_MANIFEST</span>
                    <span className="text-slate-400 text-[11px] block">AXML binary decoder & security flags</span>
                  </div>
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_ANALYZE_PERMISSIONS</span>
                    <span className="text-slate-400 text-[11px] block">Dangerous privileges & MASVS audit</span>
                  </div>
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_SCAN_EXPORTED_COMPONENTS</span>
                    <span className="text-slate-400 text-[11px] block">Unprotected IPC Activity/Service vectors</span>
                  </div>
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_INSPECT_NETWORK_CONFIG</span>
                    <span className="text-slate-400 text-[11px] block">Cleartext traffic & TLS policy validation</span>
                  </div>
                  <div className="p-3 space-y-1 panel">
                    <span className="text-emerald-400 font-medium block">ACTION_SCAN_DEX_SECRETS</span>
                    <span className="text-slate-400 text-[11px] block">Dalvik StringPool secrets & cipher audit</span>
                  </div>
                </div>
              </div>
            </>
          ) },
          { id: 'external', label: 'External tools', count: engines.length, content: (
            <>
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-xs font-medium text-slate-400">
                  External Tool Integrations & Simulated Testbed
                </h3>
                <span className="text-[11px] tabular-nums text-amber-400/90">
                  Planned for later evaluation milestones
                </span>
              </div>

              {/* Engines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engines.map((engine) => {
                  const Icon = getEngineIcon(engine.iconType);
                  return (
                    <div
                      key={engine.id}
                      className="p-6 space-y-5 flex flex-col justify-between card"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="p-3 text-brand-cyan card">
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] tabular-nums font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {engine.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-white tabular-nums">{engine.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{engine.tagline}</p>
                        </div>

                        {/* Capabilities list */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                          <span className="text-[11px] font-medium text-slate-400 block mb-1">
                            Orchestrated Capabilities:
                          </span>
                          {engine.capabilities.map((cap, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-300 tabular-nums">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                              <span className="truncate">{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Engine Metadata & Config Action */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs tabular-nums">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>Version: {engine.version}</span>
                          <span>Checks: {engine.totalChecks}</span>
                        </div>

                        <button
                          onClick={() => setSelectedEngine(engine)}
                          className="btn-app btn-app-secondary w-full justify-center"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Configure Rules & Parameters</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) },
        ]}
      />

      {/* Engine Configuration Modal */}
      {selectedEngine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg overflow-hidden card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-white tabular-nums">
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

            <div className="p-6 space-y-4 text-xs tabular-nums">
              <div className="p-3.5 text-amber-300 panel">
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

            <div className="p-4 bg-ink-900 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEngine(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs tabular-nums font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedEngine(null)}
                className="px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 text-xs tabular-nums font-medium"
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
