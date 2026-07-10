import json

d = json.load(open('scripts/site-data.json'))
print('Top-level keys:', list(d.keys()))
print('Products:', len(d['allProducts']))
print('Comparisons:', len(d['comparisons']))
print('First product keys:', list(d['allProducts'][0].keys()))
print('First comparison keys:', list(d['comparisons'][0].keys()))
print()
print('All product slugs:')
for p in d['allProducts']:
    print(' ', p.get('slug'))
print()
print('All comparison slugs:')
for c in d['comparisons']:
    print(' ', c.get('slug'))
