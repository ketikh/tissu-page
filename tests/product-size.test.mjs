import { test } from "node:test";
import assert from "node:assert/strict";
import { hasRecognisableSize, sizeRoleFromText } from "../src/lib/product-size.ts";

test("sizeRoleFromText reads Georgian and English size words", () => {
  assert.equal(sizeRoleFromText("პატარა"), "small");
  assert.equal(sizeRoleFromText("პატარა (33x25)"), "small");
  assert.equal(sizeRoleFromText("დიდი"), "big");
  assert.equal(sizeRoleFromText("დიდი (37x27)"), "big");
  assert.equal(sizeRoleFromText("Small"), "small");
  assert.equal(sizeRoleFromText("LARGE"), "big");
  assert.equal(sizeRoleFromText("Big"), "big");
});

test("sizeRoleFromText returns null for blank or unknown size text", () => {
  assert.equal(sizeRoleFromText(""), null);
  assert.equal(sizeRoleFromText("   "), null);
  assert.equal(sizeRoleFromText(null), null);
  assert.equal(sizeRoleFromText(undefined), null);
  assert.equal(sizeRoleFromText("one size"), null);
  assert.equal(sizeRoleFromText("38 cm"), null);
});

test("hasRecognisableSize is true for size pairs and for sized single products", () => {
  assert.equal(hasRecognisableSize({ size: "", size_sibling: { role: "small" } }), true);
  assert.equal(hasRecognisableSize({ size: "პატარა", size_sibling: null }), true);
  assert.equal(hasRecognisableSize({ size: "დიდი" }), true);
  assert.equal(hasRecognisableSize({ size: "", size_sibling: null }), false);
  assert.equal(hasRecognisableSize({ size: "one size" }), false);
  assert.equal(hasRecognisableSize({}), false);
});
