'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileCode,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ArrowRight,
  RotateCw,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Bot,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { AnalysisSession, ActionExecutionRecord, SecurityFinding } from '@/types/agent';
import { ViewTabs } from '@/components/ui/ViewTabs';

interface UploadConfig {
  maxBytes: number;
  directLimitBytes: number;
  blobEnabled: boolean;
  blobAccess: 'private' | 'public';
  onVercel: boolean;
}

const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxBytes: 4 * 1024 * 1024 * 1024,
  directLimitBytes: 4 * 1024 * 1024 * 1024,
  blobEnabled: false,
  blobAccess: 'private',
  onVercel: false
};

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(n >= 10 * 1024 * 1024 * 1024 ? 0 : 1)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(n >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  return `${(n / 1024).toFixed(1)} KB`;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'target.apk';
}

/** Parses an API response even when a proxy returns plain text (e.g. Vercel's 413 page). */
async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 413) {
      return { success: false, error: 'This APK is larger than the server accepts in one request. Connect a Vercel Blob store to enable large uploads.' };
    }
    if (res.status === 504) {
      return { success: false, error: 'The analysis took too long and timed out on the server. Try again, or use a smaller APK.' };
    }
    return { success: false, error: `Server error ${res.status}: ${text.slice(0, 160) || res.statusText}` };
  }
}

/**
 * Streams the raw APK to the server with upload progress (fetch cannot report upload progress).
 * The server writes it to disk chunk by chunk, so files of several GB never sit in memory.
 */
function postWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.upload.onload = () => onProgress(100);
    xhr.onerror = () => reject(new Error('Network error while uploading the APK.'));
    xhr.onload = async () => {
      const res = new Response(xhr.responseText, { status: xhr.status });
      resolve(await readJson(res));
    };
    xhr.send(file);
  });
}

export default function RunAnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'upload'>('benchmarks');
  const [selectedFixture, setSelectedFixture] = useState<string>('vulnerable_bank');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<'uploading' | 'analyzing' | null>(null);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>(DEFAULT_UPLOAD_CONFIG);

  // A file dropped outside the drop zone must not make the browser navigate away to it.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  // Ask the server how uploads should travel (direct POST locally, Vercel Blob for large files on Vercel).
  useEffect(() => {
    fetch('/api/analysis/upload-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => cfg && setUploadConfig(cfg))
      .catch(() => {});
  }, []);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [activeFindingFilter, setActiveFindingFilter] = useState<'all' | 'Critical' | 'High' | 'Medium'>('all');

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const selectApk = (file: File | undefined | null) => {
    setFileError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      setFileError('Invalid file format. Please select an Android .apk package.');
      setSelectedFile(null);
      return;
    }

    if (file.size > uploadConfig.maxBytes) {
      setFileError(`File exceeds authorized maximum limit of ${formatBytes(uploadConfig.maxBytes)}.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > uploadConfig.directLimitBytes && !uploadConfig.blobEnabled) {
      setFileError(
        `This deployment accepts APKs up to ${formatBytes(uploadConfig.directLimitBytes)} (Vercel's request limit). ` +
          'Connect a Vercel Blob store to the project to enable uploads up to ' +
          `${formatBytes(uploadConfig.maxBytes)}.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectApk(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    selectApk(e.dataTransfer.files?.[0]);
  };

  const runAnalysis = async (fixtureId?: string) => {
    setIsRunning(true);
    setError(null);
    setSession(null);
    setUploadProgress(null);
    setPhase(fixtureId ? 'analyzing' : 'uploading');

    try {
      let data: any;

      if (fixtureId) {
        const res = await fetch('/api/analysis/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fixtureId })
        });
        data = await readJson(res);
      } else if (selectedFile) {
        if (uploadConfig.blobEnabled) {
          // Blob store connected: every APK goes straight to Blob storage and is KEPT there in full,
          // then the server analyses it from there.
          const { upload } = await import('@vercel/blob/client');
          const blob = await upload(`apks/${safeName(selectedFile.name)}`, selectedFile, {
            access: uploadConfig.blobAccess,
            handleUploadUrl: '/api/analysis/blob-upload',
            contentType: 'application/vnd.android.package-archive',
            // Multipart: parallel, retried parts; required for multi-GB files.
            multipart: selectedFile.size > 8 * 1024 * 1024,
            onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage))
          });
          setUploadProgress(100);
          setPhase('analyzing');
          const res = await fetch('/api/analysis/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blobUrl: blob.url, pathname: blob.pathname, fileName: selectedFile.name })
          });
          data = await readJson(res);
        } else {
          // Direct multipart upload with progress (locally and for small files).
          data = await postWithProgress('/api/analysis/run', selectedFile, (pct) => {
            setUploadProgress(pct);
            if (pct >= 100) setPhase('analyzing');
          });
        }
      } else {
        throw new Error('No target package selected for analysis.');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Security analysis execution failed.');
      }

      setSession(data.session);
      // Auto-expand last step
      if (data.session.executionTrace?.length) {
        setExpandedSteps({ [data.session.executionTrace.length]: true });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected execution error occurred.');
    } finally {
      setIsRunning(false);
      setPhase(null);
      setUploadProgress(null);
    }
  };

  const downloadSessionJson = () => {
    if (!session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnscope_${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFindings = session?.findings.filter((f) => {
    if (activeFindingFilter === 'all') return true;
    return f.severity === activeFindingFilter;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 space-y-3 card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 text-emerald-400 panel">
              <Activity className={`w-6 h-6 ${isRunning ? 'animate-pulse text-emerald-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-emerald-400">
                  VulnScope Agent Core
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] tabular-nums bg-slate-800 text-slate-300 border border-slate-700">
                  Android Static & Bytecode Sandbox
                </span>
              </div>
              <h1 className="text-2xl sm:text-[30px] leading-tight font-medium text-white mt-0.5">
                Agentic Security Analysis Pipeline
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Evidence-grounded autonomous security testing loop: observe real tool outputs, adapt subsequent actions, and record traceable findings.
              </p>
            </div>
          </div>

          {session && (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSessionJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                title="Download complete session audit JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Intake Control Panel (when not running or can select new target) */}
      {!session && !isRunning && (
        <div className="p-6 space-y-5 card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-medium text-slate-200">
              Select Target Application
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('benchmarks')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeTab === 'benchmarks'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Authorized Benchmarks (1-Click)
              </button>
              <button
                onClick={() => setActiveTab('upload')}
        className={`px-3 py-1 rounded-lg text-xs transition ${
                  activeTab === 'upload'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload Authorized APK
              </button>
            </div>
          </div>

          {/* TAB 1: 1-Click Evaluation Benchmarks */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Authorized benchmark test APK fixtures packaged for immediate university evaluation and reproducible defense demonstrations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerable Bank Benchmark */}
                <div
                  onClick={() => setSelectedFixture('vulnerable_bank')}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                    selectedFixture === 'vulnerable_bank'
                      ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">Insecure Bank Benchmark</span>
                        <span className="px-1.5 py-0.2 rounded text-[11px] tabular-nums bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                          Deliberate Vulns
                        </span>
                      </div>
                      <p className="text-[11px] tabular-nums text-slate-400 mt-0.5">
                        com.vulnscope.insecurebank (v1.0.1), 1.1 KB
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${ selectedFixture === 'vulnerable_bank' ? 'border-rose-400 bg-rose-500 text-white' : 'border-slate-700' }`}
                    >
                      {selectedFixture === 'vulnerable_bank' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test package with verified security flaws: debuggable=true, cleartext traffic permitted, unprotected exported IPC services, and embedded Google Cloud/AWS credentials in classes.dex.
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[11px] tabular-nums">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-798 (Secrets)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-215 (Debug)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-319 (Cleartext)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">CWE-926 (Exported IPC)</span>
                  </div>
                </div>

                {/* Hardened Benchmark */}
                <div
                  onClick={() => setSelectedFixture('hardened_app')}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                    selectedFixture === 'hardened_app'
                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">Hardened Vault Benchmark</span>
                        <span className="px-1.5 py-0.2 rounded text-[11px] tabular-nums bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                          Secure Baseline
                        </span>
                      </div>
                      <p className="text-[11px] tabular-nums text-slate-400 mt-0.5">
                        com.vulnscope.securevault (v2.4.0), 0.8 KB
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${ selectedFixture === 'hardened_app' ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-700' }`}
                    >
                      {selectedFixture === 'hardened_app' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hardened Android application adhering to MASVS baseline: debuggable disabled, backup false, TLS enforced, no unprotected IPC components, clean bytecode.
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[11px] tabular-nums">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">0 Critical / High</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">Posture Rating A</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">MASVS Clean</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => runAnalysis(selectedFixture)}
                  className="btn-app btn-app-primary"
                >
                  <Activity className="w-4 h-4" />
                  <span>Execute Benchmark Analysis</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Upload Authorized APK */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Upload an authorized Android package (.apk) from local disk for automated intake validation and static security deconstruction.
              </p>

              <label
                htmlFor="apk-file"
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  if (!isDragging) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`dropzone block p-8 text-center space-y-3 cursor-pointer ${isDragging ? 'is-dragging' : ''}`}
              >
                <Upload className={`w-8 h-8 mx-auto transition-transform duration-200 ${isDragging ? 'text-white -translate-y-1' : 'text-slate-400'}`} />
                <div className="text-xs text-slate-300">
                  <span className="text-white font-medium underline underline-offset-4 decoration-white/30">
                    Browse files
                  </span>{' '}
                  {isDragging ? 'or drop the .apk here' : 'or drag & drop your authorized Android .apk file'}
                </div>
                <p className="text-[11px] tabular-nums text-slate-500">
                  Maximum file size: {formatBytes(uploadConfig.maxBytes)}, Cryptographic SHA-256 computed on intake
                </p>
                <input
                  id="apk-file"
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                {selectedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 tabular-nums text-xs mt-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span>{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                  </div>
                )}

                {fileError && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 tabular-nums text-xs mt-2 text-left">
                    <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </label>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!selectedFile}
                  onClick={() => runAnalysis()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-400 text-slate-950 tabular-nums font-medium text-xs transition duration-200"
                >
                  <Activity className="w-4 h-4" />
                  <span>Upload & Run Security Pipeline</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State during analysis execution */}
      {isRunning && (
        <div className="p-8 text-center space-y-4 card">
          <div className="inline-flex p-4 text-emerald-400 animate-pulse motion-reduce:animate-none card">
            <RotateCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white tabular-nums">
              {phase === 'uploading'
                ? `Uploading APK${uploadProgress !== null ? ` ${uploadProgress}%` : '…'}`
                : 'Autonomous Agent Execution Loop in Progress...'}
            </h3>
            {phase === 'uploading' && (
              <div className="mx-auto mt-3 h-1 w-64 max-w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                <div
                  className="h-full bg-white origin-left transition-transform duration-200"
                  style={{ transform: `scaleX(${(uploadProgress ?? 0) / 100})` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Extracting ZIP layout, inspecting AndroidManifest.xml, validating component permissions, checking cleartext TLS policy, and scanning Dalvik bytecode string pool.
            </p>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 tabular-nums text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* LIVE ANALYSIS RESULTS VIEW */}
      {session && (
        <div className="space-y-6">
          {/* Session Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums text-xs">
            <div className="p-3.5 space-y-1 panel">
              <span className="text-[11px] text-slate-400 block font-semibold">Session Identifier</span>
              <span className="text-xs font-medium text-white truncate block">{session.sessionId}</span>
            </div>
            <div className="p-3.5 space-y-1 panel">
              <span className="text-[11px] text-slate-400 block font-semibold">Execution Duration</span>
              <span className="text-xs font-medium text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {session.durationSeconds}s ({session.totalActionsExecuted} steps)
              </span>
            </div>
            <div className="p-3.5 space-y-1 panel">
              <span className="text-[11px] text-slate-400 block font-semibold">Planner Mode</span>
              <span className="text-xs font-medium text-emerald-400 truncate block">
                {session.agentMode === 'LLMAgent' ? session.llmProvider || 'LLM Agent' : 'Deterministic Engine'}
              </span>
            </div>
            <div
              className={`p-3.5 rounded-xl border space-y-1 ${ session.summary.securityPostureRating === 'A' ? 'bg-emerald-500/10 border-emerald-500/30' : session.summary.securityPostureRating === 'F' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30' }`}
            >
              <span className="text-[11px] text-slate-400 block font-semibold">Posture Rating</span>
              <div className="flex items-center justify-between">
                <span
                  className={`text-base font-semibold ${ session.summary.securityPostureRating === 'A' ? 'text-emerald-400' : session.summary.securityPostureRating === 'F' ? 'text-rose-400' : 'text-amber-400' }`}
                >
                  Grade {session.summary.securityPostureRating}
                </span>
                <span className="text-[11px] text-slate-300">
                  {session.findings.length} findings
                </span>
              </div>
            </div>
          </div>

          {/* Grouped into views: one group on screen at a time */}
          <ViewTabs
            label="Analysis results"
            views={[
              { id: 'findings', label: 'Findings', count: session.findings.length, content: (
                <>
                  {/* DISCOVERED EVIDENCE-BACKED FINDINGS */}
                  <div className="p-6 space-y-4 card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-medium text-white">
                          Evidence-Backed Security Findings ({session.findings.length})
                        </h3>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          Traceable security findings mapped to OWASP MASVS and Common Weakness Enumeration (CWE).
                        </p>
                      </div>

                      {/* Severity filter pills */}
                      <div className="flex gap-1.5 tabular-nums text-[11px]">
                        <button
                          onClick={() => setActiveFindingFilter('all')}
                          className={`px-2.5 py-1 rounded-lg ${
                            activeFindingFilter === 'all'
                              ? 'bg-slate-700 text-white font-medium'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          All ({session.findings.length})
                        </button>
                        <button
                          onClick={() => setActiveFindingFilter('Critical')}
                          className={`px-2.5 py-1 rounded-lg ${
                            activeFindingFilter === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          Critical ({session.summary.criticalCount})
                        </button>
                        <button
                          onClick={() => setActiveFindingFilter('High')}
                          className={`px-2.5 py-1 rounded-lg ${
                            activeFindingFilter === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          High ({session.summary.highCount})
                        </button>
                        <button
                          onClick={() => setActiveFindingFilter('Medium')}
                          className={`px-2.5 py-1 rounded-lg ${
                            activeFindingFilter === 'Medium'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          Medium ({session.summary.mediumCount})
                        </button>
                      </div>
                    </div>

                    {/* Finding Cards */}
                    {filteredFindings.length === 0 ? (
                      <div className="p-8 text-center space-y-2 panel">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-sm font-medium text-white tabular-nums">No findings detected for this filter</p>
                        <p className="text-xs text-slate-400 font-sans">
                          The application passed the evaluated checks cleanly.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredFindings.map((finding) => (
                          <div
                            key={finding.stableId}
                            className="p-4 space-y-3 panel"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] tabular-nums font-medium ${ finding.severity === 'Critical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : finding.severity === 'High' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30' }`}
                                >
                                  {finding.severity}
                                </span>
                                <span className="text-xs tabular-nums font-medium text-slate-300">{finding.stableId}</span>
                                <span className="text-sm font-medium text-white">{finding.title}</span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] tabular-nums">
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold border ${ finding.verificationStatus === 'Verified' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : finding.verificationStatus === 'Suspected' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : finding.verificationStatus === 'Detected' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30' }`}
                                >
                                  {finding.verificationStatus || 'Verified'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{finding.cwe}</span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{finding.owaspCategory}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{finding.description}</p>

                            {/* Exact Technical Evidence */}
                            <div className="p-3 rounded-lg bg-ink border border-slate-800 space-y-1 tabular-nums text-xs">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>TECHNICAL EVIDENCE ({finding.sourceTool})</span>
                                <span className="text-slate-500">{finding.location}</span>
                              </div>
                              <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all text-[11px] bg-slate-900/50 p-2 rounded">
                                {finding.evidence}
                              </pre>
                            </div>

                            {/* Remediation */}
                            <div className="text-xs text-slate-400 font-sans">
                              <span className="font-medium text-slate-200">Recommended Remediation: </span>
                              {finding.remediation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) },
              { id: 'trace', label: 'Execution trace', count: session.executionTrace.length, content: (
                <>
                  {/* AGENTIC EXECUTION TRACE (Step-by-step adaptive decisions) */}
                  <div className="p-6 space-y-4 card">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-500" />
                        <h3 className="text-sm font-medium text-white">
                          Agent Execution Trace & Adaptive Decisions
                        </h3>
                      </div>
                      <span className="text-[11px] tabular-nums text-slate-400">
                        {session.executionTrace.length} Allowlisted Actions Executed
                      </span>
                    </div>

                    <div className="space-y-3 tabular-nums text-xs">
                      {session.executionTrace.map((record) => {
                        const isExpanded = !!expandedSteps[record.stepNumber];
                        return (
                          <div
                            key={record.stepNumber}
                            className="overflow-hidden panel"
                          >
                            <div
                              onClick={() => toggleStep(record.stepNumber)}
                              className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-medium text-slate-300 shrink-0">
                                  {record.stepNumber}
                                </span>
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-medium text-white truncate">{record.actionName}</span>
                                  <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                                    ({record.actionId})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  {record.durationMs}ms
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${ record.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30' }`}
                                >
                                  {record.status}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Step Details & Rationale */}
                            <div className="px-4 pb-3.5 pt-1 space-y-2.5 border-t border-slate-800/40 text-[11px]">
                              {/* Observation */}
                              <div className="p-2.5 rounded-lg space-y-1 bg-white/[0.04]">
                                <span className="text-[11px] font-medium text-emerald-400 block">
                                  Observed Tool Evidence
                                </span>
                                <p className="text-slate-200 leading-relaxed font-sans">{record.observation}</p>
                              </div>

                              {/* Decision Rationale */}
                              <div className="p-2.5 rounded-lg space-y-1 bg-white/[0.04]">
                                <span className="text-[11px] font-medium text-indigo-400 block">
                                  Agent Decision Rationale (Why this action was selected)
                                </span>
                                <p className="text-indigo-200 leading-relaxed font-sans">{record.decisionRationale}</p>
                              </div>

                              {/* Collapsible raw JSON */}
                              {isExpanded && record.output && (
                                <div className="pt-1">
                                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                                    Structured Action Output JSON
                                  </span>
                                  <pre className="p-2.5 rounded-lg bg-ink border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-48">
                                    {JSON.stringify(record.output, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) },
              { id: 'target', label: 'Target APK', content: (
                <>
                  {/* Target APK Metadata Strip */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 tabular-nums text-xs panel">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Analyzed Package</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{session.targetApk.fileName}</span>
                        {session.targetApk.packageName && (
                          <span className="text-slate-400">({session.targetApk.packageName})</span>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {session.targetApk.fileSizeFormatted}
                        </span>
                      </div>
                    </div>

                    {session.storedApk && (
                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] text-slate-400 font-semibold">Complete APK kept</span>
                        <div className="text-[11px] text-slate-300 break-all">
                          {session.storedApk.location === 'vercel-blob'
                            ? `Vercel Blob (${session.storedApk.access}): ${session.storedApk.pathname}`
                            : `Server disk: storage/apks/${session.storedApk.pathname}`}
                          {!session.storedApk.durable && ' (temporary on this deployment)'}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <span className="text-[11px] font-semibold block">SHA-256 Fingerprint</span>
                      <span className="text-slate-300 font-mono select-all truncate block max-w-sm">
                        {session.targetApk.sha256}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSession(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs tabular-nums transition-colors"
                      >
                        Analyze Another APK
                      </button>
                    </div>
                  </div>
                </>
              ) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
