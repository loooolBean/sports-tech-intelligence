import assert from "node:assert/strict";
import test from "node:test";
import { getAdSenseConfig, validateAffiliateUrl } from "../src/lib/monetization";

test("affiliate offers only accept public HTTPS links", () => {
  assert.equal(validateAffiliateUrl("https://partner.example/products/1?ref=abc"), "https://partner.example/products/1?ref=abc");
  for (const link of ["javascript:alert(1)", "http://partner.example", "https://localhost/", "https://user:pass@partner.example/"]) {
    assert.throws(() => validateAffiliateUrl(link));
  }
});

test("ads remain off without explicit enablement and valid publisher/slots", () => {
  const previous = {
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    home: process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT,
    article: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT,
  };
  try {
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "false";
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";
    process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT = "123456";
    assert.equal(getAdSenseConfig().homeSlot, "");
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
    process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT = "bad";
    assert.equal(getAdSenseConfig().homeSlot, "123456");
    assert.equal(getAdSenseConfig().articleSlot, "");
  } finally {
    if (previous.enabled === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_ENABLED; else process.env.NEXT_PUBLIC_ADSENSE_ENABLED = previous.enabled;
    if (previous.client === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID; else process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = previous.client;
    if (previous.home === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT; else process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT = previous.home;
    if (previous.article === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT; else process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT = previous.article;
  }
});
