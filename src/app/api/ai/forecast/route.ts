import { NextRequest, NextResponse } from "next/server";
import { forecastGrowth } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";

interface MetricPeriod {
  period: string;
  revenue: number;
  users: number;
  growth: number;
  burnRate: number;
}

interface Prediction {
  predictedGrowthRate: number;
  predictedRunwayMonths: number;
  confidenceScore: number;
  notes: string;
}

function generateDummyHistorical(startupId: string): MetricPeriod[] {
  const seed = startupId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseRevenue = 20 + (seed % 100);
  const baseUsers = 500 + (seed % 2000);
  const growthTrend = (seed % 3) === 0 ? -1 : (seed % 3) === 1 ? 2 : 5; // Negative, slow, or fast growth
  
  const periods = ["Des 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "Mei 2026"];
  let currentRev = baseRevenue;
  let currentUsers = baseUsers;
  let currentGrowth = 10 + growthTrend;
  let currentBurn = 30 + (seed % 50);

  return periods.map(p => {
    currentRev = Math.round(currentRev * (1 + currentGrowth / 100));
    currentUsers = Math.round(currentUsers * (1 + currentGrowth / 100));
    currentBurn = Math.round(currentBurn * 1.05);
    currentGrowth = Math.max(-5, currentGrowth + (Math.random() * 4 - 2));

    return {
      period: p,
      revenue: currentRev,
      users: currentUsers,
      growth: Math.round(currentGrowth * 10) / 10,
      burnRate: currentBurn
    };
  });
}

function generateProjectedData(
  historical: MetricPeriod[],
  prediction: Prediction
): MetricPeriod[] {
  const last = historical[historical.length - 1];
  const avgGrowth = historical.reduce((s, p) => s + p.growth, 0) / historical.length;
  const projectedGrowth = prediction.predictedGrowthRate || avgGrowth;

  const monthNames = ["Jun", "Jul", "Agu", "Sep"];
  return monthNames.map((m, i) => {
    const factor = 1 + projectedGrowth / 100;
    const decay = Math.max(0.9, 1 - i * 0.03);
    return {
      period: `${m} 2026`,
      revenue: Math.round(last.revenue * Math.pow(factor, i + 1) * decay),
      users: Math.round(last.users * Math.pow(factor, i + 1) * decay),
      growth: Math.round(projectedGrowth * decay * 10) / 10,
      burnRate: Math.round(last.burnRate * (1 + i * 0.02)),
    };
  });
}

function mockForecast(historical: MetricPeriod[]): Prediction {
  const recentGrowth = historical.slice(-3).reduce((s, p) => s + p.growth, 0) / 3;
  const avgBurnRate = historical.reduce((s, p) => s + p.burnRate, 0) / historical.length;
  const avgRevenue = historical.reduce((s, p) => s + p.revenue, 0) / historical.length;
  const isDeclining = historical.slice(-3).every((p, i, arr) => i > 0 && p.growth <= arr[i - 1].growth);
  const isGrowing = recentGrowth > 15;

  return {
    predictedGrowthRate: isDeclining ? Math.max(1, recentGrowth * 0.5) : isGrowing ? recentGrowth * 1.2 : recentGrowth,
    predictedRunwayMonths: avgBurnRate > 0 && avgRevenue > 0
      ? Math.round((avgRevenue * 3) / Math.max(avgBurnRate, 1))
      : 12,
    confidenceScore: isDeclining ? 0.55 : isGrowing ? 0.85 : 0.7,
    notes: isDeclining
      ? "Pertumbuhan melambat dalam 3 bulan terakhir. Perlu strategi akselerasi baru untuk membalikkan tren."
      : isGrowing
      ? "Tren pertumbuhan positif dan konsisten. Proyeksi optimis dengan ekspansi pasar yang direncanakan."
      : "Pertumbuhan stabil dengan potensi peningkatan. Disarankan optimasi biaya operasional.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await req.json();

    if (!startupId || typeof startupId !== "string") {
      return NextResponse.json({ error: "startupId is required" }, { status: 400 });
    }

    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const historicalPeriods = generateDummyHistorical(startupId);
    let prediction: Prediction;

    try {
      const aiResult = await forecastGrowth(
        historicalPeriods.map((p) => ({
          period: p.period,
          metrics: { revenue: p.revenue, users: p.users, growth: p.growth, burnRate: p.burnRate },
        }))
      );
      prediction = {
        predictedGrowthRate: aiResult.predictedGrowthRate,
        predictedRunwayMonths: aiResult.predictedRunwayMonths,
        confidenceScore: aiResult.confidenceScore,
        notes: aiResult.notes,
      };
    } catch {
      prediction = mockForecast(historicalPeriods);
    }

    const projectedData = generateProjectedData(historicalPeriods, prediction);

    return NextResponse.json({
      startupId,
      startupName: startup.name,
      historicalData: historicalPeriods,
      projectedData,
      prediction,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
