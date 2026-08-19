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

## Shared Deploy Confirmation

For every agent-initiated push to `main`, run the shared engine immediately after the push:

```bash
python3 /home/ubuntu/trail-built-overland/tools/deploy_confirmation_remediation.py \
  --mode post-push --site pauseandflourish --expected-sha <pushed-commit-sha> --auto-remediate
```

The engine generates the concise deployment-confirmation email draft for `kamilano1@gmail.com`, verifies this site’s `version.txt` marker, and applies only the approved strict remediation actions. The canonical weekly health-check calls the same engine for reconciliation. Do not create a site-specific deploy-confirmation schedule, duplicate engine, secret, or threshold exception.
