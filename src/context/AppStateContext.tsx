'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Application,
  Finding,
  FindingStatus,
  AttackSurfaceNode,
  AttackSurfaceEdge,
  CorrelatedIssue,
  AnalysisRun,
  ActivityEvent,
  TeamMember,
  SecurityReport,
  SecurityEngine
} from '@/types';
import { initialProjects } from '@/data/mockProjects';
import { initialApplications } from '@/data/mockApplications';
import { initialFindings } from '@/data/mockFindings';
import { initialAttackSurfaceNodes, initialAttackSurfaceEdges } from '@/data/mockAttackSurface';
import { initialCorrelatedIssues } from '@/data/mockCorrelations';
import { initialAnalyses } from '@/data/mockAnalyses';
import { initialTeamMembers } from '@/data/mockTeam';
import { initialActivityEvents } from '@/data/mockActivity';
import { initialReports } from '@/data/mockReports';
import { initialSecurityEngines } from '@/data/mockEngines';
import { calculateSecurityScore, ScoreBreakdown } from '@/lib/scoringEngine';

interface AppStateContextType {
  projects: Project[];
  applications: Application[];
  findings: Finding[];
  attackSurfaceNodes: AttackSurfaceNode[];
  attackSurfaceEdges: AttackSurfaceEdge[];
  correlatedIssues: CorrelatedIssue[];
  analyses: AnalysisRun[];
  teamMembers: TeamMember[];
  activityEvents: ActivityEvent[];
  reports: SecurityReport[];
  engines: SecurityEngine[];
  
  // Workspace & Active selection
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  
  // Modals & Drawers
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  demoModalOpen: boolean;
  setDemoModalOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  
  // Actions
  resolveFinding: (findingId: string, note?: string) => void;
  updateFindingStatus: (findingId: string, status: FindingStatus) => void;
  assignFinding: (findingId: string, assigneeName: string) => void;
  addNewProject: (project: Omit<Project, 'id' | 'openFindingsCount' | 'securityScore' | 'lastScan'>) => Project;
  addNewApplication: (app: Omit<Application, 'id' | 'securityScore' | 'lastAnalyzed' | 'findingsCount' | 'versionHistory' | 'attackSurfaceScore'>) => Application;
  addReport: (report: Omit<SecurityReport, 'id' | 'reportNumber' | 'generatedDate' | 'status'>) => SecurityReport;
  inviteMember: (name: string, email: string, role: TeamMember['role']) => void;
  resetToDefaultData: () => void;
  
  // Dynamic metrics
  workspaceScore: ScoreBreakdown;
  selectedApplication?: Application;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [attackSurfaceNodes, setAttackSurfaceNodes] = useState<AttackSurfaceNode[]>(initialAttackSurfaceNodes);
  const [attackSurfaceEdges] = useState<AttackSurfaceEdge[]>(initialAttackSurfaceEdges);
  const [correlatedIssues, setCorrelatedIssues] = useState<CorrelatedIssue[]>(initialCorrelatedIssues);
  const [analyses, setAnalyses] = useState<AnalysisRun[]>(initialAnalyses);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(initialActivityEvents);
  const [reports, setReports] = useState<SecurityReport[]>(initialReports);
  const [engines] = useState<SecurityEngine[]>(initialSecurityEngines);

  const [activeWorkspace, setActiveWorkspace] = useState<string>("Acme Security Lab");
  const [selectedAppId, setSelectedAppId] = useState<string>("app-1");
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);

  // Dynamic Workspace Score
  const workspaceScore = calculateSecurityScore(findings);

  // Synchronize dynamic application scores whenever findings change
  useEffect(() => {
    setApplications(prevApps =>
      prevApps.map(app => {
        const appFindings = findings.filter(f => f.applicationId === app.id);
        const appScore = calculateSecurityScore(appFindings);
        
        let critical = 0, high = 0, medium = 0, low = 0, info = 0;
        appFindings.filter(f => f.status === 'Open' || f.status === 'In Review').forEach(f => {
          if (f.severity === 'Critical') critical++;
          if (f.severity === 'High') high++;
          if (f.severity === 'Medium') medium++;
          if (f.severity === 'Low') low++;
          if (f.severity === 'Info') info++;
        });

        return {
          ...app,
          securityScore: appScore.score,
          findingsCount: { critical, high, medium, low, info }
        };
      })
    );

    // Update Projects Scores
    setProjects(prevProjects =>
      prevProjects.map(proj => {
        const projFindings = findings.filter(f => f.projectId === proj.id);
        const projScore = calculateSecurityScore(projFindings);
        const openCount = projFindings.filter(f => f.status === 'Open' || f.status === 'In Review').length;
        
        let status: 'Healthy' | 'Needs Attention' | 'Critical Risk' = 'Healthy';
        if (projScore.score < 70) status = 'Critical Risk';
        else if (projScore.score < 85) status = 'Needs Attention';

        return {
          ...proj,
          securityScore: projScore.score,
          openFindingsCount: openCount,
          status
        };
      })
    );
  }, [findings]);

  // Actions
  const updateFindingStatus = (findingId: string, newStatus: FindingStatus) => {
    let targetFinding: Finding | undefined;
    
    setFindings(prev =>
      prev.map(f => {
        if (f.id === findingId) {
          targetFinding = { ...f, status: newStatus };
          return targetFinding;
        }
        return f;
      })
    );

    if (targetFinding) {
      // Add activity event
      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: newStatus === 'Resolved' ? 'finding_resolved' : 'finding_detected',
        title: `Finding ${newStatus === 'Resolved' ? 'Resolved' : `Status Updated to ${newStatus}`}`,
        description: `${targetFinding.findingNumber} (${targetFinding.title}) marked as ${newStatus}.`,
        timestamp: 'Just now',
        user: {
          name: 'Alex Vance',
          email: 'alex.vance@vulncope.security',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        },
        metadata: {
          applicationName: targetFinding.applicationName,
          findingTitle: targetFinding.title,
          severity: targetFinding.severity
        }
      };

      setActivityEvents(prev => [newEvent, ...prev]);

      // Update Attack Surface node risk if applicable
      setAttackSurfaceNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.relatedFindingsCount > 0 && targetFinding?.affectedComponent.includes(node.name)) {
            return {
              ...node,
              risk: newStatus === 'Resolved' ? 'Safe' : node.risk,
              relatedFindingsCount: Math.max(0, node.relatedFindingsCount - 1)
            };
          }
          return node;
        })
      );
    }
  };

  const resolveFinding = (findingId: string) => {
    updateFindingStatus(findingId, 'Resolved');
  };

  const assignFinding = (findingId: string, assigneeName: string) => {
    setFindings(prev =>
      prev.map(f => (f.id === findingId ? { ...f, assignedTo: assigneeName } : f))
    );
  };

  const addNewProject = (projectData: Omit<Project, 'id' | 'openFindingsCount' | 'securityScore' | 'lastScan'>): Project => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      openFindingsCount: 0,
      securityScore: 100,
      lastScan: 'Never',
      status: 'Healthy'
    };
    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  const addNewApplication = (appData: Omit<Application, 'id' | 'securityScore' | 'lastAnalyzed' | 'findingsCount' | 'versionHistory' | 'attackSurfaceScore'>): Application => {
    const newApp: Application = {
      ...appData,
      id: `app-${Date.now()}`,
      securityScore: 92,
      lastAnalyzed: 'Just uploaded',
      attackSurfaceScore: 45,
      findingsCount: { critical: 0, high: 1, medium: 2, low: 1, info: 0 },
      versionHistory: [
        {
          version: appData.currentVersion,
          buildNumber: appData.currentBuild,
          scanDate: 'Just now',
          securityScore: 92,
          criticalFindings: 0,
          highFindings: 1,
          totalFindings: 4,
          fileSize: appData.fileSize,
          changesSummary: 'Initial application build uploaded to VulnCope.',
          events: [
            {
              type: 'score_change',
              label: 'Initial Analysis Baseline',
              description: 'Generated initial security posture baseline.'
            }
          ]
        }
      ]
    };
    setApplications(prev => [newApp, ...prev]);
    
    // Add activity event
    setActivityEvents(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'app_uploaded',
        title: 'New Application Build Added',
        description: `${newApp.name} (${newApp.currentVersion}) registered in ${newApp.projectName}.`,
        timestamp: 'Just now',
        user: {
          name: 'Alex Vance',
          email: 'alex.vance@vulncope.security',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        },
        metadata: {
          applicationName: newApp.name
        }
      },
      ...prev
    ]);

    return newApp;
  };

  const addReport = (reportData: Omit<SecurityReport, 'id' | 'reportNumber' | 'generatedDate' | 'status'>): SecurityReport => {
    const newRep: SecurityReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      reportNumber: `REP-2026-0${reports.length + 45}`,
      generatedDate: 'Just now',
      status: 'Ready'
    };
    setReports(prev => [newRep, ...prev]);

    setActivityEvents(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'report_generated',
        title: 'Security Report Generated',
        description: `${newRep.title} generated for ${newRep.applicationName}.`,
        timestamp: 'Just now',
        user: {
          name: 'Alex Vance',
          email: 'alex.vance@vulncope.security',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        },
        metadata: {
          applicationName: newRep.applicationName,
          reportType: newRep.type
        }
      },
      ...prev
    ]);

    return newRep;
  };

  const inviteMember = (name: string, email: string, role: TeamMember['role']) => {
    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      status: 'Invited',
      lastActive: 'Invitation Pending',
      projectsAssigned: ['Acme Banking'],
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`
    };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const resetToDefaultData = () => {
    setProjects(initialProjects);
    setApplications(initialApplications);
    setFindings(initialFindings);
    setAttackSurfaceNodes(initialAttackSurfaceNodes);
    setCorrelatedIssues(initialCorrelatedIssues);
    setAnalyses(initialAnalyses);
    setTeamMembers(initialTeamMembers);
    setActivityEvents(initialActivityEvents);
    setReports(initialReports);
  };

  const selectedApplication = applications.find(a => a.id === selectedAppId) || applications[0];

  return (
    <AppStateContext.Provider
      value={{
        projects,
        applications,
        findings,
        attackSurfaceNodes,
        attackSurfaceEdges,
        correlatedIssues,
        analyses,
        teamMembers,
        activityEvents,
        reports,
        engines,
        activeWorkspace,
        setActiveWorkspace,
        selectedAppId,
        setSelectedAppId,
        searchModalOpen,
        setSearchModalOpen,
        notificationsOpen,
        setNotificationsOpen,
        demoModalOpen,
        setDemoModalOpen,
        onboardingOpen,
        setOnboardingOpen,
        resolveFinding,
        updateFindingStatus,
        assignFinding,
        addNewProject,
        addNewApplication,
        addReport,
        inviteMember,
        resetToDefaultData,
        workspaceScore,
        selectedApplication
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
