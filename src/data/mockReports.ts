import { SecurityReport } from "@/types";

export const initialReports: SecurityReport[] = [
  {
    id: "rep-1",
    reportNumber: "REP-2026-041",
    title: "Executive Mobile Security Assessment",
    type: "Executive Summary",
    applicationName: "Acme Banking Mobile",
    version: "v4.2.1",
    generatedDate: "Today, 10:45 AM",
    generatedBy: "Alex Vance",
    securityScore: 82,
    findingsCount: 12,
    downloadSize: "2.4 MB PDF",
    status: "Ready",
    executiveSummary: "SentinelX conducted a comprehensive automated security assessment of Acme Banking Mobile (v4.2.1). The application achieved a Security Posture Score of 82/100 (Good). Key risks include 2 Critical cryptographic and IPC exposure vulnerabilities requiring immediate remediation prior to store release."
  },
  {
    id: "rep-2",
    reportNumber: "REP-2026-040",
    title: "OWASP MASVS Level 2 Technical Compliance Report",
    type: "Compliance (MASVS)",
    applicationName: "Acme Banking Mobile",
    version: "v4.2.1",
    generatedDate: "Yesterday, 2:30 PM",
    generatedBy: "Sarah Jenkins",
    securityScore: 79,
    findingsCount: 15,
    downloadSize: "3.8 MB PDF",
    status: "Ready",
    executiveSummary: "Detailed mapping against OWASP Mobile Application Security Verification Standard (MASVS v2.0). 6 out of 8 categories passed with full compliance. Non-compliant items identified in MASVS-CRYPTO and MASVS-PLATFORM."
  },
  {
    id: "rep-3",
    reportNumber: "REP-2026-038",
    title: "Technical Vulnerability & Exploitability Analysis",
    type: "Technical Assessment",
    applicationName: "ShopSphere Buyer APK",
    version: "v3.4.8",
    generatedDate: "Yesterday, 4:00 PM",
    generatedBy: "Marcus Chen",
    securityScore: 67,
    findingsCount: 18,
    downloadSize: "4.1 MB PDF",
    status: "Ready",
    executiveSummary: "Technical breakdown of 18 security findings identified across static decompiler and network interceptors. Highlights hardcoded payment gateway API tokens and vulnerable OkHttp 3.12 dependencies."
  },
  {
    id: "rep-4",
    reportNumber: "REP-2026-035",
    title: "Prioritized Remediation Roadmap & Developer Guide",
    type: "Remediation Plan",
    applicationName: "TransitGo Passenger",
    version: "v2.8.4",
    generatedDate: "3 days ago",
    generatedBy: "David Kim",
    securityScore: 73,
    findingsCount: 11,
    downloadSize: "1.9 MB PDF",
    status: "Ready",
    executiveSummary: "Step-by-step developer remediation instructions with before/after code diffs for custom URL scheme authorization and SQLCipher database encryption."
  }
];
