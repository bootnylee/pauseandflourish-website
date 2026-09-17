// PauseAndFlourish.com — the stage mark (lunar phase) and per-stage visual notes, shared by Home and the stage pages.
import type React from "react";

export const STAGE_VISUAL: Record<string, { phase: number; now: string; tint: string }> = {
  "early-perimenopause": { phase: 0.15, now: "Cycles start to shift. Sleep and mood move first.", tint: "var(--pf-tint-2)" },
  "late-perimenopause": { phase: 0.4, now: "Hot flashes and night sweats arrive. Sleep needs help.", tint: "var(--pf-accent-tint)" },
  "active-menopause": { phase: 0.5, now: "Twelve months without a period. The full transition.", tint: "var(--pf-tint)" },
  "early-postmenopause": { phase: 0.7, now: "Symptoms settle. Bone, heart and skin take the lead.", tint: "var(--pf-paper-deep)" },
  "late-postmenopause": { phase: 0.95, now: "A steadier chapter. Strength, sleep and long-term health.", tint: "var(--pf-tint-2)" },
};

export function MoonMark({ phase, size = 44 }: { phase: number; size?: number }) {
  // phase 0 = new moon, 0.5 = full, 1 = new again. Lit fraction f; a paper-coloured
  // disc slides across the primary disc inside a clip so the crescent grows then wanes.
  const r = size / 2 - 2;
  const f = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const shift = (phase <= 0.5 ? 1 : -1) * 2 * r * (1 - f); // the paper disc is the lit part; it overlaps f of the primary disc
  const id = `moon-${Math.round(phase * 100)}-${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs><clipPath id={id}><circle cx={size / 2} cy={size / 2} r={r} /></clipPath></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--pf-primary)" />
      {f > 0.02 && <circle cx={size / 2 + shift} cy={size / 2} r={r} fill="var(--pf-paper)" clipPath={`url(#${id})`} />}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pf-primary)" strokeWidth="1.5" />
    </svg>
  );
}

