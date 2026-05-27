"use client";

import { Shield, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";

interface HealthScoreProps {
  healthScore: number;
  riskLabel: string;
  sentimentScore?: number;
  operationalStatus?: string;
  summaryPoints?: string[];
  synergyMatches?: { name: string; reason: string; score: number }[];
}

export function HealthScoreCard({
  healthScore,
  riskLabel,
  sentimentScore,
  operationalStatus,
  summaryPoints,
  synergyMatches,
}: HealthScoreProps) {
  const getRiskStyle = (label: string) => {
    switch (label) {
      case "HIGH_GROWTH":
        return { badge: "badge-high-growth", bar: "bg-emerald-500", icon: TrendingUp, iconBg: "bg-emerald-50 text-emerald-600", label: "High Growth" };
      case "STABLE":
        return { badge: "badge-stable", bar: "bg-blue-500", icon: Shield, iconBg: "bg-blue-50 text-blue-600", label: "Stable" };
      case "AT_RISK":
        return { badge: "badge-at-risk", bar: "bg-red-500", icon: AlertTriangle, iconBg: "bg-red-50 text-red-600", label: "At Risk" };
      default:
        return { badge: "bg-slate-50 text-slate-700", bar: "bg-slate-500", icon: Shield, iconBg: "bg-slate-50 text-slate-600", label: riskLabel };
    }
  };

  const risk = getRiskStyle(riskLabel);
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className="card-legion overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${risk.iconBg}`}>
                <RiskIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#161616]">AI Health Evaluation</h3>
                <p className="text-xs text-[#667085]">Real-time AI analysis</p>
              </div>
            </div>
            <span className={risk.badge}>{risk.label}</span>
          </div>

          <div className="flex flex-row items-center gap-8 mt-auto pt-4 w-full">
            {/* Radial Gauge as Focal Point */}
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full"></div>
              <ScoreGauge score={healthScore} size="lg" />
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-4 flex-1">
              {sentimentScore !== undefined && (
                <div className="rounded-[16px] bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sentimentScore >= 0.7 ? 'bg-emerald-500' : sentimentScore >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                    <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">AI Sentiment</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <p className={`text-xl font-extrabold ${sentimentScore >= 0.7 ? 'text-emerald-600' : sentimentScore >= 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                      {(sentimentScore * 100).toFixed(0)}%
                    </p>
                    <p className="text-[10px] font-semibold text-[#94a3b8]">{sentimentScore >= 0.7 ? 'Positif' : sentimentScore >= 0.4 ? 'Netral' : 'Negatif'}</p>
                  </div>
                </div>
              )}
              {operationalStatus && (
                <div className="rounded-[16px] bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${operationalStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Op Status</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-extrabold border ${operationalStatus === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-red-700 bg-red-50 border-red-100'}`}>
                      {operationalStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {summaryPoints && summaryPoints.length > 0 && (
        <div className="card-legion p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626]">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#161616]">Executive Summary</h3>
              <p className="text-xs text-[#667085]">AI-generated 3-point summary</p>
            </div>
          </div>
          <ul className="space-y-3">
            {summaryPoints.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#344054]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#ED1C24] text-xs font-bold">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#8c8f93]">Generated by AI · Google Gemini 2.0 Flash via OpenRouter</p>
        </div>
      )}

      {/* Synergy Recommendations */}
      {synergyMatches && synergyMatches.length > 0 && (
        <div className="card-legion p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fffbeb] text-[#d97706]">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#161616]">Synergy Recommendations</h3>
              <p className="text-xs text-[#667085]">Telkom BU collaboration matches</p>
            </div>
          </div>
          <div className="space-y-3">
            {synergyMatches.map((match, i) => (
              <div key={i} className="rounded-xl border border-[#f2f4f7] bg-[#fafafa] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#161616]">{match.name}</p>
                  <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#ED1C24]">
                    {Math.round(match.score * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-[#525252]">{match.reason}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#8c8f93]">Generated by AI · Google Gemini 2.0 Flash via OpenRouter</p>
        </div>
      )}
    </div>
  );
}

export function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const getColor = (s: number) => {
    if (s >= 70) return "stroke-emerald-500";
    if (s >= 40) return "stroke-blue-500";
    return "stroke-red-500";
  };
  const getLabel = (s: number) => {
    if (s >= 70) return "Healthy";
    if (s >= 40) return "Stable";
    return "At Risk";
  };

  const dimensions = size === "sm" ? 80 : size === "lg" ? 160 : 120;
  const strokeWidth = size === "sm" ? 6 : size === "lg" ? 12 : 8;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dimensions} height={dimensions} className="-rotate-90">
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#f2f4f7]"
        />
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getColor(score)} transition-all duration-1000`}
        />
      </svg>
      <span className={`font-bold ${size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-xl"} text-[#161616]`}>
        {score}
      </span>
      <span className={`${size === "sm" ? "text-[10px]" : "text-xs"} text-[#667085]`}>{getLabel(score)}</span>
    </div>
  );
}
