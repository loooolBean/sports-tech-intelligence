import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Content and discovery routes are deliberately public so visitors and crawlers
// can search and explore before authentication is needed for saved work.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/watchlist(.*)",
  "/alerts(.*)",
  "/billing(.*)",
  "/settings(.*)",
  "/vendor(.*)",
  "/admin(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

const clerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") && process.env.CLERK_SECRET_KEY?.startsWith("sk_");

export default clerkConfigured ? clerkHandler : () => NextResponse.next();

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
