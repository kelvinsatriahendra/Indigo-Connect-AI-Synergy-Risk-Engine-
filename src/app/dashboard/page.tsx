"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import { Search, Filter, Building2, TrendingUp, AlertTriangle, Layers, Sparkles, RefreshCw, GitBranch, FileText, Gift, Cloud, TerminalSquare, Download, CheckCircle2, Activity, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";
import { exportToPdf } from "@/lib/pdf-export";

type Startup = (typeof startupsData)[number];

const sectorColors: Record<string, string> = {
  Logistik: "bg-blue-700",
  Agritech: "bg-emerald-700",
  Fintech: "bg-amber-700",
  Edtech: "bg-indigo-700",
  Healthtech: "bg-[#ED1C24]",
  Energy: "bg-orange-700",
  Travel: "bg-rose-700",
};

// Mapping: founder user ID → startup IDs they own
const founderStartupMap: Record<string, string[]> = {
  "demo-founder-id": ["s3"], // Rick Firnando owns Verihubs (strictly 1 startup under Indigo rules)
};

// Mapping: synergy user ID → sectors they manage
const synergySectorMap: Record<string, string[]> = {
  "demo-synergy-id": ["Fintech", "Logistik", "Agritech"],
};

type UserInfo = { name: string; email: string; role: string; userId?: string };

const sectorColorMap: Record<string, string> = {
  Logistik: "#1d4ed8",
  Agritech: "#047857",
  Fintech: "#b45309",
  Edtech: "#4338ca",
  Healthtech: "#ED1C24",
  Energy: "#c2410c",
  Travel: "#be123c",
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [filters, setFilters] = useState({ sector: "all", batch: "all", risk: "all" });
  const [search, setSearch] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [analysisModal, setAnalysisModal] = useState<Startup | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Filter startups based on role
          let roleStartups = startupsData;
          if (data.user.role === "founder") {
            const myIds = founderStartupMap[data.user.userId] || [];
            roleStartups = startupsData.filter((s) => myIds.includes(s.id));
          } else if (data.user.role === "synergy") {
            const mySectors = synergySectorMap[data.user.userId] || [];
            roleStartups = startupsData.filter((s) => mySectors.includes(s.sector));
          }
          setStartups(roleStartups);
          setFilteredStartups(roleStartups);
        }
      })
      .catch(() => {
        setStartups(startupsData);
        setFilteredStartups(startupsData);
      });
  }, []);

  useEffect(() => {
    if (aiSearchActive || aiSearchLoading) return;

    let result = [...startups];
    if (filters.sector !== "all") result = result.filter((s) => s.sector === filters.sector);
    if (filters.batch !== "all") result = result.filter((s) => s.batch === filters.batch);
    if (filters.risk !== "all") result = result.filter((s) => s.status === filters.risk);
    if (search && !aiSearchActive) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
    }
    setFilteredStartups(result);
  }, [startups, filters, search, aiSearchActive, aiSearchLoading]);

  const handleAiSearch = async () => {
    if (!search.trim()) return;
    setAiSearchLoading(true);
    setAiSearchActive(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.filteredIds && Array.isArray(data.filteredIds)) {
          const filtered = startups.filter((s) => data.filteredIds.includes(s.id));
          setFilteredStartups(filtered);
        }
      }
    } catch {
      // fallback to text search
      const q = search.toLowerCase();
      setFilteredStartups(startups.filter((s) => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)));
    } finally {
      setAiSearchLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchActive(false);
    setSearch("");
    setFilteredStartups(startups);
  };

  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportReport = async () => {
    window.print();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && aiSearch) {
      handleAiSearch();
    }
  };

  const healthDistribution = [
    { label: "High Growth", count: filteredStartups.filter((s) => s.status === "ACTIVE").length, color: "bg-emerald-500" },
    { label: "Stable", count: 0, color: "bg-blue-500" },
    { label: "At Risk", count: filteredStartups.filter((s) => s.status === "AT_RISK").length, color: "bg-red-500" },
  ];

  const sectorDistribution = filteredStartups.reduce<Record<string, number>>((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const uniqueSectors = [...new Set(startups.map((s) => s.sector))];
  const uniqueBatches = [...new Set(startups.map((s) => s.batch))];

  const totalStartups = filteredStartups.length;
  const highGrowth = filteredStartups.filter((s) => s.status === "ACTIVE").length;
  const atRisk = filteredStartups.filter((s) => s.status === "AT_RISK").length;

  // Role-based dashboard config
  const dashboardConfig = {
    admin: {
      title: "Dashboard",
      subtitle: "Executive overview — seluruh portofolio startup Indigo",
    },
    synergy: {
      title: "Synergy Dashboard",
      subtitle: "Startup dalam sektor yang Anda kelola",
    },
    founder: {
      title: "Startup Saya",
      subtitle: "Overview performa startup Anda di program Indigo",
    },
  };

  const config = user ? dashboardConfig[user.role as keyof typeof dashboardConfig] || dashboardConfig.admin : dashboardConfig.admin;

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-background print:h-auto print:overflow-visible" ref={dashboardRef}>
        {/* Fixed Header Bar */}
        <div className="border-b bg-white px-8 py-5 shadow-sm relative z-10 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#161616]">{config.title}</h1>
              <p className="mt-1 text-sm text-[#667085]">{config.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <button 
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className={`print:hidden flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${exportSuccess ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'btn-primary-solid cursor-pointer'}`}
                >
                  {isExporting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Generating PDF...</>
                  ) : exportSuccess ? (
                    <><CheckCircle2 className="h-4 w-4" /> Downloaded</>
                  ) : (
                    <><Download className="h-4 w-4" /> Export Executive Report</>
                  )}
                </button>
              )}
              {user?.role === "founder" && (
                <>
                  <a href="/forecast" className="btn-primary-outline border-[#e0e0e0] text-[#344054] px-4 py-2 text-sm bg-white hover:bg-slate-50 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Lihat Forecast
                  </a>
                  <a href="/reports" className="btn-primary-solid px-4 py-2 text-sm flex items-center gap-2 shadow-sm">
                    <FileText className="h-4 w-4" /> Submit Laporan Baru
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8 print:p-0 print:overflow-visible">

        {user?.role !== "founder" && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Startup (Main Highlight) */}
            <div 
              className="rounded-[20px] p-6 relative overflow-hidden shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#ED1C24]/20"
              style={{ background: 'linear-gradient(135deg, #ED1C24 0%, #8b0000 100%)' }}
            >
              <svg className="absolute left-0 bottom-0 h-full w-auto pointer-events-none opacity-20 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M-20,120 C40,100 60,30 20,-20" strokeWidth="1.2" strokeDasharray="3 3" />
              </svg>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">Total Startup</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white shadow-sm backdrop-blur-sm">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-white tracking-wide">{totalStartups}</p>
              </div>
            </div>

            {/* Card 2: High Growth */}
            <div 
              className="rounded-[20px] bg-white p-6 relative overflow-hidden shadow-soft hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#8c8f93]">High Growth</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-[#161616] tracking-wide">{highGrowth}</p>
              </div>
              {/* Soft decorative line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-transparent opacity-50" />
            </div>

            {/* Card 3: At Risk */}
            <div 
              className="rounded-[20px] bg-white p-6 relative overflow-hidden shadow-soft hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#8c8f93]">At Risk</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-[#161616] tracking-wide">{atRisk}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-transparent opacity-50" />
            </div>

            {/* Card 4: Sektor / Batch */}
            <div 
              className="rounded-[20px] bg-white p-6 relative overflow-hidden shadow-soft hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#8c8f93]">
                    {user?.role === "synergy" ? "Sektor Dikelola" : "Batch Aktif"}
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {user?.role === "synergy" ? <GitBranch className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-[#161616] tracking-wide">
                  {user?.role === "synergy"
                    ? synergySectorMap["demo-synergy-id"]?.length || 0
                    : uniqueBatches.length}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-transparent opacity-50" />
            </div>
          </div>
        )}

        {/* Charts section - only for admin and synergy */}
        {user?.role !== "founder" && mounted && (
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Health Score Distribution - Sleek Progress Cards */}
            <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] z-0 opacity-50 transition-all group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-1 relative z-10">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center text-[#ED1C24] shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#161616] tracking-wide">Health Score Distribution</h3>
                  <p className="text-xs font-medium text-[#8c8f93]">Perbandingan status performa portofolio</p>
                </div>
              </div>
              <div className="mt-8 space-y-7 relative z-10">
                {healthDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2.5 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#344054] flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="font-extrabold text-[#161616] bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">{item.count} <span className="text-xs text-[#8c8f93] font-medium ml-1">({totalStartups > 0 ? Math.round((item.count / totalStartups) * 100) : 0}%)</span></span>
                    </div>
                    <div className="h-3.5 rounded-full bg-[#f8fafc] overflow-hidden shadow-inner border border-slate-100/50">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out relative overflow-hidden`}
                        style={{ width: `${totalStartups > 0 ? (item.count / totalStartups) * 100 : 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sektor Distribution - Recharts Premium Donut Chart */}
            <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] z-0 opacity-50 transition-all group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-1 relative z-10">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#161616] tracking-wide">Sector Distribution</h3>
                  <p className="text-xs font-medium text-[#8c8f93]">Proporsi startup berdasarkan sektor industri</p>
                </div>
              </div>
              <div className="mt-4 h-[240px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.15" />
                      </filter>
                    </defs>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      style={{ filter: "url(#pie-shadow)" }}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={sectorColorMap[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #f2f4f7', borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', color: '#161616', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#161616' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs font-semibold text-[#525252]">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Matrix & Synergy Potential Heatmap (Admin Only) */}
            {user?.role === "admin" && (
              <div className="lg:col-span-2 rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col justify-between mt-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-[200px] z-0 opacity-50 transition-all group-hover:scale-110" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#161616] tracking-wide">Executive Risk Matrix</h3>
                    <p className="text-xs font-medium text-[#8c8f93]">Pemetaan portfolio berdasarkan Potensi Sinergi vs Tingkat Risiko AI</p>
                  </div>
                </div>
                <div className="mt-2 h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                      <XAxis type="number" dataKey="synergy" name="Potensi Sinergi" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} label={{ value: 'Potensi Sinergi (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#cbd5e1', fontWeight: 'bold' }} />
                      <YAxis type="number" dataKey="risk" name="Tingkat Risiko" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} label={{ value: 'Tingkat Risiko AI (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#cbd5e1', fontWeight: 'bold' }} />
                      <ZAxis type="number" dataKey="z" range={[100, 600]} name="Valuasi" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f2f4f7', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }} />
                      <Scatter name="Startups" data={[
                        { name: 'Logee', synergy: 85, risk: 20, z: 300, fill: '#10b981' },
                        { name: 'Verihubs', synergy: 90, risk: 30, z: 400, fill: '#10b981' },
                        { name: 'T-Con', synergy: 70, risk: 40, z: 250, fill: '#f59e0b' },
                        { name: 'HealthSync', synergy: 65, risk: 75, z: 200, fill: '#ef4444' },
                        { name: 'PayDesa', synergy: 45, risk: 85, z: 150, fill: '#ef4444' },
                      ]} fill="#8884d8" opacity={0.85}>
                        {
                          [
                            { name: 'Logee', synergy: 85, risk: 20, z: 300, fill: '#10b981' },
                            { name: 'Verihubs', synergy: 90, risk: 30, z: 400, fill: '#10b981' },
                            { name: 'T-Con', synergy: 70, risk: 40, z: 250, fill: '#f59e0b' },
                            { name: 'HealthSync', synergy: 65, risk: 75, z: 200, fill: '#ef4444' },
                            { name: 'PayDesa', synergy: 45, risk: 85, z: 150, fill: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                          ))
                        }
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Founder gets a custom hero card and quick actions */}
        {user?.role === "founder" && mounted && (
          <div className="mb-8 space-y-6">
            
            {/* FOUNDER'S STARTUP HERO CARD */}
            {filteredStartups.map(startup => {
              const isHigh = startup.status === "ACTIVE";
              const healthScore = isHigh ? 92 : 45;
              const healthLabel = isHigh ? "Excellent" : "Critical Risk";
              const healthColor = isHigh ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200";
              const healthProgressColor = isHigh ? "bg-emerald-500" : "bg-rose-500";
              
              return (
                <div key={`hero-${startup.id}`} className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] overflow-hidden relative group hover:border-[#ED1C24]/30 hover:shadow-xl transition-all duration-300">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sectorColors[startup.sector] || "bg-slate-400"}`} />
                  <div className="p-6 pl-8 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                    
                    {/* Company Info */}
                    <div className="flex-1 min-w-0 flex items-start gap-5">
                      {startup && (startup as any).logo && (
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm p-1">
                          <img src={(startup as any).logo} alt={startup.name} className="h-full w-full object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-extrabold text-[#161616] tracking-tight">{startup.name}</h2>
                          <span className={isHigh ? "badge-high-growth shadow-sm" : "badge-at-risk shadow-sm"}>
                            {isHigh ? "High Growth" : "At Risk"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-bold text-[#8c8f93] tracking-wider uppercase flex items-center gap-2">
                          <span className="text-[#344054]">{startup.sector}</span> • <span>{startup.batch}</span>
                        </p>
                        <p className="mt-3 text-sm text-[#525252] leading-relaxed max-w-2xl line-clamp-2">
                          {startup.description}
                        </p>
                      </div>
                    </div>

                    {/* AI Status & Actions */}
                    <div className="w-full lg:w-[320px] shrink-0 bg-[#f8fafc] border border-slate-200 rounded-xl p-5 shadow-inner flex flex-col justify-center">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-[#667085] uppercase tracking-wider">AI Health Index</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-extrabold border ${healthColor}`}>
                          {healthScore}% · {healthLabel}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#e2e8f0] overflow-hidden mb-4">
                        <div 
                          className={`h-full rounded-full ${healthProgressColor} transition-all duration-500`}
                          style={{ width: `${healthScore}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">Lap. Terakhir: <span className="text-slate-700">12 Mei 2026</span></span>
                        </div>
                        <a href="/reports" className="text-xs font-extrabold text-[#ED1C24] hover:underline flex items-center gap-1 group/btn">
                          Update Laporan <span className="text-sm group-hover/btn:translate-x-0.5 transition-transform">›</span>
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}

            {/* Quick Actions */}
            <div className="grid gap-5 sm:grid-cols-2">
              <a href="/reports" className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] group flex items-center gap-4 p-6 transition-all hover:border-[#ED1C24] hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#ED1C24] group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#161616]">Submit Laporan Baru</p>
                  <p className="text-xs text-[#667085]">Kirim laporan bulanan untuk evaluasi AI</p>
                </div>
              </a>
              <a href="/forecast" className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] group flex items-center gap-4 p-6 transition-all hover:border-[#16a34a] hover:shadow-lg hover:shadow-green-500/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a] group-hover:bg-[#16a34a] group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#161616]">Lihat Forecast</p>
                  <p className="text-xs text-[#667085]">Prediksi pertumbuhan 3 bulan ke depan</p>
                </div>
              </a>
            </div>

            {/* Peer Benchmarking & Resource Hub Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Peer Benchmarking (Anonim) */}
              <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-base font-extrabold text-[#161616] tracking-wide">Peer Benchmarking</h3>
                  </div>
                  <p className="text-xs text-[#8c8f93]">Perbandingan performa (anonim) terhadap ekosistem Indigo</p>
                </div>
                <div className="mt-6 h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { metric: "Health Score", you: 92, avg: 76 },
                        { metric: "MoM Growth", you: 15, avg: 8 },
                        { metric: "Runway (Mo)", you: 18, avg: 12 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barGap={6}
                    >
                      <defs>
                        <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ED1C24" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#cbd5e1" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc', opacity: 0.5}}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #f2f4f7', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', background: '#ffffff' }}
                        labelStyle={{ color: '#161616', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 600 }} />
                      <Bar dataKey="you" name="Startup Anda" fill="url(#colorYou)" radius={[6, 6, 6, 6]} maxBarSize={24} />
                      <Bar dataKey="avg" name="Rata-rata Indigo" fill="url(#colorAvg)" radius={[6, 6, 6, 6]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Action Items (Replaced Resource Hub) */}
              <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] p-6 flex flex-col bg-gradient-to-br from-white to-red-50/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-[#ED1C24]" />
                    <h3 className="text-base font-extrabold text-[#161616] tracking-wide">AI Action Items</h3>
                  </div>
                  <p className="text-xs text-[#8c8f93]">Fokus perbaikan berdasarkan evaluasi laporan bulan lalu</p>
                </div>
                <div className="mt-5 space-y-4 flex-1">
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#ED1C24]">
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#161616]">Optimalkan Margin Mitra</p>
                      <p className="text-xs text-[#667085] mt-1 leading-relaxed">AI mendeteksi sentimen peringatan pada penurunan retensi aktif bulan lalu. Rancang strategi insentif baru bulan ini.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#161616]">Follow-up Sinergi Telkom</p>
                      <p className="text-xs text-[#667085] mt-1 leading-relaxed">Peluang sinergi dengan LinkAja & PADI UMKM (Match: 95%). Siapkan ringkasan teknis API untuk diajukan ke manajer Sinergi.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <RefreshCw className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#161616]">Persiapan Laporan Selanjutnya</p>
                      <p className="text-xs text-[#667085] mt-1 leading-relaxed">Laporan berikutnya dijadwalkan dalam 8 hari. Pastikan Anda menyertakan data burn-rate (pengeluaran) terbaru.</p>
                    </div>
                  </div>

                </div>
                <a href="/reports" className="mt-5 text-xs font-bold text-[#ED1C24] hover:underline flex items-center gap-1 group w-max transition-all">
                  Lihat Hasil AI Lengkap <span className="group-hover:translate-x-0.5 transition-transform">›</span>
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Filters & search — hidden for founder with few startups */}
        {(user?.role !== "founder" || startups.length > 3) && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-[#667085]" />
            <select
              className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            >
              <option value="all">Semua Sektor</option>
              {uniqueSectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            >
              <option value="all">Semua Batch</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
              value={filters.risk}
              onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
            >
              <option value="all">Semua Status</option>
              <option value="ACTIVE">High Growth</option>
              <option value="AT_RISK">At Risk</option>
            </select>

            <div className="relative flex flex-1 min-w-[300px]">
              <div className="flex w-full items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1 focus-within:border-[#ED1C24] focus-within:ring-1 focus-within:ring-[#ED1C24]">
                {aiSearch ? (
                  <Sparkles className="h-4 w-4 text-[#ED1C24]" />
                ) : (
                  <Search className="h-4 w-4 text-[#667085]" />
                )}
                <input
                  className="flex-1 border-0 bg-transparent py-2 text-sm text-[#344054] placeholder:text-[#8c8f93] focus:outline-none"
                  placeholder={aiSearch ? 'Contoh: "cari startup fintech at risk" atau "perusahaan logistik batch 6"' : "Cari startup..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {aiSearch && search && (
                  <button onClick={handleAiSearch} disabled={aiSearchLoading} className="btn-primary-solid rounded-md px-3 py-1.5 text-xs disabled:opacity-50">
                    {aiSearchLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Cari"}
                  </button>
                )}
                {aiSearchActive && (
                  <button onClick={clearAiSearch} className="text-[#8c8f93] hover:text-[#161616] text-xs">✕</button>
                )}
              </div>
              <button
                onClick={() => { setAiSearch(!aiSearch); if (aiSearchActive) clearAiSearch(); }}
                className={`ml-2 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  aiSearch
                    ? "border-[#ED1C24] bg-[#FEF2F2] text-[#ED1C24]"
                    : "border-[#e0e0e0] text-[#667085] hover:border-[#ED1C24]"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Search
              </button>
            </div>
          </div>
        )}

        {aiSearchActive && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#FEF2F2] px-4 py-2 text-sm text-[#ED1C24]">
            <Sparkles className="h-4 w-4" />
            <span>AI Search active</span>
            <button onClick={clearAiSearch} className="ml-auto text-xs underline">Clear</button>
          </div>
        )}

        {/* Standard Grid for Admin and Synergy (Founders already saw their card above) */}
        {user?.role !== "founder" && (
          filteredStartups.length === 0 ? (
            <div className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] flex flex-col items-center justify-center py-16">
              <Search className="mb-3 h-10 w-10 text-[#d0d5dd]" />
              <p className="text-sm font-medium text-[#667085]">Tidak ada startup yang cocok</p>
              <p className="text-xs text-[#8c8f93] mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStartups.map((startup) => {
              const isHigh = startup.status === "ACTIVE";
              const healthScore = isHigh ? 92 : 45;
              const healthLabel = isHigh ? "Excellent" : "Critical Risk";
              const healthColor = isHigh ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200";
              const healthProgressColor = isHigh ? "bg-emerald-500" : "bg-rose-500";
              
              // Map Synergy target based on sector
              const synergyMap: Record<string, { target: string; match: number; logos: string[] }> = {
                "Fintech": { target: "LinkAja / PADI UMKM", match: 94, logos: ["/startups/linkaja.svg", "/startups/padi umkm.png"] },
                "Logistik": { target: "Logee / Pos Indo", match: 88, logos: ["/startups/logee.jpg", "/startups/pos indo.webp"] },
                "Agritech": { target: "Telkomsel / T-Con", match: 91, logos: ["/startups/telkomsel.png"] },
                "Healthtech": { target: "Adamedika / Telkomsel", match: 79, logos: ["/startups/ada medika.png", "/startups/telkomsel.png"] },
                "Edtech": { target: "Pijar Belajar", match: 86, logos: ["/startups/pijar.webp"] },
                "Energy": { target: "Telkom Infra", match: 82, logos: ["/startups/telkom infra.png"] },
                "Travel": { target: "MDI Ventures", match: 85, logos: ["/startups/mdi ventures.jpeg"] },
              };
              const synergy = synergyMap[startup.sector] || { target: "Telkom Group", match: 85, logos: ["/startups/indigo-red.png"] };

              return (
                <div 
                  key={startup.id} 
                  className="rounded-[20px] bg-white shadow-soft border border-[#f2f4f7] overflow-hidden relative group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:border-[#ED1C24]/20"
                >
                  {/* Left accent bar matching sector color */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sectorColors[startup.sector] || "bg-slate-400"}`} />
                  
                  <div className="p-6 pl-7 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {startup && (startup as any).logo && (
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
                            <img src={(startup as any).logo} alt={startup.name} className="h-full w-full object-contain p-1" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-extrabold text-[#161616] group-hover:text-[#ED1C24] transition-colors">{startup.name}</h3>
                          <p className="mt-1 text-xs font-semibold text-[#8c8f93] tracking-wide uppercase">{startup.sector} · {startup.batch}</p>
                        </div>
                      </div>
                      <span className={isHigh ? "badge-high-growth shadow-sm" : "badge-at-risk shadow-sm"}>
                        {isHigh ? "High Growth" : "At Risk"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[#525252] line-clamp-2">{startup.description}</p>

                    {/* AI Engine Metrics Integration (Premium Dashboard Aesthetic) */}
                    <div className="mt-5 pt-4 border-t border-[#f2f4f7] space-y-4">
                      
                      {/* ROLE: FOUNDER or ADMIN (Shows Health Index prominently) */}
                      {(user?.role === "founder" || user?.role === "admin" || !user) && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-[#667085]">Health Index</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${healthColor}`}>
                              {healthScore}% · {healthLabel}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#f2f4f7] overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${healthProgressColor} transition-all duration-500`}
                              style={{ width: `${healthScore}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ROLE: SYNERGY (Shows Synergy Potential prominently) */}
                      {user?.role === "synergy" && (
                        <div className="bg-[#fcfcfd] border border-[#f2f4f7] rounded-lg p-3 shadow-sm shadow-[#f2f4f7]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Synergy Target</span>
                            <span className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-wider">AI Match</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 pr-2 truncate">
                              {synergy.logos && synergy.logos.length > 0 && (
                                <div className="flex -space-x-1.5 shrink-0">
                                  {synergy.logos.map((logo, i) => (
                                    <img key={i} src={logo} alt="Logo" className="w-5 h-5 rounded-full border border-white bg-white object-contain shadow-sm" />
                                  ))}
                                </div>
                              )}
                              <span className="text-sm font-bold text-[#344054] truncate">{synergy.target}</span>
                            </div>
                            <span className="text-lg font-extrabold text-emerald-600 shrink-0">{synergy.match}%</span>
                          </div>
                        </div>
                      )}

                      {/* ROLE: ADMIN (Shows secondary Synergy Info) */}
                      {(user?.role === "admin" || !user) && (
                        <div className="bg-[#fcfcfd] border border-[#f2f4f7] rounded-lg p-2.5 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <p className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider mb-1">Synergy Target</p>
                            <div className="flex items-center gap-1.5">
                              {synergy.logos && synergy.logos.length > 0 && (
                                <div className="flex -space-x-1 shrink-0">
                                  {synergy.logos.map((logo, i) => (
                                    <img key={i} src={logo} alt="Logo" className="w-3.5 h-3.5 rounded-full border border-white bg-white object-cover shadow-sm" />
                                  ))}
                                </div>
                              )}
                              <p className="text-xs font-bold text-[#344054] truncate">{synergy.target}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-wider">AI Match</p>
                            <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{synergy.match}%</p>
                          </div>
                        </div>
                      )}

                      {/* ROLE: FOUNDER (Shows Last Update Reminder instead of internal Synergy targets) */}
                      {user?.role === "founder" && (
                        <div className="flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#64748b]" />
                            <span className="text-xs font-medium text-[#475569]">Laporan Terakhir:</span>
                          </div>
                          <span className="text-xs font-bold text-[#0f172a]">12 Mei 2026</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Card Footer Actions based on Role */}
                  <div className="border-t border-[#f2f4f7] bg-[#fafbfc] px-6 py-3 pl-7 flex items-center justify-between text-xs text-[#8c8f93]">
                    
                    {/* Left Info */}
                    {user?.role === "synergy" ? (
                      <span className="font-medium">Sektor: <strong className="text-[#344054]">{startup.sector}</strong></span>
                    ) : user?.role === "founder" ? (
                      <span className="font-medium">Batch: <strong className="text-[#344054]">{startup.batch}</strong></span>
                    ) : (
                      <span className="font-medium">Founder: <strong className="text-[#344054]">{startup.founderName}</strong></span>
                    )}

                    {/* Right Action Button */}
                    <button 
                      onClick={() => setAnalysisModal(startup)}
                      className="text-[#ED1C24] font-bold hover:underline flex items-center gap-1 group/btn transition-colors cursor-pointer"
                    >
                      {user?.role === "synergy" ? (
                        <span>Potensi Sinergi</span>
                      ) : user?.role === "founder" ? (
                        <span>Update Laporan</span>
                      ) : (
                        <span>AI Risk Analysis</span>
                      )}
                      <span className="text-sm group-hover/btn:translate-x-0.5 transition-transform">›</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )
        )}
        </div>
      </div>

      {/* Analysis Modal */}
      {analysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="border-b border-[#f2f4f7] p-6 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] z-0 opacity-50" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-[#f2f4f7] p-2 flex items-center justify-center shrink-0">
                  <img src={analysisModal.logo} alt={analysisModal.name} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#161616]">
                    {user?.role === "synergy" ? "Analisis Potensi Sinergi" : user?.role === "founder" ? "Update Laporan Kinerja" : "AI Risk Analysis"}
                  </h2>
                  <p className="text-sm font-medium text-[#667085]">{analysisModal.name} — {analysisModal.sector}</p>
                </div>
              </div>
              <button 
                onClick={() => setAnalysisModal(null)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[#667085] hover:bg-slate-200 transition-colors cursor-pointer relative z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {user?.role === "synergy" ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-bold text-emerald-800">Rekomendasi AI Matcher</h4>
                    </div>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Sistem AI mendeteksi potensi sinergi yang tinggi antara {analysisModal.name} dengan ekosistem Telkom Group di sektor {analysisModal.sector}. AI menyarankan integrasi PoC (Proof of Concept) dalam kuartal ini.
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <a href="/synergy" className="btn-primary-solid px-6 py-2.5 text-sm shadow-md hover:shadow-lg transition-all">Buka Pipeline Sinergi</a>
                  </div>
                </div>
              ) : user?.role === "founder" ? (
                <div className="space-y-4 text-center py-6">
                  <FileText className="h-12 w-12 text-[#d0d5dd] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#161616]">Upload Laporan Bulanan</h3>
                  <p className="text-sm text-[#667085] max-w-md mx-auto">AI Synergy Risk Engine akan secara otomatis mengekstrak metrik kunci (Revenue, User, Burn Rate) dari dokumen PDF laporan Anda.</p>
                  <div className="mt-6">
                    <a href="/reports" className="btn-primary-solid px-6 py-2.5 shadow-md hover:shadow-lg transition-all">Buka Modul Reports</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#e0e0e0] p-4 bg-[#f8fafc]">
                      <p className="text-xs font-bold text-[#8c8f93] uppercase tracking-wider mb-1">Health Score</p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-extrabold text-[#161616]">{analysisModal.healthScore}</p>
                        <p className="text-sm font-medium text-emerald-600 mb-1">Stable Trend</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#e0e0e0] p-4 bg-[#f8fafc]">
                      <p className="text-xs font-bold text-[#8c8f93] uppercase tracking-wider mb-1">Risk Profile</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-3 w-3 rounded-full ${analysisModal.riskLabel === "LOW_RISK" ? "bg-emerald-500" : analysisModal.riskLabel === "MEDIUM_RISK" ? "bg-amber-500" : "bg-red-500"}`} />
                        <p className={`text-base font-bold ${analysisModal.riskLabel === "LOW_RISK" ? "text-emerald-700" : analysisModal.riskLabel === "MEDIUM_RISK" ? "text-amber-700" : "text-red-700"}`}>
                          {analysisModal.riskLabel.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-[#ED1C24]" />
                      <h4 className="font-bold text-red-800">Catatan Risiko AI</h4>
                    </div>
                    <p className="text-sm text-red-700 leading-relaxed">
                      AI mendeteksi anomali pada rasio burn-rate 3 bulan terakhir. Terdapat potensi hambatan teknis pada skalabilitas infrastruktur saat beban puncak (peak traffic). Direkomendasikan melakukan intervensi pendampingan teknis.
                    </p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <a href={`/forecast`} className="btn-primary-outline px-6 py-2.5 text-sm border-[#e0e0e0] text-[#344054] hover:border-[#ED1C24] hover:text-[#ED1C24] hover:bg-red-50 transition-all font-semibold">Lihat Forecast Detail</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
