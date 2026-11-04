import { test } from "node:test";
import assert from "node:assert/strict";

// The module reads TISSU_BANK_INFO at import time, so set it before loading.
process.env.TISSU_BANK_INFO =
  "თიბისი ბანკი (TBC):\nGE58TB7085345064300066\n\nსაქართველოს ბანკი (BOG):\nGE65BG0000000358364200\n\nჩარიცხვის შემდეგ სქრინი გამოგვიგზავნეთ.";
delete process.env.TELEGRAM_BOT_TOKEN;

const {
  bankLabelFor,
  buildActionButtons,
  buildCombinedText,
  extractAccountNumbers,
  telegramHtml,
} = await import("../src/lib/notifications.ts");

const TBC = "GE58TB7085345064300066";
const BOG = "GE65BG0000000358364200";

function order(overrides = {}) {
  return {
    orderId: "a1b2c3d4-0000-4000-8000-000000000000",
    customer: { firstName: "ნინო", lastName: "მ.", phone: "+995 599 12 34 56" },
    contactMethod: "whatsapp",
    address: { city: "თბილისი", street: "ჭავჭავაძის 12" },
    items: [{ name: "კოსმეტიკის ჩანთა", code: "CO2", quantity: 1, price: 25 }],
    subtotal: 25,
    shipping: 6,
    total: 31,
    ...overrides,
  };
}

test("extractAccountNumbers finds every Georgian IBAN once, in order", () => {
  assert.deepEqual(extractAccountNumbers(process.env.TISSU_BANK_INFO), [TBC, BOG]);
  assert.deepEqual(extractAccountNumbers(`${TBC} again ${TBC}`), [TBC]);
  assert.deepEqual(extractAccountNumbers("no accounts here"), []);
});

test("bankLabelFor maps the IBAN bank code to a short name", () => {
  assert.equal(bankLabelFor(TBC), "TBC");
  assert.equal(bankLabelFor(BOG), "BOG");
  assert.equal(bankLabelFor("GE00XX0000000000000000"), "ბანკი");
});

test("telegramHtml wraps copyable values in <code> and escapes the rest", () => {
  const html = telegramHtml(`სახელი: <ნინო> & co\nანგარიში: ${TBC}`, [TBC]);
  assert.equal(html, `სახელი: &lt;ნინო&gt; &amp; co\nანგარიში: <code>${TBC}</code>`);
});

test("telegramHtml never nests when one value is inside another", () => {
  const html = telegramHtml(`${TBC} / 345064300`, ["345064300", TBC]);
  assert.equal(html, `<code>${TBC}</code> / <code>345064300</code>`);
  assert.ok(!html.includes("<code><code>"));
});

test("telegramHtml leaves text alone without copyable values", () => {
  assert.equal(telegramHtml("a < b", []), "a &lt; b");
  assert.equal(telegramHtml("plain", ["", "  "]), "plain");
});

test("buttons: full reply first, then one WhatsApp button per account number", () => {
  const rows = buildActionButtons(order());
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 1);
  assert.equal(rows[0][0].text, "WhatsApp");
  assert.ok(rows[0][0].url.startsWith("https://wa.me/995599123456?text="));
  assert.ok(decodeURIComponent(rows[0][0].url).includes(TBC));

  assert.deepEqual(rows[1], [
    { text: "TBC ანგარიში → WhatsApp", url: `https://wa.me/995599123456?text=${TBC}` },
    { text: "BOG ანგარიში → WhatsApp", url: `https://wa.me/995599123456?text=${BOG}` },
  ]);
  for (const row of rows) for (const b of row) assert.ok(b.url.startsWith("https://"));
});

test("buttons: no phone means no buttons; no accounts means only the reply button", () => {
  assert.deepEqual(buildActionButtons(order({ customer: { firstName: "a", lastName: "b", phone: "" } })), []);
  assert.equal(buildActionButtons(order(), []).length, 1);
});

test("combined text keeps the bank details and the call line in plain form", () => {
  const text = buildCombinedText(order());
  assert.ok(text.includes("ახალი შეკვეთა — Tissu"));
  assert.ok(text.includes(`\n${TBC}\n`));
  assert.ok(text.endsWith("Viber / ზარი: +995599123456"));
  const html = telegramHtml(text, extractAccountNumbers(process.env.TISSU_BANK_INFO));
  assert.ok(html.includes(`<code>${TBC}</code>`));
  assert.ok(html.includes(`<code>${BOG}</code>`));
  assert.ok(html.includes("Viber / ზარი: +995599123456"));
});
