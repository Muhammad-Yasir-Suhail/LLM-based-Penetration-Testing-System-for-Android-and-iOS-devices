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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0d121c] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-brand-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search findings, applications, CVEs, or reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions if query is empty */}
          {!q && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase text-slate-400">
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => navigateTo('/attack-surface')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
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
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
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
              <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase text-slate-400">
                Security Findings ({matchedFindings.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedFindings.map((f) => {
                  const sColor = formatSeverityColor(f.severity);
                  return (
                    <button
                      key={f.id}
                      onClick={() => navigateTo(`/findings/${f.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors group"
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
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications Matches */}
          {matchedApps.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase text-slate-400">
                Applications ({matchedApps.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => navigateTo(`/applications/${app.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors group"
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
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Matches */}
          {matchedProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase text-slate-400">
                Projects ({matchedProjects.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.organization} • {p.environment}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
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
        <div className="flex items-center justify-between px-4 py-2 bg-[#0a0e16] border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
          <span>Navigate with arrows or click to open</span>
          <div className="flex items-center gap-1">
            <span>Select</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              <CornerDownLeft className="w-2.5 h-2.5 inline" />
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
