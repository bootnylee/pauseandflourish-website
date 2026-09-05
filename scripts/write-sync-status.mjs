import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(__dirname, "..", "price-sync-report.json");
const outputPath = resolve(__dirname, "..", "dist", "public", "sync-status.json");
const MAX_PRICE_AGE_MS = 24 * 60 * 60 * 1000;

function buildStatus() {
  const generatedAt = new Date().toISOString();
  const fallback = {
    generatedAt,
    syncMode: "skipped",
    updatedCount: 0,
    flaggedCount: 0,
    lastSuccessfulSyncAt: null,
    gateOpen: false,
  };

  if (!existsSync(reportPath)) return fallback;

  try {
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    const reportGeneratedAt = typeof report.generatedAt === "string" ? report.generatedAt : "";
    const reportGeneratedAtMs = Date.parse(reportGeneratedAt);
    const isLive = report.mode === "live";
    const isDryRun = report.mode === "dry-run";
    const updatedCount = Number.isInteger(report.updatedCount) && report.updatedCount >= 0
      ? report.updatedCount
      : Array.isArray(report.updated) ? report.updated.length : 0;
    const flaggedCount = Array.isArray(report.flagged) ? report.flagged.length : 0;
    const totalAsins = Number.isInteger(report.totalAsins) && report.totalAsins > 0 ? report.totalAsins : 0;
    const systemicFailure = typeof report.fatal === "string" && report.fatal.length > 0
      || (isLive && totalAsins > 0 && updatedCount === 0 && flaggedCount >= totalAsins);
    const fresh = isLive
      && !systemicFailure
      && Number.isFinite(reportGeneratedAtMs)
      && Date.now() - reportGeneratedAtMs >= 0
      && Date.now() - reportGeneratedAtMs < MAX_PRICE_AGE_MS;

    return {
      generatedAt,
      syncMode: systemicFailure ? "failed" : isLive ? "live" : isDryRun ? "dry-run" : "skipped",
      updatedCount,
      flaggedCount,
      lastSuccessfulSyncAt: isLive && !systemicFailure && Number.isFinite(reportGeneratedAtMs) ? reportGeneratedAt : null,
      gateOpen: Boolean(fresh),
    };
  } catch {
    return { ...fallback, syncMode: "failed" };
  }
}

try {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(buildStatus(), null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
} catch {
  // Public status reporting must never block the deployment pipeline.
  process.exitCode = 0;
}
