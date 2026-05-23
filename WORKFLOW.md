# Workflow Indigo Connect: AI Synergy & Risk Engine

## Alur Pengembangan

```
Opencode + GitHub → Deploy (Vercel/Azure)
     ↑
4 Orang Team (Kolaborasi)
```

---

## Pembagian Tim (4 Orang)

| Peran | Orang | Tugas |
|---|---|---|
| **Project Lead & AI Integration** | Anggota 1 | Koordinasi dengan opencode, setup AI (OpenRouter), testing, deployment |
| **Frontend Developer** | Anggota 2 | Implementasi UI components (Shadcn + Tailwind), integrasi halaman dengan API |
| **Backend Developer** | Anggota 3 | API Routes, database (Prisma + Supabase), logic bisnis, background jobs |
| **UI/UX Designer** | Anggota 4 | Desain antarmuka di Figma, design system, user experience, menyesuaikan dengan fitur |

---

## Siklus per Fitur (10 Fitur MVP)

```
┌──────────────────────────────────────────────────────────────────┐
│                   1 FITUR = 1 SIKLUS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tahap 1 — Perencanaan (semua anggota)                           │
│  ├── Tentukan fitur apa yang akan dibuat                         │
│  ├── Anggota 4 buat sketsa desain cepat di Figma                 │
│  └── Discusrsakan bersama                                        │
│                                                                   │
│  Tahap 2 — Implementasi (paralel)                                │
│  ├── Anggota 1: setup opencode, generate kode dari opencode      │
│  ├── Anggota 2: pasang UI components, styling halaman            │
│  ├── Anggota 3: buat API routes, update database, konek AI      │
│  └── Anggota 4: refine desain di Figma sesuai hasil jadi         │
│                                                                   │
│  Tahap 3 — Review (semua anggota)                                │
│  ├── npm run dev → preview di browser                            │
│  ├── Anggota 4: sesuaikan desain Figma agar match dengan hasil   │
│  ├── Ada revisi? ulang Tahap 2                                   │
│  └── Semua setuju? → git push                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Flow Detail per Role

### Anggota 1 (Project Lead) — Opencode Interface
```
1. Terima screenshot/desain dari Anggota 4
2. Kirim ke opencode → minta generate kode
3. Opencode keluarkan file:
   ├── page.tsx (halaman)
   ├── components/*.tsx (komponen)
   ├── app/api/*/route.ts (API endpoint)
   └── update prisma/schema.prisma (jika perlu)
4. Bagikan hasil ke Anggota 2 & 3 via GitHub
```

### Anggota 2 (Frontend Developer)
```
1. git pull (ambild code terbaru dari opencode)
2. Integrasi komponen Shadcn UI
3. Pasang chart (Recharts) untuk dashboard
4. Connect frontend ke API routes
5. npm run dev → testing tampilan
6. git add + commit + push
```

### Anggota 3 (Backend Developer)
```
1. git pull (ambild code dari opencode)
2. Setup Prisma schema & migration ke Supabase
3. Implementasi API routes & logic bisnis
4. Integrasi OpenRouter AI
5. Setup background jobs (email cron, forecasting)
6. git add + commit + push
```

### Anggota 4 (UI/UX Designer)
```
1. Lihat fitur yang akan dibuat
2. Buat desain di Figma (menyesuaikan kebutuhan)
3. Export screenshot & design tokens (warna, font, spacing)
4. Kirim ke Anggota 1 untuk di-generate opencode
5. Setelah jadi, refine desain agar match
```

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Bahasa** | TypeScript |
| **Frontend + Backend** | Next.js 14+ (App Router) |
| **Database** | Supabase (PostgreSQL via Prisma ORM) |
| **UI Components** | Tailwind CSS + Shadcn UI |
| **Chart** | Recharts |
| **AI Provider** | OpenRouter |
| **AI Model** | Gemini 1.5 Flash (gratis) |

---

## Alur Kolaborasi GitHub

```
ANGOTA 1 (opencode)           ANGGOTA 2 (frontend)         ANGGOTA 3 (backend)
       │                              │                           │
       ├── git push (generate) ──────►│                           │
       │                              ├── git pull               │
       │                              ├── integrasi UI           │
       │                              ├── git push ──────────────►│
       │                              │                           ├── git pull
       │                              │                           ├── buat API
       │                              │                           └── git push
       │◄─────────────────────────────┤                           │
       │◄─────────────────────────────┴───────────────────────────┤
       │                              │                           │
       └── git pull (semua code terbaru)                          │
       └── review & testing final                                  │
                                                                   │
ANGGOTA 4 (designer)                                              │
       │                                                           │
       └── Kirim desain ke Anggota 1 ──────────────────────────────┘
```

---

## Database

### 9 Tabel

```
User
├── id (UUID)
├── email, password_hash, name, role
└── Report, SynergyPipeline

Startup
├── id (UUID)
├── name, sector, batch, description
├── Report, SynergyPipeline, AlertLog, Forecast
└── HealthEvaluation (via Report)

Report
├── id (UUID)
├── startup_id, narrative_text, metrics (JSON)
├── HealthEvaluation (1:1)
├── ExecutiveSummary (1:1)
└── SynergyMatch (1:N)

TelkomBU
├── id (UUID)
├── name, description, keywords (JSON)
├── SynergyMatch
└── SynergyPipeline
```

### Relasi

```
User   ──1:N── Report
User   ──1:N── SynergyPipeline

Startup ──1:N── Report
Startup ──1:N── SynergyPipeline
Startup ──1:N── AlertLog
Startup ──1:N── Forecast

Report ──1:1── HealthEvaluation
Report ──1:1── ExecutiveSummary
Report ──1:N── SynergyMatch

TelkomBU ──1:N── SynergyMatch
TelkomBU ──1:N── SynergyPipeline
```

---

## Deployment

### Opsi 1: Vercel (Recommended untuk MVP — Gratis)

```
Git push → Vercel auto deploy → https://indigo-connect.vercel.app
```

**Setup:**
1. Push project ke GitHub
2. Buka vercel.com, import repository
3. Set environment variables:
   - `DATABASE_URL` (dari Supabase)
   - `OPENROUTER_API_KEY`
4. Selesai — auto deploy tiap kali push

### Opsi 2: Azure Container Apps (Enterprise)

```
Git push → build → push ACR → deploy ACA → Live
```

**Setup:**
1. Buat Dockerfile di root project
2. Build image: `docker build -t indigo-connect .`
3. Push ke Azure Container Registry
4. Deploy ke Azure Container Apps via portal / CLI

---

## Environment Variables

| Variable | Dari | Untuk |
|---|---|---|
| `DATABASE_URL` | Supabase (Project Settings → Database) | Koneksi ke PostgreSQL |
| `OPENROUTER_API_KEY` | openrouter.ai (buat akun gratis) | Akses AI model |

---

## Timeline (14 Hari Sprint)

| Hari | Aktifitas | PIC |
|---|---|---|
| 1 | Init project, setup Prisma + Supabase | Anggota 1 & 3 |
| 2 | Setup OpenRouter client + test API | Anggota 1 & 3 |
| 3-5 | Dashboard layout + chart (Recharts) | Anggota 2 + 4 (desain) |
| 5-7 | Health & Risk Evaluator + Summary Card | Anggota 1 & 3 |
| 7-9 | Synergy Matcher + Detail Startup | Anggota 2 & 3 |
| 9-10 | Filtering + Search + Export PDF | Anggota 2 & 3 |
| 10-12 | Kanban Pipeline + Email Alert + Forecasting | Anggota 3 & 1 |
| 12-14 | Deploy + Testing Final + Dokumentasi Skripsi | Semua anggota |

---

## 10 Fitur MVP

| # | Fitur | Type | PIC Utama |
|---|---|---|---|
| 1 | Executive Analytics Dashboard | Core | Anggota 2 |
| 2 | AI Health & Risk Evaluator | Core | Anggota 1 & 3 |
| 3 | Automated Telkom Synergy Matcher | Core | Anggota 3 |
| 4 | AI Executive Summary Card | Core | Anggota 1 |
| 5 | Reactive Multi-Variable Filtering | Core | Anggota 2 |
| 6 | Export Report to PDF | Bonus | Anggota 2 |
| 7 | Synergy Pipeline Tracker (Kanban) | Bonus | Anggota 2 & 3 |
| 8 | Automated Risk Email Alert | Bonus | Anggota 3 |
| 9 | Natural Language Search (AI Filter) | Bonus | Anggota 1 & 3 |
| 10 | AI Growth & Runway Forecasting | Bonus | Anggota 3 |

---

## Alur AI (OpenRouter → Gemini 1.5 Flash)

```
POST /api/ai/evaluate
├── Input:  narrative_text (laporan startup)
├── Model: google/gemini-1.5-flash
├── Output: { healthScore, riskLabel, sentimentScore }

POST /api/ai/synergy
├── Input:  product_keywords + daftar Telkom BU
├── Model: google/gemini-1.5-flash
├── Output: { matches: [{ buId, reason, score }] }

POST /api/ai/summary
├── Input:  narrative_text (laporan startup)
├── Model: google/gemini-1.5-flash
├── Output: { point1, point2, point3 }

POST /api/ai/search
├── Input:  user_query + daftar startup
├── Model: google/gemini-1.5-flash
├── Output: { filteredIds: [...] }

POST /api/ai/forecast
├── Input:  historical_data (6 bulan)
├── Model: google/gemini-1.5-flash
├── Output: { predictedGrowth, predictedRunway, confidence }
```
