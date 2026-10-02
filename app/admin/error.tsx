"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="rounded-lg border border-border bg-bg-card p-6"><h2 className="text-xl font-semibold">Workspace temporarily unavailable</h2><p className="mt-3 text-sm text-text-secondary">本次读取失败，并不代表数据为 0。请稍后重试；持续失败时检查数据库连接、迁移与 Vercel Runtime Logs。</p><button onClick={reset} className="mt-5 min-h-11 rounded bg-accent px-4 text-sm font-semibold text-white">Try again</button></section>;
}
