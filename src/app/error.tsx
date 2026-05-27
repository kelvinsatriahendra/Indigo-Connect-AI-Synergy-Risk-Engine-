"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-sm ring-8 ring-red-50">
          <AlertCircle className="h-10 w-10 text-[#ED1C24]" />
        </div>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-[#161616]">
          Ups, terjadi kesalahan sistem!
        </h1>
        <p className="mb-8 max-w-md text-sm text-[#667085] leading-relaxed">
          Kami mendeteksi adanya error pada aplikasi. {error.message ? `(${error.message})` : "Mohon muat ulang halaman ini atau coba beberapa saat lagi."}
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary-solid gap-2 px-8 py-3 text-sm shadow-md"
        >
          <RefreshCw className="h-4 w-4" /> Muat Ulang Halaman
        </button>
      </div>
    </AppShell>
  );
}
