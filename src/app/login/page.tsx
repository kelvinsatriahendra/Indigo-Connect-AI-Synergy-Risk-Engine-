"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f9] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#875bf7] text-lg font-bold text-white">
            IC
          </div>
          <h1 className="text-xl font-bold text-[#161616]">Masuk ke Indigo Connect</h1>
          <p className="mt-1 text-sm text-[#667085]">AI Synergy & Risk Engine</p>
        </div>

        <form action={action} className="card-legion space-y-5 p-6">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#344054]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#161616] placeholder:text-[#8c8f93] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
            />
            {state?.errors?.email && <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>}
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
              className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#161616] placeholder:text-[#8c8f93] focus:border-[#875bf7] focus:ring-1 focus:ring-[#875bf7]"
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

          <p className="text-center text-sm text-[#667085]">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-medium text-[#875bf7] hover:underline">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
