"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row bg-background print:bg-white overflow-hidden">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shrink-0 relative z-20 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]"></span>
            Indigo Connect
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 relative print:ml-0 print:w-full print:bg-white overflow-hidden">
        {children}
      </main>
    </div>
  );
}
