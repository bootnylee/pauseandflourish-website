// PauseAndFlourish.com - User Review Storage & Logic
// localStorage-based review storage with moderation support.
// AggregateRating is ONLY computed from genuine approved reviews — never fabricated.

import { FEATURE_USER_REVIEWS_REQUIRE_MODERATION } from "./featureFlags";

export interface UserReview {
  id: string;           // UUID-style unique ID
  productSlug: string;
  reviewerName: string; // display name (not stored as PII beyond what user provides)
  rating: number;       // 1–5 integer
  reviewText: string;
  submittedAt: string;  // ISO timestamp
  status: "pending" | "approved" | "rejected";
}

const STORAGE_KEY = "paf_user_reviews_v1";

// ─── Read / Write ─────────────────────────────────────────────────────────────

function readAll(): UserReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserReview[];
  } catch {
    return [];
  }
}

function writeAll(reviews: UserReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Submit a new user review for a product.
 * If FEATURE_USER_REVIEWS_REQUIRE_MODERATION is true, the review is stored
 * with status "pending" and will not appear publicly until approved.
 * Returns the created review.
 */
export function submitUserReview(params: {
  productSlug: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
}): UserReview {
  const review: UserReview = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productSlug: params.productSlug,
    reviewerName: params.reviewerName.trim().slice(0, 80),
    rating: Math.min(5, Math.max(1, Math.round(params.rating))),
    reviewText: params.reviewText.trim().slice(0, 2000),
    submittedAt: new Date().toISOString(),
    status: FEATURE_USER_REVIEWS_REQUIRE_MODERATION ? "pending" : "approved",
  };

  const all = readAll();
  writeAll([...all, review]);
  return review;
}

/**
 * Returns all approved reviews for a given product slug.
 */
export function getApprovedReviews(productSlug: string): UserReview[] {
  return readAll().filter(
    r => r.productSlug === productSlug && r.status === "approved"
  );
}

/**
 * Returns all reviews for a given product slug regardless of status.
 * Used by the moderation panel.
 */
export function getAllReviewsForProduct(productSlug: string): UserReview[] {
  return readAll().filter(r => r.productSlug === productSlug);
}

/**
 * Returns all reviews across all products. Used by the moderation panel.
 */
export function getAllReviews(): UserReview[] {
  return readAll();
}

/**
 * Approve a review by ID. Returns true if found and updated.
 */
export function approveReview(id: string): boolean {
  const all = readAll();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], status: "approved" };
  writeAll(all);
  return true;
}

/**
 * Reject a review by ID. Returns true if found and updated.
 */
export function rejectReview(id: string): boolean {
  const all = readAll();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], status: "rejected" };
  writeAll(all);
  return true;
}

/**
 * Delete a review permanently by ID. Returns true if found and removed.
 */
export function deleteReview(id: string): boolean {
  const all = readAll();
  const filtered = all.filter(r => r.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

// ─── AggregateRating Computation ──────────────────────────────────────────────

export interface AggregateRatingData {
  ratingValue: number;  // average, rounded to 1 decimal
  reviewCount: number;  // count of approved reviews
  bestRating: 5;
  worstRating: 1;
}

/**
 * Computes AggregateRating from GENUINE approved user reviews only.
 * Returns null if there are no approved reviews (schema must NOT be emitted).
 * This function MUST be the only source of AggregateRating data — never fabricate.
 */
export function computeAggregateRating(productSlug: string): AggregateRatingData | null {
  const approved = getApprovedReviews(productSlug);
  if (approved.length === 0) return null;

  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / approved.length) * 10) / 10;

  return {
    ratingValue: avg,
    reviewCount: approved.length,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Builds a schema.org AggregateRating object from genuine approved reviews.
 * Returns null if there are no approved reviews — caller must not emit schema.
 */
export function buildAggregateRatingSchema(productSlug: string): object | null {
  const data = computeAggregateRating(productSlug);
  if (!data) return null;

  return {
    "@type": "AggregateRating",
    ratingValue: data.ratingValue,
    reviewCount: data.reviewCount,
    bestRating: data.bestRating,
    worstRating: data.worstRating,
  };
}
