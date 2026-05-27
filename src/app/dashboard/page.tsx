"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Search, Filter, Building2, TrendingUp, AlertTriangle, Layers, Sparkles, RefreshCw, GitBranch, FileText } from "lucide-react";

type Startup = {
  id: string;
  name: string;
  founderName: string;
  sector: string;
  batch: string;
  description: string;
  status: string;
};

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

export default function DashboardPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [filters, setFilters] = useState({ sector: "all", batch: "all", risk: "all" });
  const [search, setSearch] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => res.ok ? res.json() : null),
      fetch("/api/startups").then(res => res.ok ? res.json() : [])
    ]).then(([userData, startupsData]) => {
      if (userData?.user) {
        setUser(userData.user);
        let roleStartups = startupsData;
        if (userData.user.role === "founder") {
          const myIds = founderStartupMap[userData.user.userId] || [];
          roleStartups = startupsData.filter((s: Startup) => myIds.includes(s.id));
        } else if (userData.user.role === "synergy") {
          const mySectors = synergySectorMap[userData.user.userId] || [];
          roleStartups = startupsData.filter((s: Startup) => mySectors.includes(s.sector));
        }
        setStartups(roleStartups);
        setFilteredStartups(roleStartups);
      } else {
        setStartups(startupsData);
        setFilteredStartups(startupsData);
      }
    }).catch(() => {
      setStartups([]);
      setFilteredStartups([]);
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
          <div className="mb-8 rounded-xl bg-gradient-to-r from-[#ED1C24] to-[#B91C1C] p-6 text-white">
            <p className="text-sm font-medium opacity-80">Selamat datang,</p>
            <p className="mt-1 text-xl font-bold">{user.name}</p>
            <p className="mt-2 text-sm opacity-80">
              Anda memiliki {totalStartups} startup terdaftar di program Indigo.
              {atRisk > 0 && ` ⚠️ ${atRisk} startup membutuhkan perhatian.`}
            </p>
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
        {user?.role !== "founder" && (
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="card-legion p-6">
              <h3 className="text-base font-bold text-[#161616]">Health Score Distribution</h3>
              <div className="mt-6 space-y-5">
                {healthDistribution.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#344054]">{item.label}</span>
                      <span className="text-[#667085]">{item.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#f2f4f7]">
                      <div
                        className={`h-2.5 rounded-full ${item.color} transition-all`}
                        style={{ width: `${totalStartups > 0 ? (item.count / totalStartups) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-legion p-6">
              <h3 className="text-base font-bold text-[#161616]">Sektor Distribution</h3>
              <div className="mt-6 space-y-5">
                {Object.entries(sectorDistribution).map(([sector, count]) => (
                  <div key={sector}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${sectorColors[sector] || "bg-slate-500"}`} />
                        <span className="font-medium text-[#344054]">{sector}</span>
                      </div>
                      <span className="text-[#667085]">{count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#f2f4f7]">
                      <div className={`h-2.5 rounded-full ${sectorColors[sector] || "bg-slate-500"} transition-all`}
                        style={{ width: `${totalStartups > 0 ? (count / totalStartups) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStartups.map((startup) => (
              <div key={startup.id} className="card-legion overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#161616]">{startup.name}</h3>
                      <p className="mt-0.5 text-xs text-[#667085]">{startup.sector} · {startup.batch}</p>
                    </div>
                    <span className={startup.status === "ACTIVE" ? "badge-high-growth" : "badge-at-risk"}>
                      {startup.status === "ACTIVE" ? "High Growth" : "At Risk"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#525252]">{startup.description}</p>
                </div>
                <div className="border-t border-[#f2f4f7] px-6 py-3">
                  <div className="flex items-center justify-between text-xs text-[#8c8f93]">
                    <span>Founder: {startup.founderName}</span>
                    <span>{startup.batch}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
