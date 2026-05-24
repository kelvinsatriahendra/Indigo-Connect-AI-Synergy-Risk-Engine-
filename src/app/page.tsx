import Link from "next/link";
import { getSession } from "@/lib/dal";
import { BarChart3, Shield, GitBranch, FileText, Lightbulb, Activity } from "lucide-react";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ED1C24] text-xs font-bold text-white">
            IC
          </div>
          <span className="text-sm font-bold text-[#161616]">Indigo Connect</span>
        </Link>
        <div className="flex items-center gap-4">
          {session?.userId ? (
            <Link href="/dashboard" className="btn-primary-solid text-sm px-5 py-2">
              Buka Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-primary-solid text-sm px-5 py-2">
              Masuk
            </Link>
          )}
        </div>
      </header>

      <section className="gradient-hero pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-1 text-sm text-[#667085] mb-6">
            Indigo by Telkom Indonesia
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#161616] sm:text-5xl lg:text-6xl">
            Indigo Connect
          </h1>
          <p className="mt-3 text-2xl font-semibold text-[#ED1C24] sm:text-3xl">
            AI Synergy & Risk Engine
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#525252]">
            Executive Analytics Dashboard untuk evaluasi kesehatan bisnis startup,
            deteksi risiko otomatis, dan rekomendasi sinergi dengan unit bisnis Telkom Group.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {session?.userId ? (
              <>
                <Link href="/dashboard" className="btn-primary-solid text-sm px-8 py-3">
                  Buka Dashboard
                </Link>
                <Link href="/reports" className="btn-primary-outline text-sm px-8 py-3">
                  AI Evaluation
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary-solid text-sm px-8 py-3">
                Masuk ke Platform
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-[#161616]">What is Indigo Connect?</h2>
            <p className="mt-2 text-[#525252]">AI-powered platform untuk monitoring dan sinergi startup</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Health Evaluator",
                desc: "Evaluasi otomatis kesehatan bisnis startup dengan AI. Dapatkan health score, sentiment analysis, dan risk label real-time.",
                color: "bg-[#FEF2F2] text-[#ED1C24]",
              },
              {
                icon: GitBranch,
                title: "Synergy Matcher",
                desc: "Temukan unit bisnis Telkom yang paling cocok untuk kolaborasi. AI mencocokkan berdasarkan profil dan kebutuhan startup.",
                color: "bg-[#f0f9ff] text-[#2563eb]",
              },
              {
                icon: Shield,
                title: "Risk Detection",
                desc: "Deteksi dini startup at risk dengan analisis sentimen dan operational status. Ambil tindakan sebelum terlambat.",
                color: "bg-[#fef2f2] text-[#dc2626]",
              },
              {
                icon: FileText,
                title: "Executive Summary",
                desc: "Ringkasan eksekutif otomatis dari laporan bulanan startup. Tiga poin singkat untuk keputusan cepat.",
                color: "bg-[#f0fdf4] text-[#16a34a]",
              },
              {
                icon: Lightbulb,
                title: "AI Insights",
                desc: "Wawasan cerdas dari data startup. Dapatkan rekomendasi strategis berbasis AI untuk pertumbuhan bisnis.",
                color: "bg-[#fffbeb] text-[#d97706]",
              },
              {
                icon: Activity,
                title: "Forecasting",
                desc: "Prediksi pertumbuhan dan runway startup 3 bulan ke depan. Antisipasi tantangan dengan data-driven decisions.",
                color: "bg-[#f5f3ff] text-[#7c3aed]",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card-subtle p-8">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#474d66]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#8c8f93] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-[#161616]">Mulai Evaluasi Startup Anda</h2>
          <p className="mt-3 text-[#525252]">
            Gunakan AI untuk memonitor portofolio startup Indigo dan temukan peluang sinergi dengan Telkom Group.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {session?.userId ? (
              <>
                <Link href="/dashboard" className="btn-primary-solid text-sm px-8 py-3">
                  Dashboard
                </Link>
                <Link href="/reports" className="btn-primary-outline text-sm px-8 py-3">
                  Submit Report
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary-solid text-sm px-8 py-3">
                Masuk ke Platform
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-[#8c8f93]">
          <p>&copy; 2026 Indigo by Telkom Indonesia</p>
          <p>AI Synergy & Risk Engine</p>
        </div>
      </footer>
    </div>
  );
}
