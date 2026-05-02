// PauseAndFlourish.com — Menopause Stage Data
// Defines the five journey stages used for quiz segmentation and product filtering

import { allProducts, type Product, type MenopauseStageId } from "./products";

export interface MenopauseStage {
  id: MenopauseStageId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  typicalAge: string;
  ageRange: string;       // alias for typicalAge (used in Home.tsx and MenopauseStagePage)
  primarySymptoms: string[];
  accentColor: string;
  heroKeywords: string[];
  keyFocus: string[];     // key focus areas for this stage (used in MenopauseStagePage)
}

export const menopauseStages: MenopauseStage[] = [
  {
    id: "early-perimenopause",
    name: "Early Perimenopause",
    slug: "early-perimenopause",
    tagline: "Your body is beginning to shift — and knowledge is your greatest ally.",
    description:
      "Early perimenopause typically begins in the late 30s to mid-40s. Cycles may become irregular, and subtle hormonal changes can cause mood shifts, sleep disruption, and fatigue. Most women don't yet experience hot flashes but notice changes in energy and cycle regularity.",
    typicalAge: "Late 30s – mid-40s",
    ageRange: "Late 30s – mid-40s",
    keyFocus: ["Cycle regulation", "Energy support", "Mood balance", "Sleep quality", "Stress management"],
    primarySymptoms: ["Irregular cycles", "Mood changes", "Fatigue", "Sleep disruption", "PMS changes"],
    accentColor: "#2D7D6F",
    heroKeywords: ["perimenopause symptoms", "early perimenopause signs", "perimenopause fatigue"],
  },
  {
    id: "late-perimenopause",
    name: "Late Perimenopause",
    slug: "late-perimenopause",
    tagline: "Symptoms are intensifying — targeted solutions make all the difference.",
    description:
      "Late perimenopause (typically ages 45–52) brings more pronounced hormonal fluctuations. Hot flashes, night sweats, brain fog, and weight changes become more common. This is the stage where most women begin actively seeking symptom relief.",
    typicalAge: "45–52",
    ageRange: "45–52",
    keyFocus: ["Hot flash relief", "Night sweat management", "Brain fog support", "Weight management", "Anxiety reduction"],
    primarySymptoms: ["Hot flashes", "Night sweats", "Brain fog", "Weight gain", "Anxiety"],
    accentColor: "#C4622D",
    heroKeywords: ["hot flash relief", "perimenopause brain fog", "night sweats solutions"],
  },
  {
    id: "active-menopause",
    name: "Active Menopause",
    slug: "active-menopause",
    tagline: "The transition is here — manage symptoms and protect your long-term health.",
    description:
      "Active menopause is defined as 12 consecutive months without a menstrual period (typically ages 50–55). Symptoms are often at their peak. Bone density, cardiovascular health, and sleep quality become critical priorities alongside symptom management.",
    typicalAge: "50–55",
    ageRange: "50–55",
    keyFocus: ["Cooling solutions", "Bone density", "Vaginal health", "Sleep optimization", "HRT alternatives"],
    primarySymptoms: ["Intense hot flashes", "Insomnia", "Bone density loss", "Vaginal dryness", "Joint pain"],
    accentColor: "#8B2252",
    heroKeywords: ["menopause relief", "best menopause supplements", "menopause sleep aids"],
  },
  {
    id: "early-postmenopause",
    name: "Early Postmenopause",
    slug: "early-postmenopause",
    tagline: "The transition is behind you — now it's about thriving in your next chapter.",
    description:
      "Early postmenopause (typically ages 55–60) sees many acute symptoms begin to ease, though vaginal health, skin changes, and sexual wellness become more prominent concerns. This is a time to focus on collagen, bone health, and intimate wellness.",
    typicalAge: "55–60",
    ageRange: "55–60",
    keyFocus: ["Vaginal & intimate health", "Skin & collagen", "Bone protection", "Cardiovascular health", "Sexual wellness"],
    primarySymptoms: ["Vaginal dryness", "Skin thinning", "Hair thinning", "Low libido", "Urinary changes"],
    accentColor: "#5B6E2D",
    heroKeywords: ["postmenopause vaginal health", "menopause skin care", "postmenopause supplements"],
  },
  {
    id: "late-postmenopause",
    name: "Late Postmenopause",
    slug: "late-postmenopause",
    tagline: "Longevity, vitality, and cognitive health — your wellness priorities now.",
    description:
      "Late postmenopause (60+) shifts focus to long-term health: cognitive function, bone strength, cardiovascular wellness, and maintaining energy and vitality. Supplements for brain health, muscle preservation, and joint support become increasingly important.",
    typicalAge: "60+",
    ageRange: "60+",
    keyFocus: ["Longevity supplements", "Cognitive support", "Bone & joint health", "Heart health", "Muscle preservation"],
    primarySymptoms: ["Cognitive changes", "Bone loss", "Muscle loss", "Cardiovascular risk", "Low energy"],
    accentColor: "#4A3F7A",
    heroKeywords: ["menopause cognitive health", "bone health supplements women", "postmenopause longevity"],
  },
];

export function getMenopauseStageBySlug(slug: string): MenopauseStage | undefined {
  return menopauseStages.find((s) => s.slug === slug);
}

export function getProductsForStage(stageId: MenopauseStageId): Product[] {
  return allProducts.filter(
    (p) => Array.isArray(p.stages) && p.stages.includes(stageId)
  );
}

export function getTopProductsForStage(stageId: MenopauseStageId, limit = 6): Product[] {
  const products = getProductsForStage(stageId);
  return products
    .sort((a, b) => {
      if (a.editorPick && !b.editorPick) return -1;
      if (!a.editorPick && b.editorPick) return 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}
