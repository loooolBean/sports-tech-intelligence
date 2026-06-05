import { createHash } from "node:crypto";

export function normalizeUrl(input: string): string {
  const url = new URL(input);
  url.hash = "";

  for (const key of [...url.searchParams.keys()]) {
    if (
      key.toLowerCase().startsWith("utm_") ||
      ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(key.toLowerCase())
    ) {
      url.searchParams.delete(key);
    }
  }

  url.hostname = url.hostname.toLowerCase();
  const normalized = url.toString();
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content.trim().replace(/\s+/g, " ")).digest("hex");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function toDateOrNow(value?: string | Date | null): Date {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trim()}...`;
}
