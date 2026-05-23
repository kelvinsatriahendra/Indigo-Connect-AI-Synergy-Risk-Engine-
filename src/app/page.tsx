import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-white p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1 text-sm text-slate-300">
          Indigo by Telkom Indonesia
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Indigo Connect
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI Synergy & Risk Engine
          </span>
        </h1>

        <p className="text-lg text-slate-400">
          Executive Analytics Dashboard untuk evaluasi kesehatan bisnis startup,
          deteksi risiko otomatis, dan rekomendasi sinergi dengan unit bisnis Telkom Group.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-8 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
          >
            Buka Dashboard
          </Link>
          <Link
            href="/startups"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-700 px-8 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Lihat Startup
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-3xl w-full">
        {[
          { title: "Health Score", desc: "Evaluasi otomatis kesehatan bisnis startup dengan AI" },
          { title: "Risk Detection", desc: "Deteksi dini startup at risk sebelum terlambat" },
          { title: "Synergy Match", desc: "Rekomendasi unit bisnis Telkom untuk kolaborasi" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
