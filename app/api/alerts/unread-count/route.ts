import { NextResponse } from "next/server";
import { getUnreadAlertCount } from "@/src/lib/alerts";
import { getCurrentUserProfile } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUserProfile();
  if (!user) return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "private, no-store" } });
  const count = await getUnreadAlertCount(user.id);
  return NextResponse.json({ count }, { headers: { "Cache-Control": "private, no-store" } });
}
