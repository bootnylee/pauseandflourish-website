// PauseAndFlourish.com - Feature Flags
// Controls which features are visible to the public.
// To enable a feature: set the corresponding flag to true and redeploy.

/**
 * USER_REVIEWS
 * When true: the user-review submission form, star ratings, and review display
 * section are visible on product pages. AggregateRating schema is emitted only
 * when at least one approved review exists.
 *
 * When false (default): the entire user-review UI is hidden. No AggregateRating
 * schema is emitted. The form and storage code are compiled in but never rendered.
 *
 * HOW TO ENABLE:
 * 1. Change the value below from `false` to `true`
 * 2. Commit and push to GitHub — Netlify will auto-deploy
 * 3. See /docs/user-reviews-activation.md for full instructions
 */
export const FEATURE_USER_REVIEWS = false;

/**
 * USER_REVIEWS_REQUIRE_MODERATION
 * When true: submitted reviews are stored with status "pending" and must be
 * manually approved before they appear publicly or count toward AggregateRating.
 * When false: reviews are auto-approved on submission.
 * Recommended: keep true.
 */
export const FEATURE_USER_REVIEWS_REQUIRE_MODERATION = true;
