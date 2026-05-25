"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import telkomBusData from "@/data/telkom-bus.json";
import {
  GitBranch,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  User,
  Calendar,
  Target,
  Sparkles,
  AlertCircle,
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

const statusFlow: Record<PipelineStatus, PipelineStatus[]> = {
  PIPELINE: ["ON_GOING"],
  ON_GOING: ["SUCCESS", "CANCELLED"],
  SUCCESS: [],
  CANCELLED: ["PIPELINE"],
};

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
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const fetchPipelines = async () => {
    try {
      const res = await fetch("/api/synergy/pipeline");
      if (res.ok) {
        const data = await res.json();
        setPipelines(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
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
    setEditingNotes(null);
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
        matchScore: Number(data.get("matchScore")) || 0.5,
        reason: data.get("reason") || "Sinergi potensial",
      }),
    });
    if (res.ok) {
      const newPipeline = await res.json();
      setPipelines((prev) => [...prev, newPipeline]);
      setShowNewForm(false);
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
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 text-[#ED1C24]" />
                <h1 className="text-2xl font-bold text-[#161616]">Synergy Pipeline</h1>
              </div>
              <p className="mt-1 text-sm text-[#667085]">Kanban pipeline kolaborasi startup × Telkom Business Unit</p>
            </div>
            <button onClick={() => setShowNewForm(true)} className="btn-primary-solid gap-2 px-5 py-2.5">
              <Plus className="h-4 w-4" /> New Pipeline
            </button>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <span className="text-[#667085]">Total: <strong className="text-[#161616]">{totalCount}</strong></span>
            <span className="text-[#667085]">Pipeline: <strong className="text-[#ED1C24]">{pipelineCount}</strong></span>
            <span className="text-[#667085]">On Going: <strong className="text-[#f59e0b]">{ongoingCount}</strong></span>
            <span className="text-[#667085]">Success: <strong className="text-[#10b981]">{successCount}</strong></span>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full gap-5 p-8">
            {loading ? (
              <div className="flex w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
              </div>
            ) : (
              grouped.map((col) => (
                <div key={col.status} className="flex w-72 shrink-0 flex-col">
                  <div className={`mb-4 flex items-center justify-between rounded-t-lg border-t-4 bg-white px-4 py-3 shadow-sm ${col.color}`}>
                    <h3 className="text-sm font-bold text-[#161616]">{col.label}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f2f4f7] text-xs font-medium text-[#667085]">
                      {col.items.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto">
                    {col.items.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-[#e0e0e0] p-6 text-center">
                        <p className="text-xs text-[#8c8f93]">Belum ada item</p>
                      </div>
                    ) : (
                      col.items.map((item) => {
                        const startup = getStartup(item.startupId);
                        const bu = getBu(item.telkomBuId);
                        const scoreInfo = getScoreBadge(item.matchScore);
                        const ScoreIcon = scoreInfo.icon;
                        return (
                          <div key={item.id} className={`card-legion overflow-hidden ${statusBorders[item.status] || "border-l-4 border-l-slate-200"}`}>
                            <div className="p-4">
                              {/* Header & Match Score */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-slate-50 text-slate-600 border-slate-200/60 shadow-2xs mb-2">
                                    {item.status.replace("_", " ")}
                                  </span>
                                </div>
                                <span className={`inline-flex items-center gap-1 ml-2 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-2xs ${scoreInfo.bg}`}>
                                  <ScoreIcon className="h-3 w-3 shrink-0 animate-pulse" />
                                  {Math.round(item.matchScore * 100)}%
                                </span>
                              </div>

                              {/* Synergy Connector Flow */}
                              <div className="flex flex-col gap-2 mt-2">
                                {/* Startup */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#FEF2F2] text-[#ED1C24] text-[10px] font-extrabold border border-[#ED1C24]/10 shadow-2xs">
                                      S
                                    </span>
                                    <span className="text-sm font-bold text-[#161616] truncate">
                                      {startup?.name || getStartupName(item.startupId)}
                                    </span>
                                  </div>
                                  {startup?.sector && (
                                    <span className="shrink-0 rounded bg-slate-100/80 border border-slate-200/60 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 shadow-3xs">
                                      {startup.sector}
                                    </span>
                                  )}
                                </div>

                                {/* Connecting Dotted Line */}
                                <div className="flex items-center pl-2.5 my-0.5">
                                  <div className="h-4 w-px border-l border-dashed border-slate-300"></div>
                                  <span className="text-[8px] font-bold text-slate-400 px-2 uppercase tracking-widest">Synergy Fit</span>
                                  <div className="flex-1 h-px border-t border-dashed border-slate-200"></div>
                                </div>

                                {/* Telkom BU */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-50 text-[#ED1C24] text-[10px] font-extrabold border border-[#ED1C24]/10 shadow-2xs">
                                      BU
                                    </span>
                                    <span className="text-xs font-bold text-[#344054] truncate">
                                      {bu?.name || getBuName(item.telkomBuId)}
                                    </span>
                                  </div>
                                  {bu?.sector && (
                                    <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#ED1C24] border border-[#ED1C24]/10 shadow-3xs">
                                      {bu.sector}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3 space-y-1 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500 font-semibold tracking-wide uppercase text-[8px]">Match Alignment</span>
                                  <span className="font-extrabold text-[#161616]">{Math.round(item.matchScore * 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${scoreInfo.bar} transition-all duration-500`}
                                    style={{ width: `${item.matchScore * 100}%` }}
                                  />
                                </div>
                              </div>

                              <p className="mt-3 text-xs text-[#525252] leading-relaxed line-clamp-2 italic px-1 border-l border-slate-200">
                                "{item.reason}"
                              </p>

                              {/* Notes section */}
                              {editingNotes === item.id ? (
                                <div className="mt-3 space-y-2 rounded-lg bg-amber-50/30 border border-amber-200/50 p-2.5">
                                  <textarea
                                    className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs text-[#344054] resize-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
                                    rows={3}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Tambah notes perkembangan..."
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => saveNotes(item.id)} className="btn-primary-solid px-3 py-1 text-xs rounded-full shadow-xs">Save</button>
                                    <button onClick={() => setEditingNotes(null)} className="btn-primary-outline px-3 py-1 text-xs rounded-full shadow-xs">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                item.notes && (
                                  <div className="mt-3 rounded-lg border-l-2 border-amber-500 bg-[#fffbeb] p-2.5 shadow-xs border border-amber-100/50">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <MessageSquare className="h-3 w-3 text-amber-600" />
                                      <span className="text-[8px] font-bold text-amber-700 uppercase tracking-widest">Latest Progress Note</span>
                                    </div>
                                    <p className="text-xs text-slate-700 italic leading-relaxed">"{item.notes}"</p>
                                  </div>
                                )
                              )}

                              {/* Meta */}
                              <div className="mt-4 flex items-center justify-between text-[10px] text-[#667085] border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-1">
                                  {item.assignedTo ? (
                                    <span className="flex items-center gap-1 bg-slate-100/60 rounded px-1.5 py-0.5 text-slate-700 font-medium">
                                      <User className="h-3 w-3 text-slate-500" />
                                      <span className="truncate max-w-[100px]">{item.assignedTo}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-[#8c8f93] italic bg-slate-50 rounded px-1.5 py-0.5 border border-slate-100">Unassigned</span>
                                  )}
                                </div>
                                <span className="flex items-center gap-1 text-[#8c8f93] font-medium">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-3">
                                {editingNotes !== item.id && (
                                  <button
                                    onClick={() => { setEditingNotes(item.id); setNoteText(item.notes || ""); }}
                                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#475467] shadow-sm hover:bg-slate-50 hover:text-[#161616] transition-all duration-200 cursor-pointer"
                                  >
                                    <MessageSquare className="h-3 w-3 text-slate-500" />
                                    {item.notes ? "Edit Notes" : "Add Notes"}
                                  </button>
                                )}

                                <div className="flex gap-1.5 ml-auto">
                                  {statusFlow[item.status]?.map((nextStatus) => (
                                    <button
                                      key={nextStatus}
                                      onClick={() => moveStatus(item.id, nextStatus)}
                                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-xs transition-all duration-200 cursor-pointer ${
                                        nextStatus === "SUCCESS"
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 active:bg-emerald-200"
                                          : nextStatus === "CANCELLED"
                                          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/80 active:bg-rose-200"
                                          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80 active:bg-amber-200"
                                      }`}
                                    >
                                      {nextStatus === "ON_GOING" && <><ChevronRight className="h-3 w-3 shrink-0" /> Start</>}
                                      {nextStatus === "SUCCESS" && <><Check className="h-3 w-3 shrink-0" /> Success</>}
                                      {nextStatus === "CANCELLED" && <><X className="h-3 w-3 shrink-0" /> Cancel</>}
                                      {nextStatus === "PIPELINE" && <><RotateCcw className="h-3 w-3 shrink-0" /> Reopen</>}
                                    </button>
                                  ))}
                                </div>
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

      {/* New Pipeline Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#ED1C24]">
                  <Target className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-[#161616]">New Pipeline</h2>
              </div>
              <button onClick={() => setShowNewForm(false)} className="text-[#8c8f93] hover:text-[#161616]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createPipeline} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#344054]">Startup</label>
                <select name="startupId" required className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]">
                  <option value="">Pilih startup</option>
                  {startupsData.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#344054]">Telkom Business Unit</label>
                <select name="telkomBuId" required className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]">
                  <option value="">Pilih BU</option>
                  {telkomBusData.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.name} — {bu.sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#344054]">Match Score (0-100)</label>
                <input type="number" name="matchScore" min="0" max="100" defaultValue={75}
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#344054]">Alasan Sinergi</label>
                <textarea name="reason" rows={3} placeholder="Deskripsi alasan kolaborasi..."
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary-solid flex-1 gap-2 py-2.5">
                  <Plus className="h-4 w-4" /> Create Pipeline
                </button>
                <button type="button" onClick={() => setShowNewForm(false)} className="btn-primary-outline px-6 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
