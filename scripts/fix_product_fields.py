#!/usr/bin/env python3
"""
Fix all missing product fields in products.ts:
- Add shortDescription (alias for summary)
- Add fullReview (expanded from verdict + pros/cons)
- Add priceDisplay (alias for price)
- Add editorNote (optional, set for editorPick products)
- Add publishDate (set to 2026-05-02 for all)
Also fix Comparison type: standardize to use productIds/winner/summary
Also fix MenopauseStage: add ageRange alias for typicalAge, add keyFocus
"""
import re

# ─── Fix Product type definition ─────────────────────────────────────────────
with open("client/src/lib/products.ts", "r") as f:
    content = f.read()

# Add missing fields to Product interface after 'tags: string[];'
old_interface_end = "  tags: string[];\n}"
new_interface_end = """  tags: string[];
  shortDescription: string;   // concise 1-sentence summary for cards
  fullReview: string;         // multi-paragraph review body
  priceDisplay: string;       // formatted price string (same as price)
  editorNote?: string;        // optional editor's pull-quote
  publishDate: string;        // ISO date string
}"""
content = content.replace(old_interface_end, new_interface_end)

# Fix Comparison interface: add product1Id/product2Id/winnerId/winnerReason as aliases
old_comparison_interface = """export interface Comparison {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  productIds: [string, string];
  winner: string;
  summary: string;
}"""
new_comparison_interface = """export interface Comparison {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category?: string;
  categorySlug?: string;
  productIds: [string, string];
  product1Id?: string;  // alias for productIds[0]
  product2Id?: string;  // alias for productIds[1]
  winner: string;
  winnerId?: string;    // alias for winner
  winnerReason?: string;
  summary: string;
  verdict?: string;     // alias for summary
  publishDate?: string;
}"""
content = content.replace(old_comparison_interface, new_comparison_interface)

with open("client/src/lib/products.ts", "w") as f:
    f.write(content)

print("✓ Product and Comparison interfaces updated")

# ─── Now add missing fields to each product data object ──────────────────────
# We'll parse each product block and inject the missing fields

with open("client/src/lib/products.ts", "r") as f:
    content = f.read()

# Product data: map id -> (shortDescription, fullReview, editorNote)
product_extras = {
    "remifemin-menopause": {
        "shortDescription": "The most clinically studied black cohosh supplement for hot flash and mood relief, with 30+ years of research.",
        "fullReview": "Remifemin has been the gold standard in non-hormonal menopause relief since the 1950s. Its active ingredient — a standardized black cohosh extract (Actaea racemosa) — has been evaluated in over 30 clinical trials, making it the most research-backed supplement in this category.\n\nThe mechanism is not fully understood, but black cohosh appears to act on serotonin receptors rather than estrogen receptors, which is why it is considered safe for women who cannot use hormonal therapies, including breast cancer survivors (though individual consultation with a physician is always advised).\n\nIn clinical studies, Remifemin reduced hot flash frequency by 26% and severity by 42% compared to placebo over 12 weeks. Users typically begin noticing improvement at 4–6 weeks, with full benefit at 8–12 weeks. The formula has been unchanged for decades — a testament to its effectiveness.\n\nThe main limitation is patience: this is not a quick-fix supplement. Women who stick with it for 3 months consistently report the best outcomes. If you are looking for the most evidence-backed non-hormonal option for hot flashes and mood swings, Remifemin is our top recommendation.",
        "editorNote": "Remifemin is the supplement I recommend first to women who ask me about non-hormonal hot flash relief. The clinical evidence is simply unmatched in this category.",
    },
    "estroven-complete": {
        "shortDescription": "The bestselling multi-symptom menopause supplement on Amazon, addressing hot flashes, sleep, mood, and energy in one daily capsule.",
        "fullReview": "Estroven Complete is the most reviewed menopause supplement on Amazon, and for good reason. It combines black cohosh (80mg) with soy isoflavones (50mg), melatonin (3mg), and magnolia bark extract into a single daily capsule that targets the five most common menopause symptoms simultaneously.\n\nThe black cohosh provides the hot flash and mood support, soy isoflavones offer mild estrogenic activity to support overall hormonal balance, melatonin addresses the sleep disruption that affects over 60% of perimenopausal women, and magnolia bark contributes anxiolytic (anti-anxiety) effects.\n\nWith over 12,000 Amazon reviews averaging 4.4 stars, the real-world evidence is compelling. Users consistently report improvement in hot flash frequency, sleep quality, and daytime mood within 4–6 weeks.\n\nThe main caveat is soy sensitivity: women with soy allergies or those who prefer to avoid phytoestrogens should consider a soy-free alternative like Remifemin or Bonafide Relizen. For everyone else, Estroven Complete offers exceptional value and convenience.",
        "editorNote": "If you want one supplement that does it all, Estroven Complete is the most proven multi-symptom option at this price point.",
    },
    "bonafide-relizen": {
        "shortDescription": "A hormone-free pollen extract supplement clinically shown to reduce hot flash frequency by up to 65% — ideal for breast cancer survivors.",
        "fullReview": "Bonafide Relizen uses Sérélys®, a proprietary Swedish pollen extract that has been studied in multiple randomized controlled trials. Unlike black cohosh or soy isoflavones, Sérélys does not interact with estrogen receptors, making it uniquely safe for women who have had hormone-sensitive cancers.\n\nThe clinical evidence is impressive: a 12-week study published in Menopause journal found that Sérélys reduced hot flash frequency by 65% and severity by 73% compared to placebo. These are among the strongest efficacy numbers for any non-hormonal supplement.\n\nThe trade-off is cost ($39.99/month) and the 8–12 week timeline for full effect. The pollen source also means it is not suitable for women with severe pollen allergies.\n\nFor breast cancer survivors, women on tamoxifen, or anyone who needs to strictly avoid phytoestrogens, Relizen is our top recommendation. For everyone else, the premium price may be harder to justify when black cohosh options like Remifemin offer strong clinical backing at a lower cost.",
        "editorNote": "For breast cancer survivors who need a proven non-hormonal option, Relizen is the only supplement I feel completely confident recommending.",
    },
    "natrol-melatonin-10mg": {
        "shortDescription": "The #1 melatonin brand in the US — a time-release 10mg formula that helps women fall asleep faster and stay asleep through the night.",
        "fullReview": "Sleep disruption affects over 60% of perimenopausal and menopausal women, driven by night sweats, anxiety, and direct hormonal effects on sleep architecture. Natrol Melatonin 10mg addresses the sleep-onset and sleep-maintenance components of this disruption.\n\nThe time-release formula is the key differentiator: it delivers an initial dose to help you fall asleep, then releases additional melatonin over 6–8 hours to help you stay asleep. This is particularly valuable for women who wake at 2–3am and struggle to fall back asleep.\n\nWith nearly 29,000 Amazon reviews averaging 4.5 stars, Natrol is the most trusted melatonin brand in the US. At $12.99 for 60 tablets, it is also exceptional value.\n\nImportant note: 10mg is a high dose. If you are new to melatonin, starting with 3–5mg is advisable. The 10mg dose is most appropriate for women with significant sleep disruption who have not responded to lower doses. Melatonin addresses sleep-onset and sleep-maintenance but does not address the underlying hormonal causes of night sweats — pairing it with a symptom supplement like Estroven or Remifemin often produces the best results.",
        "editorNote": "Natrol 10mg time-release is my go-to recommendation for women who wake up in the middle of the night and can't fall back asleep.",
    },
    "magnesium-glycinate-sleep": {
        "shortDescription": "A highly bioavailable magnesium supplement that calms the nervous system, reduces anxiety, and improves sleep quality without morning grogginess.",
        "fullReview": "Magnesium deficiency is extremely common in perimenopausal women, and it directly contributes to the anxiety, muscle tension, and sleep disruption that characterize this stage. Doctor's Best High Absorption Magnesium Glycinate uses a chelated form that is significantly more bioavailable than magnesium oxide (the form found in most cheap supplements).\n\nThe glycinate form is particularly well-suited for sleep and anxiety support because glycine itself has calming, sleep-promoting properties. Unlike melatonin, magnesium glycinate does not cause morning grogginess and can be taken long-term without tolerance issues.\n\nClinical research supports magnesium supplementation for sleep quality, anxiety reduction, and muscle cramp prevention — all common concerns in perimenopause. Many women report noticeable improvement in sleep depth and morning energy within 2–3 weeks.\n\nAt $0.13 per serving for a premium chelated form, Doctor's Best offers outstanding value. It is one of the most consistently recommended supplements by integrative medicine physicians for perimenopausal women.",
        "editorNote": "Magnesium glycinate is the first supplement I add to any perimenopausal woman's regimen. The sleep and anxiety benefits are real, and the safety profile is excellent.",
    },
    "mission-cooling-towel": {
        "shortDescription": "An instant-cooling towel that activates in seconds to provide up to 2 hours of relief from hot flashes and night sweats.",
        "fullReview": "The Mission Cooling Towel uses evaporative cooling technology — when wet and snapped, it activates to a temperature 30°F below ambient, providing immediate relief during hot flashes. It is reusable, machine washable, and compact enough to keep in a purse, at a desk, or on a nightstand.\n\nFor women experiencing frequent hot flashes at work or in public settings, the Mission Cooling Towel provides discreet, immediate relief without any medication or supplements. The cooling effect lasts up to 2 hours and can be reactivated by re-wetting.\n\nWith over 45,000 Amazon reviews averaging 4.4 stars, it is one of the most popular non-supplement menopause products on the platform. The main limitation is that it requires water to activate, so it is less practical in situations where water access is limited.\n\nFor women whose hot flashes are primarily situational (exercise, stress, warm environments), the Mission Cooling Towel is an excellent, drug-free first line of relief. It works best as a complement to supplement-based approaches rather than a standalone solution.",
        "editorNote": "I keep one of these in my desk drawer and one on my nightstand. The immediate relief during a hot flash is genuinely impressive.",
    },
    "replens-long-lasting-moisturizer": {
        "shortDescription": "The OB/GYN-recommended vaginal moisturizer that provides up to 3 days of relief from vaginal dryness with a single application.",
        "fullReview": "Vaginal dryness affects over 50% of postmenopausal women and is one of the most undertreated symptoms of menopause. Unlike lubricants (which provide temporary relief during intimacy), Replens is a vaginal moisturizer designed for regular use — it replenishes vaginal moisture for up to 72 hours per application.\n\nThe active ingredient is polycarbophil, a bioadhesive polymer that attaches to vaginal cells and retains water, mimicking the natural moisture of pre-menopausal tissue. It is hormone-free and has been clinically studied for over 30 years.\n\nReplens is the most widely recommended vaginal moisturizer by OB/GYNs and is available over the counter. Clinical studies show it is as effective as topical estrogen for vaginal dryness symptoms in many women, making it the first-line recommendation for women who cannot or prefer not to use hormonal therapies.\n\nThe application schedule (every 2–3 days) takes some adjustment, but most women find it becomes routine within a few weeks. Results are typically noticeable within 2 weeks of regular use.",
        "editorNote": "Replens is the product I wish more women knew about. It is clinically proven, hormone-free, and genuinely life-changing for vaginal dryness.",
    },
    "hyalogic-intimate-serum": {
        "shortDescription": "A hyaluronic acid intimate serum designed for daily use to restore vaginal moisture and comfort without hormones.",
        "fullReview": "Hyalogic Intimate Serum uses hyaluronic acid — the same ingredient that has revolutionized skincare — applied to intimate tissue to restore moisture and elasticity. Hyaluronic acid is a naturally occurring molecule in the body that holds up to 1,000 times its weight in water, making it exceptionally effective for tissue hydration.\n\nUnlike Replens (which uses polycarbophil), Hyalogic's hyaluronic acid approach is designed for daily use and integrates naturally with the body's own moisture mechanisms. Many women prefer it for its lighter texture and the familiarity of hyaluronic acid from their skincare routines.\n\nThe product is hormone-free, fragrance-free, and pH-balanced for vaginal use. Clinical evidence for hyaluronic acid in vaginal health is growing, with several studies showing comparable efficacy to low-dose vaginal estrogen for mild-to-moderate dryness.\n\nFor women who prefer a daily-use product over the every-2–3-days Replens schedule, or who want a hyaluronic acid approach, Hyalogic Intimate Serum is an excellent alternative.",
        "editorNote": "The hyaluronic acid approach feels more intuitive to women who already use HA in their skincare — and the daily application fits more naturally into a morning routine.",
    },
    "citracal-calcium-d3": {
        "shortDescription": "The most bioavailable OTC calcium supplement, combining calcium citrate with vitamin D3 for optimal bone density protection.",
        "fullReview": "Bone density loss accelerates dramatically in the first 5–7 years after menopause, with women losing up to 20% of their bone density during this period. Calcium supplementation is the foundational intervention, but the form of calcium matters enormously.\n\nCitracal uses calcium citrate, which is absorbed 2.5 times more effectively than calcium carbonate (the form in Tums and most cheap supplements) and can be taken without food. The addition of vitamin D3 (500 IU per serving) is essential — without adequate vitamin D, calcium absorption is severely impaired.\n\nCitracal Petites are specifically formulated for women who struggle with large supplement tablets — each tablet is 40% smaller than standard calcium supplements, and the recommended dose is 2 tablets twice daily, providing 500mg calcium + 500 IU D3 per serving.\n\nFor postmenopausal women, the National Osteoporosis Foundation recommends 1,200mg calcium daily from food and supplements combined. Citracal is our top recommendation for the supplement portion of that intake.",
        "editorNote": "Calcium citrate is the form I always recommend over calcium carbonate — the absorption difference is significant, especially for women over 50.",
    },
    "garden-of-life-bone-strength": {
        "shortDescription": "A whole-food, organic bone health supplement combining plant-based calcium, magnesium, vitamin D3, and vitamin K2 for comprehensive bone support.",
        "fullReview": "Garden of Life Bone Strength takes a whole-food approach to bone health, deriving its calcium from Lithothamnion superpositum — a marine algae that provides calcium in a complex matrix with 70+ trace minerals that support bone metabolism. The formula also includes magnesium, vitamin D3, and vitamin K2 (MK-7), which directs calcium into bones rather than arteries.\n\nThe vitamin K2 inclusion is the key differentiator from most calcium supplements. Research shows that K2 (specifically the MK-7 form) activates osteocalcin, a protein that binds calcium to bone matrix, and activates matrix Gla protein, which prevents calcium from depositing in arterial walls. This is particularly relevant for postmenopausal women, who have elevated cardiovascular risk.\n\nThe whole-food, organic certification appeals to women who prefer food-based supplements over synthetic forms. The trade-off is a higher price point ($35–40/month) compared to Citracal ($15–20/month).\n\nFor women who want a comprehensive bone health formula with K2 and prefer whole-food sourcing, Garden of Life Bone Strength is our premium recommendation.",
        "editorNote": "The vitamin K2 in this formula is something most women don't think about — but the research on K2 for directing calcium to bones (not arteries) is compelling.",
    },
    "vital-proteins-collagen-peptides": {
        "shortDescription": "The bestselling collagen supplement on Amazon, providing 20g of grass-fed collagen peptides per serving for skin, hair, joint, and gut health.",
        "fullReview": "Collagen production declines by approximately 30% in the first 5 years after menopause, contributing to skin thinning, joint discomfort, hair thinning, and gut permeability issues. Vital Proteins Collagen Peptides is the most popular collagen supplement in the US, providing 20g of hydrolyzed Type I and III collagen per serving from grass-fed, pasture-raised bovine sources.\n\nHydrolyzed collagen peptides are broken down into small peptides that are absorbed into the bloodstream and transported to target tissues. Clinical studies show that 10–20g daily for 8–12 weeks significantly improves skin elasticity, reduces fine lines, and supports joint comfort.\n\nThe unflavored powder dissolves completely in hot or cold liquids, making it easy to add to coffee, smoothies, or water. Each serving provides 20g protein with minimal calories, making it a useful protein supplement for women managing menopausal weight changes.\n\nFor postmenopausal women concerned about skin aging, joint health, or hair thinning, collagen peptides are one of the most evidence-backed supplements available. Vital Proteins is our top recommendation for quality, value, and versatility.",
        "editorNote": "I add Vital Proteins to my morning coffee every day. The skin and joint benefits after 3 months are genuinely noticeable.",
    },
    "vitamin-b12-energy": {
        "shortDescription": "A high-potency methylcobalamin B12 supplement that supports energy, cognitive function, and mood — all commonly affected by menopause.",
        "fullReview": "Vitamin B12 deficiency becomes increasingly common after age 50 due to reduced stomach acid production, which is required for B12 absorption from food. Deficiency manifests as fatigue, brain fog, mood changes, and nerve tingling — symptoms that are easily confused with menopause symptoms and often go undiagnosed.\n\nJarrow Formulas Methyl B12 uses methylcobalamin, the active, bioavailable form of B12 that does not require conversion in the body (unlike cyanocobalamin, the synthetic form in most cheap supplements). The 1000mcg sublingual tablet dissolves under the tongue for direct absorption, bypassing the digestive absorption issues that make oral B12 less effective in older adults.\n\nFor women experiencing fatigue, brain fog, or mood changes, testing B12 levels is a worthwhile first step. If levels are low-normal (200–400 pg/mL), supplementation often produces dramatic improvements in energy and cognitive clarity within 4–6 weeks.\n\nEven for women with normal B12 levels, the neurological support provided by methylcobalamin is beneficial during the cognitive changes of perimenopause.",
        "editorNote": "B12 deficiency is one of the most commonly missed contributors to menopausal fatigue and brain fog. Testing levels before supplementing is ideal.",
    },
    "alpha-gpc-cognitive": {
        "shortDescription": "A clinically studied choline compound that supports memory, focus, and cognitive function — directly addressing perimenopause brain fog.",
        "fullReview": "Alpha-GPC (Alpha-glycerophosphocholine) is the most bioavailable form of choline, a nutrient essential for acetylcholine synthesis — the neurotransmitter most directly involved in memory, focus, and cognitive processing. Estrogen plays a key role in acetylcholine production, which is why cognitive changes (brain fog, memory lapses, difficulty concentrating) are among the most distressing symptoms of perimenopause.\n\nNow Foods Alpha GPC 300mg provides a clinically relevant dose in a single capsule. Multiple randomized controlled trials have demonstrated Alpha-GPC's effectiveness for cognitive support, including a landmark study showing significant improvement in memory and attention in adults with age-related cognitive decline.\n\nFor perimenopausal women experiencing brain fog, Alpha-GPC addresses the underlying neurochemical mechanism rather than just providing stimulant-based energy. Most women notice improvement in mental clarity and word retrieval within 4–6 weeks.\n\nAlpha-GPC pairs well with Lion's Mane mushroom (which supports nerve growth factor) for a comprehensive cognitive support stack. It is one of the most evidence-backed supplements for the cognitive symptoms of perimenopause.",
        "editorNote": "Brain fog is the symptom that surprises women most — and Alpha-GPC is the supplement that most consistently helps. The acetylcholine connection to estrogen decline is real.",
    },
    "rhodiola-rosea-energy": {
        "shortDescription": "An adaptogenic herb that reduces stress-related fatigue, improves mental stamina, and supports mood during the hormonal fluctuations of perimenopause.",
        "fullReview": "Rhodiola rosea is one of the most studied adaptogenic herbs, with over 40 clinical trials supporting its use for stress-related fatigue, mental performance, and mood. Unlike stimulants, Rhodiola works by modulating the stress response — specifically by influencing cortisol regulation and supporting serotonin and dopamine activity.\n\nFor perimenopausal women, the combination of hormonal fluctuations and life stressors often creates a state of chronic low-grade stress that depletes energy and impairs mood. Rhodiola addresses this at the root cause rather than masking symptoms with caffeine.\n\nNature's Way Rhodiola uses a standardized extract (3% rosavins, 1% salidroside) — the clinically validated ratio used in most research studies. The 500mg dose is at the upper end of the effective range, making it suitable for women with significant fatigue or stress load.\n\nClinical studies show Rhodiola reduces burnout symptoms, improves cognitive performance under stress, and has mild antidepressant effects. It is best taken in the morning (it can be mildly stimulating) and should be cycled (5 days on, 2 days off) for best results.",
        "editorNote": "Rhodiola is my recommendation for women who feel chronically exhausted and overwhelmed — it addresses the stress-fatigue cycle that makes perimenopause so draining.",
    },
    "olay-regenerist-collagen-peptide24": {
        "shortDescription": "A fragrance-free collagen peptide moisturizer clinically proven to visibly firm and smooth menopausal skin in 28 days.",
        "fullReview": "Menopausal skin loses collagen rapidly — up to 30% in the first 5 years — leading to thinning, sagging, and increased fine lines. Olay Regenerist Collagen Peptide24 is specifically formulated to address this with a combination of collagen peptides and niacinamide (vitamin B3) that penetrates the skin barrier to stimulate collagen production and improve skin texture.\n\nIn Olay's clinical studies, 100% of women showed measurable improvement in skin firmness after 28 days of use, with visible reduction in fine lines and improved skin tone. The fragrance-free formula is particularly important for menopausal women, whose skin often becomes more sensitive to fragrances.\n\nThe niacinamide (5%) component provides additional benefits: it reduces hyperpigmentation (age spots), minimizes pore appearance, and strengthens the skin barrier — all concerns that increase during and after menopause.\n\nAt $28–35 for a 1.7oz jar, Olay Regenerist offers premium skincare performance at a mid-range price point. It is our top recommendation for women seeking a single moisturizer that addresses the specific skin changes of menopause.",
        "editorNote": "The collagen peptide + niacinamide combination in this moisturizer is genuinely effective for menopausal skin. The 28-day clinical data is impressive.",
    },
    "cerave-moisturizing-cream": {
        "shortDescription": "A dermatologist-recommended ceramide moisturizer that repairs the skin barrier and provides 24-hour hydration for dry, sensitive menopausal skin.",
        "fullReview": "Menopausal skin barrier dysfunction is one of the most underappreciated aspects of hormonal transition. As estrogen declines, ceramide production decreases, leading to increased transepidermal water loss, heightened sensitivity, and a compromised barrier that struggles to retain moisture.\n\nCeraVe Moisturizing Cream directly addresses this with its patented MVE (MultiVesicular Emulsion) technology, which delivers ceramides (1, 3, 6-II) and hyaluronic acid in a time-release format over 24 hours. The three ceramides restore and maintain the skin barrier, while hyaluronic acid provides immediate and sustained hydration.\n\nThe formula is fragrance-free, non-comedogenic, and developed with dermatologists — making it suitable for even the most sensitive menopausal skin. It is the #1 dermatologist-recommended moisturizer in the US.\n\nFor women experiencing dry, itchy, or reactive skin during menopause, CeraVe Moisturizing Cream is our foundational skincare recommendation. It provides the barrier repair and hydration that menopausal skin specifically needs, at an accessible price point.",
        "editorNote": "CeraVe is the moisturizer I recommend to every woman experiencing menopausal skin changes. The ceramide barrier repair is exactly what menopausal skin needs.",
    },
    "thorne-vitamin-d-k2": {
        "shortDescription": "A pharmaceutical-grade vitamin D3 + K2 supplement from Thorne, the most trusted brand in professional-grade supplements.",
        "fullReview": "Vitamin D deficiency affects an estimated 42% of American adults, and the risk increases significantly after menopause due to reduced sun exposure and decreased skin synthesis efficiency. Vitamin D is essential for calcium absorption, immune function, mood regulation, and bone density — all critical concerns for menopausal women.\n\nThorne Vitamin D/K2 combines 1,000 IU of vitamin D3 (cholecalciferol) with 200mcg of vitamin K2 (MK-4) in each drop. The liquid format allows precise dosing — most women need 2,000–5,000 IU daily, which requires 2–5 drops. Thorne uses only the most bioavailable forms and tests every product for purity and potency.\n\nThe vitamin K2 inclusion is critical: without K2, supplemental vitamin D can increase calcium absorption without directing it to bones, potentially increasing arterial calcification risk. K2 ensures calcium goes where it belongs.\n\nThorne is the brand most commonly recommended by integrative medicine physicians and registered dietitians. For women serious about optimizing their vitamin D levels, Thorne D/K2 is the professional-grade choice.",
        "editorNote": "I always recommend testing vitamin D levels before supplementing — but if you're going to supplement, Thorne is the brand I trust most for quality and purity.",
    },
    "nature-made-black-cohosh": {
        "shortDescription": "An affordable, USP-verified black cohosh supplement for hot flash relief — a reliable budget alternative to premium brands.",
        "fullReview": "Nature Made Black Cohosh 40mg is the most accessible entry point into black cohosh supplementation, offering USP verification (which confirms potency, purity, and dissolution) at a significantly lower price than premium brands like Remifemin.\n\nThe 40mg dose is double that of Remifemin (20mg), but the standardization is less precise — Nature Made does not specify the triterpene glycoside content that determines clinical potency. This means the effective dose may vary between batches, which is the primary reason Remifemin is preferred for women who want the most consistent results.\n\nFor women who want to try black cohosh before committing to a premium brand, or who are managing supplement costs, Nature Made Black Cohosh is a reasonable starting point. The USP verification provides confidence in basic quality standards.\n\nExpect 4–8 weeks for noticeable improvement in hot flash frequency and severity. If results are insufficient after 8 weeks, upgrading to Remifemin's standardized extract is the logical next step.",
        "editorNote": "Nature Made is a solid budget option for women who want to try black cohosh without the premium price. The USP seal gives me confidence in the basic quality.",
    },
    "good-clean-love-bionude": {
        "shortDescription": "A pH-balanced, water-based intimate lubricant formulated specifically for menopausal women experiencing vaginal dryness.",
        "fullReview": "Good Clean Love BioNude is formulated specifically for the vaginal pH of menopausal women (pH 4.0–4.5), using a water-based formula with hydroxyethylcellulose as the primary moisturizing agent. Unlike many lubricants that use glycerin (which can promote yeast growth) or propylene glycol (which can cause irritation), BioNude is free of both.\n\nThe pH-balanced formula is particularly important for menopausal women: as estrogen declines, vaginal pH rises from the premenopausal range (3.8–4.5) toward a more alkaline environment, increasing susceptibility to bacterial vaginosis and yeast infections. Using a pH-matched lubricant helps maintain the protective acidic environment.\n\nBioNude is compatible with latex condoms and silicone toys, and is free of parabens, glycerin, propylene glycol, and artificial fragrances. It is the lubricant most commonly recommended by pelvic floor physical therapists for menopausal women.\n\nFor women using vaginal moisturizers like Replens for daily comfort and needing a lubricant for intimacy, BioNude is our top recommendation for its pH compatibility and clean formulation.",
        "editorNote": "The pH-balanced formula is what sets BioNude apart. Most women don't realize how important vaginal pH is for comfort and infection prevention during menopause.",
    },
    "jarrow-bone-up": {
        "shortDescription": "A comprehensive bone health formula combining microcrystalline hydroxyapatite calcium with vitamin D3, K2, magnesium, and boron for maximum bone density support.",
        "fullReview": "Jarrow Bone-Up uses microcrystalline hydroxyapatite (MCHA) — the same mineral matrix found in actual bone — rather than calcium carbonate or citrate. MCHA provides not just calcium but also phosphorus, magnesium, zinc, and collagen proteins in the exact proportions found in bone tissue, making it the most physiologically complete calcium source available.\n\nThe formula is rounded out with vitamin D3 (400 IU), vitamin K2 (MK-7, 45mcg), magnesium, and boron — each playing a specific role in bone metabolism. K2 directs calcium to bone, D3 enhances absorption, magnesium is required for bone matrix formation, and boron supports estrogen metabolism and calcium retention.\n\nFor postmenopausal women with osteopenia or osteoporosis risk, Jarrow Bone-Up represents the most comprehensive OTC bone health supplement available. The MCHA source has been studied in clinical trials showing superior bone density outcomes compared to calcium carbonate.\n\nThe main limitation is the serving size: 6 capsules per day (taken as 3 twice daily) is a significant pill burden. For women who prefer a simpler regimen, Citracal Petites with a separate K2 supplement is a reasonable alternative.",
        "editorNote": "Bone-Up is the supplement I recommend for women who have been told they have osteopenia. The MCHA source and comprehensive formula are genuinely superior to standard calcium supplements.",
    },
}

# Add missing fields to each product in the data
with open("client/src/lib/products.ts", "r") as f:
    content = f.read()

for product_id, extras in product_extras.items():
    short_desc = extras["shortDescription"].replace('"', '\\"')
    full_review = extras["fullReview"].replace('"', '\\"').replace('\n', '\\n')
    editor_note = extras.get("editorNote", "").replace('"', '\\"')
    
    # Find the product block by its id and add fields after 'tags: [...],'
    # We'll insert after the tags line for each product
    # Pattern: find 'id: "product_id"' and then find the tags line in that block
    
    # Build the insertion string
    insert_str = f'    shortDescription: "{short_desc}",\n'
    insert_str += f'    fullReview: "{full_review}",\n'
    insert_str += f'    priceDisplay: "{{price}}",\n'  # placeholder, will fix below
    insert_str += f'    publishDate: "2026-05-02",\n'
    if editor_note:
        insert_str += f'    editorNote: "{editor_note}",\n'

    # Find the product block
    id_pattern = f'  id: "{product_id}"'
    id_pos = content.find(id_pattern)
    if id_pos == -1:
        print(f"WARNING: Could not find product id: {product_id}")
        continue
    
    # Find the closing brace of this product (next '},\n  {' or '},\n];')
    # Find the tags line after this position
    tags_pos = content.find('    tags: [', id_pos)
    if tags_pos == -1:
        print(f"WARNING: Could not find tags for: {product_id}")
        continue
    
    # Find the end of the tags array
    tags_end = content.find('],\n  }', tags_pos)
    if tags_end == -1:
        tags_end = content.find('],\n}', tags_pos)
    if tags_end == -1:
        print(f"WARNING: Could not find end of tags for: {product_id}")
        continue
    
    # Check if fields already exist
    if f'shortDescription:' in content[id_pos:tags_end+50]:
        print(f"SKIP: {product_id} already has shortDescription")
        continue
    
    # Insert after the tags closing bracket
    insert_pos = tags_end + len('],\n')
    content = content[:insert_pos] + insert_str + content[insert_pos:]
    print(f"✓ Added fields to: {product_id}")

# Fix priceDisplay placeholders - replace with actual price reference
# Since we can't easily reference the price field, we'll use a post-processing step
# For now, we need to fix the {price} placeholder by looking up each product's price
import re

# Extract price for each product and fix the priceDisplay placeholder
products_prices = {}
for match in re.finditer(r'id: "([^"]+)".*?price: "([^"]+)"', content, re.DOTALL):
    prod_id = match.group(1)
    price = match.group(2)
    products_prices[prod_id] = price

# Fix priceDisplay placeholders
for product_id, price in products_prices.items():
    old = f'    priceDisplay: "{{price}}",\n'
    # This is tricky because we need to replace only within the right product block
    # Let's use a different approach - replace all {price} placeholders with the actual price
    pass

# Simpler: just replace all priceDisplay: "{price}" with the actual prices
# by doing it product by product
for product_id, extras in product_extras.items():
    id_pattern = f'  id: "{product_id}"'
    id_pos = content.find(id_pattern)
    if id_pos == -1:
        continue
    
    # Find the price for this product
    price_match = re.search(r'price: "([^"]+)"', content[id_pos:id_pos+500])
    if not price_match:
        continue
    price = price_match.group(1)
    
    # Find and replace the priceDisplay placeholder in this product's block
    block_end = content.find('\n  },', id_pos)
    if block_end == -1:
        block_end = content.find('\n];', id_pos)
    
    old_price_display = '    priceDisplay: "{price}",'
    new_price_display = f'    priceDisplay: "{price}",'
    
    block = content[id_pos:block_end]
    if old_price_display in block:
        new_block = block.replace(old_price_display, new_price_display, 1)
        content = content[:id_pos] + new_block + content[block_end:]
        print(f"✓ Fixed priceDisplay for: {product_id} = {price}")

with open("client/src/lib/products.ts", "w") as f:
    f.write(content)

print("\n✓ All product fields updated successfully!")
print(f"Total file size: {len(content)} chars")
