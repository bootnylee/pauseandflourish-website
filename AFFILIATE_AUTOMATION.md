# Affiliate Automation Status

Affiliate product integrity for PauseAndFlourish is governed by the single canonical **Weekly Affiliate Link Health-Check** in the Trail Built Overland repository.

The job runs every Monday at 15:00 Pacific Time, covers PauseAndFlourish alongside Trail Built Overland and SilkierStrands, and emails its report to `kamilano1@gmail.com`.

It validates the full mapping chain for every product:

```text
Local product name → ASIN → generated affiliate-link ASIN → Amazon catalog title
```

Amazon Creators API `GetItems` is the source of truth. Public Amazon-page validation is only a fallback when Creators API credentials are unavailable. The optional catalog refresh uses `scripts/fetch-prices.js` with `CREATORS_API_CLIENT_ID`, `CREATORS_API_CLIENT_SECRET`, and `CREATORS_API_PARTNER_TAG`.

> Legacy PA-API 5.0 jobs, daily price-sync workflows, and standalone link-check/mapping schedules are retired. Do not recreate them. Extend the canonical weekly health-check instead.

The detailed operating rules are maintained at [`Trail-Built-Overlanding-Site/AFFILIATE_AUTOMATION.md`](https://github.com/bootnylee/Trail-Built-Overlanding-Site/blob/main/AFFILIATE_AUTOMATION.md).
