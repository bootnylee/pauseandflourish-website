// PauseAndFlourish.com - User Review Section
// Rendered on product review pages when FEATURE_USER_REVIEWS is true.
// Includes: star rating input, submission form, approved review display,
// and a simple moderation panel (accessible via URL hash #moderate).

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import {
  submitUserReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
  type UserReview,
} from "@/lib/userReviews";

// ─── Star Rating Input ────────────────────────────────────────────────────────

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none",
            border: "none",
            padding: "2px",
            cursor: "pointer",
            color: star <= (hovered || value) ? "#C4722A" : "#D4C5B8",
            transition: "color 0.1s",
          }}
        >
          <Star
            size={24}
            fill={star <= (hovered || value) ? "#C4722A" : "none"}
            stroke={star <= (hovered || value) ? "#C4722A" : "#D4C5B8"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Single Review Display ────────────────────────────────────────────────────

function ReviewCard({ review }: { review: UserReview }) {
  return (
    <div
      className="p-5 rounded-sm"
      style={{ backgroundColor: "#F9F5F1", border: "1px solid #E8DDD4" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={14}
              fill={s <= review.rating ? "#C4722A" : "none"}
              stroke={s <= review.rating ? "#C4722A" : "#D4C5B8"}
            />
          ))}
        </div>
        <span className="font-body font-semibold text-sm" style={{ color: "#2C2C2C" }}>
          {review.reviewerName}
        </span>
        <span className="font-body text-xs" style={{ color: "#B8A99A" }}>
          {new Date(review.submittedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <p className="font-body text-sm leading-relaxed" style={{ color: "#4A3A3A" }}>
        {review.reviewText}
      </p>
    </div>
  );
}

// ─── Submission Form ──────────────────────────────────────────────────────────

function ReviewForm({
  productSlug,
  onSubmitted,
}: {
  productSlug: string;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (text.trim().length < 20) { setError("Please write at least 20 characters."); return; }

    submitUserReview({ productSlug, reviewerName: name, rating, reviewText: text });
    setSubmitted(true);
    onSubmitted();
  }

  if (submitted) {
    return (
      <div
        className="p-5 rounded-sm text-center"
        style={{ backgroundColor: "#EDF5F3", border: "1px solid #D4EBE7" }}
      >
        <p className="font-body font-semibold" style={{ color: "#2D7D6F" }}>
          Thank you for your review!
        </p>
        <p className="font-body text-sm mt-1" style={{ color: "#4A3A3A" }}>
          Your review is pending approval and will appear shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-label text-xs font-semibold block mb-1" style={{ color: "#2C2C2C" }}>
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. Sarah M."
          className="w-full rounded-sm px-3 py-2 font-body text-sm"
          style={{
            border: "1px solid #D4C5B8",
            backgroundColor: "#FDFAF7",
            color: "#2C2C2C",
            outline: "none",
          }}
        />
      </div>

      <div>
        <label className="font-label text-xs font-semibold block mb-1" style={{ color: "#2C2C2C" }}>
          Your rating
        </label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="font-label text-xs font-semibold block mb-1" style={{ color: "#2C2C2C" }}>
          Your review
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full rounded-sm px-3 py-2 font-body text-sm resize-y"
          style={{
            border: "1px solid #D4C5B8",
            backgroundColor: "#FDFAF7",
            color: "#2C2C2C",
            outline: "none",
          }}
        />
        <p className="font-body text-xs mt-1" style={{ color: "#B8A99A" }}>
          {text.length}/2000 characters
        </p>
      </div>

      {error && (
        <p className="font-body text-sm" style={{ color: "#C0392B" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary rounded-sm px-6 py-2 font-body font-semibold text-sm"
        style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4" }}
      >
        Submit Review
      </button>
    </form>
  );
}

// ─── Moderation Panel (hidden behind #moderate hash) ─────────────────────────

function ModerationPanel({ onUpdate }: { onUpdate: () => void }) {
  const [reviews, setReviews] = useState<UserReview[]>([]);

  function refresh() {
    setReviews(getAllReviews().sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ));
    onUpdate();
  }

  useEffect(() => { refresh(); }, []);

  const statusColor: Record<string, string> = {
    pending: "#C4722A",
    approved: "#2D7D6F",
    rejected: "#8C8C8C",
  };

  return (
    <div
      className="mt-10 p-6 rounded-sm"
      style={{ backgroundColor: "#FFF8EE", border: "2px solid #C4722A" }}
    >
      <p className="font-label text-xs font-semibold mb-1" style={{ color: "#C4722A" }}>
        MODERATION PANEL — NOT PUBLIC
      </p>
      <h3 className="font-display font-bold text-lg mb-4" style={{ color: "#2C2C2C" }}>
        All Reviews ({reviews.length})
      </h3>

      {reviews.length === 0 && (
        <p className="font-body text-sm" style={{ color: "#8C8C8C" }}>No reviews yet.</p>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div
            key={r.id}
            className="p-4 rounded-sm"
            style={{ backgroundColor: "#FDFAF7", border: "1px solid #E8DDD4" }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span
                className="font-label text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: statusColor[r.status] + "22",
                  color: statusColor[r.status],
                  border: `1px solid ${statusColor[r.status]}44`,
                }}
              >
                {r.status.toUpperCase()}
              </span>
              <span className="font-body font-semibold text-sm" style={{ color: "#2C2C2C" }}>
                {r.reviewerName}
              </span>
              <span className="font-body text-xs" style={{ color: "#B8A99A" }}>
                {r.productSlug} · {new Date(r.submittedAt).toLocaleString()}
              </span>
              <span className="font-body text-xs font-semibold" style={{ color: "#C4722A" }}>
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </span>
            </div>
            <p className="font-body text-sm mb-3" style={{ color: "#4A3A3A" }}>
              {r.reviewText}
            </p>
            <div className="flex gap-2">
              {r.status !== "approved" && (
                <button
                  onClick={() => { approveReview(r.id); refresh(); }}
                  className="px-3 py-1 rounded-sm font-body font-semibold text-xs"
                  style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4", border: "none", cursor: "pointer" }}
                >
                  Approve
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  onClick={() => { rejectReview(r.id); refresh(); }}
                  className="px-3 py-1 rounded-sm font-body font-semibold text-xs"
                  style={{ backgroundColor: "#8C8C8C", color: "#FDF8F4", border: "none", cursor: "pointer" }}
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => { if (confirm("Delete this review permanently?")) { deleteReview(r.id); refresh(); } }}
                className="px-3 py-1 rounded-sm font-body font-semibold text-xs"
                style={{ backgroundColor: "#C0392B", color: "#FDF8F4", border: "none", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function UserReviewSection({
  productSlug,
  onAggregateRatingChange,
}: {
  productSlug: string;
  /** Called whenever the approved review set changes, so the parent can
   *  update the Product schema's aggregateRating field. */
  onAggregateRatingChange?: (count: number, avg: number | null) => void;
}) {
  const [approvedReviews, setApprovedReviews] = useState<UserReview[]>([]);
  const [showModeration, setShowModeration] = useState(false);

  const refresh = useCallback(() => {
    const approved = getApprovedReviews(productSlug);
    setApprovedReviews(approved);
    if (onAggregateRatingChange) {
      if (approved.length === 0) {
        onAggregateRatingChange(0, null);
      } else {
        const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
        onAggregateRatingChange(approved.length, Math.round(avg * 10) / 10);
      }
    }
  }, [productSlug, onAggregateRatingChange]);

  useEffect(() => {
    refresh();
    // Show moderation panel if URL hash is #moderate
    setShowModeration(window.location.hash === "#moderate");
  }, [refresh]);

  const avgRating =
    approvedReviews.length > 0
      ? Math.round(
          (approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length) * 10
        ) / 10
      : null;

  return (
    <section className="mt-14" aria-label="Reader reviews">
      <hr className="editorial-rule w-16 mb-8" />

      <p className="section-label mb-2">Reader Reviews</p>
      <h2
        className="font-display font-bold mb-2"
        style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
      >
        What Readers Are Saying
      </h2>

      {/* Aggregate summary */}
      {avgRating !== null && (
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-3xl" style={{ color: "#C4722A" }}>
            {avgRating}
          </span>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(avgRating) ? "#C4722A" : "none"}
                  stroke={s <= Math.round(avgRating) ? "#C4722A" : "#D4C5B8"}
                />
              ))}
            </div>
            <p className="font-body text-xs" style={{ color: "#B8A99A" }}>
              Based on {approvedReviews.length} reader review{approvedReviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Approved reviews list */}
      {approvedReviews.length > 0 ? (
        <div className="space-y-4 mb-8">
          {approvedReviews.map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="font-body text-sm mb-8" style={{ color: "#B8A99A" }}>
          No reader reviews yet. Be the first to share your experience.
        </p>
      )}

      {/* Submission form */}
      <div
        className="p-6 rounded-sm"
        style={{ backgroundColor: "#F9F5F1", border: "1px solid #E8DDD4" }}
      >
        <h3
          className="font-display font-bold mb-4"
          style={{ fontSize: "1.2rem", color: "#2C2C2C" }}
        >
          Write a Review
        </h3>
        <ReviewForm productSlug={productSlug} onSubmitted={refresh} />
      </div>

      {/* Moderation panel (only shown when #moderate hash is present) */}
      {showModeration && (
        <ModerationPanel onUpdate={refresh} />
      )}
    </section>
  );
}
