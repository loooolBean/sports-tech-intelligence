import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/lib/auth";
import { getPaddle, isPaddleConfigured, paddleSandbox } from "@/src/lib/paddle";
import { PaddleCheckout } from "@/src/components/pro/paddle-checkout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Secure checkout", robots: { index: false, follow: false } };
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ transaction_id?: string; _ptxn?: string }> }) {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/sign-in?redirect_url=%2Fpricing");
  if (!isPaddleConfigured()) redirect("/pricing?error=checkout-unavailable");
  const params = await searchParams;
  const id = params.transaction_id ?? params._ptxn;
  if (!id || !/^txn_[a-z0-9]+$/.test(id)) redirect("/pricing");
  const transaction = await getPaddle().transactions.get(id).catch(() => null);
  if (!transaction || transaction.customData?.userId !== user.id) redirect("/pricing");
  if (transaction.status === "completed") redirect("/billing/success");
  return <main data-private className="mx-auto min-h-[70vh] max-w-2xl px-4 py-20"><p className="overline">Sports Tech Intelligence Pro</p><h1 className="mt-3 text-h1">$15 USD / month</h1><p className="mt-4 text-text-secondary">Your subscription renews monthly. Manage or cancel it from Billing. Applicable taxes and the final total are shown at checkout.</p>{paddleSandbox() && <p className="mt-4 rounded border border-amber-500 p-4">Test checkout — no real payment will be collected.</p>}<PaddleCheckout transactionId={id} sandbox={paddleSandbox()} /><Link href="/pricing" className="mt-6 inline-block underline">Back to pricing</Link></main>;
}
