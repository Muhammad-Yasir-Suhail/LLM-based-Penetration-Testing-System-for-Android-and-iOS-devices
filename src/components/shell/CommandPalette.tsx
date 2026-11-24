'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Smartphone,
  AlertTriangle,
  FolderGit2,
  FileText,
  Users,
  Settings,
  Bot,
  ArrowRight,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { formatSeverityColor } from '@/lib/utils';

export const CommandPalette: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    findings,
    applications,
    projects,
    reports,
    teamMembers
  } = useAppState();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(!searchModalOpen);
      }
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [searchModalOpen]);

  if (!searchModalOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtered results
  const matchedFindings = findings
    .filter(f => f.title.toLowerCase().includes(q) || f.cwe.toLowerCase().includes(q) || f.findingNumber.toLowerCase().includes(q) || f.applicationName.toLowerCase().includes(q))
    .slice(0, 4);

  const matchedApps = applications
    .filter(a => a.name.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q))
    .slice(0, 3);

  const matchedProjects = projects
    .filter(p => p.name.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q))
    .slice(0, 2);

  const matchedReports = reports
    .filter(r => r.title.toLowerCase().includes(q) || r.reportNumber.toLowerCase().includes(q))
    .slice(0, 2);

  const navigateTo = (path: string) => {
    setSearchModalOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150" onClick={() => setSearchModalOpen(false)}>
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden glass-panel-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.07]">
          <Search className="w-5 h-5 text-white/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search findings, applications, CVEs, or reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-white placeholder-white/35 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="kbd">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions if query is empty */}
          {!q && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => navigateTo('/attack-surface')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all duration-200 hover:-translate-y-px"
                >
                  <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Attack Surface</p>
                    <p className="text-[10px] text-slate-400">Interactive topology graph</p>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('/correlation')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all duration-200 hover:-translate-y-px"
                >
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Finding Correlation</p>
                    <p className="text-[10px] text-slate-400">Multi-engine deduplication</p>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('/copilot')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all duration-200 hover:-translate-y-px"
                >
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Security Copilot</p>
                    <p className="text-[10px] text-slate-400">Ask AI security assistant</p>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('/analysis/run')}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all duration-200 hover:-translate-y-px"
                >
                  <div className="p-1.5 rounded-md bg-brand-cyan/10 text-brand-cyan">
                    <Command className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Run Simulated Scan</p>
                    <p className="text-[10px] text-slate-400">10-stage execution pipeline</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Security Findings Matches */}
          {matchedFindings.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                Security Findings ({matchedFindings.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedFindings.map((f) => {
                  const sColor = formatSeverityColor(f.severity);
                  return (
                    <button
                      key={f.id}
                      onClick={() => navigateTo(`/findings/${f.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] text-left transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${sColor.badge}`}>
                          {f.severity}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                            {f.findingNumber}: {f.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {f.applicationName} • {f.cwe}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff6363] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications Matches */}
          {matchedApps.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                Applications ({matchedApps.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => navigateTo(`/applications/${app.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] text-left transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                        {app.platform === 'Android' ? 'APK' : 'IPA'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {app.name} <span className="text-[10px] text-slate-400 font-mono">v{app.currentVersion}</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{app.packageName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400">{app.securityScore}/100</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff6363] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Matches */}
          {matchedProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                Projects ({matchedProjects.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] text-left transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.organization} • {p.environment}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#ff6363] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {q && matchedFindings.length === 0 && matchedApps.length === 0 && matchedProjects.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for &quot;AES&quot;, &quot;CWE-926&quot;, &quot;Acme&quot;, or &quot;Stripe&quot;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/[0.07] text-[11px] text-slate-400 font-mono">
          <span>Navigate with arrows or click to open</span>
          <div className="flex items-center gap-1">
            <span>Select</span>
            <kbd className="kbd">
              <CornerDownLeft className="w-2.5 h-2.5 inline" />
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
