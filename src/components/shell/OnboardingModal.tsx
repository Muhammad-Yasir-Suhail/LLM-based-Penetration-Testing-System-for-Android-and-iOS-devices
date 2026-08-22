'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  FileCheck,
  Code
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, setOnboardingOpen, setActiveWorkspace } = useAppState();
  const [step, setStep] = useState<number>(1);
  const [wsName, setWsName] = useState<string>('Acme Security Lab');
  const [targetPlatform, setTargetPlatform] = useState<'Both' | 'Android' | 'iOS'>('Both');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    'Mobile App Security',
    'API Security',
    'Compliance',
    'Code Security'
  ]);
  const router = useRouter();

  if (!onboardingOpen) return null;

  const toggleObjective = (obj: string) => {
    setSelectedObjectives(prev =>
      prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj]
    );
  };

  const handleFinish = () => {
    setActiveWorkspace(wsName);
    setOnboardingOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0d121c] border border-brand-cyan/30 rounded-2xl shadow-2xl overflow-hidden glass-panel-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 flex">
          <div
            className="bg-gradient-to-r from-brand-cyan to-brand-indigo transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/20 border border-brand-cyan/40 text-brand-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-brand-cyan">
                Workspace Setup • Step {step} of 4
              </span>
              <h2 className="text-base font-bold text-white">SentinelX Initialization</h2>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {step === 1 && 'Workspace'}
            {step === 2 && 'Platforms'}
            {step === 3 && 'Objectives'}
            {step === 4 && 'Complete'}
          </span>
        </div>

        {/* Body Steps */}
        <div className="p-6 space-y-5">
          {/* Step 1: Workspace Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Name your security workspace</h3>
                <p className="text-xs text-slate-400 mt-1">
                  SentinelX will isolate mobile applications, analysis history, and vulnerability correlation within this workspace.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  WORKSPACE NAME
                </label>
                <input
                  type="text"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-cyan transition-colors"
                  placeholder="e.g. Acme Security Lab"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Layers className="w-4 h-4 text-brand-cyan shrink-0" />
                <p className="text-[11px] text-slate-400">
                  Pre-configured with enterprise policies and OWASP MASVS v2.0 benchmark mappings.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Choose Testing Targets */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Select target mobile platforms</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose the ecosystems SentinelX will analyze and correlate in this workspace.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Both', label: 'Cross-Platform', desc: 'Android & iOS unified', icon: Smartphone },
                  { id: 'Android', label: 'Android Only', desc: 'APK & AAB bundles', icon: Code },
                  { id: 'iOS', label: 'iOS Only', desc: 'IPA & Swift sources', icon: Lock },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTargetPlatform(opt.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      targetPlatform === opt.id
                        ? 'bg-brand-500/20 border-brand-cyan text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 mb-2 ${targetPlatform === opt.id ? 'text-brand-cyan' : 'text-slate-400'}`} />
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Security Objectives */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Configure security objectives</h3>
                <p className="text-xs text-slate-400 mt-1">
                  SentinelX will optimize correlation rules and scoring weights based on these priorities.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Mobile App Security',
                  'API Security',
                  'Privacy & Telemetry',
                  'Compliance (MASVS)',
                  'Code & Secret Security',
                  'Supply Chain CVEs'
                ].map((obj) => {
                  const isSelected = selectedObjectives.includes(obj);
                  return (
                    <button
                      key={obj}
                      onClick={() => toggleObjective(obj)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs font-medium ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-400 text-white'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{obj}</span>
                      <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-brand-cyan' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Workspace Ready</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  <span className="text-brand-cyan font-semibold">{wsName}</span> has been configured with cross-platform analyzers, AI Copilot, and 8 active demo projects.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-[11px] space-y-1 text-slate-300">
                <p>✓ Multi-engine correlation active (MobSF, JADX, Apktool, Frida)</p>
                <p>✓ OWASP MASVS v2.0 rule definitions loaded</p>
                <p>✓ Attack surface topology engine initialized</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-[#0a0e16] border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border border-brand-cyan/40 text-xs font-bold font-mono transition-all"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
