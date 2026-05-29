"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  BarChart3,
  Shield,
  Bell,
  LogOut,
  Bot,
} from "lucide-react";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "synergy", "founder"] },
  { href: "/reports", label: "AI Evaluation", icon: FileText, roles: ["admin", "synergy", "founder"] },
  { href: "/startups", label: "Startups", icon: BarChart3, roles: ["admin"] },
  { href: "/synergy", label: "Synergy Pipeline", icon: GitBranch, roles: ["admin", "synergy"] },
  { href: "/forecast", label: "Forecast", icon: Shield, roles: ["admin", "founder"] },
  { href: "/mentor", label: "AI Mentor", icon: Bot, roles: ["founder"] },
  { href: "/alerts", label: "Alerts", icon: Bell, roles: ["admin", "synergy"] },
];

// Role display labels
const roleLabels: Record<string, string> = {
  admin: "Telkom Executive",
  synergy: "Synergy Manager",
  founder: "Mitra Startup",
};

// Role badge colors in dark mode (translucent background, light border)
const roleBadgeColors: Record<string, string> = {
  admin: "bg-[#ED1C24]/15 text-[#ED1C24] border border-[#ED1C24]/30",
  synergy: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  founder: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/alerts?unread=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUnreadCount(data.alerts.length);
      })
      .catch(() => { });

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => { });
  }, [pathname]);

  const handleLogout = async () => {
    const { logout } = await import("@/app/actions/auth");
    await logout();
  };

  // Filter nav items based on user role
  const navItems = user
    ? allNavItems.filter((item) => item.roles.includes(user.role))
    : allNavItems;

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 text-white"
      style={{ background: 'radial-gradient(circle at 50% 20%, #1e1136 0%, #0d0a1b 75%, #06040f 100%)' }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6 relative">
        <div className="h-8 w-24 relative">
          <Image
            src="/indigo-red.png"
            alt="Indigo Logo"
            fill
            className="object-contain brightness-110"
          />
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
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#ED1C24]" : "text-slate-400")} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ED1C24] px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              {isActive && !showBadge && (
                <span className="h-2 w-2 rounded-full bg-[#ED1C24]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-4 py-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
              roleBadgeColors[user.role] || "bg-[#ED1C24]/15 text-[#ED1C24] border border-[#ED1C24]/30"
            )}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
