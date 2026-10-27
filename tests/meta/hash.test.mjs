import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  hashUserData,
  normalizeCity,
  normalizeCountry,
  normalizeEmail,
  normalizePhone,
  sha256Hex,
} from "../../src/lib/meta/hash.ts";

const HEX64 = /^[0-9a-f]{64}$/;

test("normalizePhone adds the Georgian country code to local numbers", () => {
  assert.equal(normalizePhone("598 22 94 38"), "995598229438");
  assert.equal(normalizePhone("+995 598 229 438"), "995598229438");
  assert.equal(normalizePhone("00995598229438"), "995598229438");
  assert.equal(normalizePhone("0598229438"), "995598229438");
  assert.equal(normalizePhone("+44 7700 900123"), "447700900123");
  assert.equal(normalizePhone(""), "");
});

test("email, city and country normalisation", () => {
  assert.equal(normalizeEmail("  Keti@Example.COM "), "keti@example.com");
  assert.equal(normalizeCity(" Tbilisi "), "tbilisi");
  assert.equal(normalizeCity("Saint-Louis du Nord"), "saintlouisdunord");
  assert.equal(normalizeCountry("GE"), "ge");
  assert.equal(normalizeCountry("Georgia"), "", "only 2-letter codes are accepted");
});

test("sha256Hex matches node:crypto", () => {
  const expected = createHash("sha256").update("abc", "utf8").digest("hex");
  assert.equal(sha256Hex("abc"), expected);
});

test("hashUserData hashes normalised values and omits empty fields", () => {
  const hashed = hashUserData({
    email: "  Keti@Example.COM ",
    phone: "598229438",
    firstName: " Keti ",
    lastName: "",
    city: "Tbilisi",
    country: "GE",
  });
  assert.equal(hashed.em, sha256Hex("keti@example.com"));
  assert.equal(hashed.ph, sha256Hex("995598229438"));
  assert.equal(hashed.fn, sha256Hex("keti"));
  assert.equal(hashed.ln, undefined);
  assert.equal(hashed.ct, sha256Hex("tbilisi"));
  assert.equal(hashed.country, sha256Hex("ge"));
  for (const value of Object.values(hashed)) assert.match(value, HEX64);
  assert.ok(!JSON.stringify(hashed).toLowerCase().includes("keti"), "no raw PII in output");
});

test("hashUserData with nothing known returns an empty object", () => {
  assert.deepEqual(hashUserData({}), {});
  assert.deepEqual(hashUserData({ email: null, phone: "   " }), {});
});
