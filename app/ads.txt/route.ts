import { getAdSenseConfig } from "@/src/lib/monetization";

export const dynamic = "force-dynamic";

export function GET() {
  const { client } = getAdSenseConfig();
  if (!client) return new Response("Not configured\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(`google.com, ${client.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
