"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import startupsData from "@/data/startups.json";

type Startup = (typeof startupsData)[number];

export default function StartupsPage() {
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async (startup: Startup) => {
    setSelectedStartup(startup);
    setLoading(true);
    setAiSummary(null);

    const dummyReport = `Laporan bulanan ${startup.name} - ${startup.batch}

Startup ${startup.name} bergerak di bidang ${startup.sector}. 
${startup.description}

Tim telah menambah 2 anggota baru di bulan ini. 
Pendapatan bulan ini tumbuh 15% dibanding bulan lalu. 
Jumlah pengguna aktif meningkat 500 pengguna baru.
Target Q3 tercapai 80%. 
Kendala utama: proses onboarding customer masih manual. 
Rencana bulan depan: integrasi dengan payment gateway.`;

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrativeText: dummyReport }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(`1. ${data.point1}\n\n2. ${data.point2}\n\n3. ${data.point3}`);
      } else {
        setAiSummary("AI Summary tidak tersedia saat ini. Mock data:\n1. Pendapatan meningkat 15%\n2. Pengguna aktif bertambah 500\n3. Target Q3 tercapai 80%");
      }
    } catch {
      setAiSummary("AI Summary tidak tersedia saat ini. Mock data:\n1. Pendapatan meningkat 15%\n2. Pengguna aktif bertambah 500\n3. Target Q3 tercapai 80%");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Startup</h1>
              <p className="text-sm text-slate-400">
                Daftar startup binaan Indigo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold">Daftar Startup</h2>
            <div className="space-y-2">
              {startupsData.map((startup) => (
                <button
                  key={startup.id}
                  onClick={() => handleAIAnalysis(startup)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedStartup?.id === startup.id
                      ? "bg-slate-800 border-cyan-500/50"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{startup.name}</span>
                    <Badge
                      variant={startup.status === "ACTIVE" ? "default" : "destructive"}
                      className={
                        startup.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {startup.status === "ACTIVE" ? "Aktif" : "At Risk"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {startup.sector} · {startup.batch}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedStartup ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl">
                        {selectedStartup.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500 mt-1">
                        {selectedStartup.sector} · {selectedStartup.batch}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        selectedStartup.status === "ACTIVE"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        selectedStartup.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1"
                          : "bg-red-500/10 text-red-400 border-red-500/20 text-sm px-3 py-1"
                      }
                    >
                      {selectedStartup.status === "ACTIVE"
                        ? "High Growth"
                        : "At Risk"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">
                      Deskripsi
                    </h3>
                    <p className="text-slate-300">
                      {selectedStartup.description}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Founder: {selectedStartup.founderName}
                    </p>
                  </div>

                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-400">
                        AI Executive Summary
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIAnalysis(selectedStartup)}
                        disabled={loading}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        {loading ? "Menganalisis..." : "Generate AI Summary"}
                      </Button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                      </div>
                    ) : aiSummary ? (
                      <div className="space-y-3 rounded-lg bg-slate-800/50 p-4">
                        {aiSummary.split("\n\n").map((point, i) => (
                          <p key={i} className="text-sm text-slate-300 leading-relaxed">
                            {point}
                          </p>
                        ))}
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                          Dihasilkan oleh AI · Gemini 1.5 Flash via OpenRouter
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-8">
                        Klik &quot;Generate AI Summary&quot; untuk melihat ringkasan
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="text-center">
                  <p className="text-slate-500">Pilih startup untuk melihat detail</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Klik salah satu startup di samping
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
