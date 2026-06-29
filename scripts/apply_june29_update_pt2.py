import json

products_to_add = [
    {
        "id": "thorne-hormone-advantage",
        "slug": "thorne-hormone-advantage-dim",
        "name": "THORNE Hormone Advantage",
        "brand": "Thorne",
        "asin": "B0C9N5W4B8",
        "category": "Multi-Symptom Supplements",
        "categorySlug": "multi-symptom-supplements",
        "stages": ["early-perimenopause", "late-perimenopause"],
        "price": "$47.00",
        "rating": 4.4,
        "reviewCount": 1150,
        "heroImage": "https://m.media-amazon.com/images/I/61H0GjY+bHL._AC_SL1500_.jpg",
        "summary": "THORNE Hormone Advantage combines DIM (diindolylmethane), pomegranate extract, and SGS to support healthy estrogen metabolism and balance, addressing weight fluctuations and breast tenderness.",
        "pros": [
            "Clinically backed DIM supports optimal estrogen metabolism ratios",
            "Addresses perimenopause weight fluctuations and breast tenderness",
            "Includes broccoli seed extract (SGS) for long-lasting antioxidant support",
            "NSF Certified for Sport, ensuring highest purity standards"
        ],
        "cons": [
            "Premium price point ($47 for a 30-day supply)",
            "DIM can cause harmless but surprising changes in urine color",
            "May cause mild headaches during the first few days of use"
        ],
        "ingredients": ["DIM (Diindolylmethane) 150mg", "Pomegranate Extract 100mg", "Sulforaphane Glucosinolate (SGS) 25mg"],
        "verdict": "THORNE Hormone Advantage is the premium choice for women in perimenopause struggling with estrogen dominance symptoms like weight gain, breast tenderness, and mood swings.",
        "score": 8.9,
        "editorPick": False,
        "bestFor": "Women in perimenopause experiencing symptoms of estrogen dominance, such as unexplained weight gain and breast tenderness",
        "tags": ["dim", "estrogen metabolism", "weight management", "nsf certified", "perimenopause"],
        "shortDescription": "A premium DIM supplement from Thorne designed to support healthy estrogen metabolism and address perimenopause weight fluctuations.",
        "fullReview": "During early to late perimenopause, estrogen levels don't just drop—they fluctuate wildly, often leading to periods of 'estrogen dominance' relative to progesterone. This imbalance is frequently responsible for the sudden weight gain, breast tenderness, and severe mood swings many women experience before their periods stop entirely.\\n\\nTHORNE Hormone Advantage targets this specific phase using DIM (diindolylmethane), a compound found in cruciferous vegetables that promotes the metabolism of estrogen into its healthier, more protective metabolites. By optimizing this ratio, DIM helps mitigate the symptoms of estrogen dominance. Thorne enhances this formula with pomegranate extract and SGS (sulforaphane glucosinolate) from broccoli seed extract, which provide extended antioxidant protection and support liver detoxification pathways—crucial for clearing metabolized hormones.\\n\\nAs with all Thorne products, the quality is exceptional. It is NSF Certified for Sport, meaning it undergoes rigorous third-party testing for purity and label accuracy. At $47 for a one-month supply, it is an investment, but for women struggling with the specific symptoms of perimenopausal estrogen fluctuations, it is one of the most targeted and effective interventions available.",
        "priceDisplay": "$47.00",
        "publishDate": "2026-06-29",
        "editorNote": "For women who tell me they are gaining weight around their middle despite changing nothing about their diet during perimenopause, DIM is often the missing puzzle piece. Thorne makes the best version."
    }
]

file_path = "/home/ubuntu/pauseandflourish-website/client/src/lib/products.ts"
with open(file_path, "r") as f:
    content = f.read()

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
    marker = "\\n];\\n\\n// ─── Helper Functions"
    content = content.replace(marker, product_entry + marker)
    print(f"Added product: {product['id']}")

with open(file_path, "w") as f:
    f.write(content)
