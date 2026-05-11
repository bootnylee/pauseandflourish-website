from pathlib import Path

path = Path('/home/ubuntu/pauseandflourish/client/src/lib/products.ts')
text = path.read_text()

replacements = {
    'asin: "B0FTTCLPB2",\n    affiliateUrl: buildAffiliateUrl("B0FTTCLPB2"),': 'asin: "B01DTKK5ES",\n    affiliateUrl: buildAffiliateUrl("B01DTKK5ES"),',
    '    price: "$39.99",\n    rating: 4.1,\n    reviewCount: 2341,\n    heroImage: "https://m.media-amazon.com/images/I/71YyP9YyKqL._AC_SL1500_.jpg",': '    price: "$62.00",\n    rating: 4.0,\n    reviewCount: 1800,\n    heroImage: "https://m.media-amazon.com/images/I/716dnVyeX3L._AC_SL1500_.jpg",',
    '"Premium price point ($39.99/month)"': '"Premium price point ($62/month at the verified Amazon listing)"',
    'The trade-off is cost ($39.99/month) and the 8–12 week timeline for full effect.': 'The trade-off is cost ($62/month at the verified Amazon listing) and the 8–12 week timeline for full effect.',
    '    priceDisplay: "$39.99",\n    publishDate: "2026-05-02",\n    editorNote: "For breast cancer survivors who need a proven non-hormonal option, Relizen is the only supplement I feel completely confident recommending.",': '    priceDisplay: "$62.00",\n    publishDate: "2026-05-02",\n    editorNote: "For women who need a proven non-hormonal, soy-free option, Relizen remains one of the most targeted choices despite its premium price.",',
    'asin: "B0FNVNR9CF",\n    affiliateUrl: buildAffiliateUrl("B0FNVNR9CF"),': 'asin: "B07RCJY6WD",\n    affiliateUrl: buildAffiliateUrl("B07RCJY6WD"),',
    '    price: "$16.99",\n    rating: 4.7,\n    reviewCount: 22841,\n    heroImage: "https://m.media-amazon.com/images/I/81x4YxXG4aL._AC_SL1500_.jpg",': '    price: "$19.49",\n    rating: 4.7,\n    reviewCount: 8165,\n    heroImage: "https://m.media-amazon.com/images/I/71Cmid1Q7UL._AC_SL1500_.jpg",',
    '"22,000+ reviews averaging 4.7 stars"': '"8,000+ reviews averaging 4.7 stars"',
    '    priceDisplay: "$16.99",\n    publishDate: "2026-05-02",': '    priceDisplay: "$19.49",\n    publishDate: "2026-05-02",',
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f'Missing replacement target: {old[:80]!r}')
    text = text.replace(old, new, 1)

new_products = '''

  // ── New Reviews: Week of 2026-05-11 ───────────────────────────────────────
  {
    id: "opositiv-meno-vitamins",
    slug: "opositiv-meno-vitamins-menopause-support",
    name: "O Positiv MENO Vitamins for Menopause",
    brand: "O Positiv",
    asin: "B0D6S94T77",
    affiliateUrl: buildAffiliateUrl("B0D6S94T77"),
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$36.97",
    rating: 4.4,
    reviewCount: 2373,
    heroImage: "https://m.media-amazon.com/images/I/71mZt0CltqL._AC_SL1500_.jpg",
    summary: "O Positiv MENO is a hormone-free menopause formula built around black cohosh and KSM-66 ashwagandha for women who want support for hot flashes, night sweats, mood swings, and stress-related sleep disruption in one daily supplement.",
    pros: [
      "Hormone-free formula with black cohosh and KSM-66 ashwagandha",
      "Targets hot flashes, night sweats, mood, and stress-related sleep disruption",
      "4.4-star Amazon rating across more than 2,300 reviews",
      "Modern brand positioning and easy once-daily routine",
    ],
    cons: [
      "More expensive than budget black cohosh options",
      "Ashwagandha may not be appropriate for every medication profile",
      "Multi-ingredient formulas make it harder to identify which ingredient is helping",
    ],
    ingredients: ["Black Cohosh Root Extract", "KSM-66 Ashwagandha", "Chasteberry", "Shatavari"],
    verdict: "O Positiv MENO is a strong choice for women who want a contemporary, multi-symptom menopause supplement that pairs traditional hot-flash botanicals with adaptogenic mood and stress support.",
    score: 8.7,
    editorPick: false,
    bestFor: "Hot flashes plus mood and stress support",
    tags: ["menopause", "black cohosh", "ashwagandha", "hot flashes", "mood support"],
    shortDescription: "A hormone-free menopause vitamin pairing black cohosh with KSM-66 ashwagandha for hot flashes, night sweats, mood, and stress-related sleep support.",
    fullReview: "O Positiv MENO is designed for the woman who does not want to assemble a supplement stack one bottle at a time. Instead of relying on a single botanical, it combines black cohosh for vasomotor symptoms with KSM-66 ashwagandha for stress resilience and mood support, plus complementary herbs often used in women's health formulas.\n\nThe most practical advantage is symptom breadth. Many women in late perimenopause and active menopause are not dealing with hot flashes in isolation; the same hormonal transition can affect mood, sleep continuity, and perceived stress. MENO's positioning makes sense for that cluster of symptoms, especially for women who already tolerate adaptogens well.\n\nThe trade-off is that a multi-ingredient formula requires more caution. Women taking thyroid medication, sedatives, antidepressants, hormone therapy, or blood-pressure medications should review ashwagandha and black cohosh with a clinician before starting. It is also not the lowest-cost option in the category.\n\nOverall, O Positiv MENO is best for women who want a polished, hormone-free supplement with a broader mood-and-stress lens than classic black cohosh products. For the most clinically conservative single-ingredient route, Remifemin still has the stronger legacy; for convenience and symptom breadth, MENO is a compelling addition.",
    priceDisplay: "$36.97",
    publishDate: "2026-05-11",
    editorNote: "This is the modern multi-symptom option I would consider for women whose hot flashes are tied to stress, mood changes, and sleep disruption rather than heat alone.",
  },
  {
    id: "equelle-menopause",
    slug: "equelle-multi-symptom-menopause-relief",
    name: "EQUELLE Multi-Symptom Menopause Relief",
    brand: "EQUELLE",
    asin: "B0D6DL2Q1M",
    affiliateUrl: buildAffiliateUrl("B0D6DL2Q1M"),
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
    price: "$79.99",
    rating: 4.2,
    reviewCount: 266,
    heroImage: "https://m.media-amazon.com/images/I/71xaG7RpCvL._AC_SL1500_.jpg",
    summary: "EQUELLE uses plant-based S-equol from fermented soy germ to support hot flashes, sleep quality, muscle aches, and broader menopause comfort without hormones.",
    pros: [
      "Distinct S-equol mechanism rather than standard black cohosh",
      "Hormone-free and plant-based",
      "Targets hot flashes, sleep quality, and muscle aches",
      "Useful alternative for women who have not responded to black cohosh formulas",
    ],
    cons: [
      "Premium price compared with most menopause supplements",
      "Contains soy-derived ingredients",
      "Smaller Amazon review base than mature category leaders",
    ],
    ingredients: ["S-equol", "Fermented Soy Germ", "Dicalcium Phosphate", "Magnesium Stearate"],
    verdict: "EQUELLE is the premium non-hormonal pick for women who want to try S-equol rather than black cohosh, especially when hot flashes are accompanied by sleep disruption or muscle aches.",
    score: 8.6,
    editorPick: false,
    bestFor: "S-equol-based multi-symptom relief",
    tags: ["S-equol", "soy germ", "hot flashes", "sleep quality", "muscle aches"],
    shortDescription: "A premium S-equol menopause supplement made from fermented soy germ for hot flashes, sleep quality, and multi-symptom support.",
    fullReview: "EQUELLE stands apart from the crowded menopause supplement shelf because it is built around S-equol, a plant-based compound associated with soy germ fermentation. That makes it a very different choice from the black cohosh, rhapontic rhubarb, or maca-based formulas that dominate the category.\n\nThe key value proposition is targeted multi-symptom support without hormones. EQUELLE is positioned for hot flashes, sleep quality, muscle aches, and general menopause comfort, which makes it especially relevant for women who feel that their symptoms extend beyond classic daytime flushing.\n\nThe primary downside is cost. At roughly $80 for the verified two-month Amazon listing, it is meaningfully more expensive than Estroven, Remifemin, and many black cohosh products. It is also soy-derived, so it will not be appropriate for every user preference or allergy profile.\n\nFor women who have already tried black cohosh or want a different non-hormonal mechanism, EQUELLE is one of the more interesting premium options available. It should be positioned as a targeted upgrade rather than a budget first-line product.",
    priceDisplay: "$79.99",
    publishDate: "2026-05-11",
    editorNote: "EQUELLE is the product I would consider when black cohosh has not been enough and the buyer wants a genuinely different non-hormonal mechanism.",
  },
  {
    id: "bonafide-revaree-vaginal-moisturizer",
    slug: "bonafide-revaree-hyaluronic-acid-vaginal-moisturizer",
    name: "Bonafide Revaree Vaginal Moisturizer",
    brand: "Bonafide",
    asin: "B07GX65L5T",
    affiliateUrl: buildAffiliateUrl("B07GX65L5T"),
    category: "Vaginal & Intimate Health",
    categorySlug: "vaginal-intimate-health",
    stages: ["active-menopause", "early-postmenopause", "late-postmenopause"],
    price: "$131.00",
    rating: 4.4,
    reviewCount: 4387,
    heroImage: "https://m.media-amazon.com/images/I/71EpuMglGlL._SL1500_.jpg",
    summary: "Revaree is a hormone-free vaginal moisturizer insert using 5 mg hyaluronic acid for women who want a targeted, estrogen-free option for mild to moderate vaginal dryness and everyday comfort.",
    pros: [
      "5 mg hyaluronic acid insert designed for vaginal dryness",
      "Hormone-free and estrogen-free",
      "Strong 4.4-star rating across more than 4,300 Amazon reviews",
      "Useful for women who prefer an insert over gels or applicator creams",
    ],
    cons: [
      "Premium price, especially compared with Replens",
      "Insert format may not be preferred by every user",
      "Not a substitute for prescription therapy when GSM symptoms are severe",
    ],
    ingredients: ["Hyaluronic Acid 5mg", "Suppository Base"],
    verdict: "Revaree is the premium hyaluronic acid option for menopausal vaginal dryness, best suited to women who want hormone-free, targeted moisture support and are willing to pay more for insert convenience.",
    score: 8.9,
    editorPick: false,
    bestFor: "Premium hyaluronic acid vaginal moisture support",
    tags: ["vaginal dryness", "hyaluronic acid", "hormone-free", "estrogen-free", "GSM"],
    shortDescription: "A premium hormone-free vaginal insert delivering 5 mg hyaluronic acid for mild to moderate menopausal vaginal dryness.",
    fullReview: "Revaree addresses one of the most persistent postmenopausal concerns: vaginal dryness related to genitourinary syndrome of menopause. Unlike lubricants that primarily help during intimacy, Revaree is designed as a recurring vaginal moisturizer insert for everyday tissue comfort.\n\nThe formula is centered on hyaluronic acid, a moisture-binding compound already familiar in skincare and increasingly used in intimate-health products. The insert format is cleaner and more targeted than many gel applicators, which will appeal to women who want a structured routine rather than an on-demand lubricant.\n\nThe limitation is price. Revaree is significantly more expensive than Replens and aloe-based moisturizers, so it makes the most sense for women who have tried lower-cost products and want a more premium hyaluronic acid approach. Severe GSM symptoms, recurrent urinary symptoms, bleeding, or pain should still be discussed with a clinician.\n\nFor women seeking an estrogen-free vaginal moisturizer with strong consumer validation and a premium insert format, Revaree is one of the best-positioned products in the category.",
    priceDisplay: "$131.00",
    publishDate: "2026-05-11",
    editorNote: "Revaree is expensive, but the hyaluronic acid insert format fills an important gap between basic moisturizers and prescription estrogen therapy.",
  },'''

marker = '\n];\n\n// ─── Helper Functions'
if marker not in text:
    raise SystemExit('Could not find allProducts closing marker')
text = text.replace(marker, new_products + marker, 1)

new_comparisons = '''
  },
  {
    id: "opositiv-meno-vs-estroven-complete",
    slug: "opositiv-meno-vs-estroven-complete",
    title: "O Positiv MENO vs. Estroven Complete",
    subtitle: "Adaptogen-forward menopause support vs. the broad Amazon bestseller",
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    productIds: ["opositiv-meno-vitamins", "estroven-complete"],
    product1Id: "opositiv-meno-vitamins",
    product2Id: "estroven-complete",
    winner: "estroven-complete",
    winnerId: "estroven-complete",
    winnerReason: "Estroven Complete wins for value, review depth, and broad category validation; O Positiv MENO wins for women who specifically want ashwagandha-based stress and mood support.",
    summary: "Estroven Complete remains the better first-line multi-symptom pick for most buyers because it is more affordable and more established. O Positiv MENO is the more modern, adaptogen-forward choice for hot flashes that overlap with stress, mood, and sleep disruption.",
    verdict: "Estroven Complete remains the better first-line multi-symptom pick for most buyers because it is more affordable and more established. O Positiv MENO is the more modern, adaptogen-forward choice for hot flashes that overlap with stress, mood, and sleep disruption.",
    publishDate: "2026-05-11",
  },
  {
    id: "equelle-vs-bonafide-relizen",
    slug: "equelle-vs-bonafide-relizen",
    title: "EQUELLE vs. Bonafide Relizen",
    subtitle: "S-equol multi-symptom support vs. soy-free pollen extract for hot flashes",
    category: "Multi-Symptom Supplements",
    categorySlug: "multi-symptom-supplements",
    productIds: ["equelle-menopause", "bonafide-relizen"],
    product1Id: "equelle-menopause",
    product2Id: "bonafide-relizen",
    winner: "equelle-menopause",
    winnerId: "equelle-menopause",
    winnerReason: "EQUELLE wins for broader multi-symptom coverage, while Relizen remains the better fit for women who need a soy-free, estrogen-receptor-neutral hot-flash product.",
    summary: "EQUELLE is the broader menopause-support option for hot flashes, sleep quality, and muscle aches. Relizen is more specialized and better suited to women who specifically want a pollen-extract formula without soy or black cohosh.",
    verdict: "EQUELLE is the broader menopause-support option for hot flashes, sleep quality, and muscle aches. Relizen is more specialized and better suited to women who specifically want a pollen-extract formula without soy or black cohosh.",
    publishDate: "2026-05-11",
  },
  {
    id: "revaree-vs-replens-vaginal-moisturizer",
    slug: "revaree-vs-replens-vaginal-moisturizer",
    title: "Revaree vs. Replens for Vaginal Dryness",
    subtitle: "Premium hyaluronic acid insert vs. the OB/GYN-recommended moisturizer",
    category: "Vaginal & Intimate Health",
    categorySlug: "vaginal-intimate-health",
    productIds: ["bonafide-revaree-vaginal-moisturizer", "replens-long-lasting-moisturizer"],
    product1Id: "bonafide-revaree-vaginal-moisturizer",
    product2Id: "replens-long-lasting-moisturizer",
    winner: "replens-long-lasting-moisturizer",
    winnerId: "replens-long-lasting-moisturizer",
    winnerReason: "Replens wins for value, accessibility, and long-standing clinical positioning; Revaree wins for women who want a premium hyaluronic acid insert.",
    summary: "Replens remains the better first-line vaginal moisturizer because it is affordable, accessible, and well established. Revaree is the premium upgrade for women who prefer hyaluronic acid inserts and are willing to pay substantially more.",
    verdict: "Replens remains the better first-line vaginal moisturizer because it is affordable, accessible, and well established. Revaree is the premium upgrade for women who prefer hyaluronic acid inserts and are willing to pay substantially more.",
    publishDate: "2026-05-11",
  }'''

closing = '\n  }\n];\n\n/** Get a product by its id field'
if closing not in text:
    raise SystemExit('Could not find comparisons closing marker')
text = text.replace(closing, '\n' + new_comparisons + '\n];\n\n/** Get a product by its id field', 1)

path.write_text(text)
print('Applied weekly catalog update')
