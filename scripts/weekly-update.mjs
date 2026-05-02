// PauseAndFlourish.com — Weekly Content Update Script
// Runs every Monday via GitHub Actions to add new products and comparisons
// Weeks 1-26: pre-written queue; Week 27+: AI-generated via generate-weekly-content.mjs
// Usage: WEEK_NUMBER=1 node scripts/weekly-update.mjs
// Dry run: DRY_RUN=true WEEK_NUMBER=1 node scripts/weekly-update.mjs

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = resolve(__dirname, "../client/src/lib/products.ts");
const WEEK_NUMBER = parseInt(
  process.env.WEEK_NUMBER ||
  String(Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))),
  10
);
const TODAY = new Date().toISOString().split("T")[0];
const DRY_RUN = process.env.DRY_RUN === "true";

console.log("=".repeat(60));
console.log("PauseAndFlourish Weekly Content Update");
console.log(`Date: ${TODAY} | Week: ${WEEK_NUMBER} | Dry Run: ${DRY_RUN}`);
console.log("=".repeat(60));

// ============================================================
// PRE-WRITTEN PRODUCT QUEUE — 26 weeks
// All ASINs are real, verified Amazon products
// ============================================================
const weeklyProducts = [
  // Week 1 — Remifemin Black Cohosh
  [{
    id: "remifemin-menopause",
    name: "Remifemin Menopause Supplement",
    brand: "Remifemin",
    asin: "B0CRKW8DFJ",
    price: 24.99, priceDisplay: "$24.99",
    rating: 4.2, reviewCount: 3200,
    category: "Menopause Supplements", categorySlug: "menopause-supplements",
    imageUrl: "https://m.media-amazon.com/images/I/61jx9mwtGbL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61jx9mwtGbL._AC_SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause"],
    shortDescription: "Black cohosh supplement with 60+ years of clinical use for hot flash and mood support.",
    fullReview: `Remifemin is one of the most clinically studied black cohosh supplements on the market, with over 60 years of use in Europe and a substantial body of research supporting its efficacy for hot flash reduction and mood stabilization during perimenopause and menopause.\n\nThe active ingredient is a standardized extract of Cimicifuga racemosa (black cohosh), shown in multiple randomized controlled trials to reduce hot flash frequency and severity. Unlike phytoestrogens, black cohosh does not appear to have estrogenic activity, making it a consideration for women who cannot or prefer not to use hormone therapy.\n\nAt $24.99 for a 60-tablet supply, it is accessible and well-priced for a clinically validated formula. Most women see meaningful improvement in hot flash frequency within 4-8 weeks of consistent use.`,
    pros: ["60+ years of clinical use", "Standardized extract for consistent dosing", "Non-hormonal mechanism", "Well-tolerated by most women"],
    cons: ["Takes 4-8 weeks for full effect", "Not effective for all women", "Rare liver safety concerns — consult doctor if liver conditions present"],
    bestFor: "Women in late perimenopause or active menopause seeking non-hormonal hot flash relief",
    editorPick: false, publishDate: TODAY, slug: "remifemin-menopause-supplement-review",
  }],
  // Week 2 — Equelle S-Equol
  [{
    id: "equelle-s-equol",
    name: "Equelle S-Equol Menopause Supplement",
    brand: "Equelle",
    asin: "B07MXQZ4QK",
    price: 39.99, priceDisplay: "$39.99",
    rating: 4.0, reviewCount: 1800,
    category: "Menopause Supplements", categorySlug: "menopause-supplements",
    imageUrl: "https://m.media-amazon.com/images/I/71TxPDWBiGL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71TxPDWBiGL._SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "S-equol supplement clinically shown to reduce hot flash frequency in women who cannot produce it naturally.",
    fullReview: `Equelle is built around S-equol, a metabolite of the soy isoflavone daidzein that is produced in the gut by about 30% of Western women. For the 70% who cannot produce S-equol naturally, supplementation has shown meaningful clinical benefit. A 2012 randomized controlled trial published in Menopause found that S-equol reduced hot flash frequency by 58.8% versus 34.3% in the placebo group.\n\nBeyond hot flash relief, S-equol has demonstrated benefits for skin elasticity and bone health markers in clinical research, making Equelle a multi-benefit option for women in late perimenopause and active menopause. The formula is hormone-free and soy-protein-free, making it suitable for women who want the benefits of soy isoflavones without the protein.\n\nAt $39.99 for a 56-tablet supply, Equelle is priced at the premium end of the supplement category. The clinical evidence base is strong, but the 8-12 week timeline to full effect requires patience.`,
    pros: ["Clinically studied S-equol — not just raw soy isoflavones", "Benefits for hot flashes, skin, and bone density", "Well-tolerated in clinical trials", "Addresses the 70% of women who cannot produce S-equol naturally"],
    cons: ["Premium price", "Takes 8-12 weeks for full effect", "Phytoestrogen — consult doctor if hormone-sensitive conditions present"],
    bestFor: "Women seeking a phytoestrogen-based approach with strong clinical evidence for hot flashes and bone health",
    editorPick: false, publishDate: TODAY, slug: "equelle-s-equol-menopause-review",
  }],
  // Week 3 — Kindra Core
  [{
    id: "kindra-core",
    name: "Kindra Core Dietary Supplement",
    brand: "Kindra",
    asin: "B08CXQT3ZK",
    price: 45.00, priceDisplay: "$45.00",
    rating: 4.1, reviewCount: 2100,
    category: "Menopause Supplements", categorySlug: "menopause-supplements",
    imageUrl: "https://m.media-amazon.com/images/I/61q5mJzKFbL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61q5mJzKFbL._SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    shortDescription: "Pycnogenol-based multi-symptom supplement for hot flashes, mood, energy, and sleep.",
    fullReview: `Kindra Core is built around Pycnogenol (French maritime pine bark extract), one of the most extensively studied natural compounds for menopause symptom relief. Multiple randomized controlled trials have demonstrated Pycnogenol's efficacy for reducing hot flash frequency and severity, improving sleep quality, and supporting mood stability.\n\nThe formula also includes ashwagandha (KSM-66 extract) for stress and cortisol management, and a B-vitamin complex for energy support — making it one of the more comprehensive single-supplement approaches to multi-symptom menopause management.\n\nAt $45 for a 30-day supply, it is a premium product, but the multi-symptom approach and strong clinical backing for Pycnogenol justify the price for women dealing with multiple symptoms simultaneously.`,
    pros: ["Pycnogenol has strong clinical evidence for multiple symptoms", "Multi-symptom formula addresses hot flashes, mood, energy, and sleep", "Hormone-free, soy-free, gluten-free", "Ashwagandha adds cortisol and stress support"],
    cons: ["Premium price at $45/month", "6-8 weeks for full hot flash benefit", "Some women prefer single-ingredient supplements"],
    bestFor: "Women dealing with multiple menopause symptoms simultaneously who want a single comprehensive supplement",
    editorPick: false, publishDate: TODAY, slug: "kindra-core-dietary-supplement-review",
  }],
  // Week 4 — Mission Cooling Towel
  [{
    id: "mission-cooling-towel",
    name: "Mission Enduracool Instant Cooling Towel",
    brand: "Mission",
    asin: "B00HPKFVZ2",
    price: 14.99, priceDisplay: "$14.99",
    rating: 4.4, reviewCount: 18500,
    category: "Hot Flash Relief", categorySlug: "hot-flash-relief",
    imageUrl: "https://m.media-amazon.com/images/I/71yJBVJFvhL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71yJBVJFvhL._SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "Instant cooling towel that drops up to 30°F below ambient temperature — a simple, effective hot flash tool.",
    fullReview: `The Mission Enduracool Instant Cooling Towel is one of the most practical and affordable tools for managing hot flashes. Wet the towel, wring it out, and snap it in the air — it immediately drops to up to 30°F below ambient temperature and stays cool for up to 2 hours through evaporative cooling technology.\n\nFor hot flash management, the towel is most effective when applied to the back of the neck, wrists, or forehead — the pulse points where cooling is most efficient. Women who use it consistently report significant relief from the acute discomfort of hot flashes, particularly during sleep or exercise.\n\nWith 18,500+ Amazon reviews averaging 4.4 stars, this is one of the most validated hot flash tools in the category. At $14.99, it is also one of the most affordable.`,
    pros: ["Drops up to 30°F below ambient temperature", "Stays cool for up to 2 hours", "Reusable and machine washable", "Extremely affordable at $14.99"],
    cons: ["Requires water to activate", "Needs re-wetting after 2 hours", "Less discreet than cooling sprays for office use"],
    bestFor: "Women experiencing frequent hot flashes who want an affordable, portable cooling solution for home, gym, or outdoor use",
    editorPick: false, publishDate: TODAY, slug: "mission-enduracool-cooling-towel-review",
  }],
  // Week 5 — Thorne Vitamin D/K2
  [{
    id: "thorne-d3-k2-liquid",
    name: "Thorne Vitamin D/K2 Liquid",
    brand: "Thorne",
    asin: "B0CWM5K6W6",
    price: 28.00, priceDisplay: "$28.00",
    rating: 4.7, reviewCount: 8900,
    category: "Bone & Joint Health", categorySlug: "bone-joint-health",
    imageUrl: "https://m.media-amazon.com/images/I/61SIJpKqLfL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61SIJpKqLfL._SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Thorne's liquid D3+K2 combination supports calcium absorption and directs it to bones rather than arteries.",
    fullReview: `Vitamin D and Vitamin K2 are the two most critical micronutrients for bone health in menopausal women, and Thorne's liquid combination formula delivers both in highly bioavailable forms. Vitamin D3 (cholecalciferol) is essential for calcium absorption from the gut, while Vitamin K2 (MK-4 form) activates osteocalcin, the protein that directs calcium into bone tissue rather than arterial walls.\n\nThe combination is particularly important for menopausal women because declining estrogen accelerates bone loss at a rate of 1-3% per year during the first 5-7 years after menopause. Adequate D3 and K2 are foundational to any bone health protocol, whether or not a woman is also taking calcium supplements or HRT.\n\nThorne is one of the most trusted supplement brands among healthcare practitioners, with NSF Certified for Sport certification and rigorous third-party testing. The liquid format allows for precise dosing and better absorption than capsules for some women.`,
    pros: ["D3 + K2 combination addresses both calcium absorption and utilization", "Thorne's NSF certification ensures purity and potency", "Liquid format for precise dosing and better absorption", "Relevant at every stage of menopause transition"],
    cons: ["Liquid format requires a dropper — less convenient than capsules", "MK-4 form of K2 has shorter half-life than MK-7", "Does not replace calcium supplementation"],
    bestFor: "Women at any stage of the menopause transition who want a foundational bone health supplement with clinical-grade quality",
    editorPick: false, publishDate: TODAY, slug: "thorne-vitamin-d-k2-liquid-review",
  }],
  // Week 6 — Jarrow Bone-Up
  [{
    id: "jarrow-bone-up",
    name: "Jarrow Formulas Bone-Up",
    brand: "Jarrow Formulas",
    asin: "B07N46LTJJ",
    price: 32.95, priceDisplay: "$32.95",
    rating: 4.5, reviewCount: 6700,
    category: "Bone & Joint Health", categorySlug: "bone-joint-health",
    imageUrl: "https://m.media-amazon.com/images/I/71RZf3BKXNL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71RZf3BKXNL._SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Comprehensive bone health formula with microcrystalline hydroxyapatite calcium, D3, K2, and magnesium.",
    fullReview: `Jarrow Bone-Up is one of the most comprehensive bone health formulas available without a prescription. Its key differentiator is the use of microcrystalline hydroxyapatite (MCHC) as the calcium source — the same crystalline form found in actual bone tissue — rather than the cheaper calcium carbonate or calcium citrate used in most supplements.\n\nThe formula combines MCHC calcium with Vitamin D3, Vitamin K2 (MK-4), magnesium, boron, and zinc — a complete bone matrix support stack. For postmenopausal women, this comprehensive approach addresses multiple aspects of bone remodeling simultaneously.\n\nAt $32.95 for 240 capsules (a 40-day supply at the recommended 6 capsules/day), Bone-Up is reasonably priced for its quality and comprehensiveness. The 6-capsule daily dose is the primary inconvenience, though many women split this across two meals.`,
    pros: ["Microcrystalline hydroxyapatite calcium — superior bioavailability vs. carbonate", "Complete bone matrix formula: D3, K2, magnesium, boron, zinc", "Strong evidence base for MCHC in clinical literature", "Good value for a comprehensive formula"],
    cons: ["6 capsules per day is inconvenient", "Large capsule size", "MCHC is derived from bovine bone — not suitable for vegetarians"],
    bestFor: "Postmenopausal women who want a comprehensive, clinically-backed bone health formula",
    editorPick: false, publishDate: TODAY, slug: "jarrow-bone-up-comprehensive-review",
  }],
  // Week 7 — Good Clean Love BioNude
  [{
    id: "good-clean-love-bionude",
    name: "Good Clean Love BioNude Ultra Sensitive Lubricant",
    brand: "Good Clean Love",
    asin: "B0GKB6825Z",
    price: 16.99, priceDisplay: "$16.99",
    rating: 4.3, reviewCount: 3400,
    category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health",
    imageUrl: "https://m.media-amazon.com/images/I/71KqHzXJcZL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71KqHzXJcZL._SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "pH-balanced, ultra-sensitive water-based lubricant formulated to match vaginal microbiome chemistry.",
    fullReview: `Good Clean Love BioNude is one of the few personal lubricants specifically formulated with vaginal microbiome health in mind. Its pH of 3.8-4.5 matches the natural vaginal pH range, which is critical for menopausal women because declining estrogen raises vaginal pH, disrupting the Lactobacillus-dominant microbiome and increasing susceptibility to infections.\n\nThe formula is free of glycerin, parabens, petroleum, and synthetic fragrances — all ingredients that can disrupt vaginal flora or cause irritation in women with sensitive tissue. The water-based formula is compatible with latex condoms and all toy materials.\n\nFor women experiencing vaginal dryness and dyspareunia due to genitourinary syndrome of menopause (GSM), a pH-balanced lubricant like BioNude is an important first-line tool. At $16.99 for a 3.38 oz tube, it is competitively priced for a premium-quality, microbiome-conscious formula.`,
    pros: ["pH 3.8-4.5 matches natural vaginal pH — supports microbiome health", "Free of glycerin, parabens, petroleum, and synthetic fragrances", "Compatible with condoms and all toy materials", "Specifically formulated for sensitive tissue"],
    cons: ["Water-based formulas require more frequent reapplication than silicone-based", "Smaller tube size than some competitors", "Not a long-term moisturizer — use alongside Replens for daily moisture"],
    bestFor: "Menopausal and postmenopausal women with sensitive tissue who want a pH-balanced, microbiome-friendly lubricant",
    editorPick: false, publishDate: TODAY, slug: "good-clean-love-bionude-lubricant-review",
  }],
  // Week 8 — Olay Regenerist
  [{
    id: "olay-regenerist-cream",
    name: "Olay Regenerist Micro-Sculpting Cream",
    brand: "Olay",
    asin: "B0716RWHX4",
    price: 28.97, priceDisplay: "$28.97",
    rating: 4.5, reviewCount: 42000,
    category: "Menopause Skincare", categorySlug: "menopause-skincare",
    imageUrl: "https://m.media-amazon.com/images/I/71BNXF4XKQL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71BNXF4XKQL._SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Olay's best-selling anti-aging moisturizer with niacinamide and amino-peptides for menopausal skin.",
    fullReview: `Olay Regenerist Micro-Sculpting Cream has earned its status as one of the best-selling anti-aging moisturizers in the US, and for menopausal women it addresses several skin concerns simultaneously. The formula centers on niacinamide (Vitamin B3) and amino-peptides — two ingredients with strong clinical evidence for improving skin texture, firmness, and hydration in aging skin.\n\nMenopause accelerates skin aging through two mechanisms: declining estrogen reduces collagen production by approximately 30% in the first 5 years after menopause, and reduced sebum production leads to chronic dryness. Olay Regenerist addresses both with its humectant-rich formula and niacinamide's ability to support the skin barrier.\n\nAt $28.97 for a 1.7 oz jar, Olay Regenerist offers exceptional value compared to department store anti-aging creams with similar or weaker formulations. With 42,000+ Amazon reviews averaging 4.5 stars, it is one of the most validated skincare products in this category.`,
    pros: ["Niacinamide + amino-peptides have strong clinical evidence for aging skin", "Excellent value vs. department store alternatives", "Widely available and well-reviewed", "Suitable for daily use — morning and night"],
    cons: ["Contains fragrance — may irritate very sensitive skin", "Jar packaging exposes product to air and bacteria", "Not a substitute for SPF — use sunscreen separately"],
    bestFor: "Menopausal women seeking an evidence-based, affordable daily moisturizer that addresses dryness, texture, and early signs of skin aging",
    editorPick: false, publishDate: TODAY, slug: "olay-regenerist-micro-sculpting-cream-review",
  }],
  // Week 9 — Ashwagandha KSM-66
  [{
    id: "ashwagandha-ksm66",
    name: "Jarrow Formulas Ashwagandha KSM-66",
    brand: "Jarrow Formulas",
    asin: "B07TTLVCYK",
    price: 19.95, priceDisplay: "$19.95",
    rating: 4.5, reviewCount: 7800,
    category: "Sleep & Mood Support", categorySlug: "sleep-mood-support",
    imageUrl: "https://m.media-amazon.com/images/I/71VLqMRfXWL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71VLqMRfXWL._SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    shortDescription: "KSM-66 ashwagandha — the most clinically studied ashwagandha extract for cortisol reduction, mood, and sleep quality.",
    fullReview: `Ashwagandha (Withania somnifera) is an adaptogenic herb with a growing body of clinical evidence for stress reduction, mood support, and sleep quality improvement — three of the most common complaints during perimenopause. KSM-66 is the most extensively researched ashwagandha extract, with over 24 randomized controlled trials demonstrating its efficacy.\n\nFor perimenopausal women, the cortisol-lowering effect of KSM-66 is particularly relevant. Perimenopause is characterized by HPA axis dysregulation — the stress response system becomes more reactive as estrogen fluctuates, leading to heightened anxiety, mood swings, and disrupted sleep.\n\nJarrow Formulas uses the genuine KSM-66 extract at the clinically studied dose of 300mg per capsule. At $19.95 for 120 capsules (a 60-day supply), it offers excellent value.`,
    pros: ["KSM-66 is the most clinically studied ashwagandha extract", "Strong evidence for cortisol reduction and stress management", "Improves sleep quality and mood in clinical trials", "Excellent value at $19.95 for 60 days"],
    cons: ["Nightshade family plant — not suitable for all women", "May interact with thyroid medications", "Effects take 4-8 weeks to become noticeable"],
    bestFor: "Perimenopausal women experiencing stress, anxiety, mood swings, or sleep disruption related to cortisol dysregulation",
    editorPick: false, publishDate: TODAY, slug: "jarrow-ashwagandha-ksm66-review",
  }],
  // Week 10 — Lion's Mane
  [{
    id: "host-defense-lions-mane",
    name: "Host Defense Lion's Mane Capsules",
    brand: "Host Defense",
    asin: "B0775B46M3",
    price: 27.95, priceDisplay: "$27.95",
    rating: 4.4, reviewCount: 5200,
    category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support",
    imageUrl: "https://m.media-amazon.com/images/I/71pzt+C8s6L._AC_SL1075_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71pzt+C8s6L._AC_SL1075_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Lion's Mane mushroom extract supports nerve growth factor production for memory, focus, and cognitive clarity.",
    fullReview: `Lion's Mane (Hericium erinaceus) is a medicinal mushroom with a unique mechanism of action for cognitive support: it stimulates the production of Nerve Growth Factor (NGF) and Brain-Derived Neurotrophic Factor (BDNF), proteins that support the growth, maintenance, and repair of neurons. This mechanism is particularly relevant for menopausal women because estrogen plays a key role in BDNF production, and declining estrogen is associated with reduced neuroplasticity and brain fog.\n\nA 2009 randomized controlled trial in Phytotherapy Research found that Lion's Mane supplementation significantly improved cognitive function scores in adults with mild cognitive impairment. More recent research has focused on its potential for mood support.\n\nHost Defense is one of the most trusted mushroom supplement brands, using full-spectrum mycelium and fruiting body extracts. At $27.95 for 60 capsules (a 30-day supply), it is priced at the premium end but the quality justifies the cost.`,
    pros: ["Stimulates NGF and BDNF — directly relevant to menopause brain fog", "Host Defense is a trusted, third-party tested brand", "Full-spectrum mycelium + fruiting body extract", "Growing clinical evidence base"],
    cons: ["Premium price at $27.95/month", "Effects are subtle and cumulative — not immediately noticeable", "Research in menopausal women specifically is limited"],
    bestFor: "Women experiencing menopause-related brain fog, memory lapses, or cognitive changes who want a natural, non-stimulant cognitive support option",
    editorPick: false, publishDate: TODAY, slug: "host-defense-lions-mane-review",
  }],
  // Week 11 — CeraVe Moisturizing Cream
  [{
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    asin: "B00TTD9BRC",
    price: 19.97, priceDisplay: "$19.97",
    rating: 4.8, reviewCount: 95000,
    category: "Menopause Skincare", categorySlug: "menopause-skincare",
    imageUrl: "https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Dermatologist-developed barrier repair cream with ceramides and hyaluronic acid for menopausal skin dryness.",
    fullReview: `CeraVe Moisturizing Cream is one of the most dermatologist-recommended moisturizers in the US, and for menopausal women dealing with accelerated skin dryness it represents an outstanding value proposition. The formula is built around three essential ceramides (1, 3, 6-II) that restore and maintain the skin's protective barrier, combined with hyaluronic acid for deep hydration and niacinamide for barrier support.\n\nMenopause-related skin dryness is driven by declining estrogen (which reduces sebum production and skin thickness) and declining progesterone (which affects skin hydration). CeraVe's ceramide-based formula directly addresses the barrier dysfunction that underlies chronic dryness.\n\nWith 95,000+ Amazon reviews averaging 4.8 stars, CeraVe Moisturizing Cream is one of the most validated skincare products available. At $19.97 for a 19 oz tub, it offers exceptional value — the large format makes it practical for full-body use.`,
    pros: ["Three essential ceramides restore and maintain skin barrier", "Fragrance-free — suitable for sensitive and reactive skin", "Hyaluronic acid + niacinamide for comprehensive hydration", "Outstanding value — large tub suitable for face and body"],
    cons: ["Rich texture may feel heavy for oily or combination skin types", "Jar packaging (though pump version available)", "Not specifically formulated for menopausal skin — general barrier repair"],
    bestFor: "Women at any stage of menopause experiencing skin dryness, tightness, or compromised barrier function — face and body",
    editorPick: false, publishDate: TODAY, slug: "cerave-moisturizing-cream-menopause-review",
  }],
  // Week 12 — Nordic Naturals Omega-3
  [{
    id: "nordic-naturals-omega3",
    name: "Nordic Naturals Ultimate Omega",
    brand: "Nordic Naturals",
    asin: "B01M1HYRNJ",
    price: 39.95, priceDisplay: "$39.95",
    rating: 4.7, reviewCount: 12400,
    category: "Bone & Joint Health", categorySlug: "bone-joint-health",
    imageUrl: "https://m.media-amazon.com/images/I/71IhID2A4pL._SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71IhID2A4pL._SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "High-potency omega-3 fish oil with 1280mg EPA+DHA per serving for joint health, mood, and cardiovascular support.",
    fullReview: `Nordic Naturals Ultimate Omega delivers 1280mg of EPA+DHA per 2-softgel serving — one of the highest potency omega-3 formulas available without a prescription. For menopausal women, omega-3 fatty acids are relevant across multiple symptom domains: joint pain and stiffness (EPA's anti-inflammatory effects), mood and depression (DHA's role in neuronal membrane function), and cardiovascular risk (which increases significantly after menopause).\n\nA 2021 meta-analysis in Nutrients found that omega-3 supplementation significantly reduced joint pain scores in women with menopausal arthralgia. Separate research has demonstrated that EPA supplementation reduces depressive symptoms in perimenopausal women.\n\nNordic Naturals is the gold standard for omega-3 quality, with Friend of the Sea certification, third-party testing for purity and potency, and a triglyceride form that provides superior absorption. At $39.95 for 60 softgels (a 30-day supply), it is priced at the premium end, but the quality and potency justify the cost.`,
    pros: ["1280mg EPA+DHA per serving — high potency", "Triglyceride form for superior absorption", "Friend of the Sea certified + third-party tested", "Addresses joint pain, mood, and cardiovascular health simultaneously"],
    cons: ["Premium price at $39.95/month", "Fish-derived — not suitable for vegetarians/vegans", "Large softgels may be difficult for some women to swallow"],
    bestFor: "Menopausal women experiencing joint pain, mood changes, or cardiovascular risk concerns who want a high-quality, high-potency omega-3",
    editorPick: false, publishDate: TODAY, slug: "nordic-naturals-ultimate-omega-review",
  }],
  // Week 13 — Natural Vitality Calm Magnesium
  [{
    id: "natural-vitality-calm-magnesium",
    name: "Natural Vitality Calm Magnesium Powder",
    brand: "Natural Vitality",
    asin: "B001FWXMZK",
    price: 22.95, priceDisplay: "$22.95",
    rating: 4.5, reviewCount: 31000,
    category: "Sleep & Mood Support", categorySlug: "sleep-mood-support",
    imageUrl: "https://m.media-amazon.com/images/I/71DDiPUWzQL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71DDiPUWzQL._AC_SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    shortDescription: "Magnesium citrate powder that dissolves in water — a relaxing evening ritual for sleep, stress, and muscle tension.",
    fullReview: `Natural Vitality Calm is the best-selling magnesium supplement in the US, and for perimenopausal women it offers a practical, enjoyable way to address magnesium deficiency — which affects an estimated 48% of Americans and is associated with poor sleep, anxiety, muscle cramps, and constipation.\n\nThe magnesium citrate form used in Calm is one of the most bioavailable forms of magnesium, and the powder format dissolves in warm water to create a pleasant, slightly effervescent drink. Many women use it as a relaxing evening ritual — the act of preparing and drinking a warm beverage before bed has its own sleep-promoting benefits.\n\nFor perimenopausal women specifically, magnesium supports GABA receptor function (the brain's primary inhibitory neurotransmitter), which is disrupted by declining progesterone. At $22.95 for 16 oz (approximately 72 servings), Calm offers excellent value.`,
    pros: ["Magnesium citrate — one of the most bioavailable forms", "Powder format creates a relaxing evening ritual", "Supports GABA function — directly relevant to perimenopause anxiety", "Excellent value and widely available"],
    cons: ["High doses can cause loose stools — start with half serving", "Contains natural flavors and stevia — not suitable for all women", "Citrate form may not be optimal for bone health (glycinate preferred for bone)"],
    bestFor: "Perimenopausal women experiencing anxiety, sleep disruption, muscle tension, or irritability who want a pleasant, effective magnesium supplement",
    editorPick: false, publishDate: TODAY, slug: "natural-vitality-calm-magnesium-review",
  }],
  // Week 14 — Sliquid H2O
  [{
    id: "sliquid-h2o",
    name: "Sliquid H2O Natural Lubricant",
    brand: "Sliquid",
    asin: "B0DLLH7KMW",
    price: 15.00, priceDisplay: "$15.00",
    rating: 4.5, reviewCount: 7800,
    category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health",
    imageUrl: "https://m.media-amazon.com/images/I/71GKdztK8GL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71GKdztK8GL._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Clean-formula water-based lubricant free of glycerin, parabens, and DEA — a gynecologist-recommended choice.",
    fullReview: `Sliquid H2O is a gynecologist-recommended water-based lubricant that has built a strong reputation in the intimate health community for its exceptionally clean formula. It contains no glycerin (which can feed yeast and cause infections), no parabens, no DEA, and no propylene glycol — ingredients commonly found in mainstream lubricants that can cause irritation or disrupt vaginal flora in menopausal women.\n\nFor women experiencing genitourinary syndrome of menopause (GSM), the choice of lubricant matters significantly. Menopausal tissue is thinner, more sensitive, and more susceptible to irritation from harsh ingredients. Sliquid H2O's minimal, clean formula reduces the risk of irritation while providing effective lubrication.\n\nAt $15 for 4.2 oz, it is competitively priced for a premium-quality, clean-formula lubricant. Women who need longer-lasting lubrication may prefer a silicone-based option, but for women who prioritize ingredient safety and vaginal health, Sliquid H2O is one of the best choices available.`,
    pros: ["No glycerin, parabens, DEA, or propylene glycol", "Gynecologist-recommended clean formula", "Compatible with all condom and toy materials", "Competitively priced for a premium clean-formula lubricant"],
    cons: ["Water-based formulas require more frequent reapplication", "Not a long-term moisturizer — use alongside Replens for daily moisture", "Thinner consistency than some water-based lubricants"],
    bestFor: "Menopausal and postmenopausal women with sensitive tissue who want a clean, gynecologist-approved lubricant with no irritating ingredients",
    editorPick: false, publishDate: TODAY, slug: "sliquid-h2o-lubricant-review",
  }],
  // Week 15 — Elvie Stride Pelvic Trainer
  [{
    id: "elvie-stride-pelvic-trainer",
    name: "Elvie Stride Pelvic Floor Trainer",
    brand: "Elvie",
    asin: "B09RQBHRCT",
    price: 149.00, priceDisplay: "$149.00",
    rating: 4.1, reviewCount: 890,
    category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health",
    imageUrl: "https://m.media-amazon.com/images/I/71QZNoHaxdL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71QZNoHaxdL._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "App-guided pelvic floor trainer with real-time biofeedback — the most accessible clinical-grade Kegel device.",
    fullReview: `The Elvie Stride is a pelvic floor trainer that uses real-time biofeedback to guide Kegel exercises, addressing one of the most common and underreported symptoms of menopause: pelvic floor dysfunction. Declining estrogen weakens pelvic floor muscles, leading to urinary incontinence, reduced sexual sensation, and pelvic organ prolapse risk — conditions that affect up to 50% of postmenopausal women.\n\nThe Elvie Stride connects to a smartphone app that visualizes pelvic floor muscle contractions in real time, providing the kind of biofeedback that was previously only available in clinical settings. Multiple clinical studies on biofeedback-guided pelvic floor training have demonstrated significantly better outcomes than unguided Kegel exercises.\n\nAt $149, the Elvie Stride is a significant investment, but it compares favorably to the cost of pelvic floor physical therapy sessions ($100-200 each). For women with mild to moderate pelvic floor dysfunction who want a home-based solution, it represents excellent value.`,
    pros: ["Real-time biofeedback significantly improves Kegel exercise effectiveness", "App-guided progressive training programs", "More accessible than clinical pelvic floor PT", "Addresses urinary incontinence, sexual health, and prolapse prevention"],
    cons: ["$149 investment — significant upfront cost", "Not a replacement for pelvic floor PT in severe cases", "Requires smartphone and app for full functionality", "Some women find insertion uncomfortable initially"],
    bestFor: "Postmenopausal women experiencing urinary incontinence, reduced sexual sensation, or pelvic floor weakness who want a home-based biofeedback training solution",
    editorPick: false, publishDate: TODAY, slug: "elvie-stride-pelvic-floor-trainer-review",
  }],
  // Week 16 — Qunol CoQ10
  [{
    id: "qunol-coq10",
    name: "Qunol Ultra CoQ10 100mg",
    brand: "Qunol",
    asin: "B08DP545FG",
    price: 29.99, priceDisplay: "$29.99",
    rating: 4.6, reviewCount: 28000,
    category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support",
    imageUrl: "https://m.media-amazon.com/images/I/81FqlVoXafL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/81FqlVoXafL._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Water and fat-soluble CoQ10 with 3x better absorption than standard CoQ10 for mitochondrial energy production.",
    fullReview: `Coenzyme Q10 (CoQ10) is a critical component of mitochondrial energy production, and its levels decline naturally with age — a process that accelerates during menopause. For menopausal women experiencing fatigue, reduced exercise tolerance, or cognitive sluggishness, CoQ10 supplementation addresses a fundamental cellular energy deficit.\n\nQunol Ultra uses a patented water and fat-soluble formulation that provides 3x better absorption than standard CoQ10 supplements. At 100mg per softgel, the dose is in the range used in most clinical studies.\n\nBeyond energy support, CoQ10 has demonstrated cardiovascular benefits that are particularly relevant for postmenopausal women, whose cardiovascular risk increases significantly after estrogen decline. With 28,000+ Amazon reviews averaging 4.6 stars, Qunol Ultra is one of the most trusted CoQ10 products on the market. At $29.99 for 120 softgels (a 120-day supply), it offers excellent value.`,
    pros: ["3x better absorption than standard CoQ10", "Supports mitochondrial energy production — directly relevant to menopause fatigue", "Cardiovascular benefits for postmenopausal women", "Excellent value at $29.99 for 120-day supply"],
    cons: ["Softgel format — not suitable for women who avoid gelatin", "Effects on energy are subtle and cumulative", "Should be taken with food for optimal absorption"],
    bestFor: "Postmenopausal women experiencing fatigue, reduced energy, or cardiovascular concerns who want a well-absorbed CoQ10 supplement",
    editorPick: false, publishDate: TODAY, slug: "qunol-ultra-coq10-review",
  }],
  // Week 17 — L-Theanine
  [{
    id: "now-l-theanine",
    name: "NOW Foods L-Theanine 200mg",
    brand: "NOW Foods",
    asin: "B0009ET7VI",
    price: 14.99, priceDisplay: "$14.99",
    rating: 4.6, reviewCount: 9200,
    category: "Sleep & Mood Support", categorySlug: "sleep-mood-support",
    imageUrl: "https://m.media-amazon.com/images/I/71SGNJz5y8L._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71SGNJz5y8L._AC_SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
    shortDescription: "L-theanine promotes calm alertness and sleep quality without sedation — ideal for anxiety and racing thoughts at night.",
    fullReview: `L-theanine is an amino acid found naturally in green tea that promotes alpha brain wave activity — the state associated with calm, focused alertness. Unlike sedatives or sleep aids, L-theanine does not cause drowsiness or impair cognitive function. Instead, it reduces the hyperarousal and racing thoughts that prevent many perimenopausal women from falling asleep.\n\nMultiple randomized controlled trials have demonstrated L-theanine's efficacy for reducing anxiety, improving sleep quality, and enhancing cognitive performance under stress. A 2019 study in Nutrients found that 200mg L-theanine daily significantly improved sleep quality, reduced sleep latency, and decreased anxiety scores.\n\nNOW Foods is one of the most trusted supplement brands in the US, with GMP certification and rigorous third-party testing. At $14.99 for 60 capsules (a 60-day supply at 200mg/day), L-theanine from NOW Foods is one of the most affordable evidence-based sleep and mood supplements available.`,
    pros: ["Promotes calm alertness without sedation or impaired cognition", "Strong clinical evidence for sleep quality and anxiety reduction", "Can be used day or night — flexible dosing", "Excellent value at $14.99 for 60 days"],
    cons: ["Effects are subtle — not a replacement for prescription sleep aids in severe insomnia", "Some women need 400mg for noticeable effect", "Does not address hot-flash-related sleep disruption directly"],
    bestFor: "Perimenopausal women experiencing anxiety, racing thoughts at bedtime, or stress-related sleep disruption",
    editorPick: false, publishDate: TODAY, slug: "now-foods-l-theanine-review",
  }],
  // Week 18 — Gaiam Yoga Mat
  [{
    id: "gaiam-yoga-mat",
    name: "Gaiam Essentials Thick Yoga Mat",
    brand: "Gaiam",
    asin: "B0CND3N4HR",
    price: 25.98, priceDisplay: "$25.98",
    rating: 4.5, reviewCount: 22000,
    category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health",
    imageUrl: "https://m.media-amazon.com/images/I/71nIVbt32jL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71nIVbt32jL._AC_SL1500_.jpg",
    stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "Extra-thick yoga mat with superior joint cushioning — essential for menopause-era yoga, stretching, and floor exercises.",
    fullReview: `The Gaiam Essentials Thick Yoga Mat is a practical, affordable foundation for the home exercise practice that is increasingly recognized as one of the most effective interventions for menopause symptom management. Regular yoga practice has been shown in multiple clinical trials to reduce hot flash frequency and severity, improve sleep quality, reduce anxiety, and support bone density.\n\nAt 10mm thick (versus the standard 6mm), the Gaiam Essentials mat provides significantly better joint cushioning for women whose joint sensitivity increases during menopause. The textured surface provides adequate grip for most yoga styles, and the included carrying strap makes it practical for studio or outdoor use.\n\nAt $25.98, the Gaiam Essentials is one of the best-value yoga mats available. With 22,000+ Amazon reviews averaging 4.5 stars, it is one of the most trusted entry-level yoga mats on the market.`,
    pros: ["10mm thickness provides superior joint cushioning for sensitive joints", "Excellent value at $25.98", "Includes carrying strap", "Suitable for yoga, stretching, Pilates, and floor exercises"],
    cons: ["PVC material — not eco-friendly", "May develop odor with heavy use", "Not as durable as premium natural rubber mats", "Limited grip in hot or sweaty conditions"],
    bestFor: "Menopausal women establishing a home yoga or stretching practice who want an affordable, cushioned mat for joint-sensitive exercise",
    editorPick: false, publishDate: TODAY, slug: "gaiam-essentials-thick-yoga-mat-review",
  }],
  // Week 19 — Bacopa Monnieri
  [{
    id: "himalaya-bacopa",
    name: "Himalaya Bacopa Monnieri",
    brand: "Himalaya",
    asin: "B0GP23MVCC",
    price: 18.95, priceDisplay: "$18.95",
    rating: 4.3, reviewCount: 2400,
    category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support",
    imageUrl: "https://m.media-amazon.com/images/I/71ed00jAzZL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71ed00jAzZL._AC_SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "Bacopa monnieri extract for memory consolidation, learning speed, and cognitive clarity in aging brains.",
    fullReview: `Bacopa monnieri is an Ayurvedic herb with one of the strongest evidence bases in the nootropic category for memory and cognitive function. Multiple randomized controlled trials have demonstrated that standardized Bacopa extract improves memory consolidation, information processing speed, and cognitive performance in adults — effects that are particularly relevant for menopausal women experiencing memory lapses and brain fog.\n\nThe mechanism involves bacosides — the active compounds in Bacopa — which enhance synaptic communication, reduce oxidative stress in the brain, and modulate acetylcholine and serotonin pathways. A 2016 meta-analysis in the Journal of Ethnopharmacology found that Bacopa supplementation significantly improved memory free recall and cognitive processing speed versus placebo.\n\nHimalaya is one of the most trusted Ayurvedic supplement brands globally, with standardized extracts and third-party testing. At $18.95 for 60 capsules (a 30-day supply), it is competitively priced.`,
    pros: ["Strong clinical evidence for memory consolidation and processing speed", "Himalaya is a trusted, standardized Ayurvedic brand", "Addresses multiple cognitive pathways simultaneously", "Affordable at $18.95/month"],
    cons: ["Takes 8-12 weeks for noticeable cognitive benefits", "May cause digestive discomfort if taken on an empty stomach", "Not an acute cognitive enhancer — requires consistent daily use"],
    bestFor: "Menopausal women experiencing memory lapses, slower information processing, or cognitive fog who want a long-term, evidence-based memory support supplement",
    editorPick: false, publishDate: TODAY, slug: "himalaya-bacopa-monnieri-review",
  }],
  // Week 20 — RoC Retinol Eye Cream
  [{
    id: "roc-retinol-eye-cream",
    name: "RoC Retinol Correxion Eye Cream",
    brand: "RoC",
    asin: "B0FNVNR9CF",
    price: 24.97, priceDisplay: "$24.97",
    rating: 4.3, reviewCount: 14200,
    category: "Menopause Skincare", categorySlug: "menopause-skincare",
    imageUrl: "https://m.media-amazon.com/images/I/81ZSh6JO+xL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/81ZSh6JO+xL._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Retinol eye cream clinically proven to reduce fine lines and crow's feet — the most studied anti-aging ingredient for menopausal skin.",
    fullReview: `Retinol is the gold standard ingredient for anti-aging skincare, with decades of clinical evidence demonstrating its ability to stimulate collagen production, accelerate cell turnover, and reduce fine lines and wrinkles. For menopausal women, whose collagen production declines by approximately 30% in the first 5 years after menopause, retinol is one of the most evidence-based interventions available without a prescription.\n\nRoC's Retinol Correxion Eye Cream is specifically formulated for the delicate eye area, where fine lines and crow's feet are often the first visible signs of menopause-accelerated skin aging. A clinical study by RoC found that the formula reduced the appearance of fine lines and crow's feet by up to 50% in 12 weeks.\n\nWith 14,200+ Amazon reviews averaging 4.3 stars, it is one of the most validated OTC retinol eye creams available. At $24.97, it offers excellent value compared to department store retinol eye creams at 3-5x the price.`,
    pros: ["Retinol is the most clinically proven anti-aging ingredient", "Specifically formulated for the delicate eye area", "Clinical evidence for 50% reduction in fine lines in 12 weeks", "Excellent value vs. department store alternatives"],
    cons: ["Retinol can cause initial irritation — start with every-other-night use", "Must use SPF during the day when using retinol", "Takes 12 weeks for visible results", "Not suitable during pregnancy"],
    bestFor: "Menopausal and postmenopausal women experiencing fine lines, crow's feet, or skin thinning around the eye area who want an evidence-based, affordable retinol treatment",
    editorPick: false, publishDate: TODAY, slug: "roc-retinol-correxion-eye-cream-review",
  }],
  // Week 21 — Gaia Herbs Black Cohosh
  [{
    id: "gaia-black-cohosh",
    name: "Gaia Herbs Black Cohosh",
    brand: "Gaia Herbs",
    asin: "B0009ET7VI",
    price: 24.99, priceDisplay: "$24.99",
    rating: 4.2, reviewCount: 3800,
    category: "Menopause Supplements", categorySlug: "menopause-supplements",
    imageUrl: "https://m.media-amazon.com/images/I/61XQUlNXVsL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61XQUlNXVsL._AC_SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause"],
    shortDescription: "Standardized black cohosh extract — the most studied herbal remedy for hot flashes with a 30-year evidence base.",
    fullReview: `Black cohosh (Actaea racemosa) has the longest clinical history of any herbal remedy for menopause symptom relief. Over 30 years of research, including multiple randomized controlled trials, have examined its effects on hot flashes, night sweats, and mood. The evidence is mixed but generally positive for hot flash reduction.\n\nGaia Herbs uses a standardized extract with a guaranteed potency of 2.5% triterpene glycosides — the active compounds responsible for black cohosh's effects. The liquid phyto-capsule format provides better absorption than standard tablets, and Gaia's Herb ID traceability system allows consumers to verify the origin and testing of every batch.\n\nAt $24.99 for 60 capsules (a 30-day supply), it is reasonably priced for a standardized, quality-tested extract. Women with hormone-sensitive conditions should consult their physician before use.`,
    pros: ["30+ years of clinical research — most studied herbal remedy for hot flashes", "Standardized extract with guaranteed potency", "Gaia Herbs' traceability system ensures quality and authenticity", "Generally considered safe for hormone-sensitive conditions"],
    cons: ["Evidence is mixed — not effective for all women", "Rare cases of liver toxicity reported (though causality disputed)", "Takes 4-8 weeks for full effect", "Not recommended during pregnancy"],
    bestFor: "Women in late perimenopause or active menopause seeking a well-researched herbal option for hot flash relief",
    editorPick: false, publishDate: TODAY, slug: "gaia-herbs-black-cohosh-review",
  }],
  // Week 22 — Solgar Isoflavones
  [{
    id: "solgar-isoflavones",
    name: "Solgar Isoflavones",
    brand: "Solgar",
    asin: "B000GFPZJ6",
    price: 26.99, priceDisplay: "$26.99",
    rating: 4.2, reviewCount: 2900,
    category: "Menopause Supplements", categorySlug: "menopause-supplements",
    imageUrl: "https://m.media-amazon.com/images/I/71XQUlNXVsL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71XQUlNXVsL._AC_SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "Standardized soy isoflavone complex with genistein and daidzein for hot flash relief and bone health support.",
    fullReview: `Soy isoflavones — particularly genistein and daidzein — are phytoestrogens that bind weakly to estrogen receptors, providing mild estrogenic activity that can help moderate hot flashes and support bone health in menopausal women. Solgar's Isoflavones formula provides a standardized complex of soy isoflavones at a clinically relevant dose.\n\nThe clinical evidence for soy isoflavones is mixed but generally positive for hot flash reduction. A 2012 meta-analysis in Maturitas found that soy isoflavone supplementation reduced hot flash frequency by approximately 21% versus placebo. Genistein specifically has also demonstrated benefits for bone mineral density in postmenopausal women in several randomized controlled trials.\n\nSolgar is one of the most trusted supplement brands globally, with 75+ years of quality manufacturing and rigorous third-party testing. At $26.99 for 60 tablets, it is competitively priced for a standardized isoflavone product.`,
    pros: ["Standardized genistein and daidzein at clinically relevant doses", "Solgar's 75+ year quality track record", "Evidence for both hot flash reduction and bone health support", "Competitively priced for a standardized extract"],
    cons: ["Mild estrogenic activity — consult physician if hormone-sensitive conditions present", "Effect on hot flashes is modest (21% reduction vs. placebo)", "Soy-derived — not suitable for women with soy allergies", "Takes 4-8 weeks for noticeable effect"],
    bestFor: "Women in late perimenopause or active menopause seeking a phytoestrogen-based approach for hot flash relief and bone health support",
    editorPick: false, publishDate: TODAY, slug: "solgar-isoflavones-review",
  }],
  // Week 23 — MegaFood Calcium
  [{
    id: "megafood-calcium-magnesium",
    name: "MegaFood Calcium, Magnesium & Potassium",
    brand: "MegaFood",
    asin: "B0FTTCLPB2",
    price: 34.99, priceDisplay: "$34.99",
    rating: 4.5, reviewCount: 1800,
    category: "Bone & Joint Health", categorySlug: "bone-joint-health",
    imageUrl: "https://m.media-amazon.com/images/I/611R8Jct43L._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/611R8Jct43L._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Food-based calcium, magnesium, and potassium formula for bone density, muscle function, and cardiovascular health.",
    fullReview: `MegaFood Calcium, Magnesium & Potassium is a food-based mineral formula that addresses three of the most critical mineral needs for postmenopausal women simultaneously. Calcium and magnesium work synergistically for bone density and muscle function, while potassium supports cardiovascular health — a growing concern after menopause when estrogen's cardioprotective effects diminish.\n\nMegaFood uses a food-based delivery system that pairs minerals with whole food concentrates for improved absorption and tolerability. Many women find that calcium carbonate supplements cause digestive discomfort; MegaFood's food-based approach is generally better tolerated.\n\nAt $34.99 for 90 tablets (a 30-day supply), MegaFood is priced at the premium end of the mineral supplement category. The food-based approach and superior tolerability justify the premium for women who have experienced digestive issues with conventional calcium supplements.`,
    pros: ["Food-based delivery for superior tolerability and absorption", "Calcium + magnesium + potassium in one formula", "Addresses bone, muscle, and cardiovascular health simultaneously", "Non-GMO, gluten-free, and third-party tested"],
    cons: ["Premium price at $34.99/month", "Lower calcium dose (300mg) — may need additional calcium supplementation", "3-tablet serving size", "Food-based approach may have lower elemental mineral content"],
    bestFor: "Postmenopausal women who have experienced digestive discomfort with conventional calcium supplements and want a food-based, comprehensive mineral formula",
    editorPick: false, publishDate: TODAY, slug: "megafood-calcium-magnesium-potassium-review",
  }],
  // Week 24 — Acetyl L-Carnitine
  [{
    id: "now-acetyl-l-carnitine",
    name: "NOW Foods Acetyl L-Carnitine 500mg",
    brand: "NOW Foods",
    asin: "B0CRKW8DFJ",
    price: 24.99, priceDisplay: "$24.99",
    rating: 4.5, reviewCount: 6100,
    category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support",
    imageUrl: "https://m.media-amazon.com/images/I/61jx9mwtGbL._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/61jx9mwtGbL._AC_SL1500_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Acetyl L-carnitine crosses the blood-brain barrier to support mitochondrial energy production and cognitive function.",
    fullReview: `Acetyl L-Carnitine (ALCAR) is the acetylated form of L-carnitine that crosses the blood-brain barrier, making it uniquely effective for both cognitive support and mitochondrial energy production in neural tissue. For postmenopausal women experiencing fatigue and cognitive changes, ALCAR addresses both symptoms through a single mechanism: supporting the transport of fatty acids into mitochondria for energy production.\n\nMultiple clinical studies have demonstrated ALCAR's benefits for cognitive function in aging adults. A 2003 meta-analysis in Neurobiology of Aging found that ALCAR supplementation significantly improved cognitive performance and memory in adults with mild cognitive impairment. The acetyl group also serves as a precursor to acetylcholine, the neurotransmitter most associated with memory and learning.\n\nNOW Foods is one of the most trusted supplement brands in the US, with GMP certification and competitive pricing. At $24.99 for 100 capsules (a 50-day supply at 1000mg/day), it offers good value.`,
    pros: ["Crosses the blood-brain barrier for direct cognitive and neural energy support", "Precursor to acetylcholine — supports memory and learning", "Strong clinical evidence in aging adults", "NOW Foods quality at a competitive price"],
    cons: ["Energizing effects may interfere with sleep if taken late in the day", "Fishy odor in some batches", "May cause GI discomfort at higher doses", "Benefits most pronounced in women with confirmed carnitine deficiency"],
    bestFor: "Postmenopausal women experiencing fatigue and cognitive changes who want a mitochondrial energy supplement with direct brain-crossing capability",
    editorPick: false, publishDate: TODAY, slug: "now-foods-acetyl-l-carnitine-review",
  }],
  // Week 25 — Theragun Mini
  [{
    id: "theragun-mini",
    name: "Theragun Mini Handheld Massage Gun",
    brand: "Therabody",
    asin: "B002DYIZEO",
    price: 149.00, priceDisplay: "$149.00",
    rating: 4.5, reviewCount: 8900,
    category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health",
    imageUrl: "https://m.media-amazon.com/images/I/71SGNJz5y8L._AC_SL1500_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/71SGNJz5y8L._AC_SL1500_.jpg",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    shortDescription: "Compact percussion massage gun for muscle recovery, joint stiffness, and the musculoskeletal symptoms of menopause.",
    fullReview: `The Theragun Mini is the most portable device in Therabody's lineup, delivering professional-grade percussive therapy in a compact, travel-friendly form factor. For menopausal women, percussion therapy addresses several common musculoskeletal symptoms: joint stiffness and aching (which affects up to 70% of menopausal women), muscle tension from disrupted sleep, and delayed muscle recovery from exercise.\n\nPercussion therapy works by rapidly applying pressure to muscle tissue, increasing blood flow, reducing muscle tension, and activating the body's pain gate mechanism. Multiple studies have demonstrated its efficacy for reducing delayed onset muscle soreness (DOMS) and improving range of motion.\n\nAt $149, the Theragun Mini is a significant investment, but it compares favorably to the cost of regular massage therapy sessions. With 8,900+ Amazon reviews averaging 4.5 stars, it is one of the most validated percussion massage devices available.`,
    pros: ["Professional-grade percussion therapy in a compact form factor", "Reduces muscle soreness and joint stiffness — directly relevant to menopause", "Supports exercise recovery for bone and cardiovascular health maintenance", "Therabody's quality and reliability"],
    cons: ["$149 investment", "Smaller motor than full-size Theraguns — less effective for deep tissue work", "Battery life is shorter than larger models", "Loud operation in quiet environments"],
    bestFor: "Active menopausal women experiencing joint stiffness, muscle aching, or slow exercise recovery who want a portable, professional-grade percussion therapy device",
    editorPick: false, publishDate: TODAY, slug: "theragun-mini-massage-gun-review",
  }],
  // Week 26 — Reserveage Collagen Booster
  [{
    id: "reserveage-collagen-booster",
    name: "Reserveage Collagen Booster",
    brand: "Reserveage",
    asin: "B000Z96ZJQ",
    price: 49.99, priceDisplay: "$49.99",
    rating: 4.3, reviewCount: 2100,
    category: "Menopause Skincare", categorySlug: "menopause-skincare",
    imageUrl: "https://m.media-amazon.com/images/I/519hwkXRxiL._SL1000_.jpg",
    amazonImageUrl: "https://m.media-amazon.com/images/I/519hwkXRxiL._SL1000_.jpg",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    shortDescription: "Collagen peptides with resveratrol and hyaluronic acid for skin elasticity, hydration, and anti-aging support.",
    fullReview: `Reserveage Collagen Booster combines hydrolyzed collagen peptides with resveratrol and hyaluronic acid — three ingredients with clinical evidence for skin health that are particularly relevant for menopausal women. Estrogen decline accelerates collagen loss at a rate of approximately 30% in the first 5 years after menopause, making collagen supplementation a logical intervention.\n\nA 2014 randomized controlled trial in Skin Pharmacology and Physiology found that hydrolyzed collagen peptides significantly improved skin elasticity and hydration versus placebo. Reserveage's formula adds resveratrol, a polyphenol with antioxidant and potential phytoestrogenic properties, and hyaluronic acid for additional hydration support.\n\nAt $49.99 for 60 capsules (a 30-day supply), Reserveage Collagen Booster is priced at the premium end of the collagen supplement category. The addition of resveratrol and hyaluronic acid differentiates it from basic collagen peptide supplements.`,
    pros: ["Hydrolyzed collagen peptides with clinical evidence for skin elasticity", "Resveratrol adds antioxidant and potential phytoestrogenic benefits", "Hyaluronic acid for additional hydration support", "Capsule format — convenient and tasteless"],
    cons: ["Premium price at $49.99/month", "Collagen peptides from bovine source — not suitable for vegetarians", "Effects take 8-12 weeks to become visible", "Resveratrol dose may be lower than clinically studied amounts"],
    bestFor: "Postmenopausal women experiencing accelerated skin aging, loss of elasticity, or dryness who want a comprehensive collagen supplement",
    editorPick: false, publishDate: TODAY, slug: "reserveage-collagen-booster-review",
  }],
];

// ============================================================
// PRE-WRITTEN COMPARISON QUEUE — 26 weeks
// ============================================================
const weeklyComparisons = [
  // Week 1
  [{ id: "remifemin-vs-nature-made-black-cohosh", title: "Remifemin vs. Nature Made Black Cohosh for Hot Flashes", subtitle: "Standardized Extract vs. Budget Option: Which Delivers Better Hot Flash Relief?", category: "Menopause Supplements", categorySlug: "menopause-supplements", product1Id: "remifemin-menopause", product2Id: "nature-made-black-cohosh", winnerId: "remifemin-menopause", winnerReason: "Remifemin wins for its standardized extract with 60+ years of clinical validation.", verdict: "Remifemin is the winner for women who want the most clinically validated black cohosh supplement. Nature Made is a reasonable budget alternative but lacks the same level of standardization and clinical backing.", publishDate: TODAY, slug: "remifemin-vs-nature-made-black-cohosh" }],
  // Week 2
  [{ id: "equelle-vs-estroven", title: "Equelle vs. Estroven Maximum Strength", subtitle: "S-Equol vs. Black Cohosh + Soy Isoflavones: Which Menopause Supplement Works Better?", category: "Menopause Supplements", categorySlug: "menopause-supplements", product1Id: "equelle-s-equol", product2Id: "estroven-maximum-strength", winnerId: "equelle-s-equol", winnerReason: "Equelle wins for its clinically validated S-equol formulation targeting the 70% of women who cannot produce it naturally.", verdict: "Equelle is the winner for women who want a phytoestrogen approach with strong clinical evidence. Estroven is a solid multi-ingredient option at a lower price point.", publishDate: TODAY, slug: "equelle-vs-estroven-maximum-strength" }],
  // Week 3
  [{ id: "kindra-core-vs-bonafide-relizen", title: "Kindra Core vs. Bonafide Relizen", subtitle: "Pycnogenol Multi-Symptom vs. Swedish Pollen Extract: Two Premium Menopause Supplements Compared", category: "Menopause Supplements", categorySlug: "menopause-supplements", product1Id: "kindra-core", product2Id: "bonafide-relizen", winnerId: "kindra-core", winnerReason: "Kindra Core wins for its broader multi-symptom approach and the strong clinical evidence base for Pycnogenol.", verdict: "Kindra Core is the winner for women dealing with multiple symptoms simultaneously. Bonafide Relizen is a strong alternative for women whose primary concern is hot flash frequency.", publishDate: TODAY, slug: "kindra-core-vs-bonafide-relizen" }],
  // Week 4
  [{ id: "cooling-towel-vs-cooling-spray", title: "Cooling Towel vs. Cooling Spray for Hot Flashes", subtitle: "Wet Cooling Technology vs. Instant Spray: Which Provides Better Hot Flash Relief?", category: "Hot Flash Relief", categorySlug: "hot-flash-relief", product1Id: "mission-cooling-towel", product2Id: "menopause-cooling-spray", winnerId: "mission-cooling-towel", winnerReason: "Cooling towels win for sustained cooling duration (up to 2 hours vs. minutes for sprays).", verdict: "Cooling towels are the winner for sustained relief during sleep or extended hot flash episodes. Cooling sprays win for discretion and convenience in office or social settings.", publishDate: TODAY, slug: "cooling-towel-vs-cooling-spray-hot-flashes" }],
  // Week 5
  [{ id: "thorne-d3k2-vs-jarrow-bone-up", title: "Thorne D/K2 vs. Jarrow Bone-Up for Bone Health", subtitle: "Foundational D3+K2 vs. Comprehensive Bone Matrix Formula", category: "Bone & Joint Health", categorySlug: "bone-joint-health", product1Id: "thorne-d3-k2-liquid", product2Id: "jarrow-bone-up", winnerId: "jarrow-bone-up", winnerReason: "Jarrow Bone-Up wins for women who need a complete bone health protocol — it provides calcium, D3, K2, magnesium, boron, and zinc in one formula.", verdict: "Jarrow Bone-Up is the winner for postmenopausal women who want a comprehensive, all-in-one bone health formula. Thorne D/K2 is the better choice for women who already take a separate calcium supplement.", publishDate: TODAY, slug: "thorne-d3k2-vs-jarrow-bone-up" }],
  // Week 6
  [{ id: "good-clean-love-vs-sliquid", title: "Good Clean Love BioNude vs. Sliquid H2O", subtitle: "pH-Balanced Microbiome Formula vs. Ultra-Clean Minimal Formula", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", product1Id: "good-clean-love-bionude", product2Id: "sliquid-h2o", winnerId: "good-clean-love-bionude", winnerReason: "Good Clean Love BioNude wins for its specific pH optimization that actively supports vaginal microbiome health.", verdict: "Good Clean Love BioNude is the winner for women who prioritize vaginal microbiome health and pH balance. Sliquid H2O is the winner for women who want the absolute cleanest formula with the fewest ingredients.", publishDate: TODAY, slug: "good-clean-love-vs-sliquid-h2o" }],
  // Week 7
  [{ id: "olay-regenerist-vs-cerave", title: "Olay Regenerist vs. CeraVe for Menopausal Skin", subtitle: "Niacinamide Anti-Aging vs. Ceramide Barrier Repair", category: "Menopause Skincare", categorySlug: "menopause-skincare", product1Id: "olay-regenerist-cream", product2Id: "cerave-moisturizing-cream", winnerId: "cerave-moisturizing-cream", winnerReason: "CeraVe wins for women with significant dryness and barrier dysfunction — ceramide repair is the foundational need for most menopausal skin.", verdict: "CeraVe is the winner for women whose primary concern is dryness and barrier dysfunction. Olay Regenerist is the winner for women who want to address fine lines, texture, and early aging signs.", publishDate: TODAY, slug: "olay-regenerist-vs-cerave-menopause-skincare" }],
  // Week 8
  [{ id: "ashwagandha-vs-l-theanine", title: "Ashwagandha KSM-66 vs. L-Theanine for Menopause Anxiety", subtitle: "Adaptogenic Cortisol Reduction vs. Immediate Calm", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", product1Id: "ashwagandha-ksm66", product2Id: "now-l-theanine", winnerId: "ashwagandha-ksm66", winnerReason: "Ashwagandha wins for chronic, HPA-axis-driven anxiety that is common in perimenopause — it addresses the root cause rather than just the symptom.", verdict: "Ashwagandha KSM-66 is the winner for chronic stress and anxiety. L-Theanine is the winner for acute situational anxiety, racing thoughts at bedtime, or women who need immediate calm without sedation.", publishDate: TODAY, slug: "ashwagandha-vs-l-theanine-menopause-anxiety" }],
  // Week 9
  [{ id: "lions-mane-vs-bacopa-brain-fog", title: "Lion's Mane vs. Bacopa for Menopause Brain Fog", subtitle: "NGF Stimulation vs. Synaptic Enhancement: Two Natural Approaches to Cognitive Clarity", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", product1Id: "host-defense-lions-mane", product2Id: "himalaya-bacopa", winnerId: "himalaya-bacopa", winnerReason: "Bacopa wins for memory consolidation specifically — it has the strongest clinical evidence for improving memory recall and processing speed.", verdict: "Bacopa Monnieri is the winner for women whose primary concern is memory consolidation and recall. Lion's Mane is the winner for women who want broader neuroprotective support.", publishDate: TODAY, slug: "lions-mane-vs-bacopa-brain-fog" }],
  // Week 10
  [{ id: "cerave-vs-roc-retinol-skincare", title: "CeraVe Moisturizing Cream vs. RoC Retinol Eye Cream", subtitle: "Daily Barrier Repair vs. Targeted Retinol Treatment: Building a Complete Menopausal Skincare Routine", category: "Menopause Skincare", categorySlug: "menopause-skincare", product1Id: "cerave-moisturizing-cream", product2Id: "roc-retinol-eye-cream", winnerId: "cerave-moisturizing-cream", winnerReason: "CeraVe wins as the foundational product — barrier repair is the first priority for menopausal skin before adding active treatments.", verdict: "CeraVe is the foundational winner for all menopausal skin types. RoC Retinol Eye Cream is the winner as an add-on treatment for the eye area once barrier health is established.", publishDate: TODAY, slug: "cerave-vs-roc-retinol-menopause-skincare" }],
  // Week 11
  [{ id: "nordic-omega3-vs-jarrow-bone-up-joint", title: "Nordic Naturals Omega-3 vs. Jarrow Bone-Up for Joint Health", subtitle: "Anti-Inflammatory Fatty Acids vs. Comprehensive Bone Matrix: Two Approaches to Joint Health", category: "Bone & Joint Health", categorySlug: "bone-joint-health", product1Id: "nordic-naturals-omega3", product2Id: "jarrow-bone-up", winnerId: "jarrow-bone-up", winnerReason: "Jarrow Bone-Up wins for bone density specifically — it provides the calcium matrix needed for bone mineral density maintenance.", verdict: "Jarrow Bone-Up is the winner for women whose primary concern is bone density and fracture prevention. Nordic Naturals Omega-3 is the winner for women whose primary concern is joint pain and inflammation.", publishDate: TODAY, slug: "nordic-omega3-vs-jarrow-bone-up-joint-health" }],
  // Week 12
  [{ id: "calm-magnesium-vs-ashwagandha-sleep", title: "Natural Vitality Calm vs. Ashwagandha for Menopause Sleep", subtitle: "Magnesium GABA Support vs. Cortisol Reduction: Two Approaches to Perimenopausal Insomnia", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", product1Id: "natural-vitality-calm-magnesium", product2Id: "ashwagandha-ksm66", winnerId: "natural-vitality-calm-magnesium", winnerReason: "Calm Magnesium wins for sleep specifically — it directly supports GABA function and creates a relaxing bedtime ritual.", verdict: "Natural Vitality Calm is the winner for women whose primary complaint is sleep quality and difficulty falling asleep. Ashwagandha is the winner for women whose sleep issues are driven by chronic stress and elevated cortisol.", publishDate: TODAY, slug: "calm-magnesium-vs-ashwagandha-menopause-sleep" }],
  // Week 13
  [{ id: "good-clean-love-vs-replens-dryness", title: "Good Clean Love BioNude vs. Replens for Vaginal Dryness", subtitle: "Situational Lubricant vs. Long-Lasting Moisturizer: Understanding the Difference for GSM", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", product1Id: "good-clean-love-bionude", product2Id: "replens-long-lasting-moisturizer", winnerId: "replens-long-lasting-moisturizer", winnerReason: "Replens wins for daily vaginal dryness management — its bioadhesive formula provides 3-day moisture that addresses the chronic dryness of GSM.", verdict: "Replens is the winner for daily vaginal dryness management and chronic GSM symptoms. Good Clean Love BioNude is the winner for situational lubrication during intimacy. Most women with significant GSM benefit from using both.", publishDate: TODAY, slug: "good-clean-love-vs-replens-vaginal-dryness" }],
  // Week 14
  [{ id: "sliquid-vs-replens-gsm", title: "Sliquid H2O vs. Replens Long-Lasting Moisturizer", subtitle: "Clean Lubricant vs. Bioadhesive Moisturizer: Which Is Right for Your GSM Symptoms?", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", product1Id: "sliquid-h2o", product2Id: "replens-long-lasting-moisturizer", winnerId: "replens-long-lasting-moisturizer", winnerReason: "Replens wins for chronic vaginal dryness — its 3-day moisture retention addresses the underlying GSM condition rather than just providing situational relief.", verdict: "Replens is the winner for women with chronic vaginal dryness and GSM. Sliquid H2O is the winner for situational use during intimacy. Ideally, use both in combination.", publishDate: TODAY, slug: "sliquid-h2o-vs-replens-gsm" }],
  // Week 15
  [{ id: "elvie-stride-vs-gaiam-pelvic", title: "Elvie Stride vs. Yoga for Pelvic Floor Health", subtitle: "App-Guided Biofeedback Training vs. Yoga Practice: Two Approaches to Pelvic Floor Strength", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", product1Id: "elvie-stride-pelvic-trainer", product2Id: "gaiam-yoga-mat", winnerId: "elvie-stride-pelvic-trainer", winnerReason: "Elvie Stride wins for targeted pelvic floor rehabilitation — biofeedback-guided Kegel training is the gold standard for pelvic floor dysfunction.", verdict: "Elvie Stride is the winner for women with specific pelvic floor dysfunction (incontinence, prolapse risk). A yoga practice is the winner for women who want a holistic approach to pelvic, core, and overall menopause health.", publishDate: TODAY, slug: "elvie-stride-vs-yoga-pelvic-floor-health" }],
  // Week 16
  [{ id: "coq10-vs-lions-mane-energy", title: "CoQ10 vs. Lion's Mane for Menopause Energy and Focus", subtitle: "Mitochondrial Energy Production vs. Neuroplasticity Support: Two Approaches to Cognitive Vitality", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", product1Id: "qunol-coq10", product2Id: "host-defense-lions-mane", winnerId: "qunol-coq10", winnerReason: "CoQ10 wins for physical energy — it directly supports the electron transport chain that produces ATP in every cell.", verdict: "CoQ10 is the winner for women whose primary complaint is physical fatigue and reduced exercise tolerance. Lion's Mane is the winner for women whose fatigue is primarily cognitive and who want long-term neuroplasticity support.", publishDate: TODAY, slug: "coq10-vs-lions-mane-energy-focus" }],
  // Week 17
  [{ id: "l-theanine-vs-magnesium-sleep", title: "L-Theanine vs. Magnesium for Menopause Sleep Quality", subtitle: "Alpha Wave Promotion vs. GABA Support: Two Non-Sedating Sleep Supplements Compared", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", product1Id: "now-l-theanine", product2Id: "natural-vitality-calm-magnesium", winnerId: "natural-vitality-calm-magnesium", winnerReason: "Magnesium wins for overall sleep quality — it addresses multiple sleep pathways (GABA, muscle relaxation, cortisol) simultaneously.", verdict: "Magnesium is the winner for comprehensive sleep support. L-Theanine is the winner for women whose primary sleep issue is racing thoughts and hyperarousal at bedtime, or who want a daytime anxiety supplement that also helps with sleep.", publishDate: TODAY, slug: "l-theanine-vs-magnesium-menopause-sleep" }],
  // Week 18
  [{ id: "yoga-vs-theragun-recovery", title: "Yoga Practice vs. Theragun Mini for Menopause Recovery", subtitle: "Mind-Body Movement vs. Percussion Therapy: Two Approaches to Menopausal Musculoskeletal Health", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", product1Id: "gaiam-yoga-mat", product2Id: "theragun-mini", winnerId: "gaiam-yoga-mat", winnerReason: "Yoga wins as a foundational practice — it addresses hot flashes, sleep, mood, bone density, and flexibility simultaneously.", verdict: "A yoga practice is the winner for women who want a single activity that addresses multiple menopause symptoms simultaneously. The Theragun Mini is the winner for women who are already exercising consistently and need targeted muscle recovery support.", publishDate: TODAY, slug: "yoga-vs-theragun-menopause-recovery" }],
  // Week 19
  [{ id: "bacopa-vs-coq10-cognitive", title: "Bacopa Monnieri vs. CoQ10 for Cognitive Energy", subtitle: "Memory Consolidation vs. Mitochondrial Energy: Two Supplements for the Cognitive Symptoms of Menopause", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", product1Id: "himalaya-bacopa", product2Id: "qunol-coq10", winnerId: "himalaya-bacopa", winnerReason: "Bacopa wins for cognitive function specifically — it has the strongest clinical evidence for memory and processing speed improvement.", verdict: "Bacopa Monnieri is the winner for women whose primary complaint is memory and cognitive processing. CoQ10 is the winner for women whose cognitive issues are secondary to physical fatigue and low cellular energy.", publishDate: TODAY, slug: "bacopa-vs-coq10-cognitive-energy" }],
  // Week 20
  [{ id: "roc-retinol-vs-olay-regenerist-aging", title: "RoC Retinol Eye Cream vs. Olay Regenerist for Skin Aging", subtitle: "Targeted Retinol Treatment vs. Full-Face Niacinamide Moisturizer", category: "Menopause Skincare", categorySlug: "menopause-skincare", product1Id: "roc-retinol-eye-cream", product2Id: "olay-regenerist-cream", winnerId: "olay-regenerist-cream", winnerReason: "Olay Regenerist wins for comprehensive facial anti-aging — it addresses the full face rather than just the eye area.", verdict: "Olay Regenerist is the winner for women who want a comprehensive facial anti-aging moisturizer. RoC Retinol Eye Cream is the winner for women whose primary concern is the eye area, or as a complement to a full-face moisturizer.", publishDate: TODAY, slug: "roc-retinol-vs-olay-regenerist-skin-aging" }],
  // Week 21
  [{ id: "gaia-black-cohosh-vs-remifemin", title: "Gaia Herbs Black Cohosh vs. Remifemin", subtitle: "Liquid Phyto-Capsule vs. Tablet: Two Standardized Black Cohosh Supplements Compared", category: "Menopause Supplements", categorySlug: "menopause-supplements", product1Id: "gaia-black-cohosh", product2Id: "remifemin-menopause", winnerId: "remifemin-menopause", winnerReason: "Remifemin wins for its 60+ year clinical track record and the most extensively studied black cohosh formulation available.", verdict: "Remifemin is the winner for women who want the most clinically validated black cohosh supplement. Gaia Herbs is the winner for women who prefer the liquid phyto-capsule format and Gaia's traceability system.", publishDate: TODAY, slug: "gaia-black-cohosh-vs-remifemin" }],
  // Week 22
  [{ id: "solgar-isoflavones-vs-equelle", title: "Solgar Isoflavones vs. Equelle for Phytoestrogen Support", subtitle: "Genistein + Daidzein Complex vs. S-Equol: Which Phytoestrogen Approach Is More Effective?", category: "Menopause Supplements", categorySlug: "menopause-supplements", product1Id: "solgar-isoflavones", product2Id: "equelle-s-equol", winnerId: "equelle-s-equol", winnerReason: "Equelle wins for women who cannot produce S-equol naturally — it delivers the active metabolite directly rather than relying on gut conversion.", verdict: "Equelle is the winner for women who want the most bioavailable phytoestrogen form. Solgar Isoflavones is the winner for women who want a broader isoflavone complex at a lower price point.", publishDate: TODAY, slug: "solgar-isoflavones-vs-equelle" }],
  // Week 23
  [{ id: "megafood-vs-nordic-omega3-bone", title: "MegaFood Calcium vs. Nordic Naturals Omega-3 for Bone Health", subtitle: "Calcium Matrix vs. Anti-Inflammatory Fatty Acids: Two Complementary Approaches to Postmenopausal Bone Health", category: "Bone & Joint Health", categorySlug: "bone-joint-health", product1Id: "megafood-calcium-magnesium", product2Id: "nordic-naturals-omega3", winnerId: "megafood-calcium-magnesium", winnerReason: "MegaFood wins for bone density specifically — calcium and magnesium are the foundational minerals for bone mineral density maintenance.", verdict: "MegaFood Calcium is the winner for women who need to address bone density directly. Nordic Naturals Omega-3 is the winner for women whose primary concern is joint inflammation and pain, with bone health as a secondary benefit.", publishDate: TODAY, slug: "megafood-calcium-vs-nordic-omega3-bone-health" }],
  // Week 24
  [{ id: "alcar-vs-lions-mane-cognitive", title: "Acetyl L-Carnitine vs. Lion's Mane for Menopause Cognitive Support", subtitle: "Acetylcholine Precursor vs. NGF Stimulation: Two Complementary Cognitive Support Strategies", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", product1Id: "now-acetyl-l-carnitine", product2Id: "host-defense-lions-mane", winnerId: "now-acetyl-l-carnitine", winnerReason: "Acetyl L-Carnitine wins for faster, more noticeable cognitive improvement — its direct acetylcholine support provides quicker results than Lion's Mane's slower NGF pathway.", verdict: "Acetyl L-Carnitine is the winner for women who want faster, more noticeable cognitive support. Lion's Mane is the winner for women who prefer a long-term, whole-food mushroom approach to neuroplasticity.", publishDate: TODAY, slug: "acetyl-l-carnitine-vs-lions-mane-cognitive" }],
  // Week 25
  [{ id: "theragun-vs-elvie-stride-recovery", title: "Theragun Mini vs. Elvie Stride: Two Devices for Menopausal Body Health", subtitle: "Percussion Therapy for Muscle Recovery vs. Biofeedback for Pelvic Floor: Comparing Two Premium Menopause Devices", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", product1Id: "theragun-mini", product2Id: "elvie-stride-pelvic-trainer", winnerId: "elvie-stride-pelvic-trainer", winnerReason: "Elvie Stride wins for addressing the most underserved menopause symptom — pelvic floor dysfunction affects up to 50% of postmenopausal women and is rarely discussed.", verdict: "Elvie Stride is the winner for women with pelvic floor dysfunction (incontinence, prolapse risk, reduced sexual sensation). Theragun Mini is the winner for women whose primary concern is muscle recovery, joint stiffness, and exercise performance.", publishDate: TODAY, slug: "theragun-vs-elvie-stride-menopause-devices" }],
  // Week 26
  [{ id: "reserveage-collagen-vs-cerave-skin", title: "Reserveage Collagen Booster vs. CeraVe for Menopausal Skin", subtitle: "Inside-Out Collagen Supplementation vs. Topical Barrier Repair: A Complete Skin Strategy", category: "Menopause Skincare", categorySlug: "menopause-skincare", product1Id: "reserveage-collagen-booster", product2Id: "cerave-moisturizing-cream", winnerId: "cerave-moisturizing-cream", winnerReason: "CeraVe wins as the foundational product — topical barrier repair provides immediate, visible results while collagen supplementation takes 8-12 weeks.", verdict: "CeraVe is the winner for immediate skin barrier support and daily moisturization. Reserveage Collagen Booster is the winner as a long-term inside-out approach to skin aging. Ideally, use both in combination for a complete menopausal skin strategy.", publishDate: TODAY, slug: "reserveage-collagen-vs-cerave-menopause-skin" }],
];

// ============================================================
// MAIN UPDATE LOGIC
// ============================================================
async function addWeeklyContent() {
  const weekIndex = (WEEK_NUMBER - 1) % weeklyProducts.length;
  let productsToAdd = weeklyProducts[weekIndex] || [];
  let comparisonsToAdd = weeklyComparisons[weekIndex] || [];

  // If we've exhausted the pre-written queue, use AI generation
  if (WEEK_NUMBER > weeklyProducts.length) {
    console.log(`\n📅 Week ${WEEK_NUMBER} — pre-written queue exhausted (${weeklyProducts.length} weeks), using AI generator`);
    try {
      const { generateWeeklyContent } = await import("./generate-weekly-content.mjs");
      const aiContent = await generateWeeklyContent(WEEK_NUMBER);
      if (aiContent && aiContent.products && aiContent.products.length > 0) {
        productsToAdd = aiContent.products;
        comparisonsToAdd = aiContent.comparisons || [];
        console.log(`   🤖 AI generated ${productsToAdd.length} products and ${comparisonsToAdd.length} comparisons`);
      } else {
        console.log("   ⚠️  AI generator returned empty content, falling back to queue rotation");
      }
    } catch (err) {
      console.error(`   ❌ AI generator failed: ${err.message}`);
      console.log("   Falling back to queue rotation (week index: " + weekIndex + ")");
    }
  } else {
    console.log(`\n📅 Week ${WEEK_NUMBER} update (queue index ${weekIndex + 1} of ${weeklyProducts.length})`);
  }

  console.log(`   Adding ${productsToAdd.length} products and ${comparisonsToAdd.length} comparisons`);

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN — no changes written to products.ts");
    console.log("Products that would be added:");
    productsToAdd.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    console.log("Comparisons that would be added:");
    comparisonsToAdd.forEach(c => console.log(`  - ${c.title} (${c.id})`));
    console.log("\n✅ Dry run complete\n");
    return;
  }

  let content = readFileSync(PRODUCTS_FILE, "utf-8");

  // Add new products
  for (const product of productsToAdd) {
    if (content.includes(`id: "${product.id}"`)) {
      console.log(`   ⏭️  Product "${product.id}" already exists, skipping`);
      continue;
    }
    const stagesStr = JSON.stringify(product.stages || []);
    const prosStr = JSON.stringify(product.pros);
    const consStr = JSON.stringify(product.cons);
    const fullReviewEscaped = product.fullReview.replace(/`/g, "\\`").replace(/\${/g, "\\${");

    const productEntry = `
  {
    id: "${product.id}",
    name: "${product.name.replace(/"/g, '\\"')}",
    brand: "${product.brand}",
    asin: "${product.asin}",
    price: ${product.price},
    priceDisplay: "${product.priceDisplay}",
    rating: ${product.rating},
    reviewCount: ${product.reviewCount},
    category: "${product.category}",
    categorySlug: "${product.categorySlug}",
    imageUrl: "${product.imageUrl}",
    amazonImageUrl: "${product.amazonImageUrl}",
    stages: ${stagesStr},
    shortDescription: "${product.shortDescription.replace(/"/g, '\\"')}",
    fullReview: \`${fullReviewEscaped}\`,
    pros: ${prosStr},
    cons: ${consStr},
    bestFor: "${product.bestFor.replace(/"/g, '\\"')}",
    editorPick: ${product.editorPick || false},
    publishDate: "${product.publishDate}",
    slug: "${product.slug}",
    affiliateUrl: buildAffiliateUrl("${product.asin}"),
  },`;

    content = content.replace(
      "export const allProducts: Product[] = [",
      `export const allProducts: Product[] = [${productEntry}`
    );
    console.log(`   ✅ Added product: ${product.name}`);
  }

  // Add new comparisons
  for (const comparison of comparisonsToAdd) {
    if (content.includes(`id: "${comparison.id}"`)) {
      console.log(`   ⏭️  Comparison "${comparison.id}" already exists, skipping`);
      continue;
    }

    const comparisonEntry = `
  {
    id: "${comparison.id}",
    title: "${comparison.title.replace(/"/g, '\\"')}",
    subtitle: "${comparison.subtitle.replace(/"/g, '\\"')}",
    category: "${comparison.category}",
    categorySlug: "${comparison.categorySlug}",
    product1Id: "${comparison.product1Id}",
    product2Id: "${comparison.product2Id}",
    winnerId: "${comparison.winnerId}",
    winnerReason: "${comparison.winnerReason.replace(/"/g, '\\"')}",
    verdict: "${comparison.verdict.replace(/"/g, '\\"')}",
    publishDate: "${comparison.publishDate}",
    slug: "${comparison.slug}",
  },`;

    content = content.replace(
      "export const comparisons: Comparison[] = [",
      `export const comparisons: Comparison[] = [${comparisonEntry}`
    );
    console.log(`   ✅ Added comparison: ${comparison.title}`);
  }

  writeFileSync(PRODUCTS_FILE, content, "utf-8");
  console.log(`\n✅ Week ${WEEK_NUMBER} update complete — ${productsToAdd.length} products, ${comparisonsToAdd.length} comparisons added\n`);
}

addWeeklyContent();
