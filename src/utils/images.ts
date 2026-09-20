const NON_EDITORIAL_IMAGE_PATTERNS = [
  /\/images\/core\/emoji\//i,
  /\/emoji\//i,
  /(?:^|[\/_-])(favicon|apple-touch-icon|site-icon)(?:[._-]|$)/i,
  /gravatar\.com\/avatar/i,
];

/**
 * Reject small interface assets that feeds commonly expose as article images.
 * The UI also uses this for older rows that were imported before this filter
 * existed, so a trademark glyph or favicon never occupies a story image slot.
 */
export function getEditorialImageUrl(value?: string | null): string | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const candidate = `${url.hostname}${url.pathname}`;
  if (NON_EDITORIAL_IMAGE_PATTERNS.some((pattern) => pattern.test(candidate))) return null;

  const width = Number(url.searchParams.get("w") ?? url.searchParams.get("width"));
  const height = Number(url.searchParams.get("h") ?? url.searchParams.get("height"));
  if ((Number.isFinite(width) && width > 0 && width < 240) || (Number.isFinite(height) && height > 0 && height < 160)) {
    return null;
  }

  return url.toString();
}
