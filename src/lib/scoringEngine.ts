import { Finding } from "@/types";

export interface ScoreBreakdown {
  score: number;
  grade: string;
  totalFindings: number;
  openCritical: number;
  openHigh: number;
  openMedium: number;
  openLow: number;
  openInfo: number;
  resolvedCount: number;
}

export function calculateSecurityScore(findings: Finding[]): ScoreBreakdown {
  const openFindings = findings.filter(f => f.status === 'Open' || f.status === 'In Review');
  const resolvedFindings = findings.filter(f => f.status === 'Resolved');
  
  let openCritical = 0;
  let openHigh = 0;
  let openMedium = 0;
  let openLow = 0;
  let openInfo = 0;

  openFindings.forEach(f => {
    switch (f.severity) {
      case 'Critical': openCritical++; break;
      case 'High': openHigh++; break;
      case 'Medium': openMedium++; break;
      case 'Low': openLow++; break;
      case 'Info': openInfo++; break;
    }
  });

  // Weighted penalty algorithm
  const penalty = (openCritical * 18) + (openHigh * 8) + (openMedium * 3) + (openLow * 0.8);
  
  // Baseline 100 minus penalty, clamped between 15 and 99
  let calculatedScore = Math.round(100 - penalty);
  if (calculatedScore < 15) calculatedScore = 15;
  if (calculatedScore > 99) calculatedScore = 99;

  let grade = 'Good';
  if (calculatedScore >= 90) grade = 'Excellent';
  else if (calculatedScore >= 75) grade = 'Good';
  else if (calculatedScore >= 60) grade = 'Moderate';
  else if (calculatedScore >= 45) grade = 'At Risk';
  else grade = 'Critical Risk';

  return {
    score: calculatedScore,
    grade,
    totalFindings: findings.length,
    openCritical,
    openHigh,
    openMedium,
    openLow,
    openInfo,
    resolvedCount: resolvedFindings.length
  };
}
