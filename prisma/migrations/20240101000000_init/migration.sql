-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SYNERGY', 'FOUNDER');

-- CreateEnum
CREATE TYPE "RiskLabel" AS ENUM ('HIGH_GROWTH', 'STABLE', 'AT_RISK');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StartupStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('PIPELINE', 'ON_GOING', 'SUCCESS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('RISK', 'GROWTH_DROP');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FOUNDER',
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "founder_name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "status" "StartupStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "narrative_text" TEXT NOT NULL,
    "metrics" JSONB,
    "submitted_by" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_evaluations" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "health_score" INTEGER NOT NULL,
    "risk_label" "RiskLabel" NOT NULL,
    "sentiment_score" DOUBLE PRECISION,
    "operational_status" TEXT,
    "ai_raw_response" JSONB,
    "model_used" TEXT NOT NULL DEFAULT 'google/gemini-1.5-flash',
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_summaries" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "point1" TEXT NOT NULL,
    "point2" TEXT NOT NULL,
    "point3" TEXT NOT NULL,
    "ai_raw_response" JSONB,
    "model_used" TEXT NOT NULL DEFAULT 'google/gemini-1.5-flash',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telkom_bus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT NOT NULL,
    "keywords" JSONB,
    "logo_url" TEXT,
    "contact_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "telkom_bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy_matches" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "telkom_bu_id" TEXT NOT NULL,
    "match_reason" TEXT NOT NULL,
    "match_score" DOUBLE PRECISION,
    "ai_raw_response" JSONB,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synergy_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy_pipelines" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "telkom_bu_id" TEXT NOT NULL,
    "status" "PipelineStatus" NOT NULL DEFAULT 'PIPELINE',
    "notes" TEXT,
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synergy_pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "alert_type" "AlertType" NOT NULL DEFAULT 'RISK',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "email_sent_to" TEXT NOT NULL,
    "email_content" TEXT,
    "ai_summary" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "alert_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" TEXT NOT NULL,
    "startup_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "predicted_growth_rate" DOUBLE PRECISION,
    "predicted_runway_months" INTEGER,
    "confidence_score" DOUBLE PRECISION,
    "forecast_data" JSONB,
    "ai_raw_response" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "health_evaluations_report_id_key" ON "health_evaluations"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "executive_summaries_report_id_key" ON "executive_summaries"("report_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_evaluations" ADD CONSTRAINT "health_evaluations_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_summaries" ADD CONSTRAINT "executive_summaries_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy_matches" ADD CONSTRAINT "synergy_matches_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy_matches" ADD CONSTRAINT "synergy_matches_telkom_bu_id_fkey" FOREIGN KEY ("telkom_bu_id") REFERENCES "telkom_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy_pipelines" ADD CONSTRAINT "synergy_pipelines_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy_pipelines" ADD CONSTRAINT "synergy_pipelines_telkom_bu_id_fkey" FOREIGN KEY ("telkom_bu_id") REFERENCES "telkom_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy_pipelines" ADD CONSTRAINT "synergy_pipelines_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_logs" ADD CONSTRAINT "alert_logs_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

