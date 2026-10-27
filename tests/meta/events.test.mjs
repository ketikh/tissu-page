import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contactChannelForHref,
  createEventId,
  parseClientEvent,
  parseCustomData,
  roundMoney,
} from "../../src/lib/meta/events.ts";

test("parseClientEvent accepts a well-formed mirrored event", () => {
  const parsed = parseClientEvent({
    event_name: "AddToCart",
    event_id: "3f2b1c9a-1111-4a3b-9c0d-abcdefabcdef",
    event_source_url: "https://tissu.ge/ka/product/42",
    custom_data: { value: 74, currency: "GEL", content_ids: ["42"], content_type: "product", num_items: 1 },
  });
  assert.ok(parsed);
  assert.equal(parsed.event_name, "AddToCart");
  assert.equal(parsed.event_source_url, "https://tissu.ge/ka/product/42");
  assert.deepEqual(parsed.custom_data, {
    value: 74, currency: "GEL", content_ids: ["42"], content_type: "product", num_items: 1,
  });
});

test("parseClientEvent rejects unknown events, bad ids and non-mirrored events", () => {
  assert.equal(parseClientEvent(null), null);
  assert.equal(parseClientEvent({ event_name: "Hack", event_id: "abc" }), null);
  assert.equal(parseClientEvent({ event_name: "ViewContent", event_id: "has spaces" }), null);
  assert.equal(parseClientEvent({ event_name: "ViewContent", event_id: "x".repeat(65) }), null);
  assert.equal(parseClientEvent({ event_name: "Purchase", event_id: "order-1" }), null, "Purchase is server-sent");
  assert.equal(parseClientEvent({ event_name: "PageView", event_id: "a1" }), null, "PageView is browser-only");
});

test("parseClientEvent drops a non-http source url instead of failing", () => {
  const parsed = parseClientEvent({ event_name: "Contact", event_id: "a1", event_source_url: "javascript:alert(1)" });
  assert.ok(parsed);
  assert.equal(parsed.event_source_url, undefined);
});

test("parseCustomData keeps only valid standard parameters", () => {
  const data = parseCustomData({
    value: "74",
    currency: "gel",
    content_ids: ["1", 2, "", "3"],
    content_type: "service",
    content_name: "  Tote bag  ",
    contents: [{ id: "1", quantity: 2, item_price: 10 }, { id: "", quantity: 1, item_price: 1 }, "junk"],
    num_items: 2.7,
    evil: "<script>",
  });
  assert.deepEqual(data, {
    content_ids: ["1", "3"],
    content_name: "Tote bag",
    contents: [{ id: "1", quantity: 2, item_price: 10 }],
    num_items: 2,
  });
  assert.equal(parseCustomData({}), undefined);
  assert.equal(parseCustomData("nope"), undefined);
});

test("createEventId is unique and url-safe", () => {
  const ids = new Set(Array.from({ length: 200 }, () => createEventId()));
  assert.equal(ids.size, 200);
  for (const id of ids) assert.match(id, /^[A-Za-z0-9._:-]{1,64}$/);
});

test("roundMoney rounds to 2 decimals", () => {
  assert.equal(roundMoney(10.005), 10.01);
  assert.equal(roundMoney(74), 74);
});

test("contactChannelForHref recognises conversation links only", () => {
  assert.equal(contactChannelForHref("https://instagram.com/thetissushop"), "instagram");
  assert.equal(contactChannelForHref("https://m.me/thetissushop"), "messenger");
  assert.equal(contactChannelForHref("https://wa.me/995598229438"), "whatsapp");
  assert.equal(contactChannelForHref("mailto:hello@tissu.ge"), "email");
  assert.equal(contactChannelForHref("tel:+995598229438"), "phone");
  assert.equal(contactChannelForHref("https://facebook.com/thetissushop"), "facebook");
  assert.equal(contactChannelForHref("/ka/contact"), null);
  assert.equal(contactChannelForHref("https://tissu.ge/en/shop"), null);
});
