'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  Database,
  Radio,
  FileCode,
  Sparkles,
  Bot,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { AttackSurfaceNode } from '@/types';

export default function AttackSurfacePage() {
  const {
    attackSurfaceNodes,
    applications,
    selectedAppId,
    setSelectedAppId,
    findings
  } = useAppState();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-act-1');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedNode = attackSurfaceNodes.find(n => n.id === selectedNodeId) || attackSurfaceNodes[1];
  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];

  // Filtering nodes
  const filteredNodes = attackSurfaceNodes.filter(node => {
    if (filterCategory !== 'all' && node.category !== filterCategory) return false;
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase()) && !node.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate Metrics
  const exposedComponentsCount = attackSurfaceNodes.filter(n => n.exposure === 'Exported / Public').length;
  const highRiskCount = attackSurfaceNodes.filter(n => n.risk === 'Critical' || n.risk === 'High').length;
  const externalEndpointsCount = attackSurfaceNodes.filter(n => n.type === 'Network Endpoint').length;
  const sensitivePermsCount = attackSurfaceNodes.filter(n => n.type === 'Permission' && n.risk !== 'Safe').length;

  const getNodeIcon = (type: AttackSurfaceNode['type']) => {
    switch (type) {
      case 'Application': return Smartphone;
      case 'Activity': return FileCode;
      case 'Service': return Radio;
      case 'Content Provider': return Database;
      case 'Broadcast Receiver': return Radio;
      case 'Deep Link': return ExternalLink;
      case 'WebView': return GlobeIcon;
      case 'Network Endpoint': return Radio;
      case 'Permission': return Lock;
      case 'Cryptographic API': return Code2;
      case 'Local Storage': return Database;
      case 'Third-Party SDK': return Layers;
      default: return AlertTriangle;
    }
  };

  function GlobeIcon(props: any) {
    return <ExternalLink {...props} />;
  }

  const getNodeRiskBadge = (risk: AttackSurfaceNode['risk']) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Safe':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Attack Surface Explorer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              Interactive Topology Graph
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Map exposed IPC components, permissions, network sockets, cryptographic APIs, and reachability paths.
          </p>
        </div>

        {/* Application Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">Target App:</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            {applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.name} (v{app.currentVersion})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-brand-cyan/30 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">Attack Surface Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">{activeApp.attackSurfaceScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">Moderate Exposure</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">Exposed Components</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">{exposedComponentsCount}</span>
            <span className="text-xs text-rose-400 font-mono">Public IPC</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Activities, Services, Providers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-rose-500/30 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-rose-400 font-bold">High-Risk Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{highRiskCount}</span>
            <span className="text-xs text-rose-300 font-mono">P0/P1</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Direct exploit vectors</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">External Endpoints</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">{externalEndpointsCount}</span>
            <span className="text-xs text-sky-400 font-mono">Sockets</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1 unencrypted HTTP domain</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 shadow-lg col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono uppercase text-slate-400">Sensitive Permissions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">{sensitivePermsCount}</span>
            <span className="text-xs text-amber-400 font-mono">Runtime</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">External storage & biometric</span>
        </div>
      </div>

      {/* Main Interactive Split: Graph Topology on Left, Node Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Graph Visualizer */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-white font-mono">Application Exposure Topology</h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {[
                { id: 'all', label: 'All' },
                { id: 'component', label: 'IPC' },
                { id: 'permission', label: 'Permissions' },
                { id: 'network', label: 'Network' },
                { id: 'crypto', label: 'Crypto' },
                { id: 'storage', label: 'Storage' },
                { id: 'sdk', label: 'SDKs' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    filterCategory === f.id
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Nodes Grid Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[420px] max-h-[500px] overflow-y-auto pr-1">
            {filteredNodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = node.id === selectedNodeId;
              const riskBadgeClass = getNodeRiskBadge(node.risk);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-cyan shadow-lg shadow-cyan-950/40 ring-1 ring-brand-cyan'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{node.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${riskBadgeClass}`}>
                      {node.risk}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 truncate">{node.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{node.details}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span className="truncate max-w-[140px] text-slate-400">{node.exposure}</span>
                    {node.relatedFindingsCount > 0 && (
                      <span className="text-rose-400 font-bold">
                        {node.relatedFindingsCount} finding{node.relatedFindingsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Topology Hierarchy: Application → Components → Permissions → Sockets → Findings</span>
            <span className="text-brand-cyan">Click node to inspect</span>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan font-bold">
                NODE INSPECTOR
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedNode.name}</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${getNodeRiskBadge(selectedNode.risk)}`}>
              {selectedNode.risk} Risk
            </span>
          </div>

          {/* Node Metadata Table */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Node Type</span>
              <span className="text-slate-200 font-bold">{selectedNode.type}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Exposure Mode</span>
              <span className="text-amber-400 font-semibold">{selectedNode.exposure}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Correlated Findings</span>
              <span className="text-rose-400 font-bold">{selectedNode.relatedFindingsCount} active</span>
            </div>
          </div>

          {/* Technical Evidence & Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Exposure Analysis</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              {selectedNode.details}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Technical Fingerprint Evidence</h4>
            <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300">
              {selectedNode.evidence}
            </div>
          </div>

          {/* Code Snippet if present */}
          {selectedNode.codeSnippet && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Decompiled Reference</h4>
              <pre className="p-3 rounded-xl bg-black/80 border border-rose-500/30 text-[11px] font-mono text-rose-300 overflow-x-auto">
                <code>{selectedNode.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/copilot"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI About This Node</span>
            </Link>
            <Link
              href="/findings"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all border border-slate-700"
            >
              <span>Findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
