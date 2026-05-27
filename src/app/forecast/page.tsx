"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart,
} from "recharts";
import { TrendingUp, BarChart3, Shield, Lightbulb, RefreshCw, Zap } from "lucide-react";

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
  const [startupsData, setStartupsData] = useState<any[]>([]);
  
  useEffect(() => {
    fetch("/api/startups").then(res => res.json()).then(setStartupsData);
  }, []);

  const [selectedStartup, setSelectedStartup] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    startupName: string;
    historicalData: MetricPeriod[];
    projectedData: MetricPeriod[];
    prediction: Prediction;
  } | null>(null);
  const [error, setError] = useState("");

  const handleForecast = async () => {
    if (!selectedStartup) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/ai/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: selectedStartup }),
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

  const chartData = data
    ? [...data.historicalData, ...data.projectedData].map((p) => ({
        period: p.period,
        Revenue: p.revenue,
        Users: p.users,
        Growth: p.growth,
        "Burn Rate": p.burnRate,
        isProjected: data.historicalData.some((h) => h.period === p.period) ? false : true,
      }))
    : [];

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600 bg-emerald-50";
    if (score >= 0.5) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[#ED1C24]" />
            <h1 className="text-2xl font-bold text-[#161616]">Forecasting</h1>
          </div>
          <p className="mt-1 text-sm text-[#667085]">Prediksi pertumbuhan dan runway startup dengan AI</p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Controls */}
          <div className="card-legion mb-6 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-[#344054]">Pilih Startup</label>
                <select
                  value={selectedStartup}
                  onChange={(e) => setSelectedStartup(e.target.value)}
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
                >
                  <option value="">-- Pilih Startup --</option>
                  {startupsData.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.sector} ({s.batch})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleForecast}
                disabled={!selectedStartup || loading}
                className="btn-primary-solid gap-2 px-6 py-2.5 mt-5 disabled:opacity-50"
              >
                {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Menganalisis...</> : <><Zap className="h-4 w-4" /> Generate Forecast</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="card-legion mb-6 border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="card-legion flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
              <p className="text-sm font-medium text-[#344054]">AI sedang memproyeksikan data...</p>
              <p className="mt-1 text-xs text-[#8c8f93]">Menganalisis tren historis 6 bulan terakhir</p>
            </div>
          )}

          {data && (
            <>
              {/* Prediction Cards */}
              <div className="mb-6 grid gap-5 sm:grid-cols-3">
                <div className="card-legion p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#667085]">Predicted Growth</p>
                      <p className="text-xl font-bold text-[#161616]">{data.prediction.predictedGrowthRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="card-legion p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#667085]">Runway Estimate</p>
                      <p className="text-xl font-bold text-[#161616]">{data.prediction.predictedRunwayMonths} bulan</p>
                    </div>
                  </div>
                </div>

                <div className="card-legion p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getConfidenceColor(data.prediction.confidenceScore)}`}>
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#667085]">Confidence</p>
                      <p className="text-xl font-bold text-[#161616]">{(data.prediction.confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="card-legion mb-6 p-6">
                <h3 className="text-base font-bold text-[#161616] mb-1">Revenue & Users — Historical + Projected</h3>
                <p className="text-xs text-[#667085] mb-6">6 bulan historis + 3 bulan prediksi AI</p>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#667085" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#667085" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#667085" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e0e0e0", fontSize: "13px" }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#ED1C24"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ED1C24" }}
                      connectNulls
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Users"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#8c8f93]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]" /> Revenue (juta)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Users (ribu)
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-[#ED1C24]">
                    <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-[#ED1C24]" /> Projected
                  </span>
                </div>
              </div>

              {/* Growth Rate Chart */}
              <div className="card-legion mb-6 p-6">
                <h3 className="text-base font-bold text-[#161616] mb-1">Growth Rate Trend</h3>
                <p className="text-xs text-[#667085] mb-6">Persentase pertumbuhan bulanan</p>
                <ResponsiveContainer width="100%" height={250}>
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

              {/* AI Notes */}
              <div className="card-legion p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#ED1C24]">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#161616]">AI Analysis</h3>
                    <p className="mt-2 text-sm text-[#525252] leading-relaxed">{data.prediction.notes}</p>
                    <p className="mt-3 text-xs text-[#8c8f93]">Generated by AI · Google Gemini 2.0 Flash via OpenRouter</p>
                  </div>
                </div>
              </div>

              {/* Detailed Projection Table */}
              <div className="card-legion mt-6 overflow-hidden">
                <div className="p-6 pb-0">
                  <h3 className="text-base font-bold text-[#161616]">Proyeksi Detail</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f2f4f7]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#667085] uppercase">Period</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[#667085] uppercase">Revenue</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[#667085] uppercase">Users</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[#667085] uppercase">Growth</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[#667085] uppercase">Burn Rate</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#667085] uppercase">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.historicalData, ...data.projectedData].map((p, i) => {
                        const isProj = i >= data.historicalData.length;
                        return (
                          <tr key={i} className={`border-b border-[#f2f4f7] last:border-0 ${isProj ? "bg-[#fbfaff]" : ""}`}>
                            <td className="px-6 py-3 text-[#161616] font-medium">{p.period}</td>
                            <td className="px-6 py-3 text-right text-[#525252]">Rp{p.revenue}jt</td>
                            <td className="px-6 py-3 text-right text-[#525252]">{p.users.toLocaleString()}</td>
                            <td className="px-6 py-3 text-right text-[#525252]">{p.growth}%</td>
                            <td className="px-6 py-3 text-right text-[#525252]">Rp{p.burnRate}jt</td>
                            <td className="px-6 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isProj ? "bg-[#FEF2F2] text-[#ED1C24]" : "bg-[#f2f4f7] text-[#667085]"
                              }`}>
                                {isProj ? "Projected" : "Historical"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!data && !loading && (
            <div className="card-legion flex flex-col items-center justify-center py-20">
              <BarChart3 className="mb-3 h-12 w-12 text-[#d0d5dd]" />
              <p className="text-sm font-medium text-[#667085]">Pilih startup dan klik &quot;Generate Forecast&quot;</p>
              <p className="mt-1 text-xs text-[#8c8f93]">AI akan menganalisis data historis 6 bulan dan memproyeksikan 3 bulan ke depan</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
