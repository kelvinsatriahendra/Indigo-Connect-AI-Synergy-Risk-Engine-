"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HealthScoreCard } from "@/components/health-score-card";
import startupsData from "@/data/startups.json";
import telkomBusData from "@/data/telkom-bus.json";
import { FileText, Send, RefreshCw, Download, Upload } from "lucide-react";
import { exportToPdf } from "@/lib/pdf-export";

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStartup, setSelectedStartup] = useState<string>("");
  const [narrativeText, setNarrativeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{
    healthScore: number;
    riskLabel: string;
    sentimentScore: number;
    operationalStatus: string;
    summary?: { point1: string; point2: string; point3: string };
    synergy?: { matches: { buId: string; reason: string; matchScore: number }[] };
  } | null>(null);
  const [error, setError] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        await parsePdf(file);
      } else {
        setError("Harap unggah file dengan format PDF.");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        await parsePdf(file);
      } else {
        setError("Harap unggah file dengan format PDF.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const parsePdf = async (file: File) => {
    setIsParsingPdf(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal membaca PDF");
      }
      
      if (data.text) {
        setNarrativeText(data.text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat membaca PDF");
    } finally {
      setIsParsingPdf(false);
    }
  };

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

      if (!healthData) {
        const errorBody = await healthRes.json().catch(() => ({}));
        throw new Error(errorBody.error || "Gagal evaluasi kesehatan");
      }

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

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    const startup = startupsData.find((s) => s.id === selectedStartup);
    await exportToPdf(reportRef.current, `Indigo-Connect-Evaluation-${startup?.name || "Startup"}.pdf`);
  };

  const selectedStartupData = startupsData.find((s) => s.id === selectedStartup);

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#ED1C24]" />
            <h1 className="text-2xl font-bold text-[#161616]">AI Health Evaluation</h1>
          </div>
          <p className="mt-1 text-sm text-[#667085]">Submit laporan bulanan startup untuk evaluasi otomatis oleh AI</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="card-legion p-8">
            <h2 className="text-lg font-bold text-[#161616]">Laporan Bulanan Startup</h2>
            <p className="mt-1 text-sm text-[#667085]">Pilih startup dan tulis laporan untuk dievaluasi oleh AI</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#344054]">Pilih Startup</label>
                <select
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#344054]">Narrative Report</label>
                  <span className="text-xs text-[#667085]">Upload PDF atau ketik manual</span>
                </div>
                
                {/* Drag and Drop Zone */}
                <div 
                  className={`mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                    isDragging ? 'border-[#ED1C24] bg-red-50' : 'border-[#e0e0e0] bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  {isParsingPdf ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="mb-2 h-6 w-6 animate-spin text-[#ED1C24]" />
                      <p className="text-sm font-medium text-[#344054]">Membaca dokumen PDF...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="mb-2 rounded-full bg-red-100 p-2">
                        <Upload className="h-5 w-5 text-[#ED1C24]" />
                      </div>
                      <p className="text-sm font-medium text-[#344054]">Klik untuk upload PDF</p>
                      <p className="mt-1 text-xs text-[#667085]">Atau drag and drop file di sini</p>
                    </div>
                  )}
                </div>

                <textarea
                  className="w-full min-h-[200px] rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#344054] placeholder:text-[#8c8f93] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] resize-y"
                  placeholder="Tulis laporan bulanan startup di sini, atau teks hasil ekstraksi PDF akan muncul di sini untuk Anda review..."
                  value={narrativeText}
                  onChange={(e) => setNarrativeText(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleEvaluate}
                  disabled={!selectedStartup || !narrativeText.trim() || loading}
                  className="btn-primary-solid gap-2 px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Menganalisis...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Evaluate with AI</>
                  )}
                </button>
                {selectedStartupData && (
                  <span className="inline-flex items-center rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-medium text-[#ED1C24]">
                    {selectedStartupData.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="card-legion mt-6 border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="card-legion mt-6 flex flex-col items-center justify-center py-16">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
              <p className="text-sm font-medium text-[#344054]">AI sedang menganalisis laporan...</p>
              <p className="mt-1 text-xs text-[#8c8f93]">Proses: Health Score + Executive Summary + Synergy Match</p>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-end">
                <button onClick={handleDownloadPdf} className="btn-primary-outline gap-2 px-4 py-2 text-sm">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
              <div ref={reportRef}>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
