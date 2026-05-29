"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Briefcase, GitBranch, Rocket } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [selectedRole, setSelectedRole] = useState<"admin" | "synergy" | "founder">("admin");
  const [identifier, setIdentifier] = useState("940123");
  const [password, setPassword] = useState("admin123");

  const handleRoleSelect = (role: "admin" | "synergy" | "founder") => {
    setSelectedRole(role);
    if (role === "admin") {
      setIdentifier("940123");
      setPassword("admin123");
    } else if (role === "synergy") {
      setIdentifier("940789");
      setPassword("synergy123");
    } else if (role === "founder") {
      setIdentifier("850456");
      setPassword("founder123");
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 30%, #1e1136 0%, #0d0a1b 75%, #06040f 100%)' }}
    >
      {/* Background Hero Image with high visibility matching the landing page */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <img
          src="/hero-section.png"
          alt="Login Background Graphic"
          className="w-full h-full object-cover object-center opacity-95 brightness-[0.58]"
        />
        {/* Subtle fade to merge smoothly with the dark themed background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0a1b]/60" />
      </div>

      {/* Glow ambient spots */}
      <div className="absolute top-[20%] left-[20%] w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'rgba(124, 58, 237, 0.06)' }} />
      <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'rgba(237, 28, 36, 0.06)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6 text-center">
          <img
            src="/indigo-red.png"
            alt="Indigo Logo"
            className="mx-auto mb-3 h-12 w-auto object-contain brightness-110"
          />
          <p className="text-sm text-slate-300">AI Synergy & Risk Engine — Internal Platform</p>
        </div>

        <form action={action} className="card-legion space-y-5 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
          <div>
            <label className="mb-2.5 block text-xs font-bold text-[#344054] uppercase tracking-wider">
              Pilih Akses Akun Peran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "admin" as const,
                  label: "Executive",
                  icon: Briefcase,
                },
                {
                  id: "synergy" as const,
                  label: "Synergy",
                  icon: GitBranch,
                },
                {
                  id: "founder" as const,
                  label: "Founder",
                  icon: Rocket,
                },
              ].map((roleItem) => {
                const isActive = selectedRole === roleItem.id;
                const RoleIcon = roleItem.icon;
                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => handleRoleSelect(roleItem.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 group ${
                      isActive 
                        ? "bg-[#ED1C24] border-[#ED1C24] text-white shadow-md shadow-[#ED1C24]/20 scale-[1.03] font-bold" 
                        : "border-border text-[#525252] hover:bg-[#FEF2F2]/30 hover:border-[#ED1C24] hover:text-[#ED1C24] bg-white"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold mb-1.5 transition-colors duration-300 ${
                      isActive 
                        ? "bg-white text-[#ED1C24]" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-[#ED1C24]/10 group-hover:text-[#ED1C24]"
                    }`}>
                      <RoleIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] tracking-wide">{roleItem.label}</span>
                  </button>
                );
              })}
            </div>
            
            <p className="mt-3 text-[11px] text-slate-500 min-h-[32px] leading-relaxed">
              {selectedRole === "admin" && "💡 Akses penuh sebagai Telkom Executive untuk mengevaluasi portofolio startup, menganalisis risiko makro, dan sinergi."}
              {selectedRole === "synergy" && "💡 Akses sebagai Synergy Manager untuk mencocokkan dan mengelola alur kolaborasi startup × unit bisnis Telkom."}
              {selectedRole === "founder" && "💡 Akses sebagai Founder (Mitra Startup) untuk mengunggah laporan bulanan, memantau skor kesehatan, dan forecast."}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-[#344054]">
                Nomor Induk Karyawan (NIK) / Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIK Anda"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-[#8c8f93] focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none transition-all"
              />
              {state?.errors?.identifier && <p className="mt-1 text-xs text-red-500">{state.errors.identifier[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#344054]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-[#8c8f93] focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none transition-all"
              />
              {state?.errors?.password && <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>}
            </div>
          </div>

          {state?.message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary-solid w-full justify-center py-2.5 text-sm font-bold shadow-lg shadow-[#ED1C24]/10 hover:scale-[1.01] active:scale-95 transition-all"
          >
            {pending ? "Memproses Masuk..." : `Masuk sebagai ${selectedRole === "admin" ? "Executive" : selectedRole === "synergy" ? "Synergy Manager" : "Founder"}`}
          </button>

          <p className="text-center text-xs text-[#8c8f93]">
            Akun dikelola oleh sistem. Anda dapat mengubah NIK/Password di atas jika menggunakan akun lain.
          </p>
        </form>
      </div>
    </div>
  );
}
