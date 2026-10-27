import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CSV_COLUMNS,
  availabilityFor,
  csvEscape,
  feedToCsv,
  feedToXml,
  formatFeedPrice,
  googleCategoryFor,
  isFeedEligible,
  toFeedItem,
} from "../../src/lib/meta/feed.ts";

const SITE = "https://tissu.ge";

function product(overrides = {}) {
  return {
    id: "42",
    code: "T-42",
    name: "Tote bag",
    model: "City Tote",
    size: "big",
    color: "mustard",
    description: 'Reversible, "two-faced"\ncanvas tote',
    price: 74,
    original_price: null,
    currency: "GEL",
    stock: 3,
    in_stock: true,
    preorder_available: false,
    image_front: "https://res.cloudinary.com/x/front.jpg",
    image_back: "https://res.cloudinary.com/x/back.jpg",
    gallery_images: ["https://res.cloudinary.com/x/g1.jpg", "https://res.cloudinary.com/x/back.jpg"],
    category: "tote",
    tags: [],
    updated_at: "2026-10-27T00:00:00Z",
    ...overrides,
  };
}

test("toFeedItem maps a product to Meta feed fields", () => {
  const item = toFeedItem(product(), SITE, "ka");
  assert.equal(item.id, "42");
  assert.equal(item.title, "Tote bag");
  assert.equal(item.description, 'Reversible, "two-faced" canvas tote');
  assert.equal(item.availability, "in stock");
  assert.equal(item.condition, "new");
  assert.equal(item.price, "74.00 GEL");
  assert.equal(item.sale_price, "");
  assert.equal(item.link, "https://tissu.ge/ka/product/42");
  assert.equal(item.image_link, "https://res.cloudinary.com/x/front.jpg");
  assert.deepEqual(item.additional_image_link, [
    "https://res.cloudinary.com/x/back.jpg",
    "https://res.cloudinary.com/x/g1.jpg",
  ]);
  assert.equal(item.brand, "TISSU");
  assert.equal(item.item_group_id, "city-tote");
  assert.equal(item.color, "mustard");
  assert.equal(item.size, "big");
  assert.equal(item.google_product_category, "Luggage & Bags > Shopping Totes");
});

test("sale pricing puts the regular price in price and the discounted one in sale_price", () => {
  const item = toFeedItem(product({ price: 60, original_price: 74 }), SITE, "en");
  assert.equal(item.price, "74.00 GEL");
  assert.equal(item.sale_price, "60.00 GEL");
});

test("availability covers stock, pre-order and sold out", () => {
  assert.equal(availabilityFor({ in_stock: true, stock: 2, preorder_available: false }), "in stock");
  assert.equal(availabilityFor({ in_stock: false, stock: 0, preorder_available: true }), "available for order");
  assert.equal(availabilityFor({ in_stock: false, stock: 0, preorder_available: false }), "out of stock");
});

test("relative fallback images become absolute and ineligible products are skipped", () => {
  const item = toFeedItem(product({ image_front: "/static/bag.jpg", image_back: null, gallery_images: undefined }), SITE, "ka");
  assert.equal(item.image_link, "https://tissu.ge/static/bag.jpg");
  assert.deepEqual(item.additional_image_link, []);
  assert.equal(isFeedEligible(product()), true);
  assert.equal(isFeedEligible(product({ image_front: "" })), false);
  assert.equal(isFeedEligible(product({ price: 0 })), false);
});

test("google category mapping has a safe default", () => {
  assert.equal(googleCategoryFor("necklace"), "Apparel & Accessories > Jewelry > Necklaces");
  assert.equal(googleCategoryFor("APRON"), "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils > Aprons");
  assert.equal(googleCategoryFor("something-new"), "Apparel & Accessories > Handbags, Wallets & Cases");
  assert.equal(formatFeedPrice(5), "5.00 GEL");
});

test("CSV output has a header row and escapes quotes, commas and newlines", () => {
  assert.equal(csvEscape("plain"), "plain");
  assert.equal(csvEscape('say "hi", ok'), '"say ""hi"", ok"');
  const csv = feedToCsv([toFeedItem(product(), SITE, "ka")]);
  const [header, row] = csv.split("\r\n");
  assert.equal(header, CSV_COLUMNS.join(","));
  assert.ok(row.includes('"Reversible, ""two-faced"" canvas tote"'));
  assert.ok(row.includes('"https://res.cloudinary.com/x/back.jpg,https://res.cloudinary.com/x/g1.jpg"'));
  assert.ok(csv.endsWith("\r\n"));
});

test("XML output is RSS 2.0 with the g: namespace and escaped text", () => {
  const xml = feedToXml([toFeedItem(product({ name: "Tote & Co <3" }), SITE, "ka")], {
    title: "TISSU", link: SITE, description: "Catalog",
  });
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('xmlns:g="http://base.google.com/ns/1.0"'));
  assert.ok(xml.includes("<g:id>42</g:id>"));
  assert.ok(xml.includes("<g:title>Tote &amp; Co &lt;3</g:title>"));
  assert.ok(xml.includes("<g:price>74.00 GEL</g:price>"));
  assert.ok(!xml.includes("<g:sale_price>"), "empty fields are omitted");
  assert.equal((xml.match(/<g:additional_image_link>/g) ?? []).length, 2);
});
