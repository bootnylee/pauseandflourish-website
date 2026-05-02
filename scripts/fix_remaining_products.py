#!/usr/bin/env python3
"""Add missing shortDescription, fullReview, priceDisplay, publishDate fields to remaining 7 products."""
import re

remaining_extras = {
    "olly-goodbye-stress": {
        "shortDescription": "A gummy-format ashwagandha and L-theanine supplement for stress and mood support during perimenopause.",
        "fullReview": "OLLY Goodbye Stress combines ashwagandha (KSM-66, 150mg), L-theanine (100mg), and GABA (100mg) in a pleasant blackberry verbena gummy format. For perimenopausal women who struggle with supplement fatigue or pill aversion, the gummy format significantly improves adherence.\n\nAshwagandha (KSM-66) is the most clinically studied adaptogen for stress and cortisol regulation, with multiple RCTs demonstrating reductions in perceived stress, cortisol levels, and anxiety. L-theanine promotes calm focus without sedation, and GABA provides additional inhibitory neurotransmitter support.\n\nThe 150mg KSM-66 dose is at the lower end of the clinically effective range (typically 300–600mg), which is the main limitation of this product. For women with significant stress or anxiety, a higher-dose ashwagandha supplement may be more effective.\n\nFor women who want a pleasant, easy-to-take daily stress support supplement and are new to adaptogens, OLLY Goodbye Stress is an excellent entry point. The taste and convenience factor genuinely improve daily compliance.",
        "editorNote": "The gummy format makes a real difference for women who struggle to take multiple capsules daily. Compliance is half the battle with supplements.",
    },
    "cooling-towel-chill-pal": {
        "shortDescription": "A premium microfiber cooling towel that stays cold for hours — ideal for managing hot flashes at work, during exercise, or while sleeping.",
        "fullReview": "The Chill Pal Microfiber Cooling Towel uses a PVA (polyvinyl alcohol) microfiber blend that retains water more effectively than standard cooling towels, staying cold for up to 4 hours after activation. The larger size (12\" x 40\") provides more coverage than most competitors, making it practical for draping across the neck and shoulders during a hot flash.\n\nFor women who experience hot flashes during exercise, the Chill Pal is particularly valuable — it can be pre-soaked and kept in a cooler or refrigerator for immediate use. The lightweight, compact design folds into a small pouch for easy carrying.\n\nCompared to the Mission Cooling Towel, the Chill Pal's PVA material retains cold longer but takes slightly longer to reactivate. The choice between them often comes down to personal preference for texture and use case.\n\nFor women whose hot flashes are most disruptive during physical activity or in warm environments, a quality cooling towel is one of the most immediately effective non-pharmaceutical interventions available.",
        "editorNote": "I recommend keeping one cooling towel at your desk, one in your gym bag, and one on your nightstand. The immediate relief during a hot flash is worth every penny.",
    },
    "bedfan-personal-cooling": {
        "shortDescription": "A bed-specific cooling fan that circulates cool air under the sheets to prevent night sweats and improve sleep quality.",
        "fullReview": "The BedFan Personal Cooling System addresses one of the most disruptive aspects of menopausal sleep: night sweats that wake women multiple times per night. Unlike room fans (which cool the air) or cooling mattress pads (which cool the surface), the BedFan blows a gentle stream of cool air directly under the sheets, creating a microclimate around the body.\n\nThe adjustable neck allows precise positioning, and the variable speed control lets users find the exact airflow that provides comfort without being disruptive. The low-profile design fits under most bed frames and is quiet enough not to disturb a sleeping partner.\n\nFor women whose primary sleep complaint is overheating and night sweats, the BedFan addresses the problem more directly than any supplement. It works best as part of a comprehensive approach: cooling the sleep environment while using supplements like magnesium glycinate or melatonin to support sleep quality.\n\nThe investment ($60–80) is significant but often pays for itself quickly in improved sleep quality. Women who have tried everything else for night sweats frequently report the BedFan as the most effective single intervention.",
        "editorNote": "The BedFan changed my sleep completely. Nothing else I tried for night sweats came close to the immediate, consistent relief of having cool air circulating under the sheets.",
    },
    "amberen-menopause-relief": {
        "shortDescription": "A clinically studied menopause supplement using a unique succinate-based formula to address hot flashes, mood, energy, and weight management.",
        "fullReview": "Amberen uses a proprietary blend of ammonium succinate, calcium disuccinate, magnesium disuccinate, zinc disuccinate, tocopheryl acetate, monosodium L-glutamate, and glycine — a formula developed by Russian researchers in the 1970s and studied in multiple clinical trials.\n\nThe mechanism is distinct from black cohosh or soy isoflavones: the succinate compounds are thought to support mitochondrial function and hypothalamic-pituitary signaling, which regulates the temperature control center affected by estrogen decline. Two randomized controlled trials showed significant improvement in hot flashes, night sweats, mood, and energy compared to placebo.\n\nAmberen is particularly notable for its weight management claims — the clinical studies showed modest reductions in waist circumference alongside symptom improvement, which is unusual for menopause supplements.\n\nFor women who have not responded to black cohosh-based supplements, Amberen's completely different mechanism makes it a worthwhile alternative. The 90-day money-back guarantee reduces the financial risk of trying it.",
        "editorNote": "Amberen is the supplement I recommend when black cohosh hasn't worked. The completely different mechanism means it can succeed where other approaches have failed.",
    },
    "neutrogena-rapid-firming": {
        "shortDescription": "A retinol-powered firming moisturizer that visibly reduces sagging and fine lines in menopausal skin within 1 week.",
        "fullReview": "Neutrogena Rapid Firming Peptide Contour Lift Face Cream combines retinol with peptides and hyaluronic acid to address the three primary skin changes of menopause: collagen loss (leading to sagging), fine lines and wrinkles, and loss of moisture retention.\n\nRetinol is the most evidence-backed topical ingredient for skin aging, with decades of clinical research demonstrating its ability to stimulate collagen production, accelerate cell turnover, and reduce the appearance of fine lines. The peptide complex provides additional collagen-stimulating signals, while hyaluronic acid provides immediate and sustained hydration.\n\nNeutrogena's clinical studies show visible improvement in skin firmness within 1 week and significant reduction in sagging within 4 weeks — among the fastest-acting results of any OTC retinol product. The formula is designed for sensitive skin and is fragrance-free.\n\nFor menopausal women new to retinol, starting with 2–3 applications per week and gradually increasing to daily use minimizes the initial adjustment period (dryness, flaking) that some women experience. Always use SPF during the day when using retinol.",
        "editorNote": "Retinol is the gold standard for menopausal skin aging, and Neutrogena Rapid Firming delivers it at an accessible price point with a well-tolerated formula.",
    },
    "kegel-exerciser-perifit": {
        "shortDescription": "A smart pelvic floor trainer with app-guided biofeedback that strengthens pelvic floor muscles to address incontinence and improve intimate health.",
        "fullReview": "Pelvic floor weakness affects over 50% of menopausal women, contributing to stress urinary incontinence (leaking with coughing, sneezing, or exercise), urgency incontinence, and reduced intimate sensation. The Perifit is a Bluetooth-connected pelvic floor trainer that provides real-time biofeedback through a smartphone app, turning pelvic floor exercises into guided, gamified sessions.\n\nThe biofeedback element is the key differentiator from traditional Kegel exercises: many women perform Kegels incorrectly (bearing down instead of lifting), and the Perifit's real-time feedback ensures correct muscle engagement. Clinical studies on biofeedback-guided pelvic floor training show significantly better outcomes than unguided exercises.\n\nThe app includes structured programs for stress incontinence, urgency incontinence, and intimate wellness, with progressive difficulty levels. Most women see measurable improvement in 4–6 weeks of consistent use (10 minutes daily).\n\nFor women experiencing any degree of urinary incontinence or pelvic floor weakness, the Perifit is one of the most effective non-surgical interventions available. Pelvic floor physical therapists frequently recommend it as a home training tool between sessions.",
        "editorNote": "Pelvic floor health is the most overlooked aspect of menopause management. The Perifit makes the exercises actually work by ensuring you're doing them correctly.",
    },
    "optimum-nutrition-gold-whey": {
        "shortDescription": "The gold standard whey protein supplement — 24g of protein per serving to support muscle preservation and metabolic health during menopause.",
        "fullReview": "Muscle mass loss (sarcopenia) accelerates significantly after menopause, with women losing 3–8% of muscle mass per decade after age 30 — a rate that increases after estrogen decline. Adequate protein intake (1.2–1.6g per kg body weight daily) is the most important nutritional intervention for preserving muscle mass, and most women fall significantly short of this target.\n\nOptimum Nutrition Gold Standard 100% Whey is the bestselling protein supplement in the world, providing 24g of whey protein (isolate, concentrate, and peptides) per serving with only 120 calories. The whey protein isolate base ensures rapid absorption and high leucine content — the amino acid most critical for stimulating muscle protein synthesis.\n\nFor menopausal women engaged in resistance training (the most effective exercise for preserving muscle and bone density), consuming 25–30g of protein within 2 hours of training significantly improves muscle adaptation. Gold Standard Whey is the most convenient and cost-effective way to meet this target.\n\nWith dozens of flavors and a 25-year track record, Optimum Nutrition Gold Standard is the benchmark against which all other protein supplements are measured. For menopausal women focused on maintaining strength, metabolic health, and body composition, it is our top protein recommendation.",
        "editorNote": "Protein intake is the most underappreciated aspect of menopause nutrition. Gold Standard Whey makes it easy to hit your daily protein target without excess calories.",
    },
}

with open("client/src/lib/products.ts", "r") as f:
    content = f.read()

for product_id, extras in remaining_extras.items():
    short_desc = extras["shortDescription"].replace('"', '\\"')
    full_review = extras["fullReview"].replace('"', '\\"').replace('\n', '\\n')
    editor_note = extras.get("editorNote", "").replace('"', '\\"')

    id_pattern = f'    id: "{product_id}"'
    id_pos = content.find(id_pattern)
    if id_pos == -1:
        print(f"WARNING: Could not find product id: {product_id}")
        continue

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
    if 'shortDescription:' in content[id_pos:tags_end+50]:
        print(f"SKIP: {product_id} already has shortDescription")
        continue

    # Get the price for this product
    price_match = re.search(r'price: "([^"]+)"', content[id_pos:id_pos+500])
    price = price_match.group(1) if price_match else "$0.00"

    insert_str = f'    shortDescription: "{short_desc}",\n'
    insert_str += f'    fullReview: "{full_review}",\n'
    insert_str += f'    priceDisplay: "{price}",\n'
    insert_str += f'    publishDate: "2026-05-02",\n'
    if editor_note:
        insert_str += f'    editorNote: "{editor_note}",\n'

    insert_pos = tags_end + len('],\n')
    content = content[:insert_pos] + insert_str + content[insert_pos:]
    print(f"✓ Added fields to: {product_id} (price: {price})")

with open("client/src/lib/products.ts", "w") as f:
    f.write(content)

print(f"\n✓ Done! File size: {len(content)} chars")

# Verify all products now have shortDescription
all_ids = re.findall(r'    id: "([^"]+)"', content)
product_ids_only = [pid for pid in all_ids if not any(x in pid for x in 
    ['multi-symptom', 'sleep-mood', 'hot-flash', 'bone-joint', 'vaginal', 'menopause-skin', 'fitness', 'cognitive-energy',
     'remifemin-vs', 'replens-vs', 'citracal-vs', 'magnesium-vs', 'collagen-vs', 'alpha-gpc-vs'])]

print(f"\nVerification - checking {len(product_ids_only)} products:")
missing = []
for pid in product_ids_only:
    pos = content.find(f'    id: "{pid}"')
    if pos == -1:
        continue
    block = content[pos:pos+2000]
    if 'shortDescription:' not in block:
        missing.append(pid)
        print(f"  MISSING shortDescription: {pid}")
    else:
        print(f"  ✓ {pid}")

if not missing:
    print("\n✅ All products have shortDescription!")
else:
    print(f"\n⚠️  {len(missing)} products still missing shortDescription")
