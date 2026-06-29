import json
import re

# We will read products.ts, inject the 3 new products and 3 new comparisons
# Products to add:
# 1. HUM Nutrition Fan Club (B09JVBW5KH)
# 2. VMAGIC Vulva Balm (B0071Q5PL0)
# 3. Nature's Craft Menopause Support (B08C1G557Q)

# Comparisons to add:
# 1. HUM Fan Club vs Estroven Complete
# 2. VMAGIC Vulva Balm vs Replens
# 3. Nature's Craft vs Remifemin

products_to_add = [
    {
        "id": "hum-fan-club-menopause",
        "slug": "hum-fan-club-menopause-probiotic",
        "name": "HUM Fan Club Menopause Probiotic Supplement",
        "brand": "HUM Nutrition",
        "asin": "B09JVBW5KH",
        "category": "Multi-Symptom Supplements",
        "categorySlug": "multi-symptom-supplements",
        "stages": ["early-perimenopause", "late-perimenopause", "active-menopause"],
        "price": "$40.00",
        "rating": 4.1,
        "reviewCount": 1450,
        "heroImage": "https://m.media-amazon.com/images/I/61Nl-Z4qVKL._AC_SL1500_.jpg",
        "summary": "HUM Fan Club is a premium, non-hormonal, estrogen-free probiotic formula featuring Siberian rhubarb and grape seed extract to target 11 common symptoms of perimenopause and menopause, including hot flashes and mood swings.",
        "pros": [
            "Clinically-studied Siberian rhubarb extract for hot flash relief",
            "Contains probiotics to support gut microbiome during hormonal changes",
            "Vegan, non-GMO, and free of major allergens (Clean Label Project Certified)",
            "Addresses up to 11 symptoms including mood, sleep, and energy"
        ],
        "cons": [
            "Premium price point ($40 for a 30-day supply)",
            "Requires consistent daily use for 4-8 weeks for full benefits",
            "Siberian rhubarb may not be suitable for those with a history of estrogen-sensitive conditions"
        ],
        "ingredients": ["Siberian Rhubarb Extract", "Grape Seed Extract", "Lactobacillus plantarum (Probiotic)"],
        "verdict": "HUM Fan Club is an excellent premium choice for women seeking a clean, vegan, multi-symptom supplement that combines hot flash relief with gut health support.",
        "score": 8.6,
        "editorPick": False,
        "bestFor": "Women looking for a clean, vegan formula combining hot flash relief with probiotic gut support",
        "tags": ["probiotic", "siberian rhubarb", "vegan", "hot flashes", "multi-symptom", "clean label"],
        "shortDescription": "A premium vegan probiotic and Siberian rhubarb supplement targeting 11 menopause symptoms including hot flashes and mood swings.",
        "fullReview": "HUM Nutrition's Fan Club takes a modern, clean-ingredient approach to menopause symptom relief. Instead of relying on the traditional black cohosh or soy isoflavones, this formula is built around a clinically studied Siberian rhubarb extract (ERr 731), which has shown significant efficacy in reducing hot flash frequency and severity in clinical trials.\\n\\nWhat makes Fan Club unique is its inclusion of a patented probiotic strain (Lactobacillus plantarum) and grape seed extract. The gut microbiome undergoes significant shifts during the menopause transition as estrogen levels decline, and supporting gut health can have downstream benefits for mood, bloating, and overall inflammation. The grape seed extract provides antioxidant support for cardiovascular and skin health.\\n\\nHUM Nutrition is known for its strict ingredient standards—the product is vegan, non-GMO, and Clean Label Project Certified, free from artificial colors, preservatives, and common allergens. At $40 for a one-month supply, it sits in the premium tier, but the combination of targeted symptom relief and foundational gut support justifies the price for women prioritizing clean, modern formulations.",
        "priceDisplay": "$40.00",
        "publishDate": "2026-06-29",
        "editorNote": "Fan Club is my go-to recommendation for women who want a 'clean' supplement that addresses both their hot flashes and the digestive changes common in perimenopause."
    },
    {
        "id": "vmagic-vulva-balm",
        "slug": "vmagic-vulva-balm-menopause",
        "name": "VMAGIC by Medicine Mama Organic Vulva Balm",
        "brand": "Medicine Mama",
        "asin": "B0071Q5PL0",
        "category": "Vaginal & Intimate Health",
        "categorySlug": "vaginal-intimate-health",
        "stages": ["active-menopause", "early-postmenopause", "late-postmenopause"],
        "price": "$29.99",
        "rating": 4.4,
        "reviewCount": 15355,
        "heroImage": "https://m.media-amazon.com/images/I/61gR0x5Z3cL._AC_SL1500_.jpg",
        "summary": "VMAGIC is a highly-rated, 100% organic vulva balm that provides immediate, hormone-free relief for vaginal dryness, itching, and irritation associated with the menopause transition.",
        "pros": [
            "100% organic, clean ingredient profile (honey, beeswax, olive oil)",
            "Provides immediate soothing relief for external dryness and irritation",
            "Hormone-free and safe for daily use",
            "Over 15,000 positive reviews validating its effectiveness"
        ],
        "cons": [
            "Balm texture can be slightly greasy compared to water-based gels",
            "Designed for external vulvar use, not an internal vaginal moisturizer",
            "Contains bee products (not vegan)"
        ],
        "ingredients": ["Organic Extra Virgin Olive Oil", "Organic Beeswax", "Organic Honey", "Melexyll (Proprietary Honey Blend)", "Organic Avocado Oil"],
        "verdict": "VMAGIC is the absolute best organic, hormone-free balm for external vulvar dryness and irritation. Its clean ingredient list makes it ideal for sensitive skin.",
        "score": 9.1,
        "editorPick": True,
        "bestFor": "Women experiencing external vulvar dryness, chafing, or irritation who want a 100% organic solution",
        "tags": ["vulva balm", "organic", "vaginal dryness", "hormone-free", "sensitive skin"],
        "shortDescription": "A 100% organic, hormone-free vulva balm that provides immediate soothing relief for external dryness and irritation.",
        "fullReview": "Vaginal and vulvar dryness is one of the most common—yet least discussed—symptoms of menopause, affecting up to 50% of postmenopausal women. While internal moisturizers address deep tissue hydration, VMAGIC by Medicine Mama is specifically designed for the delicate external vulvar skin that often becomes irritated, thin, and prone to chafing as estrogen declines.\\n\\nThe brilliance of VMAGIC lies in its simplicity and purity. It is a 100% organic, hormone-free balm formulated with extra virgin olive oil, beeswax, honey, and avocado oil. Honey and beeswax have natural antimicrobial and anti-inflammatory properties, while the oils provide a protective lipid barrier that locks in moisture and prevents friction from clothing or exercise.\\n\\nWith over 15,000 Amazon reviews averaging 4.4 stars, the consumer validation is massive. Women consistently report immediate relief from the burning, itching, and general discomfort of vulvar dryness. Because it contains no synthetic chemicals, parabens, or artificial fragrances, it is exceptionally safe for the most sensitive skin.\\n\\nIt's important to note that VMAGIC is a thick balm intended for external use, making it an excellent complement to an internal moisturizer like Replens or Revaree, rather than a replacement. At $29.99 for a 2 oz jar, a little goes a very long way, making it a cost-effective staple for daily intimate care.",
        "priceDisplay": "$29.99",
        "publishDate": "2026-06-29",
        "editorNote": "VMAGIC is an absolute essential. Many women focus only on internal moisture, but treating external vulvar dryness is just as critical for daily comfort."
    },
    {
        "id": "natures-craft-menopause-support",
        "slug": "natures-craft-menopause-support-supplement",
        "name": "Nature's Craft Menopause Support",
        "brand": "Nature's Craft",
        "asin": "B08C1G557Q",
        "category": "Multi-Symptom Supplements",
        "categorySlug": "multi-symptom-supplements",
        "stages": ["late-perimenopause", "active-menopause"],
        "price": "$23.00",
        "rating": 4.2,
        "reviewCount": 4200,
        "heroImage": "https://m.media-amazon.com/images/I/71YvKzD2QXL._AC_SL1500_.jpg",
        "summary": "Nature's Craft Menopause Support is an affordable, comprehensive herbal blend featuring Black Cohosh, Dong Quai, and Vitex to help balance hormones and relieve hot flashes, night sweats, and mood swings.",
        "pros": [
            "Highly affordable at under $25 for a 30-day supply",
            "Comprehensive herbal blend targeting multiple symptoms",
            "Includes Dong Quai and Vitex (Chaste Tree Berry) for hormonal balance",
            "Non-GMO and formulated in the USA"
        ],
        "cons": [
            "Proprietary blend makes it difficult to know exact dosages of each herb",
            "Contains multiple botanicals, increasing the risk of mild allergic reactions",
            "Requires taking 2 capsules daily"
        ],
        "ingredients": ["Black Cohosh Extract", "Dong Quai Root", "Vitex (Chaste Tree Berry)", "Red Clover", "Sage Extract"],
        "verdict": "Nature's Craft is the best budget-friendly herbal blend for women who want to try a comprehensive botanical approach to menopause symptoms without spending $40+ a month.",
        "score": 8.2,
        "editorPick": False,
        "bestFor": "Women on a budget seeking a broad-spectrum herbal blend for overall menopause symptom relief",
        "tags": ["budget", "black cohosh", "dong quai", "herbal blend", "multi-symptom"],
        "shortDescription": "An affordable, comprehensive herbal blend featuring Black Cohosh and Dong Quai for multi-symptom menopause relief.",
        "fullReview": "Nature's Craft Menopause Support offers a classic 'kitchen sink' approach to botanical menopause relief, combining several of the most historically used herbs into a single, highly affordable formula. For women who want to explore natural remedies but are hesitant to invest in premium $50+ supplements, this provides an accessible entry point.\\n\\nThe formula includes Black Cohosh for hot flashes, Dong Quai (often called 'female ginseng') for pelvic blood flow and cramping, Vitex (Chaste Tree Berry) for mood and hormonal balance, and Red Clover for its mild phytoestrogenic properties. This combination aims to address the full spectrum of the menopause transition: temperature regulation, mood stability, and energy.\\n\\nThe primary drawback is that the ingredients are grouped into a proprietary blend, meaning you don't know the exact milligram dose of each individual herb. However, with over 4,200 reviews and a 4.2-star average, the formula clearly resonates with a large segment of women who find it effective for taking the edge off their worst symptoms.\\n\\nAt around $23 for a 30-day supply, Nature's Craft delivers excellent value. It's a solid first-line option for women in perimenopause or early menopause who want a broad-spectrum herbal safety net.",
        "priceDisplay": "$23.00",
        "publishDate": "2026-06-29",
        "editorNote": "If you are on a strict budget but need multi-symptom relief, Nature's Craft offers the best combination of traditional menopause herbs for the price."
    }
]

comparisons_to_add = [
    {
        "id": "hum-fan-club-vs-estroven-complete",
        "slug": "hum-fan-club-vs-estroven-complete",
        "title": "HUM Fan Club vs. Estroven Complete",
        "subtitle": "Modern clean-label probiotic formula vs. the bestselling traditional multi-symptom supplement",
        "category": "Multi-Symptom Supplements",
        "categorySlug": "multi-symptom-supplements",
        "productIds": ["hum-fan-club-menopause", "estroven-complete"],
        "product1Id": "hum-fan-club-menopause",
        "product2Id": "estroven-complete",
        "winner": "estroven-complete",
        "winnerId": "estroven-complete",
        "winnerReason": "Estroven Complete wins for most women due to its massive review base, lower price point, and proven track record using black cohosh and soy isoflavones. HUM Fan Club is the better choice for women who specifically want a clean-label, vegan formula with added gut microbiome support.",
        "summary": "Estroven Complete is the stronger default recommendation because it is highly accessible, affordable, and has helped thousands of women manage their symptoms. HUM Fan Club is the premium upgrade for women who want a modern formula utilizing Siberian rhubarb and probiotics, and who value clean-ingredient certifications.",
        "verdict": "Estroven Complete wins for overall value and proven reliability. HUM Fan Club wins for women prioritizing clean, vegan ingredients and gut health alongside menopause symptom relief.",
        "publishDate": "2026-06-29"
    },
    {
        "id": "vmagic-vulva-balm-vs-replens",
        "slug": "vmagic-vulva-balm-vs-replens-vaginal-dryness",
        "title": "VMAGIC Vulva Balm vs. Replens for Vaginal Dryness",
        "subtitle": "Organic external soothing balm vs. internal long-lasting moisture",
        "category": "Vaginal & Intimate Health",
        "categorySlug": "vaginal-intimate-health",
        "productIds": ["vmagic-vulva-balm", "replens-long-lasting-moisturizer"],
        "product1Id": "vmagic-vulva-balm",
        "product2Id": "replens-long-lasting-moisturizer",
        "winner": "vmagic-vulva-balm",
        "winnerId": "vmagic-vulva-balm",
        "winnerReason": "It's a tie based on needs, but VMAGIC wins for clean ingredients and daily comfort. VMAGIC is strictly for external vulvar tissue, while Replens is for internal vaginal moisture. For complete GSM (Genitourinary Syndrome of Menopause) relief, most women need both.",
        "summary": "Comparing VMAGIC and Replens is like comparing a lip balm to a throat lozenge—they treat different areas. VMAGIC is the ultimate organic solution for external chafing, itching, and irritation. Replens is the clinical standard for internal, long-lasting moisture. For best results, use them together.",
        "verdict": "VMAGIC wins for external vulvar soothing and organic purity. Replens wins for internal moisture. They are complementary products, not competitors.",
        "publishDate": "2026-06-29"
    },
    {
        "id": "natures-craft-vs-remifemin",
        "slug": "natures-craft-vs-remifemin-black-cohosh",
        "title": "Nature's Craft Menopause Support vs. Remifemin",
        "subtitle": "Broad-spectrum herbal blend vs. clinically standardized black cohosh",
        "category": "Multi-Symptom Supplements",
        "categorySlug": "multi-symptom-supplements",
        "productIds": ["natures-craft-menopause-support", "remifemin-menopause"],
        "product1Id": "natures-craft-menopause-support",
        "product2Id": "remifemin-menopause",
        "winner": "remifemin-menopause",
        "winnerId": "remifemin-menopause",
        "winnerReason": "Remifemin wins for its unparalleled clinical validation. Its standardized black cohosh extract has been studied for decades, ensuring consistent dosing and efficacy. Nature's Craft is a good budget alternative but relies on a proprietary blend.",
        "summary": "Remifemin is the superior choice for women who want a clinically proven, targeted approach to hot flashes and mood swings with guaranteed potency. Nature's Craft is the better choice for women on a tight budget who want to try a wider variety of herbs (like Dong Quai and Vitex) at once.",
        "verdict": "Remifemin wins for clinical evidence, standardization, and reliability. Nature's Craft wins for budget shoppers wanting a multi-herb approach.",
        "publishDate": "2026-06-29"
    }
]

file_path = "/home/ubuntu/pauseandflourish-website/client/src/lib/products.ts"
with open(file_path, "r") as f:
    content = f.read()

# Add products
for product in products_to_add:
    if f'id: "{product["id"]}"' in content:
        print(f"Product {product['id']} already exists")
        continue
        
    stages_str = json.dumps(product["stages"])
    pros_str = json.dumps(product["pros"])
    cons_str = json.dumps(product["cons"])
    tags_str = json.dumps(product["tags"])
    ingredients_str = json.dumps(product["ingredients"])
    
    full_review_escaped = product["fullReview"].replace("`", "\\`").replace("${", "\\${")
    
    product_entry = f"""  {{
    id: "{product["id"]}",
    slug: "{product["slug"]}",
    name: "{product["name"]}",
    brand: "{product["brand"]}",
    asin: "{product["asin"]}",
    affiliateUrl: buildAffiliateUrl("{product["asin"]}"),
    category: "{product["category"]}",
    categorySlug: "{product["categorySlug"]}",
    stages: {stages_str},
    price: "{product["price"]}",
    rating: {product["rating"]},
    reviewCount: {product["reviewCount"]},
    heroImage: "{product["heroImage"]}",
    summary: "{product["summary"].replace('"', '\\"')}",
    pros: {pros_str},
    cons: {cons_str},
    ingredients: {ingredients_str},
    verdict: "{product["verdict"].replace('"', '\\"')}",
    score: {product["score"]},
    editorPick: {'true' if product["editorPick"] else 'false'},
    bestFor: "{product["bestFor"].replace('"', '\\"')}",
    tags: {tags_str},
    shortDescription: "{product["shortDescription"].replace('"', '\\"')}",
    fullReview: `{full_review_escaped}`,
    priceDisplay: "{product["priceDisplay"]}",
    publishDate: "{product["publishDate"]}",
    editorNote: "{product["editorNote"].replace('"', '\\"')}",
  }},
"""
    # Insert before the closing bracket of allProducts
    # We find the end of the allProducts array which is before the Helper Functions
    marker = "\\n];\\n\\n// ─── Helper Functions"
    content = content.replace(marker, product_entry + marker)
    print(f"Added product: {product['id']}")

# Add comparisons
for comparison in comparisons_to_add:
    if f'id: "{comparison["id"]}"' in content:
        print(f"Comparison {comparison['id']} already exists")
        continue
        
    product_ids_str = json.dumps(comparison["productIds"])
    
    comparison_entry = f"""  {{
    id: "{comparison["id"]}",
    slug: "{comparison["slug"]}",
    title: "{comparison["title"].replace('"', '\\"')}",
    subtitle: "{comparison["subtitle"].replace('"', '\\"')}",
    category: "{comparison["category"]}",
    categorySlug: "{comparison["categorySlug"]}",
    productIds: {product_ids_str},
    product1Id: "{comparison["product1Id"]}",
    product2Id: "{comparison["product2Id"]}",
    winner: "{comparison["winner"]}",
    winnerId: "{comparison["winnerId"]}",
    winnerReason: "{comparison["winnerReason"].replace('"', '\\"')}",
    summary: "{comparison["summary"].replace('"', '\\"')}",
    verdict: "{comparison["verdict"].replace('"', '\\"')}",
    publishDate: "{comparison["publishDate"]}",
  }},
"""
    # Insert before the closing bracket of comparisons array
    marker = "\\n];\\n\\n/** Get a product by its id"
    content = content.replace(marker, comparison_entry + marker)
    print(f"Added comparison: {comparison['id']}")

with open(file_path, "w") as f:
    f.write(content)

print("Update applied to products.ts")
