import Link from "next/link";
import { getSession } from "@/lib/dal";
import { GitBranch, FileText, Activity } from "lucide-react";

const PARTNERS = [
  { name: "MDI Ventures", logo: "/partners/mdi-ventures.jpeg" },
  { name: "Agate", logo: "/partners/agate.jpeg" },
  { name: "Angin", logo: "/partners/angin.jpeg" },
  { name: "DKK Consulting", logo: "/partners/dkk-consulting.jpeg" },
  { name: "Zoho", logo: "/partners/zoho.jpeg" }
];

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/indigo-red.png"
            alt="Indigo Logo"
            className="h-8 w-auto object-contain"
          />
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

      <section className="gradient-hero relative overflow-hidden flex flex-col justify-center min-h-[85vh] pt-24 pb-28 px-6 text-white">
        {/* Glow ambient spots */}
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(237, 28, 36, 0.08)' }} />

        {/* Decorative Swooping Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          {/* Left side swooping curves */}
          <path d="M-50,220 C120,250 180,420 60,520" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
          <path d="M-20,270 C100,290 140,370 140,470" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          
          {/* Right side swooping curves */}
          <path d="M1500,80 C1280,130 1080,280 1280,430" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M1400,60 C1130,180 1130,430 1330,580" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
          <path d="M1230,280 C1080,380 1130,530 1280,630" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Circular Startup & Collaboration Images (Matching Mockup) */}
        {/* Left Side Circles */}
        <div className="hidden lg:block absolute left-[-40px] top-[22%] w-[180px] h-[180px] rounded-full border border-white/20 overflow-hidden shadow-2xl shadow-indigo-500/10 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
            alt="Startup Team"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>
        <div className="hidden lg:block absolute left-[8%] bottom-[12%] w-[110px] h-[110px] rounded-full border border-white/20 overflow-hidden shadow-2xl pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=300&q=80"
            alt="Pitch Session"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>

        {/* Right Side Circles */}
        <div className="hidden lg:block absolute right-[-30px] top-[14%] w-[130px] h-[130px] rounded-full border border-white/20 overflow-hidden shadow-2xl pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80"
            alt="Collaboration Space"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>
        <div className="hidden lg:block absolute right-[3%] bottom-[10%] w-[190px] h-[190px] rounded-full border border-white/20 overflow-hidden shadow-2xl pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=400&q=80"
            alt="Executive Meeting"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>

        <div className="relative z-20 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-md mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24] animate-pulse" />
            Indigo by Telkom Indonesia
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Indigo Connect
          </h1>
          <p className="mt-3 text-2xl font-bold text-[#ED1C24] sm:text-3xl tracking-wide drop-shadow-sm">
            AI Synergy & Risk Engine
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
            Executive Analytics Dashboard untuk evaluasi kesehatan bisnis startup,
            deteksi risiko otomatis, dan rekomendasi sinergi dengan unit bisnis Telkom Group.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {session?.userId ? (
              <>
                <Link href="/dashboard" className="btn-primary-solid text-sm px-8 py-3 shadow-lg shadow-[#ED1C24]/20 hover:scale-[1.02] transition-transform">
                  Buka Dashboard
                </Link>
                <Link href="/reports" className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-8 py-3 transition-all hover:scale-[1.02]">
                  AI Evaluation
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary-solid text-sm px-8 py-3 shadow-lg shadow-[#ED1C24]/20 hover:scale-[1.02] transition-transform">
                Masuk ke Platform
              </Link>
            )}
          </div>
        </div>

        {/* Concave Curved Separation Shape at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[80px] text-white fill-current">
            <path d="M0,40 C480,120 960,120 1440,40 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Partner Pendukung Program Indigo
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:gap-x-8">
            {PARTNERS.map((partner) => (
              <div 
                key={partner.name} 
                className="group relative flex items-center justify-center h-12 w-32 md:h-16 md:w-44 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  title={partner.name}
                  className="max-h-full max-w-full object-contain filter transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#f9fafb]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-[#ED1C24] uppercase tracking-wider">Features</span>
            <h2 className="text-3xl font-extrabold text-[#161616] mt-2">What is Indigo Connect?</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">AI-powered platform untuk monitoring, deteksi risiko, dan sinergi portofolio startup</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Health Evaluator",
                desc: "Evaluasi otomatis kesehatan bisnis startup dengan AI. Dapatkan health score, sentiment analysis, dan risk label real-time.",
                imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
              },
              {
                title: "Synergy Matcher",
                desc: "Temukan unit bisnis Telkom yang paling cocok untuk kolaborasi. AI mencocokkan berdasarkan profil dan kebutuhan startup.",
                imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80",
              },
              {
                title: "Risk Detection",
                desc: "Deteksi dini startup at risk dengan analisis sentimen dan operational status. Ambil tindakan sebelum terlambat.",
                imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
              },
              {
                title: "Executive Summary",
                desc: "Ringkasan eksekutif otomatis dari laporan bulanan startup. Tiga poin singkat untuk keputusan cepat.",
                imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
              },
              {
                title: "AI Insights",
                desc: "Wawasan cerdas dari data startup. Dapatkan rekomendasi strategis berbasis AI untuk pertumbuhan bisnis.",
                imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
              },
              {
                title: "Forecasting",
                desc: "Prediksi pertumbuhan dan runway startup 3 bulan ke depan. Antisipasi tantangan dengan data-driven decisions.",
                imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
              },
            ].map((item) => {
              return (
                <div key={item.title} className="relative overflow-hidden rounded-2xl bg-[#131722] border border-white/5 shadow-xl group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col h-[350px]">
                  {/* Top Image with Gradient Transition */}
                  <div className="relative h-[180px] w-full overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {/* Gradient Overlay fading to dark background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-[#131722]/40 to-transparent" />
                  </div>

                  {/* Content section */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-[#ED1C24] uppercase tracking-wider">Alur Kerja</span>
            <h2 className="text-3xl font-extrabold text-[#161616] mt-2">Bagaimana Indigo Connect Bekerja?</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">Tiga langkah sederhana menuju sinergi startup dan korporasi yang digerakkan oleh AI.</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#ED1C24]/10 via-[#ED1C24]/40 to-[#ED1C24]/10" />
            
            {[
              {
                step: "01",
                title: "Founder Submit Laporan",
                desc: "Founder mengunggah laporan bulanan (PDF) secara berkala ke dalam platform.",
                icon: <FileText className="h-6 w-6 text-[#ED1C24]" />
              },
              {
                step: "02",
                title: "AI Menganalisis Risiko",
                desc: "Engine AI mengekstraksi data, menilai kesehatan finansial, dan mendeteksi risiko dini.",
                icon: <Activity className="h-6 w-6 text-[#ED1C24]" />
              },
              {
                step: "03",
                title: "Rekomendasi Sinergi",
                desc: "Eksekutif menerima Executive Summary dan rekomendasi unit bisnis Telkom yang pas.",
                icon: <GitBranch className="h-6 w-6 text-[#ED1C24]" />
              }
            ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center group">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-slate-50 shadow-xl shadow-slate-200/50 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    {s.icon}
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-300 mb-2 uppercase tracking-widest">Langkah {s.step}</div>
                <h3 className="text-lg font-bold text-[#161616] mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[250px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#800a28] py-16 px-6">
        {/* Curved abstract background graphics in Telkom Indigo branding style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <svg className="absolute right-[-10%] top-[-20%] h-[150%] w-auto text-white" viewBox="0 0 500 200" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M150,-50 C250,50 350,50 450,-50" strokeWidth="6" />
            <path d="M100,-10 C220,110 320,110 440,-10" strokeWidth="4" />
            <path d="M50,30 C200,200 300,200 450,30" strokeWidth="2" strokeDasharray="10 5" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-wide">Mulai Evaluasi Startup Anda</h2>
            <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
              Gunakan AI untuk memonitor portofolio startup Indigo dan temukan peluang sinergi dengan Telkom Group.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            {session?.userId ? (
              <>
                <Link href="/reports" className="w-full sm:w-auto text-center border border-white hover:bg-white/10 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 transition-all duration-200">
                  Submit Report
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto text-center bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 transition-all duration-200">
                  Buka Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full sm:w-auto text-center border border-white hover:bg-white/10 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 transition-all duration-200">
                  Buka Demo
                </Link>
                <Link href="/login" className="w-full sm:w-auto text-center bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 transition-all duration-200">
                  Masuk ke Platform
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#111625] text-slate-400 px-6 py-10 border-t border-white/5">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <img src="/indigo-red.png" alt="Indigo Logo" className="h-6 w-auto object-contain brightness-110" />
            <span className="text-white/20 hidden sm:inline">|</span>
            <p>&copy; 2026 Indigo by Telkom Indonesia</p>
          </div>
          <p className="text-slate-500 font-medium">AI Synergy & Risk Engine</p>
        </div>
      </footer>
    </div>
  );
}
