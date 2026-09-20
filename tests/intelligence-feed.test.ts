import assert from "node:assert/strict";
import test from "node:test";
import {
  areIntelligenceTitlesSimilar,
  getFeedPeriodStart,
  getIntelligenceCategory,
  normalizeTitleForDuplicate,
  parseIntelligencePeriod,
} from "../src/lib/intelligence-feed";
import { articleIntelligenceSchema } from "../src/services/articleSummarizationService";

test("daily intelligence categories remain fixed and shareable", () => {
  assert.equal(getIntelligenceCategory("ai-sports")?.name, "AI & Sports");
  assert.equal(getIntelligenceCategory("performance-technology")?.name, "Performance Technology");
  assert.equal(getIntelligenceCategory("unknown"), null);
  assert.equal(parseIntelligencePeriod("today"), "today");
  assert.equal(parseIntelligencePeriod("week"), "week");
  assert.equal(parseIntelligencePeriod("unexpected"), "all");
});

test("period filters use rolling UTC-safe windows", () => {
  const now = new Date("2026-09-19T12:00:00.000Z");
  assert.equal(getFeedPeriodStart("today", now)?.toISOString(), "2026-09-18T12:00:00.000Z");
  assert.equal(getFeedPeriodStart("week", now)?.toISOString(), "2026-09-12T12:00:00.000Z");
  assert.equal(getFeedPeriodStart("all", now), undefined);
});

test("duplicate title matching ignores common launch wording without overmatching", () => {
  assert.equal(
    normalizeTitleForDuplicate("Catapult launches a new athlete-monitoring feature"),
    "catapult athlete monitoring feature",
  );
  assert.equal(
    areIntelligenceTitlesSimilar(
      "Catapult launches new athlete monitoring feature",
      "Catapult announces athlete-monitoring feature",
    ),
    true,
  );
  assert.equal(
    areIntelligenceTitlesSimilar(
      "Catapult launches new athlete monitoring feature",
      "Funding round expands a sports media company",
    ),
    false,
  );
});

test("AI intelligence output rejects unknown categories and excessive takeaways", () => {
  const valid = {
    summary: "A sports technology company released a product update.",
    primaryCategory: "Products & Launches",
    tags: ["Product Launch", "Athlete Monitoring"],
    whyItMatters:
      "The update changes how performance staff can review athlete monitoring information during daily training workflows.",
    keyTakeaways: ["The update adds a new workflow.", "It is intended for performance staff."],
    importanceScore: 64,
    seoTitle: "Sports Technology Product Update",
    seoDescription: "A concise overview of a new sports technology product update.",
    confidenceScore: 0.9,
  };

  assert.equal(articleIntelligenceSchema.parse(valid).importanceScore, 64);
  assert.equal(
    articleIntelligenceSchema.safeParse({ ...valid, primaryCategory: "Crypto Sports" }).success,
    false,
  );
  assert.equal(
    articleIntelligenceSchema.safeParse({
      ...valid,
      keyTakeaways: ["One", "Two", "Three", "Four"],
    }).success,
    false,
  );
});
