// PauseAndFlourish.com — Product Data
// All Amazon links use affiliate tag: pauseandflourish-20
// Categories: menopause supplements, sleep, hot flash, bone health, intimate health, skincare, fitness, cognitive

export const AFFILIATE_TAG = "pauseandflourish-20";

export function buildAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

/** Alias for buildAffiliateUrl — used by ProductCard and other components */
export const amazonLink = buildAffiliateUrl;

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  asin: string;
  affiliateUrl: string;
  category: string;
  categorySlug: string;
  stages: string[];
  price: string;
  rating: number;
  reviewCount: number;
  heroImage: string;
  summary: string;
  pros: string[];
  cons: string[];
  ingredients?: string[];
  verdict: string;
  score: number; // 1-10
  editorPick: boolean;
  bestFor: string;
  tags: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
}

export interface Comparison {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  productIds: [string, string];
  winner: string;
  summary: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: "multi-symptom-supplements",
    slug: "multi-symptom-supplements",
    name: "Multi-Symptom Supplements",
    description: "Comprehensive formulas targeting hot flashes, mood, sleep, and energy simultaneously.",
    icon: "💊",
    color: "#2D7D6F",
    bg: "#E8F5F2",
  },
  {
    id: "sleep-mood-support",
    slug: "sleep-mood-support",
    name: "Sleep & Mood Support",
    description: "Supplements and tools to restore restful sleep and stabilize mood during hormonal shifts.",
    icon: "🌙",
    color: "#5B4A8A",
    bg: "#F0ECFF",
  },
  {
    id: "hot-flash-cooling",
    slug: "hot-flash-cooling",
    name: "Hot Flash & Cooling",
    description: "Products designed to reduce hot flash frequency and intensity, and keep you cool.",
    icon: "❄️",
    color: "#1A6B8A",
    bg: "#E8F4FA",
  },
  {
    id: "bone-joint-health",
    slug: "bone-joint-health",
    name: "Bone & Joint Health",
    description: "Calcium, magnesium, vitamin D, and collagen supplements to protect bone density and joint comfort.",
    icon: "🦴",
    color: "#7A5C1E",
    bg: "#FFF8E7",
  },
  {
    id: "vaginal-intimate-health",
    slug: "vaginal-intimate-health",
    name: "Vaginal & Intimate Health",
    description: "Moisturizers, lubricants, and supplements for vaginal dryness and intimate comfort.",
    icon: "🌸",
    color: "#8B3A6B",
    bg: "#FFF0F8",
  },
  {
    id: "menopause-skincare",
    slug: "menopause-skincare",
    name: "Menopause Skincare",
    description: "Collagen supplements, moisturizers, and serums formulated for menopausal skin changes.",
    icon: "✨",
    color: "#C4722A",
    bg: "#FFF5EC",
  },
  {
    id: "fitness-pelvic-health",
    slug: "fitness-pelvic-health",
    name: "Fitness & Pelvic Health",
    description: "Resistance training tools, pelvic floor devices, and protein supplements for midlife fitness.",
    icon: "💪",
    color: "#2C6B2F",
    bg: "#EDFAEE",
  },
  {
    id: "cognitive-energy-support",
    slug: "cognitive-energy-support",
    name: "Cognitive & Energy Support",
    description: "Supplements targeting brain fog, memory, focus, and fatigue common in perimenopause.",
    icon: "🧠",
    color: "#1A5C8B",
    bg: "#EEF6FF",
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const allProducts: Product[] = [
  // ── Multi-Symptom Supplements ──────────────────────────────────────────────
  {
    id: "remifemin-menopause",
    slug: "remifemin-menopause-supplement",
    name: "Remifemin Menopause Supplement",
    brand: "Remifemin",
    asin: "B0CRKW8DFJ",
    affiliateUrl: buildAffiliateUrl("B0CRKW8DFJ"),
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    stages: ["late-perimenopause", "active-menopause"],
    price: "$22.99",
    rating: 4.3,
    reviewCount: 4821,
    heroImage: "https://m.media-amazon.com/images/I/61jx9mwtGbL._AC_SL1500_.jpg",
    summary: "Remifemin is one of the most clinically studied black cohosh supplements on the market, with over 30 years of research supporting its use for hot flash and mood relief.",
    pros: [
      "30+ years of clinical research behind the formula",
      "Standardized black cohosh extract (20mg per tablet)",
      "Non-hormonal — safe for women who cannot use HRT",
      "Over 4,800 Amazon reviews averaging 4.3 stars",
    ],
    cons: [
      "Results may take 4–8 weeks to appear",
      "Not suitable during pregnancy or for those with liver conditions",
      "Some users report mild GI upset initially",
    ],
    ingredients: ["Black Cohosh Extract (Actaea racemosa) 20mg"],
    verdict: "Remifemin is our top pick for women seeking a well-researched, non-hormonal option for hot flashes and mood swings. The clinical backing sets it apart from most competitors.",
    score: 9.0,
    editorPick: true,
    bestFor: "Hot flashes & mood swings",
    tags: ["black cohosh", "non-hormonal", "hot flashes", "clinically studied"],
  },
  {
    id: "estroven-complete",
    slug: "estroven-complete-menopause-relief",
    name: "Estroven Complete Multi-Symptom Menopause Relief",
    brand: "Estroven",
    asin: "B00DTCNI2I",
    affiliateUrl: buildAffiliateUrl("B00DTCNI2I"),
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$29.99",
    rating: 4.4,
    reviewCount: 12847,
    heroImage: "https://m.media-amazon.com/images/I/7120+vq4VnL._AC_SL1500_.jpg",
    summary: "Estroven Complete addresses hot flashes, night sweats, mood, sleep, and energy in a single daily capsule, making it the most popular multi-symptom menopause supplement on Amazon.",
    pros: [
      "Addresses 5 symptoms in one capsule",
      "Contains black cohosh + soy isoflavones",
      "12,000+ Amazon reviews — most reviewed in category",
      "Drug-free and hormone-free",
    ],
    cons: [
      "Soy isoflavones may not suit women with soy sensitivity",
      "Some users prefer single-ingredient formulas",
      "Results vary significantly between individuals",
    ],
    ingredients: ["Black Cohosh 80mg", "Soy Isoflavones 50mg", "Melatonin 3mg", "Magnolia Bark Extract"],
    verdict: "Estroven Complete is the bestselling menopause supplement on Amazon for good reason — it's comprehensive, well-tolerated, and backed by thousands of positive reviews.",
    score: 8.8,
    editorPick: true,
    bestFor: "Multi-symptom relief in one capsule",
    tags: ["multi-symptom", "black cohosh", "soy isoflavones", "bestseller"],
  },
  {
    id: "bonafide-relizen",
    slug: "bonafide-relizen-hot-flash-relief",
    name: "Bonafide Relizen Hot Flash Relief",
    brand: "Bonafide",
    asin: "B0FTTCLPB2",
    affiliateUrl: buildAffiliateUrl("B0FTTCLPB2"),
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    stages: ["late-perimenopause", "active-menopause"],
    price: "$39.99",
    rating: 4.1,
    reviewCount: 2341,
    heroImage: "https://m.media-amazon.com/images/I/611R8Jct43L._AC_SL1500_.jpg",
    summary: "Relizen uses a proprietary Swedish pollen extract (Sérélys) that is hormone-free and clinically shown to reduce hot flash frequency by up to 65% in 12 weeks.",
    pros: [
      "Hormone-free pollen extract — unique mechanism of action",
      "Clinically shown to reduce hot flashes by up to 65%",
      "Safe for breast cancer survivors",
      "No black cohosh or soy",
    ],
    cons: [
      "Premium price point ($39.99/month)",
      "Pollen extract — not suitable for those with severe pollen allergies",
      "Requires 8–12 weeks for full effect",
    ],
    ingredients: ["Sérélys® Pollen Extract 160mg"],
    verdict: "Relizen is the best choice for women who cannot use black cohosh or soy, including breast cancer survivors. The clinical data is impressive and the formula is uniquely safe.",
    score: 8.5,
    editorPick: false,
    bestFor: "Breast cancer survivors & soy-free needs",
    tags: ["pollen extract", "hormone-free", "breast cancer safe", "hot flashes"],
  },

  // ── Sleep & Mood Support ───────────────────────────────────────────────────
  {
    id: "natrol-melatonin-10mg",
    slug: "natrol-melatonin-10mg-sleep-aid",
    name: "Natrol Melatonin 10mg Advanced Sleep",
    brand: "Natrol",
    asin: "B07N46LTJJ",
    affiliateUrl: buildAffiliateUrl("B07N46LTJJ"),
    category: "Sleep & Mood Support",
    categorySlug: "sleep-mood-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$12.99",
    rating: 4.5,
    reviewCount: 28943,
    heroImage: "https://m.media-amazon.com/images/I/7129sag1N7L._AC_SL1500_.jpg",
    summary: "Natrol Melatonin 10mg is the #1 melatonin brand in the US, offering a time-release formula that helps women fall asleep faster and stay asleep through the night.",
    pros: [
      "#1 melatonin brand in the US",
      "Time-release formula for sustained sleep support",
      "Drug-free and non-habit forming",
      "Excellent value at $12.99 for 60 tablets",
    ],
    cons: [
      "10mg may be too high for some — start with 5mg if sensitive",
      "Not a solution for underlying hormonal sleep disruption",
      "May cause morning grogginess in some users",
    ],
    ingredients: ["Melatonin 10mg (time-release)"],
    verdict: "For women whose menopause-related sleep disruption is primarily about falling and staying asleep, Natrol 10mg is an excellent, affordable, and well-studied option.",
    score: 8.7,
    editorPick: true,
    bestFor: "Falling asleep & staying asleep",
    tags: ["melatonin", "sleep", "time-release", "non-habit forming"],
  },
  {
    id: "magnesium-glycinate-sleep",
    slug: "doctors-best-magnesium-glycinate",
    name: "Doctor's Best High Absorption Magnesium Glycinate",
    brand: "Doctor's Best",
    asin: "B0CWM5K6W6",
    affiliateUrl: buildAffiliateUrl("B0CWM5K6W6"),
    category: "Sleep & Mood Support",
    categorySlug: "sleep-mood-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$18.99",
    rating: 4.6,
    reviewCount: 41287,
    heroImage: "https://m.media-amazon.com/images/I/71DDiPUWzQL._AC_SL1500_.jpg",
    summary: "Magnesium glycinate is the most bioavailable form of magnesium, supporting sleep quality, mood regulation, muscle relaxation, and bone health — all critical during menopause.",
    pros: [
      "Highly bioavailable glycinate form — minimal GI upset",
      "Supports sleep, mood, muscle relaxation, and bone health",
      "41,000+ Amazon reviews — exceptional track record",
      "Affordable at $18.99 for 240 tablets",
    ],
    cons: [
      "Large tablets — some prefer capsules",
      "Benefits are gradual (2–4 weeks)",
      "Not a standalone sleep solution for severe insomnia",
    ],
    ingredients: ["Magnesium (as Magnesium Glycinate Chelate) 200mg per serving"],
    verdict: "Magnesium glycinate is one of the most impactful supplements a perimenopausal woman can take. Doctor's Best offers the best quality-to-price ratio in this category.",
    score: 9.2,
    editorPick: true,
    bestFor: "Sleep, mood & bone health combined",
    tags: ["magnesium", "sleep", "mood", "bone health", "glycinate"],
  },
  {
    id: "olly-goodbye-stress",
    slug: "olly-goodbye-stress-gummies",
    name: "OLLY Goodbye Stress Gummies",
    brand: "OLLY",
    asin: "B01M1HYRNJ",
    affiliateUrl: buildAffiliateUrl("B01M1HYRNJ"),
    category: "Sleep & Mood Support",
    categorySlug: "sleep-mood-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    price: "$13.99",
    rating: 4.4,
    reviewCount: 19823,
    heroImage: "https://m.media-amazon.com/images/I/71IhID2A4pL._AC_SL1500_.jpg",
    summary: "OLLY Goodbye Stress gummies combine GABA, L-Theanine, and lemon balm to ease anxiety and stress — common symptoms during perimenopause — in a pleasant, easy-to-take format.",
    pros: [
      "Pleasant berry flavor — easy daily compliance",
      "GABA + L-Theanine combination supports calm without sedation",
      "No hormones or black cohosh",
      "Great for daytime stress relief",
    ],
    cons: [
      "Contains added sugars (3g per serving)",
      "Not as potent as pharmaceutical-grade options",
      "Gummy format may not suit all preferences",
    ],
    ingredients: ["GABA 100mg", "L-Theanine 50mg", "Lemon Balm Extract 75mg"],
    verdict: "OLLY Goodbye Stress is an excellent entry-level option for women experiencing anxiety and stress during perimenopause, particularly those new to supplements.",
    score: 7.8,
    editorPick: false,
    bestFor: "Daytime anxiety & stress relief",
    tags: ["stress", "anxiety", "GABA", "L-theanine", "gummies"],
  },

  // ── Hot Flash & Cooling ────────────────────────────────────────────────────
  {
    id: "cooling-towel-chill-pal",
    slug: "chill-pal-mesh-cooling-towel",
    name: "Chill Pal Mesh Cooling Towel",
    brand: "Chill Pal",
    asin: "B082HNDCTW",
    affiliateUrl: buildAffiliateUrl("B082HNDCTW"),
    category: "Hot Flash & Cooling",
    categorySlug: "hot-flash-cooling",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$9.95",
    rating: 4.5,
    reviewCount: 32741,
    heroImage: "https://m.media-amazon.com/images/I/91QJY0MQT4L._AC_SL1500_.jpg",
    summary: "The Chill Pal mesh cooling towel provides instant, drug-free hot flash relief by lowering skin temperature by up to 30°F when wet. Compact enough for purse or nightstand.",
    pros: [
      "Instant cooling — works in seconds",
      "Drug-free and hormone-free",
      "Compact and portable — fits in a purse",
      "Excellent value at under $10",
    ],
    cons: [
      "Requires water to activate",
      "Cooling effect diminishes as towel dries",
      "Not a long-term solution for frequent hot flashes",
    ],
    verdict: "The Chill Pal is an essential, affordable tool for managing hot flashes on the go. Every woman in perimenopause or menopause should have one.",
    score: 8.0,
    editorPick: false,
    bestFor: "On-the-go hot flash relief",
    tags: ["cooling", "hot flashes", "portable", "drug-free"],
  },
  {
    id: "bedfan-personal-cooling",
    slug: "bedfan-personal-bed-fan",
    name: "BedFan Personal Cooling Fan",
    brand: "BedFan",
    asin: "B0GKB6825Z",
    affiliateUrl: buildAffiliateUrl("B0GKB6825Z"),
    category: "Hot Flash & Cooling",
    categorySlug: "hot-flash-cooling",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$69.95",
    rating: 4.2,
    reviewCount: 4218,
    heroImage: "https://m.media-amazon.com/images/I/71nbij27yIL._AC_SL1500_.jpg",
    summary: "The BedFan blows a gentle stream of cool air between the sheets, targeting night sweats at the source without disturbing a sleeping partner.",
    pros: [
      "Targets night sweats directly at the source",
      "Adjustable airflow — won't disturb partner",
      "Quiet operation",
      "Eliminates need to lower room temperature",
    ],
    cons: [
      "Higher price point ($69.95)",
      "Bulky — not portable",
      "Some users find the airflow insufficient for severe night sweats",
    ],
    verdict: "For women whose night sweats are disrupting sleep, the BedFan is a game-changing investment. The targeted cooling approach is more effective than lowering room temperature.",
    score: 8.2,
    editorPick: false,
    bestFor: "Night sweats & sleep disruption",
    tags: ["night sweats", "cooling", "sleep", "bed fan"],
  },
  {
    id: "amberen-menopause-relief",
    slug: "amberen-multi-symptom-menopause-relief",
    name: "Amberen Multi-Symptom Menopause Relief",
    brand: "Amberen",
    asin: "B0DLLH7KMW",
    affiliateUrl: buildAffiliateUrl("B0DLLH7KMW"),
    category: "Hot Flash & Cooling",
    categorySlug: "hot-flash-cooling",
    stages: ["active-menopause", "early-postmenopause"],
    price: "$34.99",
    rating: 4.0,
    reviewCount: 8921,
    heroImage: "https://m.media-amazon.com/images/I/71GKdztK8GL._AC_SL1500_.jpg",
    summary: "Amberen uses a patented ammonium succinate complex to address hot flashes, night sweats, weight gain, and mood changes through a unique metabolic approach rather than phytoestrogens.",
    pros: [
      "Unique non-hormonal, non-phytoestrogen approach",
      "Addresses weight gain — uncommon in this category",
      "90-day money-back guarantee",
      "No black cohosh or soy",
    ],
    cons: [
      "Limited independent clinical research",
      "Results take 30–90 days",
      "Some users report no benefit",
    ],
    verdict: "Amberen is worth trying for women who have not responded to black cohosh or soy-based supplements. The money-back guarantee reduces the financial risk.",
    score: 7.5,
    editorPick: false,
    bestFor: "Women who haven't responded to standard supplements",
    tags: ["hot flashes", "weight gain", "non-phytoestrogen", "ammonium succinate"],
  },

  // ── Bone & Joint Health ────────────────────────────────────────────────────
  {
    id: "citracal-calcium-d3",
    slug: "citracal-petites-calcium-d3",
    name: "Citracal Petites Calcium Citrate + D3",
    brand: "Citracal",
    asin: "B0FNVNR9CF",
    affiliateUrl: buildAffiliateUrl("B0FNVNR9CF"),
    category: "Bone & Joint Health",
    categorySlug: "bone-joint-health",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$16.99",
    rating: 4.7,
    reviewCount: 22841,
    heroImage: "https://m.media-amazon.com/images/I/81ZSh6JO+xL._AC_SL1500_.jpg",
    summary: "Citracal Petites uses calcium citrate — the most bioavailable form of calcium — combined with vitamin D3 for optimal absorption. The small tablet size makes it easy to take consistently.",
    pros: [
      "Calcium citrate — absorbed with or without food",
      "Small tablet size — easy to swallow",
      "Includes vitamin D3 for enhanced calcium absorption",
      "22,000+ reviews averaging 4.7 stars",
    ],
    cons: [
      "Requires multiple tablets per day for full dose",
      "Calcium supplements should be taken in split doses",
      "Not a standalone bone health solution",
    ],
    ingredients: ["Calcium (as Calcium Citrate) 200mg", "Vitamin D3 500 IU"],
    verdict: "Citracal Petites is our top calcium recommendation for menopausal women. The citrate form, small size, and D3 inclusion make it the most practical daily calcium supplement.",
    score: 9.0,
    editorPick: true,
    bestFor: "Daily calcium & bone density maintenance",
    tags: ["calcium", "vitamin D3", "bone health", "calcium citrate"],
  },
  {
    id: "garden-of-life-bone-strength",
    slug: "garden-of-life-mykind-bone-strength",
    name: "Garden of Life mykind Organics Bone Strength",
    brand: "Garden of Life",
    asin: "B0716RWHX4",
    affiliateUrl: buildAffiliateUrl("B0716RWHX4"),
    category: "Bone & Joint Health",
    categorySlug: "bone-joint-health",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$39.99",
    rating: 4.4,
    reviewCount: 7823,
    heroImage: "https://m.media-amazon.com/images/I/71XQUlNXVsL._AC_SL1500_.jpg",
    summary: "Garden of Life Bone Strength provides a whole-food calcium complex from algae, combined with magnesium, vitamin D3, vitamin K2, and strontium for comprehensive bone support.",
    pros: [
      "Whole-food algae calcium — highly bioavailable",
      "Includes vitamin K2 (MK-7) for calcium routing to bones",
      "USDA Organic and Non-GMO Project Verified",
      "Comprehensive formula — calcium, D3, K2, magnesium, strontium",
    ],
    cons: [
      "Premium price ($39.99)",
      "Large serving size (4 tablets per day)",
      "Algae calcium may have slight taste",
    ],
    ingredients: ["Calcium (from Algae) 770mg", "Magnesium 60mg", "Vitamin D3 1000 IU", "Vitamin K2 (MK-7) 100mcg", "Strontium 3.4mg"],
    verdict: "For women who want the most comprehensive, clean-label bone health supplement, Garden of Life Bone Strength is the premium choice. The K2 inclusion is particularly valuable.",
    score: 8.8,
    editorPick: false,
    bestFor: "Comprehensive bone health with K2",
    tags: ["bone health", "calcium", "vitamin K2", "organic", "algae calcium"],
  },

  // ── Vaginal & Intimate Health ──────────────────────────────────────────────
  {
    id: "replens-long-lasting-moisturizer",
    slug: "replens-long-lasting-vaginal-moisturizer",
    name: "Replens Long-Lasting Vaginal Moisturizer",
    brand: "Replens",
    asin: "B0071Q5PL0",
    affiliateUrl: buildAffiliateUrl("B0071Q5PL0"),
    category: "Vaginal & Intimate Health",
    categorySlug: "vaginal-intimate-health",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$19.99",
    rating: 4.4,
    reviewCount: 18923,
    heroImage: "https://m.media-amazon.com/images/I/71XhvmGPvBL._SL1500_.jpg",
    summary: "Replens is the #1 OB/GYN recommended vaginal moisturizer, providing up to 3 days of relief from vaginal dryness with a single application. Hormone-free and clinically tested.",
    pros: [
      "#1 OB/GYN recommended vaginal moisturizer",
      "Lasts up to 3 days per application",
      "Hormone-free — safe for all women including cancer survivors",
      "Clinically tested for safety and efficacy",
    ],
    cons: [
      "Some women prefer daily application for consistent comfort",
      "Applicator-based — less convenient than topical creams",
      "May not be sufficient for severe vaginal atrophy",
    ],
    verdict: "Replens is the gold standard for non-hormonal vaginal moisture. The 3-day duration and OB/GYN endorsement make it the most trusted option in this category.",
    score: 9.1,
    editorPick: true,
    bestFor: "Vaginal dryness & intimate comfort",
    tags: ["vaginal dryness", "moisturizer", "hormone-free", "OB/GYN recommended"],
  },
  {
    id: "hyalogic-intimate-serum",
    slug: "hyalogic-hyaluronic-acid-intimate-serum",
    name: "Hyalogic Intimate Serum with Hyaluronic Acid",
    brand: "Hyalogic",
    asin: "B000Z96ZJQ",
    affiliateUrl: buildAffiliateUrl("B000Z96ZJQ"),
    category: "Vaginal & Intimate Health",
    categorySlug: "vaginal-intimate-health",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$24.99",
    rating: 4.3,
    reviewCount: 3241,
    heroImage: "https://m.media-amazon.com/images/I/519hwkXRxiL._SL1000_.jpg",
    summary: "Hyalogic Intimate Serum uses hyaluronic acid — the same molecule used in premium skincare — to provide deep, lasting hydration to vaginal tissue.",
    pros: [
      "Hyaluronic acid provides deep tissue hydration",
      "Fragrance-free and paraben-free",
      "Can be used daily for ongoing maintenance",
      "Suitable for sensitive skin",
    ],
    cons: [
      "Less research than Replens",
      "Higher price per application",
      "Some users prefer the Replens applicator format",
    ],
    verdict: "Hyalogic Intimate Serum is an excellent alternative to Replens for women who prefer a hyaluronic acid approach or want a daily-use format.",
    score: 8.0,
    editorPick: false,
    bestFor: "Daily intimate hydration with hyaluronic acid",
    tags: ["hyaluronic acid", "vaginal dryness", "intimate health", "daily use"],
  },

  // ── Menopause Skincare ─────────────────────────────────────────────────────
  {
    id: "vital-proteins-collagen-peptides",
    slug: "vital-proteins-collagen-peptides",
    name: "Vital Proteins Collagen Peptides",
    brand: "Vital Proteins",
    asin: "B09RQBHRCT",
    affiliateUrl: buildAffiliateUrl("B09RQBHRCT"),
    category: "Menopause Skincare",
    categorySlug: "menopause-skincare",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$43.00",
    rating: 4.5,
    reviewCount: 89234,
    heroImage: "https://m.media-amazon.com/images/I/71QZNoHaxdL._AC_SL1500_.jpg",
    summary: "Vital Proteins Collagen Peptides is the bestselling collagen supplement in the US, supporting skin elasticity, joint health, and hair and nail strength — all of which decline during menopause.",
    pros: [
      "Bestselling collagen supplement in the US",
      "Unflavored — mixes easily into coffee, smoothies, or water",
      "Clinically studied for skin elasticity improvement",
      "Also supports joints, hair, and nails",
    ],
    cons: [
      "Premium price ($43 for 20oz)",
      "Bovine-sourced — not suitable for vegetarians",
      "Benefits require consistent use for 8+ weeks",
    ],
    ingredients: ["Bovine Collagen Peptides 20g per serving", "Vitamin C 90mg", "Hyaluronic Acid 80mg"],
    verdict: "Vital Proteins is the benchmark collagen supplement. For menopausal women experiencing skin thinning, joint discomfort, and hair changes, it addresses multiple concerns simultaneously.",
    score: 9.0,
    editorPick: true,
    bestFor: "Skin elasticity, joints & hair",
    tags: ["collagen", "skin elasticity", "joint health", "hair", "bestseller"],
  },
  {
    id: "neutrogena-rapid-firming",
    slug: "neutrogena-rapid-firming-retinol-serum",
    name: "Neutrogena Rapid Firming Peptide Contour Lift Serum",
    brand: "Neutrogena",
    asin: "B07TTLVCYK",
    affiliateUrl: buildAffiliateUrl("B07TTLVCYK"),
    category: "Menopause Skincare",
    categorySlug: "menopause-skincare",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$29.99",
    rating: 4.2,
    reviewCount: 6821,
    heroImage: "https://m.media-amazon.com/images/I/81JinWKTvHL._SL1500_.jpg",
    summary: "Neutrogena's Rapid Firming serum combines peptides and hyaluronic acid to address the skin laxity and moisture loss that accelerates after menopause.",
    pros: [
      "Peptide complex targets skin firmness directly",
      "Hyaluronic acid for immediate plumping",
      "Dermatologist-tested formula",
      "Accessible price point for a peptide serum",
    ],
    cons: [
      "Contains fragrance — may irritate sensitive skin",
      "Results are subtle compared to prescription retinoids",
      "Some users prefer fragrance-free formulas",
    ],
    verdict: "Neutrogena Rapid Firming is an excellent accessible peptide serum for menopausal skin. It won't replace prescription retinoids but delivers visible improvement at a fraction of the cost.",
    score: 7.8,
    editorPick: false,
    bestFor: "Skin firmness & hydration on a budget",
    tags: ["peptides", "skin firming", "hyaluronic acid", "menopause skincare"],
  },

  // ── Fitness & Pelvic Health ────────────────────────────────────────────────
  {
    id: "kegel-exerciser-perifit",
    slug: "perifit-kegel-exerciser-app",
    name: "Perifit Kegel Exerciser with App",
    brand: "Perifit",
    asin: "B0CND3N4HR",
    affiliateUrl: buildAffiliateUrl("B0CND3N4HR"),
    category: "Fitness & Pelvic Health",
    categorySlug: "fitness-pelvic-health",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$89.99",
    rating: 4.3,
    reviewCount: 4821,
    heroImage: "https://m.media-amazon.com/images/I/71nIVbt32jL._AC_SL1500_.jpg",
    summary: "Perifit is a biofeedback Kegel trainer that connects to a smartphone app, turning pelvic floor exercises into interactive games. Clinically validated for stress urinary incontinence.",
    pros: [
      "Biofeedback ensures correct muscle engagement",
      "App-guided games improve compliance",
      "Clinically validated for urinary incontinence",
      "Bluetooth connectivity — tracks progress over time",
    ],
    cons: [
      "High price point ($89.99)",
      "Requires smartphone for full functionality",
      "Not suitable for women with certain pelvic conditions",
    ],
    verdict: "Perifit is the most effective at-home pelvic floor training tool available. For women experiencing stress incontinence or pelvic floor weakness during menopause, it's a worthwhile investment.",
    score: 8.7,
    editorPick: true,
    bestFor: "Pelvic floor strengthening & urinary incontinence",
    tags: ["pelvic floor", "Kegel", "biofeedback", "urinary incontinence"],
  },
  {
    id: "optimum-nutrition-gold-whey",
    slug: "optimum-nutrition-gold-standard-whey",
    name: "Optimum Nutrition Gold Standard 100% Whey Protein",
    brand: "Optimum Nutrition",
    asin: "B002DYIZEO",
    affiliateUrl: buildAffiliateUrl("B002DYIZEO"),
    category: "Fitness & Pelvic Health",
    categorySlug: "fitness-pelvic-health",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$34.99",
    rating: 4.6,
    reviewCount: 134821,
    heroImage: "https://m.media-amazon.com/images/I/71SGNJz5y8L._AC_SL1500_.jpg",
    summary: "Adequate protein intake is critical for preserving muscle mass during menopause. Gold Standard Whey is the bestselling protein supplement in the world, providing 24g of protein per serving.",
    pros: [
      "24g protein per serving — supports muscle preservation",
      "Bestselling protein supplement globally",
      "Wide flavor variety",
      "Excellent amino acid profile including leucine for muscle synthesis",
    ],
    cons: [
      "Dairy-based — not suitable for lactose intolerance",
      "Some flavors contain artificial sweeteners",
      "Not specifically formulated for menopause",
    ],
    ingredients: ["Whey Protein Isolate & Concentrate blend 24g protein per serving"],
    verdict: "Protein supplementation is one of the most evidence-backed interventions for preserving muscle mass during menopause. Gold Standard Whey is the most trusted option in this category.",
    score: 8.9,
    editorPick: false,
    bestFor: "Muscle preservation & strength training support",
    tags: ["protein", "muscle preservation", "whey", "fitness", "strength training"],
  },

  // ── Cognitive & Energy Support ─────────────────────────────────────────────
  {
    id: "alpha-gpc-cognitive",
    slug: "double-wood-alpha-gpc-cognitive-support",
    name: "Double Wood Supplements Alpha GPC",
    brand: "Double Wood Supplements",
    asin: "B0GP23MVCC",
    affiliateUrl: buildAffiliateUrl("B0GP23MVCC"),
    category: "Cognitive & Energy Support",
    categorySlug: "cognitive-energy-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$29.95",
    rating: 4.4,
    reviewCount: 9821,
    heroImage: "https://m.media-amazon.com/images/I/71ed00jAzZL._AC_SL1500_.jpg",
    summary: "Alpha GPC is a choline compound that supports acetylcholine production — the neurotransmitter most affected by estrogen decline — making it one of the most targeted supplements for menopausal brain fog.",
    pros: [
      "Directly supports acetylcholine — the neurotransmitter most affected by estrogen decline",
      "Clinically studied for cognitive function",
      "Well-tolerated with minimal side effects",
      "Affordable at $29.95",
    ],
    cons: [
      "Less well-known than mainstream supplements",
      "Some users report mild headaches initially",
      "Not a substitute for addressing underlying hormonal causes",
    ],
    ingredients: ["Alpha GPC (L-Alpha glycerylphosphorylcholine) 300mg per capsule"],
    verdict: "Alpha GPC is our top pick for menopausal brain fog. Its targeted mechanism of action — supporting the neurotransmitter most affected by estrogen loss — makes it uniquely relevant for this symptom.",
    score: 8.6,
    editorPick: true,
    bestFor: "Brain fog & memory support",
    tags: ["brain fog", "cognitive", "alpha GPC", "choline", "memory"],
  },
  {
    id: "rhodiola-rosea-energy",
    slug: "nootropics-depot-rhodiola-rosea",
    name: "Nootropics Depot Rhodiola Rosea Extract",
    brand: "Nootropics Depot",
    asin: "B0775B46M3",
    affiliateUrl: buildAffiliateUrl("B0775B46M3"),
    category: "Cognitive & Energy Support",
    categorySlug: "cognitive-energy-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    price: "$19.99",
    rating: 4.5,
    reviewCount: 5821,
    heroImage: "https://m.media-amazon.com/images/I/71pzt+C8s6L._AC_SL1075_.jpg",
    summary: "Rhodiola rosea is an adaptogen with strong clinical evidence for reducing fatigue, improving mental performance under stress, and supporting mood — all common concerns during perimenopause.",
    pros: [
      "Strong clinical evidence for fatigue reduction",
      "Adaptogen — helps body manage stress hormones",
      "Improves mental performance under stress",
      "Well-tolerated with decades of research",
    ],
    cons: [
      "Can be mildly stimulating — avoid late in the day",
      "Quality varies significantly between brands",
      "Not suitable for those with bipolar disorder",
    ],
    ingredients: ["Rhodiola Rosea Extract (3% rosavins, 1% salidroside) 500mg"],
    verdict: "Rhodiola rosea is one of the most evidence-backed adaptogens for the fatigue and stress that characterize perimenopause. Nootropics Depot's standardized extract is among the highest quality available.",
    score: 8.4,
    editorPick: false,
    bestFor: "Fatigue, stress & mental performance",
    tags: ["rhodiola", "adaptogen", "fatigue", "stress", "energy"],
  },
  {
    id: "vitamin-b12-energy",
    slug: "jarrow-formulas-methyl-b12",
    name: "Jarrow Formulas Methyl B-12 1000mcg",
    brand: "Jarrow Formulas",
    asin: "B08DP545FG",
    affiliateUrl: buildAffiliateUrl("B08DP545FG"),
    category: "Cognitive & Energy Support",
    categorySlug: "cognitive-energy-support",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$11.99",
    rating: 4.7,
    reviewCount: 23841,
    heroImage: "https://m.media-amazon.com/images/I/81FqlVoXafL._AC_SL1500_.jpg",
    summary: "B12 deficiency is common in perimenopausal women and contributes significantly to fatigue, brain fog, and mood changes. Jarrow's methylcobalamin form is the most bioavailable and neurologically active form.",
    pros: [
      "Methylcobalamin — most bioavailable and neurologically active B12 form",
      "Sublingual lozenge — bypasses GI absorption issues",
      "Excellent value at $11.99",
      "23,000+ reviews averaging 4.7 stars",
    ],
    cons: [
      "Lozenge format not preferred by all",
      "High dose (1000mcg) — some prefer lower doses",
      "Not a standalone solution for severe deficiency",
    ],
    ingredients: ["Methylcobalamin (Vitamin B12) 1000mcg"],
    verdict: "B12 supplementation is a simple, affordable, and often overlooked intervention for menopausal fatigue and brain fog. Jarrow's methylcobalamin is the gold standard form.",
    score: 8.8,
    editorPick: false,
    bestFor: "Energy, brain fog & mood support",
    tags: ["B12", "methylcobalamin", "energy", "brain fog", "fatigue"],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getEditorPicks(): Product[] {
  return allProducts.filter((p) => p.editorPick);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return allProducts.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByStage(stageSlug: string): Product[] {
  return allProducts.filter((p) => p.stages.includes(stageSlug));
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, limit);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// ─── Comparisons ─────────────────────────────────────────────────────────────

export const comparisons: Comparison[] = [
  {
    id: "remifemin-vs-nature-made-black-cohosh",
    title: "Remifemin vs. Nature Made Black Cohosh for Hot Flashes",
    subtitle: "Standardized Extract vs. Budget Option: Which Delivers Better Hot Flash Relief?",
    category: "Menopause Supplements",
    categorySlug: "menopause-supplements",
    product1Id: "remifemin-menopause",
    product2Id: "nature-made-black-cohosh",
    winnerId: "remifemin-menopause",
    winnerReason: "Remifemin wins for its standardized extract with 60+ years of clinical validation.",
    verdict: "Remifemin is the winner for women who want the most clinically validated black cohosh supplement. Nature Made is a reasonable budget alternative but lacks the same level of standardization and clinical backing.",
    publishDate: "2026-05-02",
    slug: "remifemin-vs-nature-made-black-cohosh",
  },
  {
    id: "remifemin-vs-estroven",
    slug: "remifemin-vs-estroven-complete",
    title: "Remifemin vs. Estroven Complete",
    subtitle: "Single-ingredient clinical formula vs. multi-symptom convenience",
    productIds: ["remifemin-menopause", "estroven-complete"],
    winner: "remifemin-menopause",
    summary: "Remifemin wins for clinical credibility and purity; Estroven Complete wins for convenience and breadth of symptom coverage.",
  },
  {
    id: "replens-vs-hyalogic",
    slug: "replens-vs-hyalogic-intimate-serum",
    title: "Replens vs. Hyalogic Intimate Serum",
    subtitle: "The OB/GYN standard vs. the hyaluronic acid approach",
    productIds: ["replens-long-lasting-moisturizer", "hyalogic-intimate-serum"],
    winner: "replens-long-lasting-moisturizer",
    summary: "Replens wins on clinical evidence and OB/GYN endorsement; Hyalogic wins for daily-use convenience and hyaluronic acid technology.",
  },
  {
    id: "citracal-vs-garden-of-life-bone",
    slug: "citracal-vs-garden-of-life-bone-strength",
    title: "Citracal Petites vs. Garden of Life Bone Strength",
    subtitle: "Affordable daily calcium vs. premium whole-food formula",
    productIds: ["citracal-calcium-d3", "garden-of-life-bone-strength"],
    winner: "citracal-calcium-d3",
    summary: "Citracal wins for value, accessibility, and proven calcium citrate absorption. Garden of Life wins for those who want K2 and a whole-food, organic formula.",
  },
  {
    id: "magnesium-vs-melatonin-sleep",
    slug: "magnesium-glycinate-vs-melatonin-sleep",
    title: "Magnesium Glycinate vs. Melatonin for Sleep",
    subtitle: "Root-cause mineral support vs. direct sleep hormone",
    productIds: ["magnesium-glycinate-sleep", "natrol-melatonin-10mg"],
    winner: "magnesium-glycinate-sleep",
    summary: "Magnesium glycinate wins for addressing underlying sleep disruption causes; melatonin wins for immediate, reliable sleep onset support.",
  },
  {
    id: "collagen-vs-b12-cognitive",
    slug: "vital-proteins-collagen-vs-b12-energy",
    title: "Vital Proteins Collagen vs. Jarrow B12 for Energy",
    subtitle: "Structural support vs. metabolic energy",
    productIds: ["vital-proteins-collagen-peptides", "vitamin-b12-energy"],
    winner: "vitamin-b12-energy",
    summary: "B12 wins for direct energy and cognitive support; collagen wins for skin, joint, and hair benefits with secondary energy support.",
  },
  {
    id: "alpha-gpc-vs-rhodiola-brain-fog",
    slug: "alpha-gpc-vs-rhodiola-brain-fog",
    title: "Alpha GPC vs. Rhodiola Rosea for Brain Fog",
    subtitle: "Targeted neurotransmitter support vs. adaptogenic stress management",
    productIds: ["alpha-gpc-cognitive", "rhodiola-rosea-energy"],
    winner: "alpha-gpc-cognitive",
    summary: "Alpha GPC wins for targeted brain fog relief via acetylcholine support; Rhodiola wins for stress-driven fatigue and mental performance under pressure.",
  },
];

/** Get a product by its id field (used by ComparisonCard and comparison pages) */
export function getProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

/** Get comparisons that include a specific category's products */
export function getComparisonsByCategory(categorySlug: string): Comparison[] {
  const categoryProductIds = getProductsByCategory(categorySlug).map((p) => p.id);
  return comparisons.filter((c) =>
    c.productIds.some((id) => categoryProductIds.includes(id))
  );
}

/** Get a comparison by its slug */
export function getComparisonBySlug(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
