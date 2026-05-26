"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import { Search, Filter, Building2, TrendingUp, AlertTriangle, Layers, Sparkles, RefreshCw, GitBranch, FileText, Gift, Cloud, TerminalSquare, Download, CheckCircle2 } from "lucide-react";
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
  "demo-founder-id": ["s3", "s8"], // Yusuf Pratama owns FinAccess & PayDesa
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
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50/50 print:h-auto print:overflow-visible" ref={dashboardRef}>
        {/* Fixed Header Bar */}
        <div className="border-b bg-white px-8 py-5 shadow-sm relative z-10 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#161616]">{config.title}</h1>
              <p className="mt-1 text-sm text-[#667085]">{config.subtitle}</p>
            </div>
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
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8 print:p-0 print:overflow-visible">

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Startup */}
          <div 
            className="rounded-xl border border-white/5 p-6 relative overflow-hidden shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #2a0b18 0%, #0a0712 50%, #22081d 100%)' }}
          >
            {/* SVG Vectors to match user image */}
            <svg className="absolute left-0 bottom-0 h-full w-auto pointer-events-none opacity-20 text-red-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M-20,120 C40,100 60,30 20,-20" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M-10,130 C50,110 70,40 30,-10" strokeWidth="0.8" />
            </svg>
            <svg className="absolute right-0 top-0 h-full w-auto pointer-events-none opacity-20 text-purple-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M120,-20 C60,0 40,70 80,120" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M110,-30 C50,-10 30,60 70,110" strokeWidth="0.8" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">
                  {user?.role === "founder" ? "Startup Saya" : "Total Startup"}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#ED1C24] shadow-sm">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white tracking-wide">{totalStartups}</p>
            </div>
          </div>

          {/* Card 2: High Growth */}
          <div 
            className="rounded-xl border border-white/5 p-6 relative overflow-hidden shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #2a0b18 0%, #0a0712 50%, #22081d 100%)' }}
          >
            {/* SVG Vectors to match user image */}
            <svg className="absolute left-0 bottom-0 h-full w-auto pointer-events-none opacity-20 text-red-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M-20,120 C40,100 60,30 20,-20" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M-10,130 C50,110 70,40 30,-10" strokeWidth="0.8" />
            </svg>
            <svg className="absolute right-0 top-0 h-full w-auto pointer-events-none opacity-20 text-purple-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M120,-20 C60,0 40,70 80,120" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M110,-30 C50,-10 30,60 70,110" strokeWidth="0.8" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">High Growth</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-wide">{highGrowth}</p>
            </div>
          </div>

          {/* Card 3: At Risk */}
          <div 
            className="rounded-xl border border-white/5 p-6 relative overflow-hidden shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #2a0b18 0%, #0a0712 50%, #22081d 100%)' }}
          >
            {/* SVG Vectors to match user image */}
            <svg className="absolute left-0 bottom-0 h-full w-auto pointer-events-none opacity-20 text-red-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M-20,120 C40,100 60,30 20,-20" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M-10,130 C50,110 70,40 30,-10" strokeWidth="0.8" />
            </svg>
            <svg className="absolute right-0 top-0 h-full w-auto pointer-events-none opacity-20 text-purple-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M120,-20 C60,0 40,70 80,120" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M110,-30 C50,-10 30,60 70,110" strokeWidth="0.8" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">At Risk</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-sm animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-rose-400 tracking-wide">{atRisk}</p>
            </div>
          </div>

          {/* Card 4: Sektor Dikelola / Batch Aktif */}
          <div 
            className="rounded-xl border border-white/5 p-6 relative overflow-hidden shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #2a0b18 0%, #0a0712 50%, #22081d 100%)' }}
          >
            {/* SVG Vectors to match user image */}
            <svg className="absolute left-0 bottom-0 h-full w-auto pointer-events-none opacity-20 text-red-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M-20,120 C40,100 60,30 20,-20" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M-10,130 C50,110 70,40 30,-10" strokeWidth="0.8" />
            </svg>
            <svg className="absolute right-0 top-0 h-full w-auto pointer-events-none opacity-20 text-purple-300/40" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M120,-20 C60,0 40,70 80,120" strokeWidth="1.2" strokeDasharray="3 3" />
              <path d="M110,-30 C50,-10 30,60 70,110" strokeWidth="0.8" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">
                  {user?.role === "synergy" ? "Sektor Dikelola" : "Batch Aktif"}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-sm">
                  {user?.role === "synergy" ? <GitBranch className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white tracking-wide">
                {user?.role === "synergy"
                  ? synergySectorMap["demo-synergy-id"]?.length || 0
                  : uniqueBatches.length}
              </p>
            </div>
          </div>
        </div>

        {/* Charts section - only for admin and synergy */}
        {user?.role !== "founder" && mounted && (
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Health Score Distribution - Sleek Progress Cards */}
            <div className="card-legion p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#161616] tracking-wide mb-1">Health Score Distribution</h3>
                <p className="text-xs text-[#8c8f93]">Perbandingan status performa portofolio startup</p>
              </div>
              <div className="mt-6 space-y-6">
                {healthDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#344054]">{item.label}</span>
                      <span className="font-bold text-[#161616]">{item.count} <span className="text-xs text-[#8c8f93] font-normal">({totalStartups > 0 ? Math.round((item.count / totalStartups) * 100) : 0}%)</span></span>
                    </div>
                    <div className="h-3 rounded-full bg-[#f2f4f7] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${totalStartups > 0 ? (item.count / totalStartups) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sektor Distribution - Recharts Premium Donut Chart */}
            <div className="card-legion p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#161616] tracking-wide mb-1">Sector Distribution</h3>
                <p className="text-xs text-[#8c8f93]">Proporsi startup berdasarkan sektor industri</p>
              </div>
              <div className="mt-4 h-[240px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={sectorColorMap[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
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
              <div className="lg:col-span-2 card-legion p-6 flex flex-col justify-between mt-2">
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-[#161616] tracking-wide mb-1">Executive Risk Matrix</h3>
                  <p className="text-xs text-[#8c8f93]">Pemetaan portfolio berdasarkan Potensi Sinergi vs Tingkat Risiko AI</p>
                </div>
                <div className="mt-2 h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="synergy" name="Potensi Sinergi" unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} label={{ value: 'Potensi Sinergi (%)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                      <YAxis type="number" dataKey="risk" name="Tingkat Risiko" unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} label={{ value: 'Tingkat Risiko AI (%)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                      <ZAxis type="number" dataKey="z" range={[100, 500]} name="Valuasi" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Scatter name="Startups" data={[
                        { name: 'Logee', synergy: 85, risk: 20, z: 300, fill: '#10b981' },
                        { name: 'FinAccess', synergy: 90, risk: 30, z: 400, fill: '#10b981' },
                        { name: 'T-Con', synergy: 70, risk: 40, z: 250, fill: '#f59e0b' },
                        { name: 'HealthSync', synergy: 65, risk: 75, z: 200, fill: '#ef4444' },
                        { name: 'PayDesa', synergy: 45, risk: 85, z: 150, fill: '#ef4444' },
                      ]} fill="#8884d8">
                        {
                          [
                            { name: 'Logee', synergy: 85, risk: 20, z: 300, fill: '#10b981' },
                            { name: 'FinAccess', synergy: 90, risk: 30, z: 400, fill: '#10b981' },
                            { name: 'T-Con', synergy: 70, risk: 40, z: 250, fill: '#f59e0b' },
                            { name: 'HealthSync', synergy: 65, risk: 75, z: 200, fill: '#ef4444' },
                            { name: 'PayDesa', synergy: 45, risk: 85, z: 150, fill: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
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

        {/* Founder gets a quick action section instead of charts */}
        {user?.role === "founder" && mounted && (
          <div className="mb-8 space-y-6">
            {/* Quick Actions */}
            <div className="grid gap-5 sm:grid-cols-2">
              <a href="/reports" className="card-legion group flex items-center gap-4 p-6 transition-all hover:border-[#ED1C24] hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#ED1C24] group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#161616]">Submit Laporan Baru</p>
                  <p className="text-xs text-[#667085]">Kirim laporan bulanan untuk evaluasi AI</p>
                </div>
              </a>
              <a href="/forecast" className="card-legion group flex items-center gap-4 p-6 transition-all hover:border-[#16a34a] hover:shadow-lg hover:shadow-green-500/10">
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
              <div className="card-legion p-6 flex flex-col justify-between">
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
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 600 }} />
                      <Bar dataKey="you" name="Startup Anda" fill="#ED1C24" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="avg" name="Rata-rata Indigo" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resource Hub & Perks */}
              <div className="card-legion p-6 flex flex-col">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-base font-extrabold text-[#161616] tracking-wide">Resource Hub & Perks</h3>
                  </div>
                  <p className="text-xs text-[#8c8f93]">Klaim benefit eksklusif jaringan Telkom Group</p>
                </div>
                <div className="mt-5 space-y-3 flex-1">
                  
                  <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Cloud className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#161616]">AWS Activate Credits</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Hingga $100k credit untuk startup aktif</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200 transition-colors cursor-pointer">
                      Claim
                    </button>
                  </div>

                  <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <TerminalSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#161616]">Telkom API Sandbox</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Akses gratis API Telkomsel & IndiHome</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition-colors cursor-pointer">
                      Connect
                    </button>
                  </div>

                  <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#161616]">Legal & Compliance Vault</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ruang dokumen aman untuk due diligence</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-300 transition-colors cursor-pointer">
                      Open
                    </button>
                  </div>

                </div>
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

        {filteredStartups.length === 0 ? (
          <div className="card-legion flex flex-col items-center justify-center py-16">
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
              const synergyMap: Record<string, { target: string; match: number }> = {
                "Fintech": { target: "LinkAja / PADI UMKM", match: 94 },
                "Logistik": { target: "Logee / Pos Indo", match: 88 },
                "Agritech": { target: "Sayurbox / T-Con", match: 91 },
                "Healthtech": { target: "Adamedika / Telkomsel", match: 79 },
                "Edtech": { target: "Pijar Mahir", match: 86 },
                "Energy": { target: "Telkom Infra", match: 82 },
                "Travel": { target: "Mitra Tours", match: 85 },
              };
              const synergy = synergyMap[startup.sector] || { target: "Telkom Group", match: 85 };

              return (
                <div 
                  key={startup.id} 
                  className="card-legion overflow-hidden relative group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
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
                            <span className="text-sm font-bold text-[#344054] truncate pr-2">{synergy.target}</span>
                            <span className="text-lg font-extrabold text-emerald-600">{synergy.match}%</span>
                          </div>
                        </div>
                      )}

                      {/* ROLE: ADMIN (Shows secondary Synergy Info) */}
                      {(user?.role === "admin" || !user) && (
                        <div className="bg-[#fcfcfd] border border-[#f2f4f7] rounded-lg p-2.5 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <p className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Synergy Target</p>
                            <p className="text-xs font-bold text-[#344054] mt-0.5 truncate">{synergy.target}</p>
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
                    <button className="text-[#ED1C24] font-bold hover:underline flex items-center gap-1 group/btn transition-colors">
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
        )}
        </div>
      </div>
    </AppShell>
  );
}
