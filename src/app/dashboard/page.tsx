"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import startupsData from "@/data/startups.json";

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

    if (filters.sector !== "all") {
      result = result.filter((s) => s.sector === filters.sector);
    }
    if (filters.batch !== "all") {
      result = result.filter((s) => s.batch === filters.batch);
    }
    if (filters.risk !== "all") {
      result = result.filter((s) => s.status === filters.risk);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Indigo Connect</h1>
              <p className="text-sm text-slate-400">Executive Analytics Dashboard</p>
            </div>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Startup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{filteredStartups.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">High Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-400">
                {filteredStartups.filter((s) => s.status === "ACTIVE").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">
                {filteredStartups.filter((s) => s.status === "AT_RISK").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Batch Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{uniqueBatches.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Health Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthDistribution.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all`}
                        style={{
                          width: `${
                            filteredStartups.length > 0
                              ? (item.count / filteredStartups.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Sektor Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(sectorDistribution).map(([sector, count]) => (
                  <div key={sector} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            sectorColors[sector] || "bg-slate-500"
                          }`}
                        />
                        <span className="text-slate-300">{sector}</span>
                      </div>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className={`h-2 rounded-full ${
                          sectorColors[sector] || "bg-slate-500"
                        } transition-all`}
                        style={{
                          width: `${
                            filteredStartups.length > 0
                              ? (count / filteredStartups.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
          >
            <option value="all">Semua Sektor</option>
            {uniqueSectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="all">Semua Batch</option>
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
            value={filters.risk}
            onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
          >
            <option value="all">Semua Status</option>
            <option value="ACTIVE">High Growth</option>
            <option value="AT_RISK">At Risk</option>
          </select>

          <input
            className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 min-w-[200px]"
            placeholder="Cari startup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStartups.map((startup) => (
            <Card
              key={startup.id}
              className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{startup.name}</CardTitle>
                    <CardDescription className="text-slate-500 mt-1">
                      {startup.sector} · {startup.batch}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      startup.status === "ACTIVE" ? "default" : "destructive"
                    }
                    className={
                      startup.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                  >
                    {startup.status === "ACTIVE" ? "High Growth" : "At Risk"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{startup.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Founder: {startup.founderName}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
