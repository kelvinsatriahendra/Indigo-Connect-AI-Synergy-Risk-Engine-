import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      <Sidebar />
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
}
