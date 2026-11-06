# RestockWire

RestockWire is the wire service for iPhone restocks: live in-store pickup stock at every Apple Store, the
hours each store usually restocks, and a phone alert the moment your configuration is back.

It covers the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max at all 269 US Apple Stores and at the Apple
Stores of 18 more countries. Browsing the live stock, the map, the restock log and every store page is free.
Alerts come with a monthly plan: Plus ($5) holds 10 alert rules, Pro ($10) 20, Max ($20) 50, where one rule
is one store × one exact configuration.

Live at <https://restockwire.com>. RestockWire is independent and not affiliated with or endorsed by Apple Inc.

## How it works

1. **Read.** A poller asks apple.com's in-store pickup availability for every configuration: every store
   every 15 seconds, and every 5 seconds for the stores that paid alerts point at.
2. **Confirm.** A change counts only when a second read agrees with the first. A configuration seen for the
   first time sets the baseline and is never reported as a restock, and a single glitchy response never
   becomes a restock or a sell-out.
3. **Push.** A confirmed restock is matched against active alert rules and sent as Web Push to every device
   with notifications on, about 3 seconds after confirmation. E-mail goes out only when no device has
   notifications on. On an iPhone, notifications need the installable Home Screen app (`/phone-alerts`
   walks through it).
4. **Log.** Every confirmed restock and sell-out is stored with store, configuration and time. Store, city
   and state pages derive their restock hours, busiest weekdays and sell-out times from that log.

### Code map

* `poller/` — the reader (`poller/main.ts`). In production the poller runs on separate hosts with their own
  egress; `poller/relay.ts` runs next to the site's database and relays what the poller cluster records
  (stock rows, confirmed events, heartbeats) into it, then hands fresh restocks to the alert sender.
* `src/lib/stock/` — the shared engine: parse → diff against the last state → confirm → `restock` /
  `soldout` events → match alert rules → one notification per restock, with cool-downs and dedupe.
* `src/lib/push/`, `public/sw.js`, `src/app/manifest.ts` — the installable web app: service worker, push
  subscriptions, notification clicks.
* `src/app/` — the Next.js 16 site: live stock pages, the live map (`/live-map`, MapLibre with OpenFreeMap
  tiles), store / city / state / country pages, the restock log, sign-in (Clerk e-mail codes), Stripe
  Checkout and the account page.
* `src/lib/db` — Drizzle on Postgres; migrations live in `drizzle/`.

## Run it yourself

```bash
cp .env.example .env.local          # fill in the values; DATABASE_URL can be any Postgres 17
npm install
npx web-push generate-vapid-keys    # → VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY in .env.local
npm run db:migrate                  # applies drizzle/*.sql
npm run seed                        # stores and configurations from data/apple
npm run dev                         # site on http://localhost:3000
npm run poller                      # one local poller process
npm test                            # vitest
npm run typecheck && npm run lint
```

`npm run build` first runs `scripts/vendor.mjs`, which copies MapLibre's worker into `public/vendor/`
(MapLibre 6 looks for it next to its main module, which bundlers relocate).

Without `IPV6_PREFIX`, a local poller shares one source address and Apple throttles it to roughly one
request a minute: enough for a smoke test, not for real coverage.

## License

MIT — see `LICENSE`.
