import "server-only";
import { createHash } from "node:crypto";
import { PostHog } from "posthog-node";
import { after } from "next/server";
import type { ProductEvent } from "./analytics-policy";

// Telemetry must never prevent a successful payment, registration or saved action.
export async function captureProductEvent(distinctId: string, event: ProductEvent, properties: Record<string, string | number | boolean> = {}, dedupeKey?: string) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return;
  const hash = dedupeKey ? createHash("sha256").update(`${event}:${dedupeKey}`).digest("hex") : null;
  const uuid = hash ? `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-8${hash.slice(17,20)}-${hash.slice(20,32)}` : undefined;
  const timestamp = new Date();
  try {
    after(async () => {
      try {
        const client = new PostHog(token, { host, flushAt: 1, flushInterval: 0, requestTimeout: 3000, fetchRetryCount: 0 });
        client.on("error", () => { /* Never log credentials or user payloads. */ });
        client.capture({ distinctId, event, properties, uuid, timestamp });
        await client.shutdown();
      } catch { console.warn(`Product event delivery failed: ${event}`); }
    });
  } catch { console.warn(`Product event delivery failed: ${event}`); }
}
