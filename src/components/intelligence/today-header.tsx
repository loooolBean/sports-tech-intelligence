"use client";

import { useEffect, useState } from "react";

export function TodayHeader({
  updatesToday,
  nowIso,
}: {
  updatesToday: number;
  nowIso: string;
}) {
  const [dateLabel, setDateLabel] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(nowIso)),
  );

  useEffect(() => {
    setDateLabel(
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  return (
    <div className="max-w-3xl">
      <p className="eyebrow-rule">Daily intelligence feed</p>
      <h1 className="mt-5 text-5xl font-extrabold leading-[0.96] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-7xl">
        Know what moved.<br /><span className="text-accent">Understand why.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">
        Daily sports technology developments, filtered and explained for people who need the signal—not another news pile.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-tertiary">
        <time suppressHydrationWarning dateTime={nowIso}>
          {dateLabel}
        </time>
        <span aria-hidden="true">·</span>
        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-semibold text-accent">{updatesToday} {updatesToday === 1 ? "update" : "updates"} in 24h</span>
      </div>
    </div>
  );
}
