"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import { Search, Filter, Building2, TrendingUp, AlertTriangle, Layers, Sparkles, RefreshCw, GitBranch, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Startup = (typeof startupsData)[number];

const sectorColors: Record<string, string> = {
  Logistik: "bg-blue-500",
  Agritech: "bg-green-500",
  Fintech: "bg-yellow-500",
  Edtech: "bg-purple-500",
  Healthtech: "bg-red-500",
  Energy: "bg-orange-500",
  Travel: "bg-pink-500",
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
  Logistik: "#3b82f6",
  Agritech: "#22c55e",
  Fintech: "#eab308",
  Edtech: "#a855f7",
  Healthtech: "#ef4444",
  Energy: "#f97316",
  Travel: "#ec4899",
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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#161616]">{config.title}</h1>
          <p className="mt-1 text-sm text-[#667085]">{config.subtitle}</p>
        </div>

        {/* Role-specific welcome banner for Founder */}
        {user?.role === "founder" && (
          <div 
            className="mb-8 rounded-xl p-6 text-white border border-white/5 relative overflow-hidden shadow-xl"
            style={{ background: 'radial-gradient(circle at 50% 20%, #1e1136 0%, #0d0a1b 75%, #06040f 100%)' }}
          >
            {/* Glowing accent blobs inside */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-600/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-red-600/5 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-xs font-semibold text-[#ED1C24] uppercase tracking-wider">Mitra Startup</p>
              <p className="text-sm font-medium opacity-80 mt-1">Selamat datang,</p>
              <p className="mt-1 text-2xl font-extrabold text-white tracking-wide">{user.name}</p>
              <p className="mt-2 text-sm text-slate-300">
                Anda memiliki <span className="font-bold text-white">{totalStartups} startup</span> terdaftar di program Indigo.
                {atRisk > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/10">
                    ⚠️ {atRisk} startup membutuhkan perhatian
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Role-specific welcome banner for Synergy */}
        {user?.role === "synergy" && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] p-6 text-white">
            <p className="text-sm font-medium opacity-80">Synergy Manager,</p>
            <p className="mt-1 text-xl font-bold">{user.name}</p>
            <p className="mt-2 text-sm opacity-80">
              Anda mengelola sinergi untuk {totalStartups} startup di sektor{" "}
              {synergySectorMap["demo-synergy-id"]?.join(", ")}.
            </p>
          </div>
        )}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-legion p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">
                {user?.role === "founder" ? "Startup Saya" : "Total Startup"}
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#ED1C24]">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#161616]">{totalStartups}</p>
          </div>

          <div className="card-legion p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">High Growth</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{highGrowth}</p>
          </div>

          <div className="card-legion p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">At Risk</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-red-600">{atRisk}</p>
          </div>

          <div className="card-legion p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">
                {user?.role === "synergy" ? "Sektor Dikelola" : "Batch Aktif"}
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {user?.role === "synergy" ? <GitBranch className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#161616]">
              {user?.role === "synergy"
                ? synergySectorMap["demo-synergy-id"]?.length || 0
                : uniqueBatches.length}
            </p>
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
          </div>
        )}

        {/* Founder gets a quick action section instead of charts */}
        {user?.role === "founder" && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2">
            <a href="/reports" className="card-legion group flex items-center gap-4 p-6 transition-all hover:border-[#ED1C24]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#ED1C24] group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#161616]">Submit Laporan Baru</p>
                <p className="text-xs text-[#667085]">Kirim laporan bulanan untuk evaluasi AI</p>
              </div>
            </a>
            <a href="/forecast" className="card-legion group flex items-center gap-4 p-6 transition-all hover:border-[#ED1C24]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a] group-hover:bg-[#16a34a] group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#161616]">Lihat Forecast</p>
                <p className="text-xs text-[#667085]">Prediksi pertumbuhan 3 bulan ke depan</p>
              </div>
            </a>
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
                      <div>
                        <h3 className="text-base font-extrabold text-[#161616] group-hover:text-[#ED1C24] transition-colors">{startup.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#8c8f93] tracking-wide uppercase">{startup.sector} · {startup.batch}</p>
                      </div>
                      <span className={isHigh ? "badge-high-growth shadow-sm" : "badge-at-risk shadow-sm"}>
                        {isHigh ? "High Growth" : "At Risk"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[#525252] line-clamp-2">{startup.description}</p>

                    {/* AI Engine Metrics Integration (Premium Dashboard Aesthetic) */}
                    <div className="mt-5 pt-4 border-t border-[#f2f4f7] space-y-4">
                      {/* Health Index Bar */}
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

                      {/* AI Synergy Potential Card */}
                      <div className="bg-[#fcfcfd] border border-[#f2f4f7] rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Synergy Target</p>
                          <p className="text-xs font-bold text-[#344054] mt-0.5">{synergy.target}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-wider">AI Match</p>
                          <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{synergy.match}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#f2f4f7] bg-[#fafbfc] px-6 py-3 pl-7 flex items-center justify-between text-xs text-[#8c8f93]">
                    <span className="font-medium">Founder: <strong className="text-[#344054]">{startup.founderName}</strong></span>
                    <button className="text-[#ED1C24] font-bold hover:underline flex items-center gap-1">
                      <span>Analisis</span>
                      <span className="text-sm">›</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
