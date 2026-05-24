"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  BarChart3,
  Shield,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "AI Evaluation", icon: FileText },
  { href: "/startups", label: "Startups", icon: BarChart3 },
  { href: "/synergy", label: "Synergy Pipeline", icon: GitBranch },
  { href: "/forecast", label: "Forecast", icon: Shield },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/alerts?unread=true")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setUnreadCount(data.alerts.length);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#875bf7] text-xs font-bold text-white">
          IC
        </div>
        <div>
          <p className="text-sm font-bold text-[#161616]">Indigo Connect</p>
          <p className="text-[10px] font-medium text-[#8c8f93]">AI Synergy & Risk Engine</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.href === "/alerts" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#f4f2fc] text-[#875bf7]"
                  : "text-[#5c5e61] hover:bg-[#f7f8f9] hover:text-[#161616]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              {isActive && !showBadge && (
                <span className="h-2 w-2 rounded-full bg-[#875bf7]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f7] text-xs font-semibold text-[#344054]">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#161616] truncate">Telkom Indonesia</p>
            <p className="text-xs text-[#8c8f93]">Indigo Incubator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
