"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Bot, User, Send, Sparkles, BookOpen, TrendingUp, Shield, Lightbulb } from "lucide-react";

type UserInfo = { name: string; email: string; role: string; userId?: string };

// Mock Maps
const founderStartupMap: Record<string, string[]> = {
  "demo-founder-id": ["s3"],
};

// Mock evaluation context for the mentor to reference
const mockEvaluationContext = {
  startupId: "s3",
  startupName: "Verihubs",
  healthScore: 94,
  riskLabel: "LOW_RISK",
  month: "Mei 2026",
  summaryPoints: [
    "Volume verifikasi API meningkat tajam dengan tingkat keberhasilan (True Acceptance Rate) mencapai 99.8%.",
    "SLA Uptime sistem sangat stabil di angka 99.99%, memenuhi standar perbankan tier-1.",
    "Rencana integrasi dengan ekosistem enterprise berpotensi melipatgandakan hit rate API harian.",
  ],
};

// Pre-defined quick prompt suggestions
const quickPrompts = [
  { icon: TrendingUp, label: "Strategi pertumbuhan", prompt: "Apa strategi pertumbuhan yang direkomendasikan berdasarkan evaluasi terakhir saya?" },
  { icon: Shield, label: "Mitigasi risiko", prompt: "Apa potensi risiko utama yang perlu saya waspadai dan bagaimana mitigasinya?" },
  { icon: Lightbulb, label: "Peluang sinergi", prompt: "Bagaimana cara memaksimalkan peluang sinergi dengan Telkom Group?" },
  { icon: BookOpen, label: "Tips fundraising", prompt: "Apa yang harus saya siapkan untuk presentasi di hadapan investor Telkom?" },
];

// Mock AI responses based on keywords
const mockResponses: Record<string, string> = {
  "pertumbuhan": "Berdasarkan evaluasi terakhir Verihubs, volume verifikasi API Anda sudah stabil. Saya merekomendasikan tiga langkah strategis:\n\n1. **Ekspansi Sektoral** — Perluas layanan dari perbankan ke sektor telco dan e-commerce yang juga membutuhkan e-KYC kuat.\n2. **Kemitraan Distribusi** — Jajaki integrasi dengan penyedia gateway pembayaran sebagai layanan bundling.\n3. **Optimasi Model AI** — Terus latih model Liveness Detection untuk menekan angka spoofing attack yang semakin canggih.",
  "risiko": "Berdasarkan profil risiko Verihubs saat ini (Health Score 94, Low Risk), area yang perlu diwaspadai:\n\n1. **Risiko Keamanan Data** — Pastikan sertifikasi ISO 27001 dan audit pentest rutin dilakukan mengingat data biometrik yang dikelola sangat sensitif.\n2. **Risiko Infrastruktur** — Skalabilitas server perlu ditingkatkan seiring dengan lonjakan request API dari klien enterprise.\n3. **Ketergantungan Vendor** — Diversifikasi penyedia cloud untuk menghindari single point of failure dan menjaga SLA 99.99%.",
  "sinergi": "Peluang sinergi Verihubs dengan ekosistem Telkom Group sangat menjanjikan:\n\n1. **Telkomsel (Match Score: 95%)** — Integrasi layanan verifikasi identitas untuk proses registrasi nomor prabayar (Prepaid) dan layanan finansial Telkomsel.\n2. **LinkAja** — Penguatan proses e-KYC untuk meminimalisir akun palsu dan fraud transaksi.\n3. **Telkom Data Ekosistem** — Pemanfaatan infrastruktur data center lokal (NeutraDC) untuk compliance regulasi penyimpanan data BSSN.\n\nRekomendasi: Mulai dengan PoC (Proof of Concept) bersama Telkomsel di Q3 2026.",
  "fundraising": "Untuk presentasi di hadapan investor Telkom, persiapkan hal berikut:\n\n1. **Metrik Kunci** — Highlight API Uptime 99.99%, FAR (False Acceptance Rate) < 0.01%, dan pertumbuhan klien B2B yang konsisten.\n2. **Traksi Sinergi** — Tunjukkan pipeline integrasi dengan Telkomsel dan potensi penghematan biaya e-KYC bagi seluruh ekosistem BUMN.\n3. **Roadmap Teknologi** — Presentasikan keunggulan proprietary AI engine Anda sebagai competitive moat.\n4. **Ask yang Jelas** — Tentukan jumlah dana yang dibutuhkan, penggunaan dana (R&D AI, expansion, hiring), dan milestone 12 bulan ke depan.",
  "default": "Terima kasih atas pertanyaan Anda. Berdasarkan evaluasi AI terakhir Verihubs (Health Score: 94, Low Risk), performa startup Anda sangat baik. SLA terjaga di angka 99.99% dan teknologi biometrik proprietary menjadi keunggulan kompetitif yang signifikan.\n\nSaya merekomendasikan untuk fokus pada tiga hal: (1) eksplorasi use-case baru di luar sektor finansial, (2) percepatan integrasi dengan Telkomsel, dan (3) penguatan sertifikasi keamanan data (compliance).\n\nApakah ada topik spesifik yang ingin Anda dalami lebih lanjut?",
};

function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("pertumbuhan") || lower.includes("growth") || lower.includes("tumbuh") || lower.includes("strategi pertumbuhan")) {
    return mockResponses["pertumbuhan"];
  }
  if (lower.includes("risiko") || lower.includes("risk") || lower.includes("mitigasi") || lower.includes("waspadai")) {
    return mockResponses["risiko"];
  }
  if (lower.includes("sinergi") || lower.includes("synergy") || lower.includes("telkom") || lower.includes("kolaborasi") || lower.includes("peluang sinergi")) {
    return mockResponses["sinergi"];
  }
  if (lower.includes("fundrais") || lower.includes("investor") || lower.includes("presentasi") || lower.includes("dana") || lower.includes("pitch")) {
    return mockResponses["fundraising"];
  }
  return mockResponses["default"];
}

export default function MentorPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [startupName, setStartupName] = useState("Verihubs");

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    {
      role: "ai",
      content: `Halo! Saya AI Mentor Anda di program Indigo by Telkom. 👋\n\nSaya telah menganalisis evaluasi terakhir **${mockEvaluationContext.startupName}** (Health Score: ${mockEvaluationContext.healthScore}%, ${mockEvaluationContext.riskLabel === "LOW_RISK" ? "Low Risk" : "At Risk"}).\n\nBerikut ringkasan:\n• ${mockEvaluationContext.summaryPoints[0]}\n• ${mockEvaluationContext.summaryPoints[1]}\n• ${mockEvaluationContext.summaryPoints[2]}\n\nSilakan tanyakan apa saja — mulai dari strategi pertumbuhan, mitigasi risiko, peluang sinergi Telkom, hingga persiapan fundraising.`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/auth/me").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/startups").then((res) => (res.ok ? res.json() : []))
    ])
      .then(([userData, fetchedStartups]) => {
        if (userData?.user) {
          setUser(userData.user);
          if (userData.user.role === "founder" && userData.user.userId) {
            const myIds = founderStartupMap[userData.user.userId] || ["s3"];
            const startup = fetchedStartups.find((s: any) => myIds.includes(s.id));
            if (startup) setStartupName(startup.name);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || isChatLoading) return;

    setChatMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");
    setIsChatLoading(true);

    setTimeout(() => {
      const response = getAIResponse(text);
      setChatMessages((prev) => [...prev, { role: "ai", content: response }]);
      setIsChatLoading(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50/50">
        {/* Fixed Header Bar */}
        <div className="border-b bg-white px-8 py-5 shadow-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-[#ED1C24]" />
                <h1 className="text-2xl font-bold text-[#161616]">AI Mentor</h1>
              </div>
              <p className="mt-1 text-sm text-[#667085]">
                Konsultasi strategi bisnis dengan AI berdasarkan evaluasi dan data startup Anda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600">Online</span>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                        msg.role === "user"
                          ? "bg-[#ED1C24] text-white"
                          : "bg-[#161616] text-white"
                      }`}
                    >
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#ED1C24] text-white rounded-tr-sm shadow-md shadow-red-500/15"
                          : "bg-white border border-[#e0e0e0] text-[#344054] rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} className={msg.role === "user" ? "text-white" : "text-[#161616]"}>
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#161616] text-white flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl px-5 py-4 bg-white border border-[#e0e0e0] rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Quick Prompts (shown only when few messages) */}
            {chatMessages.length <= 1 && (
              <div className="border-t border-[#f2f4f7] bg-[#fafbfc] px-6 py-4">
                <div className="mx-auto max-w-3xl">
                  <p className="text-xs font-semibold text-[#8c8f93] uppercase tracking-wider mb-3">Mulai dengan topik populer</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((qp, i) => {
                      const Icon = qp.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(qp.prompt)}
                          className="flex items-center gap-3 rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 text-left transition-all hover:border-red-300 hover:shadow-sm hover:bg-red-50/30 group cursor-pointer"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#ED1C24] group-hover:bg-red-100 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-[#344054] group-hover:text-red-700 transition-colors">{qp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-[#e0e0e0] bg-white px-6 py-4">
              <form onSubmit={handleSubmit} className="mx-auto max-w-3xl flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-[#f8fafc] px-4 py-2.5 focus-within:border-[#ED1C24] focus-within:ring-2 focus-within:ring-red-100 transition-all">
                  <Sparkles className="h-4 w-4 text-red-400 shrink-0" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan strategi, risiko, peluang sinergi, atau tips fundraising..."
                    className="flex-1 bg-transparent text-sm text-[#344054] placeholder:text-[#a1a1aa] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="h-11 w-11 shrink-0 rounded-xl bg-[#ED1C24] text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-red-500/20 cursor-pointer"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
              <p className="mx-auto max-w-3xl mt-2 text-[10px] text-[#a1a1aa] text-center">
                AI Mentor menghasilkan rekomendasi berdasarkan data evaluasi {startupName}. Selalu verifikasi dengan tim Anda sebelum mengambil keputusan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
