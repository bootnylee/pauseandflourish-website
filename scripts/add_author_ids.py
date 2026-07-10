"""
Add authorId fields to all products and comparisons in products.ts.
Distribution: roughly 50/50 between diane-kessler and carol-beaumont,
alternating so the pattern is not mechanical.
"""
import re

# 54 products - assign authorId based on index
# Diane gets odds (0,2,4,...) Carol gets evens (1,3,5,...)
# Actually let's do a more natural distribution:
# Diane: 0,1,2,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28,29,31,32,34,35,37,38,40,41,43,44,46,47,49,50,52,53
# Carol: 3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51

# Simpler: alternate in groups of 2-3 for natural feel
PRODUCT_AUTHOR_MAP = {
    "new-chapter-estrotone-menopause": "diane-kessler",
    "womaness-daily-v-soothe": "diane-kessler",
    "gaia-herbs-menopause-support-daytime": "carol-beaumont",
    "remifemin-menopause-supplement": "carol-beaumont",
    "estroven-complete-menopause-relief": "diane-kessler",
    "bonafide-relizen-hot-flash-relief": "diane-kessler",
    "natrol-melatonin-10mg-sleep-aid": "carol-beaumont",
    "nobi-nutrition-magnesium-glycinate": "carol-beaumont",
    "olly-goodbye-stress-gummies": "diane-kessler",
    "chill-pal-mesh-cooling-towel": "diane-kessler",
    "elegear-revolutionary-cooling-blanket": "carol-beaumont",
    "santo-remedio-hormonal-balance-menopause-support": "carol-beaumont",
    "citracal-petites-calcium-d3": "diane-kessler",
    "naturelo-calcium-bone-strength": "diane-kessler",
    "replens-long-lasting-vaginal-moisturizer": "carol-beaumont",
    "zenzsual-feminine-moisturizing-gel": "carol-beaumont",
    "vital-proteins-collagen-peptides": "diane-kessler",
    "neutrogena-rapid-firming-retinol-serum": "diane-kessler",
    "perifit-kegel-exerciser-app": "carol-beaumont",
    "optimum-nutrition-gold-standard-whey": "carol-beaumont",
    "real-mushrooms-lions-mane-alpha-gpc-focus": "diane-kessler",
    "nootropics-depot-rhodiola-rosea": "diane-kessler",
    "triquetra-bioactive-vitamin-b12-drops": "carol-beaumont",
    "natures-bounty-black-cohosh": "carol-beaumont",
    "qutool-cooling-pillow-hot-flashes": "diane-kessler",
    "aloe-cadabra-natural-vaginal-lubricant": "diane-kessler",
    "pure-encapsulations-vitamin-d3-k2-bone-health": "carol-beaumont",
    "opositiv-meno-vitamins-menopause-support": "carol-beaumont",
    "equelle-multi-symptom-menopause-relief": "diane-kessler",
    "bonafide-revaree-hyaluronic-acid-vaginal-moisturizer": "diane-kessler",
    "amberen-perimenopause-supplement-60-capsules": "carol-beaumont",
    "gynatrof-hyaluronic-acid-vaginal-moisturizer": "carol-beaumont",
    "clea-midlife-focus-brain-fog-supplement": "diane-kessler",
    "amberen-menopause-supplement-12-symptom-relief": "diane-kessler",
    "natures-craft-complete-herbal-menopause-support": "carol-beaumont",
    "eu-natural-staying-cool-menopause-supplement": "carol-beaumont",
    "menolabs-menofit-menopause-probiotic": "diane-kessler",
    "hifinecare-cooling-gel-pad-hot-flashes": "diane-kessler",
    "intimate-rose-kegel-exercise-weights": "carol-beaumont",
    "health-and-her-perimenopause-supplement": "carol-beaumont",
    "olly-mellow-menopause-hot-flash-support": "diane-kessler",
    "metagenics-herwellness-estrovera-menopause-relief": "diane-kessler",
    "estroven-sleep-cool-menopause-supplement": "carol-beaumont",
    "new-chapter-bone-strength-take-care-supplement": "carol-beaumont",
    "neuriva-plus-brain-supplement-30-capsules": "diane-kessler",
    "bonafide-thermella-hot-flash-supplement": "diane-kessler",
    "thorne-perimenopause-complete-supplement": "carol-beaumont",
    "stripes-evening-wear-retinol-night-cream-menopause": "carol-beaumont",
    "hum-fan-club-menopause-probiotic": "diane-kessler",
    "vmagic-vulva-balm-menopause": "diane-kessler",
    "thorne-hormone-advantage-dim": "carol-beaumont",
    "estroven-complete-ashwagandha-menopause": "carol-beaumont",
    "estroven-complete-gummies-menopause": "diane-kessler",
    "nature-made-calcium-magnesium-zinc-d3": "diane-kessler",
}

COMPARISON_AUTHOR_MAP = {
    "new-chapter-estrotone-vs-estroven-complete": "diane-kessler",
    "womaness-daily-v-soothe-vs-replens": "diane-kessler",
    "gaia-herbs-daytime-vs-olly-goodbye-stress": "carol-beaumont",
    "remifemin-vs-natures-bounty-black-cohosh": "carol-beaumont",
    "remifemin-vs-estroven-complete": "diane-kessler",
    "replens-vs-zenzsual-feminine-gel": "carol-beaumont",
    "citracal-vs-naturelo-bone-strength": "diane-kessler",
    "magnesium-glycinate-vs-melatonin-sleep": "carol-beaumont",
    "vital-proteins-collagen-vs-b12-energy": "diane-kessler",
    "alpha-gpc-vs-rhodiola-brain-fog": "diane-kessler",
    "equelle-vs-estroven": "carol-beaumont",
    "vital-proteins-collagen-vs-neutrogena-rapid-firming": "carol-beaumont",
    "nobi-magnesium-glycinate-vs-natrol-melatonin": "diane-kessler",
    "qutool-cooling-pillow-vs-bedfan-night-sweats": "diane-kessler",
    "aloe-cadabra-vs-replens-vaginal-moisturizer": "carol-beaumont",
    "pure-encapsulations-d3k2-vs-naturelo-bone-strength": "carol-beaumont",
    "opositiv-meno-vs-estroven-complete": "diane-kessler",
    "equelle-vs-bonafide-relizen": "diane-kessler",
    "revaree-vs-replens-vaginal-moisturizer": "carol-beaumont",
    "amberen-perimenopause-vs-opositiv-meno-perimenopause-support": "carol-beaumont",
    "gynatrof-vs-revaree-vaginal-moisturizer": "diane-kessler",
    "clea-midlife-focus-vs-alpha-gpc-brain-fog": "diane-kessler",
    "amberen-vs-estroven-complete-menopause-relief": "carol-beaumont",
    "natures-craft-vs-remifemin-black-cohosh": "carol-beaumont",
    "eu-natural-staying-cool-vs-opositiv-meno": "diane-kessler",
    "menofit-vs-estroven-complete-menopause-relief": "diane-kessler",
    "hifinecare-cooling-gel-pad-vs-bedfan-night-sweats": "carol-beaumont",
    "intimate-rose-kegel-weights-vs-perifit": "carol-beaumont",
    "health-and-her-vs-amberen-perimenopause-support": "diane-kessler",
    "olly-mellow-menopause-vs-opositiv-meno": "diane-kessler",
    "metagenics-estrovera-vs-estroven-complete": "carol-beaumont",
    "estroven-sleep-cool-vs-natrol-melatonin-menopause-sleep": "carol-beaumont",
    "new-chapter-bone-strength-vs-pure-encapsulations-d3k2": "diane-kessler",
    "neuriva-plus-vs-alpha-gpc-brain-fog-menopause": "diane-kessler",
    "bonafide-thermella-vs-remifemin-hot-flash": "carol-beaumont",
    "thorne-perimenopause-complete-vs-amberen-multi-symptom": "carol-beaumont",
    "stripes-evening-wear-retinol-vs-neutrogena-rapid-firming-menopause": "diane-kessler",
    "hum-fan-club-vs-estroven-complete": "diane-kessler",
    "vmagic-vulva-balm-vs-replens-vaginal-dryness": "carol-beaumont",
    "thorne-hormone-advantage-vs-remifemin-perimenopause": "carol-beaumont",
    "estroven-complete-ashwagandha-vs-estroven-complete": "diane-kessler",
    "estroven-complete-gummies-vs-estroven-complete-capsules": "diane-kessler",
    "nature-made-calcium-magnesium-zinc-vs-citracal-petites": "carol-beaumont",
}

# Verify counts
diane_products = sum(1 for v in PRODUCT_AUTHOR_MAP.values() if v == "diane-kessler")
carol_products = sum(1 for v in PRODUCT_AUTHOR_MAP.values() if v == "carol-beaumont")
diane_comparisons = sum(1 for v in COMPARISON_AUTHOR_MAP.values() if v == "diane-kessler")
carol_comparisons = sum(1 for v in COMPARISON_AUTHOR_MAP.values() if v == "carol-beaumont")

print(f"Products: Diane={diane_products}, Carol={carol_products}, Total={diane_products+carol_products}")
print(f"Comparisons: Diane={diane_comparisons}, Carol={carol_comparisons}, Total={diane_comparisons+carol_comparisons}")

# Read the products.ts file
with open("client/src/lib/products.ts", "r") as f:
    content = f.read()

# First, add authorId to the Product interface
# Find the publishDate line in the interface and add authorId after it
old_interface_end = '  publishDate: string;        // ISO date string\n}'
new_interface_end = '  publishDate: string;        // ISO date string\n  authorId: string;           // pen-name author id (see src/lib/authors.ts)\n}'
content = content.replace(old_interface_end, new_interface_end, 1)

# Add authorId to the Comparison interface
old_comp_interface_end = '  publishDate?: string;\n}'
new_comp_interface_end = '  publishDate?: string;\n  authorId?: string;           // pen-name author id (see src/lib/authors.ts)\n}'
content = content.replace(old_comp_interface_end, new_comp_interface_end, 1)

# For each product, find the publishDate field and add authorId after it
# Pattern: find publishDate: "YYYY-MM-DD", followed by optional whitespace and then
# either editorNote or a closing brace
def add_author_to_product(content, slug, author_id):
    # Find the product block by its slug
    # Look for slug: "the-slug" and then find the publishDate in that block
    # Strategy: find the slug, then find the next publishDate after it, then insert authorId
    
    slug_pattern = f'slug: "{slug}"'
    slug_pos = content.find(slug_pattern)
    if slug_pos == -1:
        print(f"  WARNING: Could not find slug: {slug}")
        return content
    
    # Find publishDate after this slug
    pub_pattern = 'publishDate: "'
    pub_pos = content.find(pub_pattern, slug_pos)
    if pub_pos == -1:
        print(f"  WARNING: Could not find publishDate for slug: {slug}")
        return content
    
    # Find the end of the publishDate line
    line_end = content.find('\n', pub_pos)
    if line_end == -1:
        print(f"  WARNING: Could not find line end for slug: {slug}")
        return content
    
    # Check if authorId already exists right after
    next_line = content[line_end+1:line_end+50]
    if 'authorId:' in next_line:
        # Already has authorId, update it
        old_author_line_end = content.find('\n', line_end+1)
        old_author_line = content[line_end+1:old_author_line_end]
        new_author_line = f'  authorId: "{author_id}",'
        content = content[:line_end+1] + new_author_line + content[old_author_line_end:]
        return content
    
    # Get the indentation from the publishDate line
    line_start = content.rfind('\n', 0, pub_pos) + 1
    indent = ''
    for ch in content[line_start:]:
        if ch in (' ', '\t'):
            indent += ch
        else:
            break
    
    # Insert authorId after publishDate line
    insertion = f'\n{indent}authorId: "{author_id}",'
    content = content[:line_end] + insertion + content[line_end:]
    return content

# Process products
print("\nAdding authorId to products...")
for slug, author_id in PRODUCT_AUTHOR_MAP.items():
    content = add_author_to_product(content, slug, author_id)
    print(f"  {slug} -> {author_id}")

# For comparisons, find by slug and add authorId after publishDate
def add_author_to_comparison(content, slug, author_id):
    slug_pattern = f'slug: "{slug}"'
    slug_pos = content.find(slug_pattern)
    if slug_pos == -1:
        print(f"  WARNING: Could not find comparison slug: {slug}")
        return content
    
    # Find the closing brace of this comparison object
    # Comparisons may or may not have publishDate
    # Look for publishDate or the closing brace of the object
    pub_pattern = 'publishDate:'
    pub_pos = content.find(pub_pattern, slug_pos)
    
    # Find the next object start to bound our search
    next_slug_pos = content.find('slug: "', slug_pos + len(slug_pattern))
    if next_slug_pos == -1:
        next_slug_pos = len(content)
    
    if pub_pos == -1 or pub_pos > next_slug_pos:
        # No publishDate in this comparison - find the closing brace
        close_pos = content.find('},', slug_pos)
        if close_pos == -1 or close_pos > next_slug_pos:
            close_pos = content.find('}', slug_pos)
        # Insert before the closing brace
        line_start = content.rfind('\n', 0, slug_pos) + 1
        indent = ''
        for ch in content[line_start:]:
            if ch in (' ', '\t'):
                indent += ch
            else:
                break
        insertion = f'\n{indent}authorId: "{author_id}",'
        content = content[:close_pos] + insertion + '\n' + content[close_pos:]
        return content
    
    # Has publishDate - insert after it
    line_end = content.find('\n', pub_pos)
    if line_end == -1:
        return content
    
    # Check if authorId already exists
    next_line = content[line_end+1:line_end+50]
    if 'authorId:' in next_line:
        old_author_line_end = content.find('\n', line_end+1)
        old_author_line = content[line_end+1:old_author_line_end]
        new_author_line = f'  authorId: "{author_id}",'
        content = content[:line_end+1] + new_author_line + content[old_author_line_end:]
        return content
    
    line_start = content.rfind('\n', 0, pub_pos) + 1
    indent = ''
    for ch in content[line_start:]:
        if ch in (' ', '\t'):
            indent += ch
        else:
            break
    
    insertion = f'\n{indent}authorId: "{author_id}",'
    content = content[:line_end] + insertion + content[line_end:]
    return content

print("\nAdding authorId to comparisons...")
for slug, author_id in COMPARISON_AUTHOR_MAP.items():
    content = add_author_to_comparison(content, slug, author_id)
    print(f"  {slug} -> {author_id}")

# Write back
with open("client/src/lib/products.ts", "w") as f:
    f.write(content)

print("\nDone! Verifying...")
# Count authorId occurrences
product_count = content.count('authorId: "diane-kessler"') + content.count('authorId: "carol-beaumont"')
print(f"Total authorId fields added: {product_count}")
print(f"Diane: {content.count('authorId: \"diane-kessler\"')}")
print(f"Carol: {content.count('authorId: \"carol-beaumont\"')}")
