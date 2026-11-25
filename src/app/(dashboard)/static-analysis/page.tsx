'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { mockCodeFiles, MockCodeFile } from '@/data/mockCodeSnippets';
import { useAppState } from '@/context/AppStateContext';
import { formatSeverityColor } from '@/lib/utils';

export default function StaticAnalysisPage() {
  const { findings } = useAppState();
  const [selectedFileId, setSelectedFileId] = useState<string>(mockCodeFiles[0].id);
  const [copied, setCopied] = useState(false);

  const selectedFile = mockCodeFiles.find(f => f.id === selectedFileId) || mockCodeFiles[0];
  const associatedFinding = findings.find(f => f.id === selectedFile.associatedFindingId) || findings[1];
  const sColor = formatSeverityColor(associatedFinding.severity);

  const lines = selectedFile.content.split('\n');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] sm:text-[36px] leading-[1.1] font-medium text-white font-sans">
              Static Code Analysis & AST Viewer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs tabular-nums bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              JADX / Dalvik Decompiler
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Decompiled bytecode AST, line-level vulnerability cross-references, and data-flow taint analysis.
          </p>
        </div>

        <Link
          href="/copilot"
          className="btn-app btn-app-secondary"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI About This Code</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 tabular-nums text-xs">
        <div className="p-3.5 card">
          <span className="text-slate-400 text-[11px] block">Files Analyzed</span>
          <span className="text-xl font-semibold text-white">1,428</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Classes deconstructed</span>
        </div>

        <div className="p-3.5 card">
          <span className="text-slate-400 text-[11px] block">Rules Executed</span>
          <span className="text-xl font-semibold text-white">87</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">OWASP MASVS rules</span>
        </div>

        <div className="p-3.5 card">
          <span className="text-rose-400 text-[11px] font-medium block">AST Findings</span>
          <span className="text-xl font-semibold text-rose-400">9</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Direct source matches</span>
        </div>

        <div className="p-3.5 card">
          <span className="text-slate-400 text-[11px] block">Decompiler Confidence</span>
          <span className="text-xl font-semibold text-emerald-400">94%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">High semantic fidelity</span>
        </div>
      </div>

      {/* Split Code Viewer and Vulnerability Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Tree & Decompiled Code Viewer */}
        <div className="lg:col-span-7 overflow-hidden flex flex-col card">
          {/* File Selector Tabs */}
          <div className="flex items-center justify-between p-3 bg-slate-900/70 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
              {mockCodeFiles.map((file) => {
                const isSelected = file.id === selectedFileId;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-800 text-brand-cyan border border-brand-cyan/40 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-slate-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* File Path Header */}
          <div className="px-4 py-2 bg-black/40 border-b border-slate-800 text-[11px] tabular-nums text-slate-400 flex items-center justify-between">
            <span>Path: {selectedFile.filePath}</span>
            <span className="text-rose-400 font-medium">Vulnerable Line: #{selectedFile.vulnerableLineNumber}</span>
          </div>

          {/* Syntax Highlighted Code Viewer with Vulnerable Line Highlighted */}
          <div className="p-4 bg-black/90 text-xs overflow-x-auto max-h-[560px] overflow-y-auto space-y-0.5 select-text">
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isVulnerable = lineNum >= selectedFile.highlightedLineStart && lineNum <= selectedFile.highlightedLineEnd;
              const isExactVulnerable = lineNum === selectedFile.vulnerableLineNumber;

              return (
                <div
                  key={lineNum}
                  className={`flex items-start group ${ isVulnerable ? 'bg-rose-500/15 border-l-4 border-rose-500 pl-2 text-rose-200 font-medium' : 'code-line-normal pl-3 text-slate-300' }`}
                >
                  <span className={`w-8 shrink-0 select-none text-[11px] font-mono tabular-nums ${ isExactVulnerable ? 'text-rose-400 font-medium' : 'text-slate-600 group-hover:text-slate-400' }`}>
                    {lineNum}
                  </span>
                  <pre className="flex-1 font-mono text-xs overflow-x-visible">
                    <code>{line || ' '}</code>
                  </pre>
                  {isExactVulnerable && (
                    <span className="px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/40 shrink-0 ml-2">
                      Vulnerable Sink
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Finding Detail Inspector */}
        <div className="lg:col-span-5 p-6 space-y-5 flex flex-col justify-between card">
          <div className="space-y-5">
            {/* Finding Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-brand-cyan">
                  FLIGHT FINDING INSPECTION
                </span>
                <h3 className="text-base font-medium text-white mt-0.5">{associatedFinding.title}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${sColor.badge}`}>
                {associatedFinding.severity}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
              <div className="p-2.5 flex justify-between panel">
                <span className="text-slate-400">CWE</span>
                <span className="text-slate-200 font-medium">{associatedFinding.cwe}</span>
              </div>
              <div className="p-2.5 flex justify-between panel">
                <span className="text-slate-400">Confidence</span>
                <span className="text-emerald-400 font-medium">{associatedFinding.confidence}%</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-slate-300">Vulnerability Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                {associatedFinding.description}
              </p>
            </div>

            {/* Impact */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-rose-400">Business & Security Impact</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/25">
                {associatedFinding.impact}
              </p>
            </div>

            {/* Recommendation */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-emerald-400">Remediation Guidance</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/25">
                {associatedFinding.remediation}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <Link
              href={`/findings/${associatedFinding.id}`}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <span>View Full Finding Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/copilot"
              className="btn-app btn-app-primary"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI To Fix</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
