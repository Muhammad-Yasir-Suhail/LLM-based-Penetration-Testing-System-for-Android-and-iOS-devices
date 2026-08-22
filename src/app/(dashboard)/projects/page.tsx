'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  FileCode,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { Project, Platform } from '@/types';
import { getScoreGrade } from '@/lib/utils';

export default function ProjectsPage() {
  const { projects, addNewProject, addNewApplication } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Android' | 'iOS' | 'Cross-Platform'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'findings'>('score');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [newProjectName, setNewProjectName] = useState('');
  const [newOrg, setNewOrg] = useState('Acme Financial Group');
  const [newEnv, setNewEnv] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [newDesc, setNewDesc] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Android', 'iOS']);
  
  // Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Filter and sort
  const filteredProjects = projects.filter(p => {
    if (platformFilter !== 'All' && !p.platforms.includes(platformFilter as any)) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.organization.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.securityScore - a.securityScore;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'findings') return b.openFindingsCount - a.openFindingsCount;
    return 0;
  });

  const handleSimulateUpload = (filename: string, size: string) => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadedFile({ name: filename, size, type: filename.endsWith('.apk') ? 'Android APK' : 'iOS IPA' });

    setTimeout(() => setUploadProgress(45), 250);
    setTimeout(() => setUploadProgress(80), 550);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
    }, 850);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const createdProject = addNewProject({
      name: newProjectName,
      description: newDesc || 'Automated mobile security assessment project.',
      organization: newOrg,
      environment: newEnv,
      platforms: selectedPlatforms,
      applicationsCount: uploadedFile ? 1 : 0,
      status: 'Healthy',
      leadEngineer: 'Alex Vance',
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    });

    if (uploadedFile) {
      addNewApplication({
        name: `${newProjectName} Mobile`,
        packageName: `com.${newOrg.toLowerCase().replace(/\s+/g, '')}.${newProjectName.toLowerCase().replace(/\s+/g, '')}`,
        platform: selectedPlatforms.includes('Android') ? 'Android' : 'iOS',
        currentVersion: '1.0.0',
        currentBuild: '10001',
        projectId: createdProject.id,
        projectName: createdProject.name,
        fileSize: uploadedFile.size,
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
        minSdk: 'API 26',
        targetSdk: 'API 34',
        status: 'Active',
        iconBg: 'from-blue-600 to-indigo-900'
      });
    }

    // Reset and close
    setIsModalOpen(false);
    setModalStep(1);
    setNewProjectName('');
    setNewDesc('');
    setUploadedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage mobile security repositories, target builds, and security posture scorecards.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalStep(1);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, org, or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Platform Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['All', 'Android', 'iOS'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  platformFilter === p
                    ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-cyan"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="findings">Sort by Findings</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProjects.map((project) => {
          const scoreMeta = getScoreGrade(project.securityScore);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="p-5 rounded-3xl bg-[#0d121c] border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between group space-y-4 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${scoreMeta.bg} ${scoreMeta.color}`}>
                    Score {project.securityScore}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-cyan transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {project.description}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-800/60 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Platform</span>
                  <span className="text-slate-200">{project.platforms.join(' + ')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Open Findings</span>
                  <span className={`font-bold ${project.openFindingsCount > 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {project.openFindingsCount} Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Last Analysis</span>
                  <span className="text-slate-400">{project.lastScan}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-brand-cyan group-hover:translate-x-1 transition-transform">
                <span>View Project</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* "+ New Project" Multi-Step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-[#0d121c] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel-glow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-cyan border border-brand-cyan/40">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase">
                    STEP {modalStep} OF 3
                  </span>
                  <h3 className="text-base font-bold text-white">Create Security Project</h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">PROJECT NAME *</label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Apex Crypto Wallet"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">ORGANIZATION</label>
                      <input
                        type="text"
                        value={newOrg}
                        onChange={(e) => setNewOrg(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">ENVIRONMENT</label>
                      <select
                        value={newEnv}
                        onChange={(e) => setNewEnv(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan"
                      >
                        <option value="Production">Production</option>
                        <option value="Staging">Staging</option>
                        <option value="Development">Development</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">DESCRIPTION</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={2}
                      placeholder="Security objectives and release scope..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">Target Platform Architecture</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Android', label: 'Android', desc: 'APK / AAB', icon: Smartphone },
                      { id: 'iOS', label: 'iOS', desc: 'IPA / Swift', icon: Smartphone },
                      { id: 'Cross-Platform', label: 'Both', desc: 'Android + iOS', icon: Layers },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedPlatforms(opt.id === 'Cross-Platform' ? ['Android', 'iOS'] : [opt.id as any])}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          (opt.id === 'Cross-Platform' && selectedPlatforms.length === 2) || (selectedPlatforms.length === 1 && selectedPlatforms.includes(opt.id as any))
                            ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <opt.icon className="w-5 h-5 mb-1 text-brand-cyan" />
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Upload Application Build (APK / AAB / IPA)
                  </h4>

                  {/* Drag & Drop Box */}
                  <div
                    onClick={() => handleSimulateUpload('ApexWallet_v1.0.0_release.apk', '42.8 MB')}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      uploadedFile
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-brand-cyan bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${uploadedFile ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {uploadedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-400">Application uploaded successfully.</p>
                        <p className="text-[11px] font-mono text-slate-300">
                          {uploadedFile.name} ({uploadedFile.size})
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-200">
                          Drag & drop APK / IPA build here, or <span className="text-brand-cyan underline">browse files</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Supports Android APK (up to 200MB) or iOS IPA (up to 300MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Uploading & fingerprinting build...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-cyan transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0a0e16] border-t border-slate-800 flex items-center justify-between">
              {modalStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setModalStep(modalStep - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {modalStep < 3 ? (
                <button
                  type="button"
                  disabled={!newProjectName && modalStep === 1}
                  onClick={() => setModalStep(modalStep + 1)}
                  className="px-4 py-2 rounded-xl bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border border-brand-cyan/40 text-xs font-bold font-mono transition-all disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateProject}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 text-xs font-bold font-mono shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
                >
                  Complete & Register Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
