"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getLogoForName } from "@/lib/logos";
import { Building2, Sparkles, Coins, TrendingUp, Handshake, Activity, Scale, X } from "lucide-react";

type Startup = {
  id: string;
  name: string;
  founderName: string;
  sector: string;
  batch: string;
  description: string;
  status: string;
};

// Detailed operational, financial, and synergy metrics mapped by startup ID
const startupMetrics: Record<string, {
  cashBalance: string;
  burnRate: string;
  runway: string;
  runwayStatus: "Aman" | "At Risk" | "Kritis";
  runwayColor: string;
  monthlyRevenue: string;
  revenueGrowth: string;
  revenueGrowthColor: string;
  mau: string;
  synergyMitra: string;
  synergyStatus: "Aktif" | "Pipeline" | "Belum Ada";
  synergyColor: string;
  sentiment: string;
  sentimentLabel: string;
  sentimentColor: string;
  riskLabel: "Low Risk" | "Medium Risk" | "High Risk";
  riskColor: string;
}> = {
  s1: {
    cashBalance: "Rp 1.200.000.000",
    burnRate: "Rp 80.000.000/bln",
    runway: "15 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 180.000.000",
    revenueGrowth: "+15% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "14.500 MAU",
    synergyMitra: "Logee / Pos Indonesia",
    synergyStatus: "Aktif",
    synergyColor: "text-blue-600 bg-blue-50 border-blue-100",
    sentiment: "72%",
    sentimentLabel: "Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s2: {
    cashBalance: "Rp 650.000.000",
    burnRate: "Rp 50.000.000/bln",
    runway: "13 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 95.000.000",
    revenueGrowth: "+10% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "8.200 MAU",
    synergyMitra: "Sayurbox / T-Con",
    synergyStatus: "Pipeline",
    synergyColor: "text-amber-600 bg-amber-50 border-amber-100",
    sentiment: "78%",
    sentimentLabel: "Sangat Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s3: {
    cashBalance: "Rp 1.800.000.000",
    burnRate: "Rp 100.000.000/bln",
    runway: "18 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 320.000.000",
    revenueGrowth: "+18% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "25.000 MAU",
    synergyMitra: "LinkAja / PADI UMKM",
    synergyStatus: "Aktif",
    synergyColor: "text-blue-600 bg-blue-50 border-blue-100",
    sentiment: "85%",
    sentimentLabel: "Sangat Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s4: {
    cashBalance: "Rp 450.000.000",
    burnRate: "Rp 35.000.000/bln",
    runway: "12 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 75.000.000",
    revenueGrowth: "+8% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "12.000 MAU",
    synergyMitra: "Pijar Mahir",
    synergyStatus: "Pipeline",
    synergyColor: "text-amber-600 bg-amber-50 border-amber-100",
    sentiment: "80%",
    sentimentLabel: "Sangat Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s5: {
    cashBalance: "Rp 200.000.000",
    burnRate: "Rp 40.000.000/bln",
    runway: "5 Bulan",
    runwayStatus: "Kritis",
    runwayColor: "text-rose-600 bg-rose-50 border-rose-100 animate-pulse",
    monthlyRevenue: "Rp 45.000.000",
    revenueGrowth: "-5% MoM",
    revenueGrowthColor: "text-rose-600 bg-rose-50",
    mau: "3.400 MAU",
    synergyMitra: "Adamedika (Rencana)",
    synergyStatus: "Belum Ada",
    synergyColor: "text-slate-600 bg-slate-50 border-slate-100",
    sentiment: "35%",
    sentimentLabel: "Negatif",
    sentimentColor: "text-rose-600",
    riskLabel: "High Risk",
    riskColor: "text-rose-600 bg-rose-50 border-rose-200"
  },
  s6: {
    cashBalance: "Rp 800.000.000",
    burnRate: "Rp 60.000.000/bln",
    runway: "13.3 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 110.000.000",
    revenueGrowth: "+12% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "5.600 MAU",
    synergyMitra: "Telkom Infra",
    synergyStatus: "Pipeline",
    synergyColor: "text-amber-600 bg-amber-50 border-amber-100",
    sentiment: "82%",
    sentimentLabel: "Sangat Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s7: {
    cashBalance: "Rp 500.000.000",
    burnRate: "Rp 45.000.000/bln",
    runway: "11 Bulan",
    runwayStatus: "Aman",
    runwayColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    monthlyRevenue: "Rp 80.000.000",
    revenueGrowth: "+7% MoM",
    revenueGrowthColor: "text-emerald-600 bg-emerald-50",
    mau: "9.100 MAU",
    synergyMitra: "Mitra Tours",
    synergyStatus: "Pipeline",
    synergyColor: "text-amber-600 bg-amber-50 border-amber-100",
    sentiment: "75%",
    sentimentLabel: "Positif",
    sentimentColor: "text-emerald-600",
    riskLabel: "Low Risk",
    riskColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  s8: {
    cashBalance: "Rp 280.000.000",
    burnRate: "Rp 35.000.000/bln",
    runway: "8 Bulan",
    runwayStatus: "At Risk",
    runwayColor: "text-amber-600 bg-amber-50 border-amber-100",
    monthlyRevenue: "Rp 60.000.000",
    revenueGrowth: "-12% MoM",
    revenueGrowthColor: "text-rose-600 bg-rose-50",
    mau: "4.200 MAU",
    synergyMitra: "PADI UMKM (Rencana)",
    synergyStatus: "Belum Ada",
    synergyColor: "text-slate-600 bg-slate-50 border-slate-100",
    sentiment: "42%",
    sentimentLabel: "Kurang Sentimen",
    sentimentColor: "text-amber-600",
    riskLabel: "High Risk",
    riskColor: "text-rose-600 bg-rose-50 border-rose-200"
  }
};

export default function StartupsPage() {
  const [startupsData, setStartupsData] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareStartupA, setCompareStartupA] = useState<string>("");
  const [compareStartupB, setCompareStartupB] = useState<string>("");

  useEffect(() => {
    fetch("/api/startups")
      .then(res => res.json())
      .then(data => {
        setStartupsData(data);
        if (data.length > 1) {
          setCompareStartupA(data[0].id);
          setCompareStartupB(data[1].id);
        }
      });
  }, []);

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
        setAiSummary("AI Summary tidak tersedia saat ini.");
      }
    } catch {
      setAiSummary("AI Summary tidak tersedia saat ini.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50/50">
        {/* Fixed Header Bar */}
        <div className="border-b bg-white px-8 py-5 shadow-sm relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#ED1C24]" />
                <h1 className="text-2xl font-bold text-[#161616]">Startup</h1>
              </div>
              <p className="mt-1 text-sm text-[#667085]">Daftar startup binaan Indigo</p>
            </div>
            <button 
              onClick={() => setIsCompareModalOpen(true)}
              className="btn-primary-solid flex items-center gap-2 px-4 py-2 text-sm font-bold"
            >
              <Scale className="h-4 w-4" /> Compare Startups
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-[#344054] uppercase tracking-wider">Daftar Startup</h2>
            <div className="space-y-2">
              {startupsData.map((startup) => (
                <button
                  key={startup.id}
                  onClick={() => handleAIAnalysis(startup)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selectedStartup?.id === startup.id
                      ? "border-[#ED1C24] bg-[#FEF2F2]"
                      : "border-[#e0e0e0] bg-white hover:border-[#ED1C24] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {getLogoForName(startup.name) ? (
                          <img src={getLogoForName(startup.name)} alt={startup.name} className="h-full w-full object-contain p-1" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{startup.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-semibold text-[#161616]">{startup.name}</span>
                    </div>
                    <span className={startup.status === "ACTIVE" ? "badge-high-growth" : "badge-at-risk"}>
                      {startup.status === "ACTIVE" ? "Aktif" : "At Risk"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#667085]">{startup.sector} · {startup.batch}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedStartup ? (
              <div className="card-legion overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                          <img src={(selectedStartup as any).logo} alt={selectedStartup.name} className="h-full w-full object-contain p-2" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#161616]">{selectedStartup.name}</h2>
                        <span className={selectedStartup.status === "ACTIVE" ? "badge-high-growth" : "badge-at-risk"}>
                          {selectedStartup.status === "ACTIVE" ? "High Growth" : "At Risk"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#667085]">{selectedStartup.sector} · {selectedStartup.batch}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-[#344054] mb-2">Deskripsi</h3>
                    <p className="text-sm text-[#525252] leading-relaxed font-medium">{selectedStartup.description}</p>
                    <p className="mt-2.5 text-xs font-semibold text-[#8c8f93]">Founder: <strong className="text-[#344054]">{selectedStartup.founderName}</strong></p>
                  </div>

                  {/* Financial & Growth Grid (Enterprise Dashboard Style) */}
                  {(() => {
                    const metrics = startupMetrics[selectedStartup.id as keyof typeof startupMetrics];
                    if (!metrics) return null;

                    return (
                      <div className="mt-8 border-t border-[#f2f4f7] pt-6 animate-fade-in">
                        <h3 className="text-xs font-bold text-[#161616] mb-4 uppercase tracking-wider">Metrik Operasional & Kinerja</h3>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Card 1: Financial Health */}
                          <div className="rounded-xl border border-[#e0e0e0] bg-[#fcfcfd] p-4 flex flex-col justify-between shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Financial Health</span>
                              <Coins className="h-4 w-4 text-[#ED1C24]" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Sisa Kas (Cash)</span>
                                <span className="text-xs font-extrabold text-[#161616]">{metrics.cashBalance}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Burn Rate</span>
                                <span className="text-xs font-bold text-[#525252]">{metrics.burnRate}</span>
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-[#e0e0e0]/50">
                                <span className="text-xs font-extrabold text-[#161616]">Runway Kas</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.runwayColor}`}>
                                  {metrics.runway} ({metrics.runwayStatus})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Growth & Traction */}
                          <div className="rounded-xl border border-[#e0e0e0] bg-[#fcfcfd] p-4 flex flex-col justify-between shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Growth & Traction</span>
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Pendapatan (MoM)</span>
                                <span className="text-xs font-extrabold text-[#161616]">{metrics.monthlyRevenue}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Pertumbuhan</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${metrics.revenueGrowthColor}`}>
                                  {metrics.revenueGrowth}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-[#e0e0e0]/50">
                                <span className="text-xs font-extrabold text-[#161616]">Pengguna Aktif</span>
                                <span className="text-xs font-extrabold text-emerald-600">{metrics.mau}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card 3: Telkom Synergy Pipeline */}
                          <div className="rounded-xl border border-[#e0e0e0] bg-[#fcfcfd] p-4 flex flex-col justify-between shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">Telkom Synergy Pipeline</span>
                              <Handshake className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Unit Sinergi</span>
                                <span className="text-xs font-extrabold text-[#161616] truncate max-w-[140px]" title={metrics.synergyMitra}>
                                  {metrics.synergyMitra}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2.5 border-t border-[#e0e0e0]/50">
                                <span className="text-xs font-extrabold text-[#161616]">Status Kolaborasi</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.synergyColor}`}>
                                  {metrics.synergyStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card 4: AI Risk & Sentiment */}
                          <div className="rounded-xl border border-[#e0e0e0] bg-[#fcfcfd] p-4 flex flex-col justify-between shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-[#8c8f93] uppercase tracking-wider">AI Risk & Sentiment</span>
                              <Activity className="h-4 w-4 text-[#ED1C24]" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#525252]">Sentimen Laporan</span>
                                <span className={`text-xs font-bold ${metrics.sentimentColor}`}>
                                  {metrics.sentiment} ({metrics.sentimentLabel})
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2.5 border-t border-[#e0e0e0]/50">
                                <span className="text-xs font-extrabold text-[#161616]">Label Risiko AI</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.riskColor}`}>
                                  {metrics.riskLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-8 border-t border-[#f2f4f7] pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#ED1C24]" />
                        <h3 className="text-sm font-semibold text-[#161616]">AI Executive Summary</h3>
                      </div>
                      <button
                        onClick={() => handleAIAnalysis(selectedStartup)}
                        disabled={loading}
                        className="btn-primary-outline gap-2 px-4 py-2 text-xs disabled:opacity-50"
                      >
                        {loading ? "Menganalisis..." : "Generate AI Summary"}
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
                      </div>
                    ) : aiSummary ? (
                      <div className="space-y-3 rounded-xl bg-[#f2f4f7] p-5">
                        {aiSummary.split("\n\n").map((point, i) => (
                          <p key={i} className="text-sm text-[#344054] leading-relaxed">{point}</p>
                        ))}
                        <p className="pt-3 border-t border-[#e0e0e0] text-xs text-[#8c8f93]">
                          Dihasilkan oleh AI · Google Gemini 2.0 Flash via OpenRouter
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#8c8f93] text-center py-8">
                        Klik &quot;Generate AI Summary&quot; untuk melihat ringkasan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-legion flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Building2 className="mx-auto h-10 w-10 text-[#d0d5dd]" />
                  <p className="mt-3 text-sm font-medium text-[#667085]">Pilih startup untuk melihat detail</p>
                  <p className="mt-1 text-xs text-[#8c8f93]">Klik salah satu startup di samping</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-[#f8fafc] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#161616]">Side-by-Side Comparison</h2>
                  <p className="text-xs text-[#667085]">Bandingkan metrik dua startup secara berdampingan</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="rounded-full p-2 text-[#8c8f93] hover:bg-[#f2f4f7] hover:text-[#161616] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                
                {/* VS Badge in the middle */}
                <div className="hidden md:flex absolute left-1/2 top-4 -translate-x-1/2 z-10 h-10 w-10 bg-white rounded-full border border-[#e0e0e0] items-center justify-center shadow-sm">
                  <span className="text-xs font-extrabold text-[#ED1C24]">VS</span>
                </div>

                {/* Startup A Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-[#344054] mb-2 block uppercase tracking-wider">Startup A</label>
                    <select 
                      className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-sm font-bold text-[#161616] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                      value={compareStartupA}
                      onChange={(e) => setCompareStartupA(e.target.value)}
                    >
                      {startupsData.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sector})</option>)}
                    </select>
                  </div>
                  
                  {(() => {
                    const data = startupsData.find(s => s.id === compareStartupA);
                    const metrics = startupMetrics[compareStartupA];
                    if (!data || !metrics) return null;
                    return (
                      <div className="card-legion p-5 space-y-4 bg-white">
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Sektor & Batch</span>
                          <span className="text-xs font-bold text-[#161616]">{data.sector} · {data.batch}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Monthly Revenue</span>
                          <span className="text-sm font-extrabold text-emerald-600">{metrics.monthlyRevenue}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Growth (MoM)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.revenueGrowthColor}`}>{metrics.revenueGrowth}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Burn Rate</span>
                          <span className="text-sm font-bold text-[#525252]">{metrics.burnRate}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Cash Runway</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.runwayColor}`}>{metrics.runway}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-medium text-[#667085]">Risk Level</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.riskColor}`}>{metrics.riskLabel}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Startup B Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-[#344054] mb-2 block uppercase tracking-wider">Startup B</label>
                    <select 
                      className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-sm font-bold text-[#161616] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                      value={compareStartupB}
                      onChange={(e) => setCompareStartupB(e.target.value)}
                    >
                      {startupsData.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sector})</option>)}
                    </select>
                  </div>
                  
                  {(() => {
                    const data = startupsData.find(s => s.id === compareStartupB);
                    const metrics = startupMetrics[compareStartupB];
                    if (!data || !metrics) return null;
                    return (
                      <div className="card-legion p-5 space-y-4 bg-white">
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Sektor & Batch</span>
                          <span className="text-xs font-bold text-[#161616]">{data.sector} · {data.batch}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Monthly Revenue</span>
                          <span className="text-sm font-extrabold text-emerald-600">{metrics.monthlyRevenue}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Growth (MoM)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.revenueGrowthColor}`}>{metrics.revenueGrowth}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Burn Rate</span>
                          <span className="text-sm font-bold text-[#525252]">{metrics.burnRate}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#f2f4f7] pb-3">
                          <span className="text-xs font-medium text-[#667085]">Cash Runway</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.runwayColor}`}>{metrics.runway}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-medium text-[#667085]">Risk Level</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${metrics.riskColor}`}>{metrics.riskLabel}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
