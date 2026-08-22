import { AnalysisRun } from "@/types";

export const initialAnalyses: AnalysisRun[] = [
  {
    id: "an-1",
    runNumber: "AN-2026-0842",
    applicationId: "app-1",
    applicationName: "Acme Banking Mobile",
    version: "v4.2.1 (Build 42108)",
    platform: "Android",
    startedAt: "Today, 10:40 AM",
    duration: "2m 41s",
    status: "Completed",
    checksExecuted: 142,
    filesAnalyzed: 1428,
    rulesExecuted: 87,
    findingsFound: 12,
    findingsBreakdown: {
      critical: 2,
      high: 4,
      medium: 5,
      low: 1
    },
    enginesUsed: ["MobSF", "JADX", "Apktool", "Frida", "Burp Suite", "SentinelX Static Core"],
    staticAnalysisScore: 82,
    manifestScore: 78,
    dependencyScore: 91
  },
  {
    id: "an-2",
    runNumber: "AN-2026-0839",
    applicationId: "app-2",
    applicationName: "Acme Banking iOS",
    version: "v4.2.0 (Build 42010)",
    platform: "iOS",
    startedAt: "Yesterday, 2:07 PM",
    duration: "3m 12s",
    status: "Completed",
    checksExecuted: 128,
    filesAnalyzed: 940,
    rulesExecuted: 74,
    findingsFound: 7,
    findingsBreakdown: {
      critical: 0,
      high: 2,
      medium: 4,
      low: 1
    },
    enginesUsed: ["MobSF", "SentinelX Static Core"],
    staticAnalysisScore: 89,
    manifestScore: 94,
    dependencyScore: 92
  },
  {
    id: "an-3",
    runNumber: "AN-2026-0831",
    applicationId: "app-3",
    applicationName: "ShopSphere Buyer APK",
    version: "v3.4.8 (Build 34800)",
    platform: "Android",
    startedAt: "Yesterday, 3:10 PM",
    duration: "4m 05s",
    status: "Completed",
    checksExecuted: 164,
    filesAnalyzed: 2180,
    rulesExecuted: 92,
    findingsFound: 18,
    findingsBreakdown: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 3
    },
    enginesUsed: ["MobSF", "JADX", "Apktool", "Burp Suite"],
    staticAnalysisScore: 67,
    manifestScore: 70,
    dependencyScore: 64
  }
];
