"use client";
import { useState } from "react";
import { initializePaddle } from "@paddle/paddle-js";

export function PaddleCheckout({ transactionId, sandbox }: { transactionId: string; sandbox: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function open() {
    setPending(true); setError("");
    try {
      const paddle = await initializePaddle({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        environment: sandbox ? "sandbox" : "production",
        eventCallback(event) { if (event.name === "checkout.error") setError("Checkout could not be opened. Please try again."); },
      });
      if (!paddle) throw new Error("Checkout unavailable");
      paddle.Checkout.open({ transactionId, settings: { displayMode: "overlay", successUrl: `${window.location.origin}/billing/success` } });
    } catch { setError("Unable to connect to checkout. Please retry or return to pricing."); }
    finally { setPending(false); }
  }
  return <div className="mt-8"><button onClick={open} disabled={pending} className="rounded-full bg-text-primary px-6 py-3 font-semibold text-bg disabled:opacity-50">{pending ? "Opening checkout…" : "Continue to secure checkout"}</button><p role="status" className="mt-4 text-sm text-text-secondary">{error}</p></div>;
}
