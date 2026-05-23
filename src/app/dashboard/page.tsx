"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import { Search, Filter, Building2, TrendingUp, AlertTriangle, Layers } from "lucide-react";

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

export default function DashboardPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [filters, setFilters] = useState({ sector: "all", batch: "all", risk: "all" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    setStartups(startupsData);
    setFilteredStartups(startupsData);
  }, []);

  useEffect(() => {
    let result = [...startups];
    if (filters.sector !== "all") result = result.filter((s) => s.sector === filters.sector);
    if (filters.batch !== "all") result = result.filter((s) => s.batch === filters.batch);
    if (filters.risk !== "all") result = result.filter((s) => s.status === filters.risk);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
    }
    setFilteredStartups(result);
  }, [startups, filters, search]);

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

  return (
    <AppShell>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#161616]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#667085]">Executive overview of startup portfolio</p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-legion p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">Total Startup</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f2fc] text-[#875bf7]">
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
              <p className="text-sm font-medium text-[#667085]">Batch Aktif</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#161616]">{uniqueBatches.length}</p>
          </div>
        </div>

        {/* Charts Row */}
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
                      style={{
                        width: `${totalStartups > 0 ? (item.count / totalStartups) * 100 : 0}%`,
                      }}
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
                    <div
                      className={`h-2.5 rounded-full ${sectorColors[sector] || "bg-slate-500"} transition-all`}
                      style={{
                        width: `${totalStartups > 0 ? (count / totalStartups) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-[#667085]" />
          <select
            className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
          >
            <option value="all">Semua Sektor</option>
            {uniqueSectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="all">Semua Batch</option>
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
            value={filters.risk}
            onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
          >
            <option value="all">Semua Status</option>
            <option value="ACTIVE">High Growth</option>
            <option value="AT_RISK">At Risk</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2 pl-10 pr-3 text-sm text-[#344054] placeholder:text-[#8c8f93] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
              placeholder="Cari startup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Startup Cards */}
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
