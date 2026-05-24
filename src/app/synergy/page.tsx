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
                        return (
                          <div key={item.id} className="card-legion overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#161616] truncate">{getStartupName(item.startupId)}</p>
                                  <p className="text-xs text-[#667085] truncate">{getBuName(item.telkomBuId)}</p>
                                </div>
                                <span className="ml-2 shrink-0 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#ED1C24]">
                                  {Math.round(item.matchScore * 100)}%
                                </span>
                              </div>

                              <p className="mt-2 text-xs text-[#525252] leading-relaxed line-clamp-2">{item.reason}</p>

                              {/* Notes section */}
                              {editingNotes === item.id ? (
                                <div className="mt-3 space-y-2">
                                  <textarea
                                    className="w-full rounded-lg border border-[#e0e0e0] bg-white p-2 text-xs text-[#344054] resize-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
                                    rows={3}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Tambah notes..."
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => saveNotes(item.id)} className="btn-primary-solid px-3 py-1 text-xs">Save</button>
                                    <button onClick={() => setEditingNotes(null)} className="btn-primary-outline px-3 py-1 text-xs">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                item.notes && (
                                  <div className="mt-3 rounded-lg bg-[#f2f4f7] p-2.5">
                                    <p className="text-xs text-[#525252]">{item.notes}</p>
                                  </div>
                                )
                              )}

                              {/* Meta */}
                              <div className="mt-3 flex items-center gap-3 text-[10px] text-[#8c8f93]">
                                {item.assignedTo && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" /> {item.assignedTo}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-3 flex items-center gap-1.5 border-t border-[#f2f4f7] pt-3">
                                {!item.notes && !editingNotes && (
                                  <button
                                    onClick={() => { setEditingNotes(item.id); setNoteText(""); }}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#667085] hover:bg-[#f2f4f7] transition-colors"
                                  >
                                    <MessageSquare className="h-3 w-3" /> Notes
                                  </button>
                                )}

                                {statusFlow[item.status]?.map((nextStatus) => (
                                  <button
                                    key={nextStatus}
                                    onClick={() => moveStatus(item.id, nextStatus)}
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                                      nextStatus === "SUCCESS"
                                        ? "text-emerald-600 hover:bg-emerald-50"
                                        : nextStatus === "CANCELLED"
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-[#ED1C24] hover:bg-[#FEF2F2]"
                                    }`}
                                  >
                                    {nextStatus === "ON_GOING" && <><ChevronRight className="h-3 w-3" /> Start</>}
                                    {nextStatus === "SUCCESS" && <><Check className="h-3 w-3" /> Success</>}
                                    {nextStatus === "CANCELLED" && <><X className="h-3 w-3" /> Cancel</>}
                                    {nextStatus === "PIPELINE" && <><RotateCcw className="h-3 w-3" /> Reopen</>}
                                  </button>
                                ))}
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
