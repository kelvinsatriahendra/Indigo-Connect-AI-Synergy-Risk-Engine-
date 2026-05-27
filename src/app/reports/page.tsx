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
  "demo-founder-id": ["s3"], // Founder mengelola FinAccess (strictly 1 startup under Indigo rules)
};
const synergySectorMap: Record<string, string[]> = {
  "demo-synergy-id": ["Fintech", "Logistik", "Agritech"],
};

// High-fidelity incoming reports submitted by founders for Executive review
const mockSubmittedReports = [
  {
    id: "r1",
    startupId: "s1",
    startupName: "Logee",
    sector: "Logistik",
    batch: "Batch 6",
    month: "Mei 2026",
    submittedDate: "24 Mei 2026",
    narrativeText: "Logee mencatat pertumbuhan volume pengiriman sebesar 15% month-on-month. Kami berhasil mengintegrasikan 50 UKM baru ke dalam rantai pasok. Namun, biaya operasional bahan bakar armada meningkat sebesar 8% karena inflasi global. Kami sedang melakukan efisiensi rute menggunakan AI untuk mengurangi konsumsi bahan bakar. Runway saat ini aman di kisaran 18 bulan.",
    evaluation: {
      healthScore: 88,
      riskLabel: "LOW_RISK",
      sentimentScore: 0.72,
      operationalStatus: "ACTIVE",
      summary: {
        point1: "Pertumbuhan volume pengiriman sebesar 15% MoM menunjukkan traksi pasar yang kuat.",
        point2: "Kenaikan biaya bahan bakar 8% diantisipasi dengan optimalisasi rute rute berbasis AI.",
        point3: "Runway keuangan aman selama 18 bulan ke depan, likuiditas dalam kondisi sehat."
      },
      synergy: {
        matches: [
          { buId: "bu2", reason: "Sinergi logistik armada dengan Logee untuk efisiensi distribusi produk Telkomsel.", matchScore: 92 }
        ]
      }
    }
  },
  {
    id: "r2",
    startupId: "s3",
    startupName: "FinAccess",
    sector: "Fintech",
    batch: "Batch 5",
    month: "Mei 2026",
    submittedDate: "22 Mei 2026",
    narrativeText: "FinAccess menunjukkan pertumbuhan penyaluran pembiayaan yang stabil. Kami merilis fitur credit scoring baru yang mempercepat approval pinjaman mikro menjadi 5 menit. NPL (Non-Performing Loan) terjaga di angka 1.8%. Kami mencari integrasi dengan ekosistem pembayaran Telkom (seperti LinkAja) untuk memperluas jangkauan merchant.",
    evaluation: {
      healthScore: 94,
      riskLabel: "LOW_RISK",
      sentimentScore: 0.85,
      operationalStatus: "ACTIVE",
      summary: {
        point1: "Penyaluran pembiayaan tumbuh stabil dengan peluncuran credit scoring instan 5 menit.",
        point2: "NPL terjaga sangat baik di angka 1.8%, jauh di bawah batas rata-rata industri.",
        point3: "Rencana integrasi dengan LinkAja berpotensi melipatgandakan akuisisi merchant mikro."
      },
      synergy: {
        matches: [
          { buId: "bu1", reason: "Integrasi LinkAja / PADI UMKM untuk penyaluran modal produktif merchant.", matchScore: 95 }
        ]
      }
    }
  },
  {
    id: "r3",
    startupId: "s5",
    startupName: "HealthSync",
    sector: "Healthtech",
    batch: "Batch 5",
    month: "Mei 2026",
    submittedDate: "20 Mei 2026",
    narrativeText: "HealthSync menghadapi hambatan regulasi baru terkait sertifikasi data medis pasien di server lokal. Hal ini memperlambat proses akuisisi 10 klinik baru. Laju pembakaran kas (burn rate) meningkat karena kami harus merekrut tim compliance khusus. Sisa kas operasional saat ini diproyeksikan hanya bertahan selama 5 bulan.",
    evaluation: {
      healthScore: 48,
      riskLabel: "HIGH_RISK",
      sentimentScore: 0.35,
      operationalStatus: "AT_RISK",
      summary: {
        point1: "Hambatan regulasi sertifikasi rekam medis memperlambat ekspansi komersial ke klinik baru.",
        point2: "Burn rate membengkak akibat penambahan tim compliance khusus, mempercepat kas habis.",
        point3: "Kondisi keuangan kritis dengan runway sisa kas operasional hanya bertahan selama 5 bulan."
      },
      synergy: {
        matches: [
          { buId: "bu4", reason: "Kolaborasi infrastruktur cloud terverifikasi dengan Adamedika / Telkom Cloud.", matchScore: 78 }
        ]
      }
    }
  },
  {
    id: "r4",
    startupId: "s8",
    startupName: "PayDesa",
    sector: "Fintech",
    batch: "Batch 8",
    month: "Mei 2026",
    submittedDate: "18 Mei 2026",
    narrativeText: "PayDesa mengalami penurunan volume transaksi harian sebesar 20% di pasar tradisional akibat masuknya kompetitor dompet digital besar yang membakar uang untuk promo. Mitra agen desa kami mengeluhkan margin yang menipis. Kas operasional tersisa untuk 8 bulan, dan kami sedang merancang pivot ke sistem supply chain warung desa.",
    evaluation: {
      healthScore: 52,
      riskLabel: "HIGH_RISK",
      sentimentScore: 0.42,
      operationalStatus: "AT_RISK",
      summary: {
        point1: "Transaksi harian drop 20% akibat perang promo dari kompetitor dompet digital raksasa.",
        point2: "Margin agen desa menipis, memicu ketidakpuasan mitra dan penurunan retensi aktif.",
        point3: "Kas tersisa untuk 8 bulan dengan rencana pivot strategis ke supply chain warung desa."
      },
      synergy: {
        matches: [
          { buId: "bu1", reason: "Sinergi dengan PADI UMKM untuk penyediaan supply chain barang murah.", matchScore: 89 }
        ]
      }
    }
  }
];

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<string>("");
  const [selectedReportId, setSelectedReportId] = useState("r1");
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

  // For Executive / Synergy roles, auto-select the first report.
  // For Founder role, auto-select their own startup report (e.g. s3 / FinAccess) to instantly show data.
  useEffect(() => {
    if (user) {
      if (user.role !== "founder" && mockSubmittedReports.length > 0) {
        const firstReport = mockSubmittedReports[0];
        setSelectedReportId(firstReport.id);
        setResult(firstReport.evaluation);
      } else if (user.role === "founder") {
        const myIds = founderStartupMap[user.userId || "demo-founder-id"] || ["s3"];
        const myReport = mockSubmittedReports.find(r => myIds.includes(r.startupId));
        if (myReport) {
          setSelectedReportId(myReport.id);
          setResult(myReport.evaluation);
          setNarrativeText(myReport.narrativeText);
        }
      }
    }
  }, [user]);

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
  const activeReport = mockSubmittedReports.find((r) => r.id === selectedReportId);

  // Dummy history data
  const reportHistory = [
    { month: "April 2026", date: "12 Apr 2026", healthScore: 88, status: "Excellent" },
    { month: "Maret 2026", date: "15 Mar 2026", healthScore: 85, status: "Good" },
    { month: "Februari 2026", date: "10 Feb 2026", healthScore: 78, status: "Stable" },
  ];

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFD] relative">
        {/* Subtle AI Mesh/Pattern Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        {/* Fixed Header Bar */}
        <div className="border-b border-[#f1f1f5] bg-white/80 backdrop-blur-md px-8 py-4 shadow-sm relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#ED1C24]" />
              <div>
                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">AI Evaluation Reports</h1>
                <p className="mt-1 text-sm font-medium text-[#64748b]">Analisis performa & risiko startup menggunakan AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#667085] hidden xl:block">
                {user?.role === "founder"
                  ? "Submit laporan bulanan startup untuk evaluasi otomatis oleh AI"
                  : "Review hasil evaluasi laporan bulanan dan usulan sinergi dari mitra startup"}
              </p>
              
              {/* Header Controls for Founder */}
              {user?.role === "founder" && (
                <div className="flex items-center gap-3">
                  {availableStartups.length > 1 ? (
                    <select
                      className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] min-w-[200px]"
                      value={selectedStartup}
                      onChange={(e) => setSelectedStartup(e.target.value)}
                    >
                      <option value="">-- Pilih Startup --</option>
                      {availableStartups.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.sector}
                        </option>
                      ))}
                    </select>
                  ) : (
                    availableStartups.length === 1 && (
                      <div className="hidden lg:flex rounded-lg bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 items-center gap-2">
                        <p className="text-sm font-bold text-[#0f172a]">{availableStartups[0].name}</p>
                      </div>
                    )
                  )}
                  <button
                    onClick={handleEvaluate}
                    disabled={!selectedStartup || !narrativeText.trim() || loading}
                    className="btn-primary-solid gap-2 px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                  >
                    {loading ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Menganalisis...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Evaluate with AI</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">

          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col gap-6">

              {/* Left Column: Form Input & History */}
              <div className="flex-1 min-w-0 space-y-6">
                {user?.role === "founder" ? (
                  // FOUNDER VIEW: Form Input
                  <div className="card-legion p-6 lg:p-8">
                    <h2 className="text-lg font-bold text-[#161616]">Form Laporan Bulanan</h2>
                    <p className="mt-1 text-sm text-[#667085]">Unggah dokumen PDF atau tulis narasi laporan untuk dievaluasi oleh AI</p>

                    <div className="mt-8 space-y-6">

                      {/* Select is now in the header for founders, and for non-founders we use a list view anyway */}



                      <div className="pt-2 border-t border-[#f2f4f7]">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="block text-sm font-bold text-[#344054]">Narrative Report</label>
                          <span className="text-xs font-medium text-[#667085]">Upload PDF / Ketik Manual</span>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="space-y-5">
                          <div
                            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed transition-all duration-300 p-10 ${
                              isParsingPdf
                                ? "border-[#ED1C24] bg-red-50/30"
                                : "border-[#cbd5e1] bg-gradient-to-b from-white to-slate-50 hover:border-[#ff2d55] hover:bg-red-50/10 hover:shadow-lg hover:-translate-y-0.5"
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
                              <div className="flex flex-col items-center z-10">
                                <RefreshCw className="mb-4 h-10 w-10 animate-spin text-[#ff2d55]" />
                                <p className="text-base font-extrabold text-[#0f172a]">Mengekstrak teks PDF dengan AI...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-center z-10">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-black/5 group-hover:-translate-y-1 transition-transform duration-300">
                                  <Upload className="h-7 w-7 text-[#ff2d55]" />
                                </div>
                                <p className="text-base font-extrabold text-[#0f172a]">Klik atau Drop Laporan PDF di sini</p>
                                <p className="mt-2 text-xs font-medium text-[#64748b]">Sistem AI akan mengekstrak otomatis. Maksimal 10MB.</p>
                              </div>
                            )}
                          </div>

                          <textarea
                            className="w-full min-h-[220px] rounded-[20px] border border-slate-200 bg-white px-6 py-5 text-sm text-[#334155] shadow-sm placeholder:text-[#94a3b8] focus:border-[#ff2d55] focus:ring-1 focus:ring-[#ff2d55] resize-y leading-relaxed hover:border-slate-300 transition-colors"
                            placeholder="Atau ketik/paste narasi laporan bulanan di sini secara langsung..."
                            value={narrativeText}
                            onChange={(e) => setNarrativeText(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Submit action moved to header bar */}
                    </div>
                  </div>
                ) : (
                  // EXECUTIVE & SYNERGY VIEW: AI Evaluation Explorer List
                  <div className="card-legion p-6 lg:p-8 animate-fade-in">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#161616]">Daftar Laporan Masuk</h2>
                        <p className="mt-1 text-sm text-[#667085]">Pilih laporan startup untuk melihat analisis AI mendalam di panel kanan</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3.5 py-1.5 text-xs font-bold text-[#ED1C24] border border-red-100/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24] animate-pulse" />
                        Executive Viewer Mode
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {mockSubmittedReports.map((report) => {
                        const isActive = selectedReportId === report.id;
                        const isHigh = report.evaluation.operationalStatus === "ACTIVE";
                        const statusColor = isHigh
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100";

                        return (
                          <div
                            key={report.id}
                            onClick={() => {
                              setSelectedReportId(report.id);
                              setResult(report.evaluation);
                            }}
                            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between gap-4 ${isActive
                                ? "border-[#ED1C24] bg-red-50/10 shadow-md"
                                : "border-[#e0e0e0] bg-white hover:border-[#ED1C24] hover:shadow-sm"
                              }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                {(() => {
                                  const logo = (startupsData.find(s => s.id === report.startupId) as any)?.logo;
                                  return logo ? (
                                    <div className="h-6 w-6 shrink-0 rounded bg-white border border-slate-200 overflow-hidden shadow-2xs">
                                      <img src={logo} alt={report.startupName} className="h-full w-full object-contain p-0.5" />
                                    </div>
                                  ) : null;
                                })()}
                                <h3 className={`text-base font-extrabold transition-colors ${isActive ? "text-[#ED1C24]" : "text-[#161616] group-hover:text-[#ED1C24]"
                                  }`}>
                                  {report.startupName}
                                </h3>
                                <span className="text-[10px] font-bold text-[#8c8f93] uppercase bg-[#f2f4f7] px-2 py-0.5 rounded">
                                  {report.sector} · {report.batch}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-[#344054]">
                                Periode Laporan: <span className="font-medium text-[#667085]">{report.month}</span>
                              </p>

                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-extrabold border ${statusColor}`}>
                                Health: {report.evaluation.healthScore}%
                              </span>
                              <div className="h-8 w-8 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:bg-[#fef2f2] transition-colors">
                                <ChevronRight className={`h-4 w-4 text-[#d0d5dd] transition-transform ${isActive ? "text-[#ED1C24] translate-x-0.5" : "group-hover:text-[#ED1C24] group-hover:translate-x-0.5"
                                  }`} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show original narrative box below list when a report is selected (for Executive) */}
                {user?.role !== "founder" && activeReport && (
                  <div className="card-legion p-6 lg:p-8 animate-fade-in">
                    <div className="flex items-center gap-2.5 mb-4">
                      <FileText className="h-5 w-5 text-[#ED1C24]" />
                      <h3 className="text-base font-extrabold text-[#161616]">
                        Detail Laporan Asli: <span className="text-[#ED1C24]">{activeReport.startupName}</span>
                      </h3>
                    </div>
                    <div className="rounded-xl border border-[#e0e0e0] bg-[#f8fafc] p-5 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-[#8c8f93] mb-3 pb-3 border-b border-[#e0e0e0]/60">
                        <span>Periode: <strong>{activeReport.month}</strong></span>
                        <span>Diterima: <strong>{activeReport.submittedDate}</strong></span>
                      </div>
                      <p className="text-sm text-[#525252] leading-relaxed whitespace-pre-line font-medium">
                        "{activeReport.narrativeText}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Founder-only block errors and loading */}
                {user?.role === "founder" && error && (
                  <div className="card-legion border-red-200 bg-red-50 p-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-red-600 font-bold">!</span>
                    </div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                {user?.role === "founder" && loading && (
                  <div className="card-legion flex flex-col items-center justify-center py-16">
                    <div className="mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[#ED1C24] border-t-transparent" />
                    <p className="text-base font-bold text-[#161616]">AI sedang memproses laporan...</p>
                    <p className="mt-2 text-sm text-[#667085] text-center max-w-sm">Mengekstrak konteks finansial, menganalisis profil risiko, dan mencari potensi sinergi dengan Telkom Group.</p>
                  </div>
                )}

                {/* History Container - Sitting beneath the Form (Only for Founders) */}
                {user?.role === "founder" && (
                  <div className="card-legion p-6 lg:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-[#fef2f2] p-2.5 rounded-xl">
                        <History className="h-5 w-5 text-[#ED1C24]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#161616]">Riwayat Laporan</h3>
                        <p className="text-xs text-[#8c8f93] mt-0.5">Histori evaluasi bulanan AI</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {reportHistory.map((hist, i) => (
                        <div key={i} onClick={() => alert("Fitur riwayat historis masih dalam tahap pengembangan.")} className="group cursor-pointer rounded-xl border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#ED1C24] hover:shadow-md flex flex-col justify-between">
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

                    <button onClick={() => alert("Halaman daftar riwayat lengkap akan segera hadir!")} className="mt-6 w-full rounded-xl border border-[#e0e0e0] py-3 text-sm font-bold text-[#344054] hover:bg-[#f8fafc] hover:text-[#161616] transition-all active:scale-[0.98]">
                      Lihat Semua Riwayat
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: AI Result */}
              {result && (
                <div className="w-full shrink-0">
                  <div className="sticky top-6">
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-base font-bold text-[#161616]">Hasil Evaluasi AI</h3>
                      <button 
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,45,85,0.3)] active:translate-y-0"
                        style={{ background: 'linear-gradient(135deg, #ff2d55 0%, #ff4d6d 100%)', boxShadow: '0 4px 14px rgba(255,45,85,0.2)' }}
                      >
                        <Download className="h-4 w-4" /> Export Report PDF
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
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
