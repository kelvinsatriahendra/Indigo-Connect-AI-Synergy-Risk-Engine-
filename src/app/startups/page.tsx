"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Building2, Sparkles } from "lucide-react";

type Startup = {
  id: string;
  name: string;
  founderName: string;
  sector: string;
  batch: string;
  description: string;
  status: string;
};

export default function StartupsPage() {
  const [startupsData, setStartupsData] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/startups").then(res => res.json()).then(setStartupsData);
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
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-[#ED1C24]" />
            <h1 className="text-2xl font-bold text-[#161616]">Startup</h1>
          </div>
          <p className="mt-1 text-sm text-[#667085]">Daftar startup binaan Indigo</p>
        </div>

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
                    <span className="font-semibold text-[#161616]">{startup.name}</span>
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
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-[#161616]">{selectedStartup.name}</h2>
                        <span className={selectedStartup.status === "ACTIVE" ? "badge-high-growth" : "badge-at-risk"}>
                          {selectedStartup.status === "ACTIVE" ? "High Growth" : "At Risk"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#667085]">{selectedStartup.sector} · {selectedStartup.batch}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-[#344054] mb-2">Deskripsi</h3>
                    <p className="text-sm text-[#525252] leading-relaxed">{selectedStartup.description}</p>
                    <p className="mt-2 text-xs text-[#8c8f93]">Founder: {selectedStartup.founderName}</p>
                  </div>

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
    </AppShell>
  );
}
