const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-1.5-flash";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://indigo-connect.vercel.app",
      "X-OpenRouter-Title": "Indigo Connect AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter API error (${res.status}): ${res.statusText} — ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  return data.choices[0]?.message?.content ?? "";
}

export async function evaluateHealthReport(narrativeText: string) {
  const prompt = `Anda adalah AI Health Evaluator untuk inkubator startup Indigo by Telkom Indonesia.

Analisis laporan bulanan startup berikut dan berikan output JSON saja (tanpa markdown):

Laporan:
${narrativeText}

Output JSON:
{
  "healthScore": <number 0-100>,
  "riskLabel": <"HIGH_GROWTH" | "STABLE" | "AT_RISK">,
  "sentimentScore": <number 0.0-1.0>,
  "operationalStatus": "<deskripsi singkat>"
}`;

  const content = await callOpenRouter([
    { role: "system", content: "Anda adalah AI evaluator yang hanya merespon dengan JSON valid." },
    { role: "user", content: prompt },
  ]);

  return JSON.parse(cleanJson(content));
}

export async function generateExecutiveSummary(narrativeText: string) {
  const prompt = `Buat executive summary dari laporan startup berikut dalam 3 poin singkat (maks 1 kalimat per poin).

Laporan:
${narrativeText}

Output JSON:
{
  "point1": "...",
  "point2": "...",
  "point3": "..."
}`;

  const content = await callOpenRouter([
    { role: "system", content: "Anda adalah AI yang merespon dengan JSON valid." },
    { role: "user", content: prompt },
  ]);

  return JSON.parse(cleanJson(content));
}

export async function matchSynergy(
  narrativeText: string,
  telkomBus: { id: string; name: string; description: string; keywords: string[] }[]
) {
  const telkomBUList = telkomBus
    .map((bu) => `- ${bu.name}: ${bu.description} (keywords: ${bu.keywords.join(", ")})`)
    .join("\n");

  const prompt = `Analisis laporan startup berikut dan cocokkan dengan unit bisnis Telkom yang paling relevan untuk kolaborasi.

Laporan startup:
${narrativeText}

Unit bisnis Telkom yang tersedia:
${telkomBUList}

Output JSON:
{
  "matches": [
    {
      "buId": "<id unit bisnis>",
      "reason": "<alasan sinergi>",
      "matchScore": <0.0-1.0>
    }
  ]
}

Urutkan dari matchScore tertinggi ke terendah. Maksimal 3 rekomendasi.`;

  const content = await callOpenRouter([
    { role: "system", content: "Anda adalah AI Synergy Matcher yang merespon dengan JSON valid." },
    { role: "user", content: prompt },
  ]);

  return JSON.parse(cleanJson(content));
}

export async function searchByNaturalLanguage(
  query: string,
  startups: { id: string; name: string; sector: string; description: string; batch: string }[]
) {
  const startupList = startups
    .map((s) => `- ID: ${s.id}, Nama: ${s.name}, Sektor: ${s.sector}, Batch: ${s.batch}, Deskripsi: ${s.description}`)
    .join("\n");

  const prompt = `User query: "${query}"

Daftar startup yang tersedia:
${startupList}

Filter daftar startup di atas berdasarkan query user. Output JSON:
{
  "filteredIds": ["<id1>", "<id2>"]
}`;

  const content = await callOpenRouter([
    { role: "system", content: "Anda adalah AI Search Filter yang merespon dengan JSON valid." },
    { role: "user", content: prompt },
  ]);

  return JSON.parse(cleanJson(content));
}

export async function forecastGrowth(
  historicalData: { period: string; metrics: Record<string, number> }[]
) {
  const dataStr = historicalData
    .map((d) => `- ${d.period}: ${JSON.stringify(d.metrics)}`)
    .join("\n");

  const prompt = `Berikut data historis 6 bulan terakhir dari sebuah startup:
${dataStr}

Berdasarkan data di atas, prediksi 3 bulan ke depan. Output JSON:
{
  "predictedGrowthRate": <number>,
  "predictedRunwayMonths": <number>,
  "confidenceScore": <0.0-1.0>,
  "notes": "<penjelasan singkat>"
}`;

  const content = await callOpenRouter([
    { role: "system", content: "Anda adalah AI Financial Forecaster yang merespon dengan JSON valid." },
    { role: "user", content: prompt },
  ]);

  return JSON.parse(cleanJson(content));
}

function cleanJson(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}
