"use client";

import { Shield, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";

interface HealthScoreProps {
  healthScore: number;
  riskLabel: string;
  sentimentScore?: number;
  operationalStatus?: string;
  summaryPoints?: string[];
  synergyMatches?: { name: string; reason: string; score: number; logo?: string }[];
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score Card (Hero) */}
        <div 
          className="rounded-[24px] overflow-hidden relative flex flex-col h-full"
          style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,248,252,1))',
          border: '1px solid rgba(255,0,60,0.06)',
          boxShadow: '0 10px 40px rgba(15,0,40,0.08)'
        }}
      >
        {/* Subtle AI Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="p-8 relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${risk.iconBg} shadow-inner`}>
                <RiskIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight">AI Health Evaluation</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ED1C24]"></span>
                  </span>
                  <span className="text-xs font-semibold text-[#64748b]">Real-time AI analysis active</span>
                </div>
              </div>
            </div>
            <span className={`${risk.badge} px-3 py-1 text-xs shadow-sm ring-1 ring-inset ring-black/5`}>{risk.label}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 mt-auto">
            {/* Radial Gauge as Focal Point */}
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full"></div>
              <ScoreGauge score={healthScore} size="lg" />
            </div>

            {/* Metrics */}
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              {sentimentScore !== undefined && (
                <div className="rounded-[16px] bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-[#64748b] mb-1 uppercase tracking-wider">AI Sentiment Score</p>
                  <p className="text-2xl font-extrabold text-[#0f172a]">{(sentimentScore * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-[#94a3b8] mt-1">Based on narrative tone</p>
                </div>
              )}
              {operationalStatus && (
                <div className="rounded-[16px] bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-[#64748b] mb-1 uppercase tracking-wider">Operational Status</p>
                  <p className="text-lg font-extrabold text-[#0f172a] mt-1">{operationalStatus}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Insight Cards */}
      {summaryPoints && summaryPoints.length > 0 ? (
        <div className="rounded-[20px] bg-[#FCFBFF] border border-[#f1f1f5] shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-[#ED1C24] shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0f172a]">AI Insights & Summary</h3>
              <p className="text-xs font-medium text-[#64748b]">Key takeaways extracted by Gemini 2.0</p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 uppercase tracking-widest">
              AI Generated
            </span>
          </div>
          <div className="space-y-4">
            {summaryPoints.map((point, i) => {
              // Highlight some keywords simply by rendering the first few words bold or using an icon
              const isPositive = point.toLowerCase().includes('tumbuh') || point.toLowerCase().includes('stabil') || point.toLowerCase().includes('aman') || point.toLowerCase().includes('accelerated') || point.toLowerCase().includes('healthy');
              const isWarning = point.toLowerCase().includes('hambatan') || point.toLowerCase().includes('kritis') || point.toLowerCase().includes('depends');
              
              const Icon = isPositive ? TrendingUp : (isWarning ? AlertTriangle : Target);
              const iconColor = isPositive ? 'text-emerald-500 bg-emerald-50' : (isWarning ? 'text-amber-500 bg-amber-50' : 'text-blue-500 bg-blue-50');

              return (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-[16px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconColor} mt-0.5`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-[#334155] leading-relaxed">
                    {point}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
      </div>

      {/* Synergy Recommendations */}
      {synergyMatches && synergyMatches.length > 0 && (
        <div className="rounded-[20px] bg-white border border-[#f1f1f5] shadow-md p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] text-[#d97706] shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0f172a]">Synergy Recommendations</h3>
              <p className="text-xs font-medium text-[#64748b]">Telkom BU collaboration matches</p>
            </div>
          </div>
          <div className="space-y-3">
            {synergyMatches.map((match, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-[#FAFAFD] p-5 hover:border-amber-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {match.logo && (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                        <img src={match.logo} alt={match.name} className="h-full w-full object-contain p-1" />
                      </div>
                    )}
                    <p className="font-bold text-[#0f172a]">{match.name}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-bold text-[#ED1C24] shadow-sm">
                    {Math.round(match.score * 100)}% match
                  </span>
                </div>
                <p className="text-sm font-medium text-[#475569] leading-relaxed">{match.reason}</p>
              </div>
            ))}
          </div>
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
          className="text-slate-100"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-extrabold tracking-tight ${size === "lg" ? "text-5xl" : size === "sm" ? "text-sm" : "text-2xl"} text-[#0f172a]`}>
          {score}
        </span>
        <span className={`${size === "sm" ? "text-[8px]" : size === "lg" ? "text-sm" : "text-xs"} font-bold text-[#64748b] uppercase tracking-wider`}>{getLabel(score)}</span>
      </div>
    </div>
  );
}
