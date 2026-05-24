"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import startupsData from "@/data/startups.json";
import { Bell, AlertTriangle, TrendingUp, CalendarClock, CheckCheck } from "lucide-react";

interface Alert {
  id: string;
  type: "RISK" | "MILESTONE" | "REMINDER";
  title: string;
  message: string;
  startupId: string | null;
  severity: "high" | "medium" | "low";
  read: boolean;
  createdAt: string;
}

const severityStyles: Record<string, string> = {
  high: "border-l-red-500 bg-red-50/50",
  medium: "border-l-amber-500 bg-amber-50/50",
  low: "border-l-emerald-500 bg-emerald-50/50",
};

const typeIcons = {
  RISK: AlertTriangle,
  MILESTONE: TrendingUp,
  REMINDER: CalendarClock,
} as const;

const typeColors: Record<string, string> = {
  RISK: "bg-red-50 text-red-600",
  MILESTONE: "bg-emerald-50 text-emerald-600",
  REMINDER: "bg-amber-50 text-amber-600",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?type=${filter}` : "";
      const res = await fetch(`/api/alerts${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const markRead = async (id: string) => {
    const res = await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    if (res.ok) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllRead = async () => {
    const unread = alerts.filter((a) => !a.read);
    await Promise.all(
      unread.map((a) =>
        fetch("/api/alerts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: a.id, read: true }),
        })
      )
    );
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const getStartupName = (id: string | null) =>
    id ? startupsData.find((s) => s.id === id)?.name || id : null;

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-[#ED1C24]" />
              <h1 className="text-2xl font-bold text-[#161616]">Alerts</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[#667085]">Notifikasi dan peringatan portofolio startup</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
            >
              <option value="all">Semua Tipe</option>
              <option value="RISK">Risk</option>
              <option value="MILESTONE">Milestone</option>
              <option value="REMINDER">Reminder</option>
            </select>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-primary-outline gap-2 px-4 py-2 text-sm">
                <CheckCheck className="h-4 w-4" /> Mark All Read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="card-legion flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ED1C24] border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="card-legion flex flex-col items-center justify-center py-20">
            <Bell className="mb-3 h-12 w-12 text-[#d0d5dd]" />
            <p className="text-sm font-medium text-[#667085]">Tidak ada alert</p>
            <p className="mt-1 text-xs text-[#8c8f93]">Semua notifikasi sudah dibaca</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = typeIcons[alert.type];
              const startupName = getStartupName(alert.startupId);
              return (
                <div
                  key={alert.id}
                  className={`card-legion border-l-4 ${severityStyles[alert.severity]} ${alert.read ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start gap-4 p-5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[alert.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#161616]">{alert.title}</h3>
                          {startupName && (
                            <span className="mt-0.5 inline-flex items-center rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-medium text-[#ED1C24]">
                              {startupName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#8c8f93]">
                            {new Date(alert.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          {!alert.read && (
                            <button
                              onClick={() => markRead(alert.id)}
                              className="rounded-md px-2 py-1 text-[10px] font-medium text-[#ED1C24] hover:bg-[#FEF2F2] transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-[#525252] leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
