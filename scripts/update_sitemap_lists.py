import re

file_path = "/home/ubuntu/pauseandflourish-website/scripts/generate-sitemap.mjs"
with open(file_path, "r") as f:
    content = f.read()

new_product_slugs = [
    '"hum-fan-club-menopause-probiotic"',
    '"vmagic-vulva-balm-menopause"',
    '"thorne-hormone-advantage-dim"'
]

new_comparison_slugs = [
    '"hum-fan-club-vs-estroven-complete"',
    '"vmagic-vulva-balm-vs-replens-vaginal-dryness"',
    '"natures-craft-vs-remifemin-black-cohosh"'
]

# Insert product slugs
product_marker = "const productSlugs = ["
if product_marker in content:
    insertion = "\\n  " + ",\\n  ".join(new_product_slugs) + ","
    content = content.replace(product_marker, product_marker + insertion)

# Insert comparison slugs
comparison_marker = "const comparisonSlugs = ["
if comparison_marker in content:
    insertion = "\\n  " + ",\\n  ".join(new_comparison_slugs) + ","
    content = content.replace(comparison_marker, comparison_marker + insertion)

with open(file_path, "w") as f:
    f.write(content)

print("Sitemap lists updated.")
