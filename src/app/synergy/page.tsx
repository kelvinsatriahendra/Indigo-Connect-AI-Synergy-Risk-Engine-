"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getLogoForName } from "@/lib/logos";
import {
  GitBranch,
  Plus,
  ChevronRight,
  X,
  Check,
  RotateCcw,
  MessageSquare,
  User,
  Calendar,
  Target,
  Sparkles,
  AlertCircle,
  BrainCircuit,
  Activity,
  GripVertical
} from "lucide-react";

type PipelineStatus = "PIPELINE" | "ON_GOING" | "SUCCESS" | "CANCELLED";

interface Pipeline {
  id: string;
  startupId: string;
  telkomBuId: string;
  status: PipelineStatus;
  matchScore: number;
  reason: string;
  notes: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const columns: { status: PipelineStatus; label: string; color: string }[] = [
  { status: "PIPELINE", label: "Pipeline", color: "border-t-[#ED1C24]" },
  { status: "ON_GOING", label: "On Going", color: "border-t-[#f59e0b]" },
  { status: "SUCCESS", label: "Success", color: "border-t-[#10b981]" },
  { status: "CANCELLED", label: "Cancelled", color: "border-t-[#ef4444]" },
];

const statusBorders: Record<PipelineStatus, string> = {
  PIPELINE: "border-l-4 border-l-[#ED1C24]",
  ON_GOING: "border-l-4 border-l-[#f59e0b]",
  SUCCESS: "border-l-4 border-l-[#10b981]",
  CANCELLED: "border-l-4 border-l-[#ef4444]",
};

const getScoreBadge = (score: number) => {
  const pct = Math.round(score * 100);
  if (pct >= 85) {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      bar: "bg-emerald-500",
      text: "High Synergy",
      icon: Sparkles
    };
  } else if (pct >= 70) {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-100",
      bar: "bg-amber-500",
      text: "Moderate Fit",
      icon: Target
    };
  } else {
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-100",
      bar: "bg-rose-500",
      text: "Low Fit",
      icon: AlertCircle
    };
  }
};

export default function SynergyPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [startupsData, setStartupsData] = useState<any[]>([]);
  const [telkomBusData, setTelkomBusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Panels
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeCRMItem, setActiveCRMItem] = useState<Pipeline | null>(null);
  
  // Form States
  const [noteText, setNoteText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isSimulatingAI, setIsSimulatingAI] = useState(false);
  
  // Drag and Drop States
  const [draggedOverCol, setDraggedOverCol] = useState<PipelineStatus | null>(null);

  const fetchData = async () => {
    try {
      const [pipelinesRes, startupsRes, busRes] = await Promise.all([
        fetch("/api/synergy/pipeline"),
        fetch("/api/startups"),
        fetch("/api/telkom-bu")
      ]);
      
      if (pipelinesRes.ok) setPipelines(await pipelinesRes.json());
      if (startupsRes.ok) setStartupsData(await startupsRes.json());
      if (busRes.ok) setTelkomBusData(await busRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const moveStatus = async (id: string, newStatus: PipelineStatus) => {
    const res = await fetch("/api/synergy/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPipelines((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
  };

  const saveNotes = async (id: string) => {
    const res = await fetch("/api/synergy/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: noteText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPipelines((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    setActiveCRMItem(null);
  };

  const createPipeline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/synergy/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startupId: data.get("startupId"),
        telkomBuId: data.get("telkomBuId"),
        matchScore: (Number(data.get("matchScore")) || 50) / 100, // Normalized to 0-1
        reason: data.get("reason") || "Sinergi potensial",
      }),
    });
    if (res.ok) {
      const newPipeline = await res.json();
      setPipelines((prev) => [...prev, newPipeline]);
      setShowNewForm(false);
    }
  };

  const handleAIMatchmaking = async () => {
    if (!formRef.current) return;
    const startupInput = formRef.current.elements.namedItem("startupId") as HTMLSelectElement;
    const selectedStartupId = startupInput.value;

    if (!selectedStartupId) {
      alert("Silakan pilih Startup Partner terlebih dahulu agar AI dapat menganalisis profilnya.");
      return;
    }

    const startup = startupsData.find(s => s.id === selectedStartupId);
    if (!startup) return;

    setIsSimulatingAI(true);
    try {
      const res = await fetch("/api/ai/synergy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrativeText: startup.description }),
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data AI");
      
      const data = await res.json();
      const bestMatch = data.matches?.[0];
      
      if (bestMatch) {
        const buInput = formRef.current.elements.namedItem("telkomBuId") as HTMLSelectElement;
        const scoreInput = formRef.current.elements.namedItem("matchScore") as HTMLInputElement;
        const reasonInput = formRef.current.elements.namedItem("reason") as HTMLTextAreaElement;

        if (buInput) buInput.value = bestMatch.buId;
        // The mock returned 0.92, so we multiply by 100
        if (scoreInput) scoreInput.value = Math.round(bestMatch.matchScore * 100).toString();
        if (reasonInput) reasonInput.value = `AI Recommendation: ${bestMatch.reason}`;
      } else {
        alert("AI tidak menemukan kecocokan yang signifikan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghubungi AI Synergy Matcher.");
    } finally {
      setIsSimulatingAI(false);
    }
  };

  const getStartupName = (id: string) => startupsData.find((s) => s.id === id)?.name || id;
  const getBuName = (id: string) => telkomBusData.find((b) => b.id === id)?.name || id;
  const getStartup = (id: string) => startupsData.find((s) => s.id === id);
  const getBu = (id: string) => telkomBusData.find((b) => b.id === id);

  const grouped = columns.map((col) => ({
    ...col,
    items: pipelines.filter((p) => p.status === col.status),
  }));

  const totalCount = pipelines.length;
  const pipelineCount = pipelines.filter((p) => p.status === "PIPELINE").length;
  const ongoingCount = pipelines.filter((p) => p.status === "ON_GOING").length;
  const successCount = pipelines.filter((p) => p.status === "SUCCESS").length;

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden bg-[#FAFAFD] relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        {/* Header */}
        <div className="border-b border-[#f1f1f5] bg-white px-8 py-5 shadow-sm relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ED1C24] to-[#991217] text-white shadow-md">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-[#161616] tracking-tight">Synergy Pipeline</h1>
                  {/* AI Matchmaker Live Badge */}
                  <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700">AI Matchmaker Active</span>
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-[#667085]">Interactive Kanban pipeline untuk kolaborasi Startup × Telkom Business Unit</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timestamp */}
              <div className="hidden lg:block text-right">
                <p className="text-xs font-medium text-[#8c8f93]">Terakhir dimutakhirkan</p>
                <p className="text-xs font-bold text-[#344054]">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
              
              <button onClick={() => setShowNewForm(true)} className="btn-primary-solid gap-2 px-5 py-2.5 shadow-md shadow-[#ED1C24]/10">
                <Plus className="h-4 w-4" /> New Pipeline
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex gap-6 text-sm border-t border-slate-50 pt-3">
            <span className="text-[#667085] font-medium">Total: <strong className="text-[#161616] font-bold">{totalCount}</strong></span>
            <span className="text-[#667085] font-medium">Pipeline: <strong className="text-[#ED1C24] font-bold">{pipelineCount}</strong></span>
            <span className="text-[#667085] font-medium">On Going: <strong className="text-[#f59e0b] font-bold">{ongoingCount}</strong></span>
            <span className="text-[#667085] font-medium">Success: <strong className="text-[#10b981] font-bold">{successCount}</strong></span>
          </div>
        </div>

        {/* Kanban Board (Board View) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
          <div className="flex h-full gap-6 items-start">
            {loading ? (
              <div className="flex w-full h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ED1C24] border-t-transparent shadow-lg" />
              </div>
            ) : (
              grouped.map((col) => (
                <div 
                  key={col.status} 
                  className={`flex h-full w-[350px] shrink-0 flex-col rounded-xl transition-all duration-300 p-3 ${
                    draggedOverCol === col.status 
                      ? 'bg-slate-200/60 ring-2 ring-slate-400/30 ring-inset shadow-inner' 
                      : 'bg-slate-100/50 border border-slate-200/60'
                  }`}
                  onDragOver={(e) => { 
                    e.preventDefault(); 
                    setDraggedOverCol(col.status); 
                  }}
                  onDragLeave={(e) => { 
                    e.preventDefault(); 
                    setDraggedOverCol(null); 
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggedOverCol(null);
                    const id = e.dataTransfer.getData("pipelineId");
                    if (id && pipelines.find(p => p.id === id)?.status !== col.status) {
                      moveStatus(id, col.status);
                    }
                  }}
                >
                  {/* Column Header */}
                  <div className={`mb-4 flex items-center justify-between rounded-xl border-t-4 bg-white px-5 py-3.5 shadow-sm ${col.color}`}>
                    <h3 className="text-[15px] font-bold text-[#161616] uppercase tracking-wide">{col.label}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 shadow-inner">
                      {col.items.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-1 pb-4">
                    {col.items.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center bg-white/40 backdrop-blur-sm">
                         <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-2">
                           <Target className="h-5 w-5 text-slate-400" />
                         </div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Drop Here</p>
                      </div>
                    ) : (
                      col.items.map((item) => {
                        const startup = getStartup(item.startupId);
                        const bu = getBu(item.telkomBuId);
                        const scoreInfo = getScoreBadge(item.matchScore);
                        const ScoreIcon = scoreInfo.icon;
                        
                        return (
                          <div 
                            key={item.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("pipelineId", item.id);
                            }}
                            className={`card-legion overflow-hidden cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[#ED1C24]/30 hover:-translate-y-1 transition-all duration-200 bg-white ${statusBorders[item.status]}`}
                          >
                            <div className="p-4">
                              {/* Header & Match Score */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing" />
                                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-slate-50 text-slate-600 border-slate-200/60 shadow-xs">
                                    {item.status.replace("_", " ")}
                                  </span>
                                </div>
                                <span className={`inline-flex items-center gap-1 ml-2 shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold shadow-2xs ${scoreInfo.bg}`}>
                                  <ScoreIcon className="h-3 w-3 shrink-0 animate-pulse" />
                                  {Math.round(item.matchScore * 100)}%
                                </span>
                              </div>

                              {/* Synergy Connector Flow */}
                              <div className="flex flex-col gap-3 mt-4">
                                {/* Startup */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {startup && getLogoForName(startup.name) ? (
                                      <div className="h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 overflow-hidden shadow-2xs">
                                        <img src={getLogoForName(startup.name)} alt={startup.name} className="h-full w-full object-contain p-0.5" />
                                      </div>
                                    ) : (
                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 text-[11px] font-extrabold border border-blue-100 shadow-2xs">
                                        {startup?.name.charAt(0) || "S"}
                                      </span>
                                    )}
                                    <span className="text-[13px] font-bold text-[#161616] truncate">
                                      {startup?.name || getStartupName(item.startupId)}
                                    </span>
                                  </div>
                                </div>

                                {/* Connecting Dotted Line */}
                                <div className="flex items-center pl-3 my-0.5">
                                  <div className="h-5 w-px border-l-2 border-dashed border-slate-200"></div>
                                  <span className="text-[9px] font-bold text-slate-400 px-3 uppercase tracking-widest bg-white">Synergetic Fit</span>
                                  <div className="flex-1 h-px border-t-2 border-dashed border-slate-200"></div>
                                </div>

                                {/* Telkom BU */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {bu && getLogoForName(bu.name) ? (
                                      <div className="h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 overflow-hidden shadow-2xs">
                                        <img src={getLogoForName(bu.name)} alt={bu.name} className="h-full w-full object-contain p-0.5" />
                                      </div>
                                    ) : (
                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#ED1C24] text-[11px] font-extrabold border border-[#ED1C24]/10 shadow-2xs">
                                        BU
                                      </span>
                                    )}
                                    <span className="text-[13px] font-bold text-[#344054] truncate">
                                      {bu?.name || getBuName(item.telkomBuId)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="mt-4 text-xs text-[#525252] leading-relaxed line-clamp-2 italic px-2 border-l-2 border-slate-200">
                                "{item.reason}"
                              </p>

                              {/* Notes Indicator */}
                              {item.notes && (
                                <div className="mt-3 rounded-lg border-l-2 border-indigo-500 bg-indigo-50/50 p-2 shadow-xs border border-indigo-100/50 flex items-start gap-2">
                                  <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-1 flex-1">
                                    {item.notes}
                                  </p>
                                </div>
                              )}

                              {/* Action Footer */}
                              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <button
                                  onClick={() => { setActiveCRMItem(item); setNoteText(item.notes || ""); }}
                                  className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-[#475467] border border-slate-200 shadow-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer group"
                                >
                                  <Activity className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500" />
                                  Manage CRM
                                </button>
                                
                                <span className="flex items-center gap-1.5 text-[#8c8f93] font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs">{new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CRM Pipeline Modal (Slide Over) */}
      {activeCRMItem && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm transition-all">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 border-b bg-gradient-to-br from-slate-50 to-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-[#161616]">CRM & Activity Log</h2>
                </div>
                <p className="text-xs text-slate-500">Manage pipeline progression notes and tasks.</p>
              </div>
              <button onClick={() => setActiveCRMItem(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              
              {/* Synergy Overview Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Synergy Overview</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                      {getStartupName(activeCRMItem.startupId).charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#161616]">{getStartupName(activeCRMItem.startupId)}</p>
                      <p className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">Startup Partner</p>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getBu(activeCRMItem.telkomBuId) && (getBu(activeCRMItem.telkomBuId) as any).logo ? (
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-1">
                        <img src={(getBu(activeCRMItem.telkomBuId) as any).logo} alt="BU Logo" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#ED1C24] font-bold text-lg shadow-sm">
                        BU
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#161616]">{getBuName(activeCRMItem.telkomBuId)}</p>
                      <p className="text-xs text-[#ED1C24] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full inline-block mt-0.5">Telkom Business Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Editor */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Pipeline Progress Notes
                </h3>
                <div className="rounded-xl border border-indigo-100 bg-white overflow-hidden shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500">
                    Catat riwayat diskusi, kendala, atau next step di sini.
                  </div>
                  <textarea
                    className="w-full bg-transparent p-4 text-sm text-[#344054] resize-none outline-none placeholder:text-slate-300"
                    rows={6}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Contoh: Telah melakukan meeting pertama dengan CTO. Lanjut ke tahap technical due diligence minggu depan..."
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-white flex gap-3">
              <button onClick={() => saveNotes(activeCRMItem.id)} className="btn-primary-solid flex-1 py-2.5 rounded-lg font-bold shadow-md shadow-indigo-500/20">
                Simpan CRM Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Pipeline Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-100 shadow-sm text-[#ED1C24]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#161616]">Create Pipeline</h2>
                  <p className="text-[11px] text-slate-500">Tambahkan inisiasi sinergi baru ke Kanban</p>
                </div>
              </div>
              <button onClick={() => setShowNewForm(false)} className="text-[#8c8f93] hover:text-[#161616] p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={createPipeline} className="p-6 space-y-5">
              
              {/* AI MATCHMAKING BUTTON */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100/50 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <BrainCircuit className="h-4 w-4" />
                    <span className="text-xs font-bold">Bingung mencari kecocokan?</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAIMatchmaking}
                    disabled={isSimulatingAI}
                    className="flex items-center gap-1.5 bg-[#ED1C24] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md shadow-red-600/20"
                  >
                    {isSimulatingAI ? (
                      <><div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Ask AI for Recommendation</>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#344054] uppercase tracking-wide">Startup Partner</label>
                <select name="startupId" required className="w-full rounded-lg border border-[#e0e0e0] bg-slate-50 px-4 py-3 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] focus:bg-white transition-all shadow-sm">
                  <option value="">-- Pilih Startup --</option>
                  {startupsData.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#344054] uppercase tracking-wide">Telkom Business Unit</label>
                <select name="telkomBuId" required className="w-full rounded-lg border border-[#e0e0e0] bg-slate-50 px-4 py-3 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] focus:bg-white transition-all shadow-sm">
                  <option value="">-- Pilih Divisi Telkom --</option>
                  {telkomBusData.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.name} — {bu.sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#344054] uppercase tracking-wide">Synergy Match Score (0-100)</label>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 rounded-full border border-emerald-100">AI Estimated</span>
                </div>
                <input type="number" name="matchScore" min="0" max="100" defaultValue={75}
                  className="w-full rounded-lg border border-[#e0e0e0] bg-slate-50 px-4 py-3 text-sm text-[#161616] font-bold focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#344054] uppercase tracking-wide">Alasan Strategis</label>
                <textarea name="reason" rows={3} placeholder="Deskripsi alasan mengapa kolaborasi ini menguntungkan..."
                  className="w-full rounded-lg border border-[#e0e0e0] bg-slate-50 px-4 py-3 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] focus:bg-white transition-all resize-none shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="btn-primary-solid flex-1 gap-2 py-3 rounded-lg font-bold shadow-lg shadow-[#ED1C24]/20">
                  <Plus className="h-4 w-4" /> Tambahkan ke Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
