"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HealthScoreCard } from "@/components/health-score-card";
import startupsData from "@/data/startups.json";
import telkomBusData from "@/data/telkom-bus.json";
import { FileText, Send, RefreshCw, Download, Upload, History, ChevronRight } from "lucide-react";
import { exportToPdf } from "@/lib/pdf-export";

type Startup = (typeof startupsData)[number];
type UserInfo = { name: string; email: string; role: string; userId?: string };

// Mock Maps
const founderStartupMap: Record<string, string[]> = {
  "demo-founder-id": ["s3", "s8"], // Founder mengelola FinAccess & PayDesa
};
const synergySectorMap: Record<string, string[]> = {
  "demo-synergy-id": ["Fintech", "Logistik", "Agritech"],
};

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([]);
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

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          let roleStartups = startupsData;
          if (data.user.role === "founder" && data.user.userId) {
            const myIds = founderStartupMap[data.user.userId] || ["s3", "s8"]; 
            roleStartups = startupsData.filter((s) => myIds.includes(s.id));
          } else if (data.user.role === "synergy" && data.user.userId) {
            const mySectors = synergySectorMap[data.user.userId] || [];
            roleStartups = startupsData.filter((s) => mySectors.includes(s.sector));
          }
          setAvailableStartups(roleStartups);
          
          // Auto-select if founder and only 1 startup managed
          if (data.user.role === "founder" && roleStartups.length === 1) {
            setSelectedStartup(roleStartups[0].id);
          }
        }
      })
      .catch(() => {
        setAvailableStartups(startupsData);
      });
  }, []);

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

  // Dummy history data
  const reportHistory = [
    { month: "April 2026", date: "12 Apr 2026", healthScore: 88, status: "Excellent" },
    { month: "Maret 2026", date: "15 Mar 2026", healthScore: 85, status: "Good" },
    { month: "Februari 2026", date: "10 Feb 2026", healthScore: 78, status: "Stable" },
  ];

  if (!mounted) return null;

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

        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Form Input */}
            <div className="flex-1 min-w-0">
              <div className="card-legion p-6 lg:p-8">
                <h2 className="text-lg font-bold text-[#161616]">Form Laporan Bulanan</h2>
                <p className="mt-1 text-sm text-[#667085]">Unggah dokumen PDF atau tulis narasi laporan untuk dievaluasi oleh AI</p>

                <div className="mt-8 space-y-6">
                  
                  {/* Dropdown - conditionally hidden for Founders with 1 startup */}
                  {(!user || user.role !== "founder" || availableStartups.length > 1) ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#344054]">Pilih Startup</label>
                      <select
                        className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
                        value={selectedStartup}
                        onChange={(e) => setSelectedStartup(e.target.value)}
                      >
                        <option value="">-- Pilih Startup --</option>
                        {availableStartups.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.sector} ({s.batch})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Show static selected startup info to let them know who they are submitting for */
                    selectedStartupData && (
                      <div className="mb-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-4 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Startup Terpilih</p>
                            <p className="text-base font-bold text-[#0f172a]">{selectedStartupData.name}</p>
                         </div>
                         <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                           ✓ Terverifikasi
                         </span>
                      </div>
                    )
                  )}

                  <div className="pt-2 border-t border-[#f2f4f7]">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-sm font-bold text-[#344054]">Narrative Report</label>
                      <span className="text-xs font-medium text-[#667085]">Upload PDF / Ketik Manual</span>
                    </div>
                    
                    {/* Drag and Drop Zone */}
                    <div 
                      className={`mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
                        isDragging ? 'border-[#ED1C24] bg-[#FEF2F2]' : 'border-[#e0e0e0] bg-[#f8fafc] hover:bg-[#f1f5f9]'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
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
                          <RefreshCw className="mb-3 h-8 w-8 animate-spin text-[#ED1C24]" />
                          <p className="text-sm font-bold text-[#344054]">Mengekstrak teks PDF...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 rounded-full bg-white shadow-sm ring-1 ring-black/5 p-3">
                            <Upload className="h-6 w-6 text-[#ED1C24]" />
                          </div>
                          <p className="text-sm font-bold text-[#344054]">Klik atau Drop PDF di sini</p>
                          <p className="mt-1.5 text-xs font-medium text-[#8c8f93]">Maksimal 10MB (Sistem akan mengekstrak teks otomatis)</p>
                        </div>
                      )}
                    </div>

                    <textarea
                      className="w-full min-h-[220px] rounded-xl border border-[#e0e0e0] bg-white px-5 py-4 text-sm text-[#344054] placeholder:text-[#a1a1aa] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] resize-y leading-relaxed"
                      placeholder="Atau ketik/paste narasi laporan bulanan di sini secara langsung..."
                      value={narrativeText}
                      onChange={(e) => setNarrativeText(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleEvaluate}
                      disabled={!selectedStartup || !narrativeText.trim() || loading}
                      className="btn-primary-solid gap-2 px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                    >
                      {loading ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Sedang Menganalisis...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Evaluate with AI</>
                      )}
                    </button>
                    {selectedStartupData && (
                      <span className="text-xs font-medium text-[#8c8f93]">
                        Mengevaluasi <strong className="text-[#344054]">{selectedStartupData.name}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="card-legion mt-6 border-red-200 bg-red-50 p-6 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {loading && (
                <div className="card-legion mt-6 flex flex-col items-center justify-center py-16">
                  <div className="mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[#ED1C24] border-t-transparent" />
                  <p className="text-base font-bold text-[#161616]">AI sedang memproses laporan...</p>
                  <p className="mt-2 text-sm text-[#667085] text-center max-w-sm">Mengekstrak konteks finansial, menganalisis profil risiko, dan mencari potensi sinergi dengan Telkom Group.</p>
                </div>
              )}
            </div>

            {/* Right Column: AI Result or History */}
            <div className="w-full lg:w-[480px] shrink-0">
               {result ? (
                 <div className="sticky top-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#161616]">Hasil Evaluasi AI</h3>
                      <button onClick={handleDownloadPdf} className="btn-primary-outline gap-2 px-4 py-2 text-xs">
                        <Download className="h-4 w-4" /> Download PDF
                      </button>
                    </div>
                    <div ref={reportRef} className="shadow-lg shadow-black/5 rounded-2xl">
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
               ) : (
                 <div className="card-legion sticky top-6 p-6 lg:p-8">
                   <div className="mb-6 flex items-center gap-3">
                     <div className="bg-[#fef2f2] p-2.5 rounded-xl">
                       <History className="h-5 w-5 text-[#ED1C24]" />
                     </div>
                     <div>
                       <h3 className="text-base font-bold text-[#161616]">Riwayat Laporan</h3>
                       <p className="text-xs text-[#8c8f93] mt-0.5">Histori evaluasi bulanan AI</p>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     {reportHistory.map((hist, i) => (
                       <div key={i} className="group cursor-pointer rounded-xl border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#ED1C24] hover:shadow-md">
                         <div className="flex items-center justify-between mb-3">
                           <div>
                             <p className="text-sm font-extrabold text-[#161616] group-hover:text-[#ED1C24] transition-colors">{hist.month}</p>
                             <p className="text-xs font-medium text-[#8c8f93] mt-1">Dikirim: {hist.date}</p>
                           </div>
                           <div className="h-8 w-8 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:bg-[#fef2f2] transition-colors">
                             <ChevronRight className="h-4 w-4 text-[#d0d5dd] group-hover:text-[#ED1C24] transition-transform group-hover:translate-x-0.5" />
                           </div>
                         </div>
                         <div className="flex items-center justify-between border-t border-[#f2f4f7] pt-3 mt-3">
                           <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">AI Health Score</span>
                           <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-extrabold shadow-sm ${hist.healthScore >= 80 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'}`}>
                             {hist.healthScore}% · {hist.status}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <button className="mt-6 w-full rounded-xl border border-[#e0e0e0] py-3 text-sm font-bold text-[#344054] hover:bg-[#f8fafc] hover:text-[#161616] transition-all active:scale-[0.98]">
                     Lihat Semua Riwayat
                   </button>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
