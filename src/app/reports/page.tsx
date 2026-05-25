"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HealthScoreCard } from "@/components/health-score-card";
import startupsData from "@/data/startups.json";
import telkomBusData from "@/data/telkom-bus.json";
import { FileText, Send, RefreshCw, Download, Upload, History, ChevronRight, MessageSquare, Bot, User } from "lucide-react";
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

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Halo! Laporan bulan ini sudah saya evaluasi. Ada hal spesifik yang ingin didiskusikan terkait strategi atau rekomendasi sinergi?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput("");
    setIsChatLoading(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Berdasarkan analisis evaluasi terbaru, saya merekomendasikan untuk menunda ekspansi fitur dan lebih berfokus pada retensi pengguna aktif bulan ini guna menekan burn rate.' 
      }]);
      setIsChatLoading(false);
    }, 1500);
  };

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

  // For Executive / Synergy roles, auto-select the first report to populate the UI
  useEffect(() => {
    if (user && user.role !== "founder" && mockSubmittedReports.length > 0) {
      const firstReport = mockSubmittedReports[0];
      setSelectedReportId(firstReport.id);
      setResult(firstReport.evaluation);
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
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#ED1C24]" />
            <h1 className="text-2xl font-bold text-[#161616]">AI Health Evaluation</h1>
          </div>
          <p className="mt-1 text-sm text-[#667085]">
            {user?.role === "founder" 
              ? "Submit laporan bulanan startup untuk evaluasi otomatis oleh AI" 
              : "Review hasil evaluasi laporan bulanan dan usulan sinergi dari mitra startup"}
          </p>
        </div>

        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Form Input & History */}
            <div className="flex-1 min-w-0 space-y-6">
              {user?.role === "founder" ? (
                // FOUNDER VIEW: Form Input
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

                  <div className="space-y-4">
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
                          className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isActive
                              ? "border-[#ED1C24] bg-red-50/10 shadow-md"
                              : "border-[#e0e0e0] bg-white hover:border-[#ED1C24] hover:shadow-sm"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className={`text-base font-extrabold transition-colors ${
                                isActive ? "text-[#ED1C24]" : "text-[#161616] group-hover:text-[#ED1C24]"
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
                            <p className="text-xs font-bold text-[#344054] line-clamp-1 leading-relaxed">
                              Excerpt: <span className="font-medium text-[#8c8f93]">"{report.narrativeText}"</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-extrabold border ${statusColor}`}>
                              Health: {report.evaluation.healthScore}%
                            </span>
                            <div className="h-8 w-8 rounded-full bg-[#f8fafc] flex items-center justify-center group-hover:bg-[#fef2f2] transition-colors">
                              <ChevronRight className={`h-4 w-4 text-[#d0d5dd] transition-transform ${
                                isActive ? "text-[#ED1C24] translate-x-0.5" : "group-hover:text-[#ED1C24] group-hover:translate-x-0.5"
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
                      <div key={i} className="group cursor-pointer rounded-xl border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#ED1C24] hover:shadow-md flex flex-col justify-between">
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

            {/* Right Column: AI Result */}
            {result && (
              <div className="w-full lg:w-[480px] shrink-0">
                <div className="sticky top-6">
                  <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
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

                  {/* Interactive AI Mentor Chat (Visible only for founder after evaluation) */}
                  {user?.role === "founder" && (
                    <div className="mt-6 shadow-lg shadow-black/5 rounded-2xl border border-[#e0e0e0] bg-white overflow-hidden flex flex-col h-[400px]">
                      <div className="bg-[#f8fafc] px-5 py-3 border-b border-[#e0e0e0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#161616]">Interactive AI Mentor</h3>
                            <p className="text-[10px] text-[#667085]">Tanyakan strategi berdasarkan evaluasi Anda</p>
                          </div>
                        </div>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#ED1C24] text-white' : 'bg-indigo-600 text-white'}`}>
                              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-[#ED1C24] text-white rounded-tr-none' : 'bg-white border border-[#e0e0e0] text-[#344054] rounded-tl-none shadow-sm'}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="flex gap-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-2xl px-4 py-3 bg-white border border-[#e0e0e0] rounded-tl-none shadow-sm flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#e0e0e0] flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Tanya rekomendasi spesifik..."
                          className="flex-1 rounded-full border border-[#e0e0e0] bg-[#f8fafc] px-4 py-2 text-sm text-[#344054] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="h-9 w-9 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                          <Send className="h-4 w-4 ml-0.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}
