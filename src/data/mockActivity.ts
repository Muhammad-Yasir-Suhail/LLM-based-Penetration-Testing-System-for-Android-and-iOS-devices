import { ActivityEvent } from "@/types";

export const initialActivityEvents: ActivityEvent[] = [
  {
    id: "act-1",
    type: "analysis_complete",
    title: "Static Security Analysis Completed",
    description: "Scan #AN-2026-0842 finished on Acme Banking Mobile (v4.2.1). 142 rules evaluated with 12 findings.",
    timestamp: "Today, 10:42 AM",
    user: {
      name: "SentinelX Engine",
      email: "orchestrator@sentinelx.security",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"
    },
    metadata: {
      applicationName: "Acme Banking Mobile",
      severity: "Critical"
    }
  },
  {
    id: "act-2",
    type: "finding_detected",
    title: "Critical Vulnerability Correlated",
    description: "Hardcoded AES Cryptographic Key discovered in AuthManager.kt (CWE-798, CVSS 8.8).",
    timestamp: "Today, 10:41 AM",
    user: {
      name: "SentinelX Correlator",
      email: "ai.copilot@sentinelx.security",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"
    },
    metadata: {
      applicationName: "Acme Banking Mobile",
      findingTitle: "Hardcoded AES Master Key",
      severity: "Critical"
    }
  },
  {
    id: "act-3",
    type: "app_uploaded",
    title: "Application Build Uploaded",
    description: "Acme Banking Mobile build 42108 (Android APK, 48.6 MB) uploaded for pre-release validation.",
    timestamp: "Today, 10:35 AM",
    user: {
      name: "Alex Vance",
      email: "alex.vance@sentinelx.security",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    metadata: {
      applicationName: "Acme Banking Mobile"
    }
  },
  {
    id: "act-4",
    type: "finding_resolved",
    title: "Vulnerability Marked as Resolved",
    description: "F-1039 (Insecure SharedPreferences Storage) marked as Resolved by Sarah Jenkins.",
    timestamp: "Yesterday, 4:15 PM",
    user: {
      name: "Sarah Jenkins",
      email: "sarah.j@sentinelx.security",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    metadata: {
      applicationName: "Acme Banking Mobile",
      severity: "Medium"
    }
  },
  {
    id: "act-5",
    type: "report_generated",
    title: "Executive Security Assessment Generated",
    description: "Generated Q3 Mobile Threat Assessment Report for Acme Financial Group.",
    timestamp: "Yesterday, 3:00 PM",
    user: {
      name: "Alex Vance",
      email: "alex.vance@sentinelx.security",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    metadata: {
      applicationName: "Acme Banking Mobile",
      reportType: "Executive Summary"
    }
  },
  {
    id: "act-6",
    type: "ai_consultation",
    title: "AI Security Copilot Consultation",
    description: "Security team queried AI Copilot for automated remediation diff on CWE-926 exported activities.",
    timestamp: "Yesterday, 1:20 PM",
    user: {
      name: "David Kim",
      email: "david.kim@transitgo.io",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    }
  }
];
