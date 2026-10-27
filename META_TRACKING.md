# Meta (Facebook) tracking on tissu.ge

Pixel in the browser, Conversions API on the server, domain-verification tag,
and a product feed for Commerce Manager. Everything is switched on by
environment variables; with none of them set the site behaves exactly as before.

## 1. Environment variables (set in Railway → Variables)

| Variable | Required | Where to get it |
| --- | --- | --- |
| `META_PIXEL_ID` | yes | Events Manager → Data sources → your pixel → the numeric ID |
| `META_CAPI_ACCESS_TOKEN` | for server events | Events Manager → pixel → Settings → Conversions API → *Generate access token* |
| `META_TEST_EVENT_CODE` | only while testing | Events Manager → pixel → *Test events* tab (looks like `TEST12345`) |
| `META_DOMAIN_VERIFICATION` | for domain verification | Business settings → Brand safety → Domains → tissu.ge → *Meta-tag verification*; paste only the `content="…"` value |
| `META_GRAPH_API_VERSION` | no | Defaults to `v26.0`; override only if Meta retires it |

Railway redeploys automatically after you save variables. Remove
`META_TEST_EVENT_CODE` once testing is done, otherwise real events keep showing
up under "Test events".

## 2. What fires where

| Event | Browser (Pixel) | Server (Conversions API) | event_id |
| --- | --- | --- | --- |
| PageView | every page load and client-side route change | no | random |
| ViewContent | product page (`/ka/product/…`, `/en/product/…`) | mirrored | random, shared |
| AddToCart | every add-to-cart button (product page, shop grid, necklace builder) | mirrored | random, shared |
| InitiateCheckout | checkout page, once per visit, when the cart is known | mirrored | random, shared |
| Purchase | order confirmation page, once per order | sent directly by `/api/checkout` when the order is created | the order id |
| Contact | click on any Instagram / Facebook / Messenger / WhatsApp / Viber / Telegram / mailto / tel link | mirrored | random, shared |
| Lead | contact form submitted (`/contact`) | mirrored | random, shared |

- All values are in GEL. `content_ids` use the product id from the admin, which is
  also the `id` column of the feed, so events match catalogue items.
- Browser and server copies share one `event_id`, so Meta deduplicates them.
- Purchase is idempotent: the checkout page hands the order to the confirmation
  page through session storage, the confirmation page fires once and remembers
  the order id, so a refresh never fires it again. The server copy is the
  reliable one and goes out even if the customer closes the tab.
- Server events carry `client_ip_address` (Cloudflare's `cf-connecting-ip`),
  `client_user_agent`, the `_fbp` / `_fbc` cookies (or `fbc` built from
  `fbclid`), and SHA-256 hashes of email, phone, first name, last name, city
  and country from the checkout form or the signed-in account. Raw details are
  never sent.
- Tracking failures are logged with the prefix `[meta-capi]` and never affect
  checkout or page rendering.

Code lives in `src/lib/meta/` (shared logic), `src/components/meta/MetaPixel.tsx`
(loader + PageView + Contact clicks) and `src/app/api/meta/events/route.ts`
(browser → server mirror).

## 3. How to test

### Pixel (browser)
1. Install the **Meta Pixel Helper** Chrome extension.
2. Open https://tissu.ge, a product page, add something to the cart, open the
   checkout, click the Instagram icon. The helper should list PageView,
   ViewContent, AddToCart, InitiateCheckout and Contact with their parameters.
3. Place a test order: on the confirmation page the helper shows Purchase with
   the order total and the product ids.

### Conversions API (server)
1. Set `META_TEST_EVENT_CODE` in Railway to the code from Events Manager →
   *Test events*, wait for the redeploy.
2. Repeat the steps above. In *Test events* each action appears twice, once
   as "Browser" and once as "Server", with the same event id and the server
   copy marked as deduplicated.
3. Purchase appears from the server even if you close the tab right after
   ordering.
4. Railway logs show `[meta-capi] … rejected` or `… failed` lines if the token
   or pixel id is wrong.

### Domain verification
Set `META_DOMAIN_VERIFICATION`, redeploy, then in Business settings → Domains
click **Verify**. View-source of any page shows
`<meta name="facebook-domain-verification" content="…">`.

### Automated checks
`npm test` runs the unit tests for hashing, event validation, the feed format
and the Conversions API request shape (no network, no dependencies).

## 4. Product feed for Commerce Manager

- CSV: `https://tissu.ge/feeds/meta-products.csv`
- XML (RSS): `https://tissu.ge/feeds/meta-products.xml`

Commerce Manager → Catalog → Data sources → *Add items* → *Data feed* →
*Scheduled feed* → paste the CSV URL, hourly or daily. No login is needed.

Columns: `id, title, description, availability, condition, price, sale_price,
link, image_link, additional_image_link, brand, item_group_id, color, size,
google_product_category`. Products without a photo or price are skipped.
Availability is `in stock`, `out of stock`, or `available for order` for sold-out
items the admin marked as pre-orderable. `item_group_id` groups colour/size
variants by the admin's *model* name. The feed regenerates at most every 10 minutes and tells caches (Cloudflare, Meta) to keep it for an hour.

## 5. Infrastructure notes

- **Content-Security-Policy**: the site does not send a CSP header today, so
  nothing had to be allowed. If one is added later it must permit
  `https://connect.facebook.net` (script-src) and `https://www.facebook.com`
  (img-src and connect-src).
- **Cloudflare**:
  - *Rocket Loader* can delay or break `fbevents.js`; keep it off, or add a
    page rule disabling it for tissu.ge.
  - *Bot Fight Mode* / *Super Bot Fight Mode* can block Meta's feed fetcher.
    If the feed shows "fetch failed" in Commerce Manager, add a WAF skip rule
    for the path `/feeds/*` (or for the `facebookexternalhit` and
    `facebookcatalog` user agents).
  - If *Zaraz* is enabled with a Meta Pixel tool, disable one of the two,
    otherwise events are sent twice.
  - The feed responses send `Cache-Control: public, max-age=3600`; Cloudflare
    may cache them, which is fine.
- **Railway**: nothing to configure beyond the variables above.
