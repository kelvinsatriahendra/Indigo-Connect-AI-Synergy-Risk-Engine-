"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthScoreCard } from "@/components/health-score-card";
import startupsData from "@/data/startups.json";
import telkomBusData from "@/data/telkom-bus.json";

export default function ReportsPage() {
  const [selectedStartup, setSelectedStartup] = useState<string>("");
  const [narrativeText, setNarrativeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    healthScore: number;
    riskLabel: string;
    sentimentScore: number;
    operationalStatus: string;
    summary?: { point1: string; point2: string; point3: string };
    synergy?: { matches: { buId: string; reason: string; matchScore: number }[] };
  } | null>(null);
  const [error, setError] = useState("");

  const handleEvaluate = async () => {
    if (!selectedStartup || !narrativeText.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const [healthRes, summaryRes, synergyRes] = await Promise.all([
        fetch("/api/ai/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ narrativeText }),
        }),
        fetch("/api/ai/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ narrativeText }),
        }),
        fetch("/api/ai/synergy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ narrativeText }),
        }),
      ]);

      const healthData = healthRes.ok ? await healthRes.json() : null;
      const summaryData = summaryRes.ok ? await summaryRes.json() : null;
      const synergyData = synergyRes.ok ? await synergyRes.json() : null;

      if (!healthData) throw new Error("Gagal evaluasi kesehatan");

      setResult({
        healthScore: healthData.healthScore,
        riskLabel: healthData.riskLabel,
        sentimentScore: healthData.sentimentScore,
        operationalStatus: healthData.operationalStatus,
        summary: summaryData || undefined,
        synergy: synergyData || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const selectedStartupData = startupsData.find((s) => s.id === selectedStartup);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-2xl font-bold">AI Health Evaluation</h1>
          <p className="text-sm text-slate-400">Submit laporan bulanan startup untuk evaluasi otomatis</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Laporan Bulanan Startup</CardTitle>
            <CardDescription className="text-slate-500">
              Pilih startup dan tulis laporan untuk dievaluasi oleh AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Pilih Startup</label>
              <select
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white"
                value={selectedStartup}
                onChange={(e) => setSelectedStartup(e.target.value)}
              >
                <option value="">-- Pilih Startup --</option>
                {startupsData.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.sector} ({s.batch})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Narrative Report</label>
              <textarea
                className="w-full min-h-[200px] rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 resize-y"
                placeholder="Tulis laporan bulanan startup di sini..."
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleEvaluate}
                disabled={!selectedStartup || !narrativeText.trim() || loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {loading ? "Menganalisis..." : "Evaluate with AI ✨"}
              </Button>
              {selectedStartupData && (
                <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                  {selectedStartupData.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-slate-900 border-red-800">
            <CardContent className="p-6">
              <p className="text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <p className="text-slate-400 text-sm">AI sedang menganalisis laporan...</p>
              <p className="text-slate-600 text-xs">Proses: Health Score + Executive Summary + Synergy Match</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <HealthScoreCard
            healthScore={result.healthScore}
            riskLabel={result.riskLabel}
            sentimentScore={result.sentimentScore}
            operationalStatus={result.operationalStatus}
            summaryPoints={
              result.summary
                ? [result.summary.point1, result.summary.point2, result.summary.point3]
                : undefined
            }
            synergyMatches={
              result.synergy?.matches?.map((m) => {
                const bu = telkomBusData.find((b) => b.id === m.buId);
                return {
                  name: bu?.name || m.buId,
                  reason: m.reason,
                  score: m.matchScore,
                };
              }) || undefined
            }
          />
        )}
      </div>
    </div>
  );
}
