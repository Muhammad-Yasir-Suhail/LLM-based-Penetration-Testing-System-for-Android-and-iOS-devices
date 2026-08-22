'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Download,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  Bot,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { getScoreGrade, formatSeverityColor } from '@/lib/utils';

export default function ReportPreviewPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { reports, findings } = useAppState();

  const report = reports.find(r => r.id === reportId) || reports[0];
  const criticals = findings.filter(f => f.severity === 'Critical');
  const highs = findings.filter(f => f.severity === 'High');
  const scoreMeta = getScoreGrade(report.securityScore);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reports</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/40 text-xs font-mono font-bold transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Document */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0d121c] border border-slate-800 shadow-2xl space-y-8 font-sans print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Cover Header */}
        <div className="border-b-2 border-slate-800 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-cyan border border-brand-cyan/40">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold font-mono text-white print:text-black">
                  Sentinel<span className="text-brand-cyan">X</span>
                </span>
                <p className="text-[10px] font-mono text-slate-400">
                  Autonomous Mobile Application Security Platform
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 print:text-black print:border-black">
              {report.reportNumber}
            </span>
          </div>

          <div className="pt-4 space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-brand-cyan tracking-wider">
              OFFICIAL SECURITY ASSESSMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
              {report.title}
            </h1>
            <p className="text-sm text-slate-400 print:text-gray-600 font-mono">
              Target: {report.applicationName} • Version {report.version} • Generated {report.generatedDate} by {report.generatedBy}
            </p>
          </div>
        </div>

        {/* Security Score Overview Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 print:border-gray-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">Evaluated Posture</span>
              <h3 className="text-xl font-bold text-white print:text-black">Overall Security Score: {report.securityScore}/100</h3>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                Normalized against OWASP Mobile Application Security Verification Standard (MASVS v2.0).
              </p>
            </div>

            <div className={`px-4 py-2 rounded-xl text-center font-mono border ${scoreMeta.bg} ${scoreMeta.color}`}>
              <span className="text-2xl font-extrabold block">{report.securityScore}</span>
              <span className="text-[10px] uppercase font-bold">{scoreMeta.label}</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 print:text-black pb-2 border-b border-slate-800">
            1. Executive Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700 leading-relaxed">
            {report.executiveSummary} SentinelX performed automated static bytecode deconstruction, manifest exposure audits, dynamic API intercept mapping, and third-party dependency vulnerability analysis.
          </p>
        </div>

        {/* Risk Breakdown Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 print:text-black pb-2 border-b border-slate-800">
            2. Risk Distribution Matrix
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-rose-400 font-bold block">Critical</span>
              <span className="text-xl font-extrabold text-white print:text-black">2</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-amber-400 font-bold block">High</span>
              <span className="text-xl font-extrabold text-white print:text-black">4</span>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-yellow-400 font-bold block">Medium</span>
              <span className="text-xl font-extrabold text-white print:text-black">5</span>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
              <span className="text-sky-400 font-bold block">Low</span>
              <span className="text-xl font-extrabold text-white print:text-black">1</span>
            </div>
          </div>
        </div>

        {/* Critical & High Findings List */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 print:text-black pb-2 border-b border-slate-800">
            3. Prioritized Vulnerability Findings
          </h2>

          <div className="space-y-3">
            {[...criticals, ...highs.slice(0, 2)].map((f, idx) => {
              const sColor = formatSeverityColor(f.severity);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white print:text-black">
                      {f.findingNumber}: {f.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${sColor.badge}`}>
                      {f.severity} (CVSS {f.cvss})
                    </span>
                  </div>

                  <p className="text-slate-300 print:text-gray-700">{f.description}</p>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-emerald-300 print:text-emerald-800">
                    <strong>Remediation:</strong> {f.remediation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Security Copilot Sign-Off */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900/60 to-brand-cyan/10 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-xs uppercase">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Copilot Autonomous Security Verification</span>
          </div>
          <p className="text-xs text-slate-300 print:text-gray-700 leading-relaxed">
            All 12 discovered issues have been correlated and categorized against OWASP MASVS v2.0. Resolving the 2 critical cryptographic items will elevate the security posture to 90/100 (Excellent) before App Store / Play Store deployment.
          </p>
        </div>

        {/* Footer Sign-off */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 print:text-gray-500">
          <span>SentinelX Security Platform • Confidential Assessment</span>
          <span>Approved by Alex Vance (Lead SecOps)</span>
        </div>
      </div>
    </div>
  );
}
