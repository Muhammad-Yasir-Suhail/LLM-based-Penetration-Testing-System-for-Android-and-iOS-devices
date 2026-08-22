'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FolderGit2,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Activity,
  Plus,
  Layers,
  FileText,
  Users
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { getScoreGrade } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, applications, findings } = useAppState();

  const project = projects.find(p => p.id === projectId) || projects[0];
  const projectApps = applications.filter(a => a.projectId === project.id);
  const projectFindings = findings.filter(f => f.projectId === project.id);
  const scoreMeta = getScoreGrade(project.securityScore);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Banner Header */}
      <div className="p-6 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{project.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${scoreMeta.bg} ${scoreMeta.color}`}>
                  Score {project.securityScore}/100 ({scoreMeta.label})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {project.organization} • {project.environment} Environment • Lead: {project.leadEngineer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/analysis/run"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Scan Project Builds</span>
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed pt-2 border-t border-slate-800/60">
          {project.description}
        </p>
      </div>

      {/* Applications in Project */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
            Target Applications ({projectApps.length})
          </h3>
          <Link
            href="/applications"
            className="text-xs font-mono text-brand-cyan hover:underline"
          >
            View Applications Inventory
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectApps.map((app) => {
            const appScoreMeta = getScoreGrade(app.securityScore);
            return (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="p-5 rounded-3xl bg-[#0d121c] border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center font-mono font-bold text-xs text-white shadow-md">
                      {app.platform === 'Android' ? 'APK' : 'IPA'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                        {app.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {app.packageName} • v{app.currentVersion}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${appScoreMeta.bg} ${appScoreMeta.color}`}>
                    {app.securityScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 block">Critical</span>
                    <span className="font-bold text-white">{app.findingsCount.critical}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 block">High</span>
                    <span className="font-bold text-white">{app.findingsCount.high}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-[10px] text-yellow-400 block">Medium</span>
                    <span className="font-bold text-white">{app.findingsCount.medium}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-brand-cyan group-hover:translate-x-1 transition-transform">
                  <span>Open Security Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
