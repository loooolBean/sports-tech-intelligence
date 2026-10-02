export function getAdSenseConfig() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
  const homeSlot = process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT?.trim() ?? "";
  const articleSlot = process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT?.trim() ?? "";
  const validClient = /^ca-pub-\d{16}$/.test(client) ? client : "";
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && Boolean(validClient);
  return {
    client: validClient,
    homeSlot: enabled && /^\d+$/.test(homeSlot) ? homeSlot : "",
    articleSlot: enabled && /^\d+$/.test(articleSlot) ? articleSlot : "",
  };
}

export function validateAffiliateUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid HTTPS partner URL."); }
  if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") ||
      /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) {
    throw new Error("Enter a public HTTPS partner URL without embedded credentials.");
  }
  return url.toString();
}
