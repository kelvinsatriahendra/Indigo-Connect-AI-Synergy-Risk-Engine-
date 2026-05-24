"use client";

import { useActionState } from "react";
import { login, loginAsDemo } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 30%, #1e1136 0%, #0d0a1b 75%, #06040f 100%)' }}
    >
      {/* Glow ambient spots */}
      <div className="absolute top-[20%] left-[20%] w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'rgba(124, 58, 237, 0.06)' }} />
      <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'rgba(237, 28, 36, 0.06)' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-8 text-center">
          <img
            src="/indigo-red.png"
            alt="Indigo Logo"
            className="mx-auto mb-4 h-12 w-auto object-contain brightness-110"
          />
          <p className="text-sm text-slate-300">AI Synergy & Risk Engine — Internal Platform</p>
        </div>

        <form action={action} className="card-legion space-y-5 p-6">
          <div>
            <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-[#344054]">
              Nomor Induk Karyawan (NIK)
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="Masukkan NIK Anda"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#161616] placeholder:text-[#8c8f93] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
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
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#161616] placeholder:text-[#8c8f93] focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24]"
            />
            {state?.errors?.password && <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>}
          </div>

          {state?.message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary-solid w-full justify-center py-2.5 text-sm"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e0e0e0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#8c8f93]">atau masuk sebagai demo</span>
            </div>
          </div>

          {/* Demo Quick Login Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => loginAsDemo("admin")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-[#FEF2F2] hover:border-[#ED1C24] hover:text-[#ED1C24]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#ED1C24] text-[10px] font-bold text-white">A</span>
              Telkom Executive — NIK 940123
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo("synergy")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-[#fffbeb] hover:border-[#d97706] hover:text-[#d97706]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#d97706] text-[10px] font-bold text-white">S</span>
              Synergy Manager — NIK 940789
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo("founder")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f0f9ff] hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#2563eb] text-[10px] font-bold text-white">F</span>
              Mitra Startup — NIK 850456
            </button>
          </div>

          <p className="text-center text-xs text-[#8c8f93]">
            Akun dikelola oleh administrator sistem.
          </p>
        </form>
      </div>
    </div>
  );
}
