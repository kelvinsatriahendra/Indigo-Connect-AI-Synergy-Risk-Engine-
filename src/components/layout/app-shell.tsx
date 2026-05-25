import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f4f4] print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <main className="ml-64 flex-1 print:ml-0 print:w-full print:bg-white">
        {children}
      </main>
    </div>
  );
}
