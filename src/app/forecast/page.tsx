"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, ReferenceArea
} from "recharts";
import { TrendingUp, BarChart3, Shield, Lightbulb, RefreshCw, Zap, Sparkles } from "lucide-react";

type Startup = (typeof startupsData)[number];
type UserInfo = { name: string; email: string; role: string; userId?: string };

// Mock Maps
const founderStartupMap: Record<string, string[]> = {
  "demo-founder-id": ["s3"], // Founder mengelola FinAccess (strictly 1 startup under Indigo rules)
};
const synergySectorMap: Record<string, string[]> = {
  "demo-synergy-id": ["Fintech", "Logistik", "Agritech"],
};

interface MetricPeriod {
  period: string;
  revenue: number;
  users: number;
  growth: number;
  burnRate: number;
}

interface Prediction {
  predictedGrowthRate: number;
  predictedRunwayMonths: number;
  confidenceScore: number;
  notes: string;
}

export default function ForecastPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    startupName: string;
    historicalData: MetricPeriod[];
    projectedData: MetricPeriod[];
    prediction: Prediction;
  } | null>(null);
  const [error, setError] = useState("");

  const fetchForecastForStartup = async (startupId: string) => {
    if (!startupId) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/ai/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Forecast gagal");
      }

      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          let roleStartups = startupsData;
          if (data.user.role === "founder" && data.user.userId) {
            const myIds = founderStartupMap[data.user.userId] || ["s3", "s8"]; 
            roleStartups = startupsData.filter((s) => myIds.includes(s.id));
          } else if (data.user.role === "synergy" && data.user.userId) {
            const mySectors = synergySectorMap[data.user.userId] || [];
            roleStartups = startupsData.filter((s) => mySectors.includes(s.sector));
          }
          setAvailableStartups(roleStartups);
          
          if (data.user.role === "founder" && roleStartups.length === 1) {
            const targetId = roleStartups[0].id;
            setSelectedStartup(targetId);
            fetchForecastForStartup(targetId);
          }
        }
      })
      .catch(() => {
        setAvailableStartups(startupsData);
      });
  }, []);

  const handleForecast = async () => {
    await fetchForecastForStartup(selectedStartup);
  };

  const chartData = data
    ? [...data.historicalData, ...data.projectedData].map((p, i, arr) => {
        const isProjected = data.historicalData.every((h) => h.period !== p.period);
        const isLastHistorical = i === data.historicalData.length - 1;
        return {
          period: p.period,
          Revenue: isProjected ? null : p.revenue,
          ProjectedRevenue: isProjected || isLastHistorical ? p.revenue : null,
          Users: isProjected ? null : p.users,
          ProjectedUsers: isProjected || isLastHistorical ? p.users : null,
          Growth: p.growth,
          "Burn Rate": p.burnRate,
          isProjected,
        };
      })
    : [];

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600 bg-emerald-50";
    if (score >= 0.5) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50/50">
        {/* Fixed Header Bar */}
        <div className="border-b bg-white px-8 py-4 shadow-sm relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-[#ED1C24]" />
              <h1 className="text-2xl font-bold text-[#161616]">Forecasting</h1>
            </div>
            <p className="mt-1 text-sm text-[#667085]">Prediksi pertumbuhan dan runway startup dengan AI</p>
          </div>
          
          {/* Controls in Header */}
          {(user?.role !== "founder" || availableStartups.length > 1) && (
            <div className="flex items-center gap-3">
              {availableStartups.length > 1 ? (
                <select
                  value={selectedStartup}
                  onChange={(e) => setSelectedStartup(e.target.value)}
                  className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] min-w-[200px]"
                >
                  <option value="">-- Pilih Startup --</option>
                  {availableStartups.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.sector} ({s.batch})</option>
                  ))}
                </select>
              ) : (
                availableStartups.length === 1 && (
                  <div className="rounded-lg bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 flex items-center gap-2">
                    <p className="text-sm font-bold text-[#0f172a]">{availableStartups[0].name}</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      ✓ Terverifikasi
                    </span>
                  </div>
                )
              )}
              <button
                onClick={handleForecast}
                disabled={!selectedStartup || loading}
                className="btn-primary-solid gap-2 px-5 py-2 text-sm disabled:opacity-50"
              >
                {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Menganalisis...</> : <><Zap className="h-4 w-4" /> Generate Forecast</>}
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">

        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-6">
            
            {/* Top Main Content */}
            <div className="w-full min-w-0">

          {error && (
            <div className="rounded-[20px] bg-red-50 shadow-soft border border-red-200 mb-6 p-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
              <p className="text-sm font-medium text-[#344054]">AI sedang memproyeksikan data...</p>
              <p className="mt-1 text-xs text-[#8c8f93]">Menganalisis tren historis 6 bulan terakhir</p>
            </div>
          )}

          {data && (
            <>
              {/* Prediction Cards */}
              <div className="mb-6 grid gap-5 sm:grid-cols-3">
                <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] z-0 opacity-50 transition-all group-hover:scale-110" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-600 shadow-sm">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#8c8f93]">Predicted Growth</p>
                      <p className="text-xl font-extrabold text-[#161616]">{data.prediction.predictedGrowthRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] z-0 opacity-50 transition-all group-hover:scale-110" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 shadow-sm">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#8c8f93]">Runway Estimate</p>
                      <p className="text-xl font-extrabold text-[#161616]">{data.prediction.predictedRunwayMonths} bulan</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[100px] z-0 opacity-50 transition-all group-hover:scale-110" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm border ${getConfidenceColor(data.prediction.confidenceScore)}`}>
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#8c8f93]">Confidence</p>
                      <p className="text-xl font-extrabold text-[#161616]">{(data.prediction.confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Container */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                
                {/* Revenue & Users Chart */}
                <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-base font-bold text-[#161616] mb-1">Revenue & Users — Historical + Projected</h3>
                  <p className="text-xs text-[#667085] mb-6">6 bulan historis + 3 bulan prediksi AI</p>
                  <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#667085" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#667085" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#667085" }} />
                    {data && <ReferenceArea x1={data.historicalData[data.historicalData.length - 1].period} x2={data.projectedData[data.projectedData.length - 1].period} fill="#ED1C24" fillOpacity={0.03} />}
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e0e0e0", fontSize: "13px" }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#ED1C24"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ED1C24" }}
                      connectNulls
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ProjectedRevenue"
                      stroke="#ED1C24"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#fff", stroke: "#ED1C24", strokeWidth: 2 }}
                      connectNulls
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Users"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      connectNulls
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ProjectedUsers"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#fff", stroke: "#f59e0b", strokeWidth: 2 }}
                      connectNulls
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-auto pt-3 flex items-center gap-4 text-xs text-[#8c8f93]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]" /> Revenue (juta)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Users (ribu)
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-red-500 font-medium">
                    <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-red-500 mr-1" /> Projected
                  </span>
                </div>
                {/* Projected Label Overlay */}
                <div className="absolute top-[80px] right-[25%] pointer-events-none opacity-50">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Projected</span>
                </div>
                </div>

                {/* Growth Rate Chart */}
                <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-base font-bold text-[#161616] mb-1">Growth Rate Trend</h3>
                  <p className="text-xs text-[#667085] mb-6">Persentase pertumbuhan bulanan</p>
                  <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#667085" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#667085" }} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e0e0e0", fontSize: "13px" }}
                      formatter={(value) => [`${value}%`, "Growth"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Growth"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#growthGradient)"
                    />
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </div>

              {/* AI Notes */}
              <div className="rounded-[20px] bg-gradient-to-r from-red-50/50 to-orange-50/50 shadow-soft border border-red-100 p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-10 -top-10 text-red-100 opacity-50 transform rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                  <Sparkles className="h-40 w-40" />
                </div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#ED1C24] shadow-sm border border-red-100">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#161616] tracking-wide">AI Analysis</h3>
                    <p className="mt-2 text-sm text-[#525252] leading-relaxed">{data.prediction.notes}</p>
                    <p className="mt-3 text-[11px] font-semibold text-[#8c8f93] tracking-wider uppercase">Generated by AI · Google Gemini 2.0 Flash</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!data && !loading && (
            <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] flex flex-col items-center justify-center py-20 w-full">
              <BarChart3 className="mb-3 h-12 w-12 text-[#d0d5dd]" />
              <p className="text-sm font-medium text-[#667085]">Pilih startup dan klik &quot;Generate Forecast&quot;</p>
              <p className="mt-1 text-xs text-[#8c8f93]">AI akan menganalisis data historis 6 bulan dan memproyeksikan 3 bulan ke depan</p>
            </div>
          )}
          </div> {/* End Top Main Content */}

          {/* Bottom Section: Detailed Projections */}
          {data && (
            <div className="w-full mt-2">
              <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#161616]">Detailed Projections</h3>
                    <p className="text-xs text-[#667085] mt-1">Estimasi periodik AI</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#ED1C24] bg-[#FEF2F2] px-2.5 py-1 rounded-md border border-[#ED1C24]/20">
                    {data.projectedData.length} mo forecast
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...data.historicalData, ...data.projectedData].map((p, i) => {
                    const isProj = i >= data.historicalData.length;
                    return (
                      <div 
                        key={i} 
                        className={`rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${isProj ? 'border-white/10 text-white hover:border-[#ED1C24]/30 hover:shadow-purple-500/5' : 'border-[#e0e0e0] bg-white text-[#161616]'}`}
                        style={isProj ? { background: 'radial-gradient(circle at 50% 20%, #1e1136 0%, #0d0a1b 75%, #06040f 100%)' } : undefined}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className={`text-sm font-bold ${isProj ? 'text-white' : 'text-[#161616]'}`}>{p.period}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isProj ? "bg-[#ED1C24] text-white shadow-sm shadow-red-200" : "bg-[#f2f4f7] text-[#667085]"}`}>
                            {isProj ? "Projected" : "Historical"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                          <div>
                            <p className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${isProj ? 'text-slate-400' : 'text-[#8c8f93]'}`}>Revenue</p>
                            <p className={`font-bold ${isProj ? 'text-white' : 'text-[#161616]'}`}>Rp{p.revenue}jt</p>
                          </div>
                          <div>
                            <p className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${isProj ? 'text-slate-400' : 'text-[#8c8f93]'}`}>Users</p>
                            <p className={`font-bold ${isProj ? 'text-white' : 'text-[#161616]'}`}>{p.users.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${isProj ? 'text-slate-400' : 'text-[#8c8f93]'}`}>Growth</p>
                            <p className={`font-bold flex items-center gap-1 ${p.growth >= 0 ? (isProj ? 'text-emerald-400' : 'text-emerald-600') : (isProj ? 'text-rose-400' : 'text-red-600')}`}>
                              {p.growth > 0 ? '+' : ''}{p.growth}%
                            </p>
                          </div>
                          <div>
                            <p className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${isProj ? 'text-slate-400' : 'text-[#8c8f93]'}`}>Burn Rate</p>
                            <p className={`font-bold ${isProj ? 'text-white' : 'text-[#161616]'}`}>Rp{p.burnRate}jt</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>
</AppShell>
  );
}
