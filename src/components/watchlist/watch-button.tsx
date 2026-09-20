"use client";

import { Bell, BellOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toggleCompanyWatch, toggleProductWatch } from "@/src/actions/watchlist";

export function WatchButton({ entityId, entityType, watching, returnPath }: { entityId: string; entityType: "company" | "product"; watching: boolean; returnPath: string }) {
  const action = entityType === "company" ? toggleCompanyWatch : toggleProductWatch;
  return <form action={action}><input type="hidden" name="entityId" value={entityId} /><input type="hidden" name="watching" value={String(watching)} /><input type="hidden" name="returnPath" value={returnPath} /><WatchSubmit watching={watching} entityType={entityType} /></form>;
}

function WatchSubmit({ watching, entityType }: { watching: boolean; entityType: "company" | "product" }) {
  const { pending } = useFormStatus();
  const label = watching ? "Watching" : `Watch ${entityType === "company" ? "Company" : "Product"}`;
  return <button type="submit" disabled={pending} aria-pressed={watching} title={watching ? "Remove from Watchlist" : "Track future updates"} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-caption font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${watching ? "border border-accent bg-accent/5 text-accent" : "border border-border text-text-primary hover:border-accent hover:text-accent"}`}>{watching ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}{pending ? "Updating…" : label}</button>;
}
