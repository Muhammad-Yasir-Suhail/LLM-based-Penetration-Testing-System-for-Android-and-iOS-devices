'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Bot,
  Layers,
  Key,
  Database,
  CheckCircle2,
  Lock,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function SettingsPage() {
  const { activeWorkspace, setActiveWorkspace, resetToDefaultData } = useAppState();
  const [activeTab, setActiveTab] = useState<'general' | 'workspace' | 'security' | 'notifications' | 'ai' | 'integrations' | 'api' | 'audit'>('general');
  const [saved, setSaved] = useState(false);
  const [wsInput, setWsInput] = useState(activeWorkspace);

  const handleSave = () => {
    setActiveWorkspace(wsInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'workspace', label: 'Workspace', icon: Layers },
    { id: 'security', label: 'Security Policies', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Copilot', icon: Bot },
    { id: 'integrations', label: 'Tool Integrations', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure VulnCope policies, notification webhooks, AI Copilot parameters, and integration credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-3 space-y-1 font-mono text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-9 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-6 text-xs font-mono">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">General Platform Preferences</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">PLATFORM DISPLAY NAME</label>
                  <input
                    type="text"
                    defaultValue="VulnCope Framework v1.2.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">DEFAULT SECURITY BENCHMARK</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100">
                    <option>OWASP MASVS v2.0 (Level 2 Strict)</option>
                    <option>OWASP Mobile Top 10 2024</option>
                    <option>PCI-DSS Mobile Annex</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Reset Prototype State</h4>
                    <p className="text-[11px] text-slate-400">Restore all mock projects, apps, and findings to initial defaults.</p>
                  </div>
                  <button
                    onClick={() => {
                      resetToDefaultData();
                      alert('Prototype state reset to default mock dataset.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">Workspace Configuration</h3>
              <div>
                <label className="block text-slate-400 mb-1">ACTIVE WORKSPACE NAME</label>
                <input
                  type="text"
                  value={wsInput}
                  onChange={(e) => setWsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">Security Policies & Guardrails</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-brand-cyan" />
                  <span>Block CI/CD builds on Critical OWASP MASVS violations</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-brand-cyan" />
                  <span>Require hardware Keystore backing for all encrypted local SQLite databases</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-brand-cyan" />
                  <span>Flag all unpinned TLS connections as High severity</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">AI Security Copilot Engine</h3>
              <p className="text-slate-300">
                VulnCope Copilot uses deterministic context synthesis to explain vulnerabilities and suggest code patches without external API keys.
              </p>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                AI Copilot is operational in Local Simulation Mode.
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">Security Tool Integrations</h3>
              <p className="text-slate-300">
                Connected tools (MobSF, JADX, Apktool, Frida, Burp Suite) communicate via simulated orchestrator bus.
              </p>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">VulnCope REST API Keys</h3>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">CI/CD Pipeline Key</span>
                <span className="text-emerald-400">vc_live_84f938a1928374619b</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
