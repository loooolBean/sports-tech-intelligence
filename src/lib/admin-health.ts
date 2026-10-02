export type Health = "Healthy" | "Needs attention" | "Not connected" | "Unavailable" | "No data yet";

export function jobHealth(job: { status: string; startedAt: Date; finishedAt: Date | null } | null, now = new Date()): Health {
  if (!job) return "No data yet";
  if (job.status === "FAILED") return "Needs attention";
  if (job.status === "RUNNING") return "Needs attention";
  // Both configured crons run daily. Allow two hours for scheduling and processing.
  if (!job.finishedAt || now.getTime() - job.finishedAt.getTime() > 26 * 3600_000) return "Needs attention";
  return "Healthy";
}

export function reportingWindow(now = new Date()) {
  const offset = 8 * 3600_000;
  const shifted = new Date(now.getTime() + offset);
  const today = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - offset);
  return { today, since: new Date(today.getTime() - 6 * 86400_000) };
}

export function aiHealth(configured: boolean, failures: number, pending: number, lastSuccess: Date | null): Health {
  if (!configured) return "Not connected";
  if (failures > 0 || pending > 0) return "Needs attention";
  return lastSuccess ? "Healthy" : "No data yet";
}
