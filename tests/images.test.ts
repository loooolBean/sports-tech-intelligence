import assert from "node:assert/strict";
import test from "node:test";
import { getEditorialImageUrl } from "../src/utils/images";

test("rejects feed emoji and icon assets", () => {
  assert.equal(getEditorialImageUrl("https://s.w.org/images/core/emoji/17.0.2/72x72/2122.png"), null);
  assert.equal(getEditorialImageUrl("https://example.com/favicon.ico"), null);
  assert.equal(getEditorialImageUrl("https://example.com/photo.jpg?w=120"), null);
});

test("keeps normal editorial images", () => {
  assert.equal(
    getEditorialImageUrl("https://example.com/news/athlete-training.jpg?w=1024"),
    "https://example.com/news/athlete-training.jpg?w=1024",
  );
});
