import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { UserRole } from "@prisma/client";
import { prisma } from "../../../../src/lib/prisma";
import { getAdminEmails } from "../../../../src/lib/auth";

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const payload = await request.text();
  const event = new Webhook(webhookSecret).verify(payload, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  }) as {
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ email_address: string; id: string }>;
      primary_email_address_id?: string;
      first_name?: string | null;
      last_name?: string | null;
    };
  };

  if (event.type === "user.created" || event.type === "user.updated") {
    const email =
      event.data.email_addresses?.find(
        (item) => item.id === event.data.primary_email_address_id,
      )?.email_address ?? event.data.email_addresses?.[0]?.email_address;

    if (email) {
      const name = [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || null;
      const role = getAdminEmails().includes(email.toLowerCase()) ? UserRole.ADMIN : UserRole.USER;

      await prisma.user.upsert({
        where: { clerkUserId: event.data.id },
        create: {
          clerkUserId: event.data.id,
          email,
          name,
          role,
        },
        update: {
          email,
          name,
          role,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
