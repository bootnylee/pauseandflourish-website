file_path = "/home/ubuntu/pauseandflourish-website/client/src/lib/products.ts"
with open(file_path, "r") as f:
    content = f.read()

# Fix the wrong ASIN B0C9N5W4B8 with the correct one B07RR9JF9B
content = content.replace(
    'asin: "B0C9N5W4B8"',
    'asin: "B07RR9JF9B"'
)
content = content.replace(
    'affiliateUrl: buildAffiliateUrl("B0C9N5W4B8")',
    'affiliateUrl: buildAffiliateUrl("B07RR9JF9B")'
)
content = content.replace(
    'heroImage: "https://m.media-amazon.com/images/I/61H0GjY+bHL._AC_SL1500_.jpg"',
    'heroImage: "https://m.media-amazon.com/images/I/71sMBJFBBqL._AC_SL1500_.jpg"'
)

with open(file_path, "w") as f:
    f.write(content)

print("ASIN fixed to B07RR9JF9B for Thorne Hormone Advantage")
