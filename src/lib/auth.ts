import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentUserProfile() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  const adminEmails = getAdminEmails();
  const desiredRole = adminEmails.includes(primaryEmail.toLowerCase()) ? UserRole.ADMIN : undefined;

  return prisma.user.upsert({
    where: {
      clerkUserId: clerkUser.id,
    },
    create: {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      name: clerkUser.fullName,
      role: desiredRole ?? UserRole.USER,
    },
    update: {
      email: primaryEmail,
      name: clerkUser.fullName,
      ...(desiredRole ? { role: desiredRole } : {}),
    },
  });
}

export async function requireAdminUser() {
  const user = await getCurrentUserProfile();

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return user;
}
