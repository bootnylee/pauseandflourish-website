# Weekly Article Update Playbook — PauseAndFlourish.com

## Purpose
Every Monday, find at least 1 new peer-reviewed article for each of the 6 menopause categories and add them to the site's research library.

## Stages to Update (6 total)
1. `early-perimenopause` — Early Perimenopause (late 30s–mid 40s)
2. `late-perimenopause` — Late Perimenopause (45–52)
3. `active-menopause` — Active Menopause (50–55)
4. `early-postmenopause` — Early Postmenopause (55–60)
5. `late-postmenopause` — Late Postmenopause (60+)
6. `general` — General Menopause (all stages)

## Step-by-Step Process

### Step 1: Search for New Articles
For each stage, search PubMed (https://pubmed.ncbi.nlm.nih.gov/) or PMC (https://pmc.ncbi.nlm.nih.gov/) using queries relevant to that stage's primary symptoms. Prioritize:
- Published within the last 12 months
- Study types: Meta-Analysis, Systematic Review, RCT (highest priority), Cohort, Review
- Journals: Menopause (NAMS), Frontiers in Reproductive Health, BMJ, JAMA, Lancet, Maturitas

### Step 2: For Each New Article, Collect
- Full NLM citation (Authors. Title. Journal. Year;Vol(Issue):Pages. doi:xxx)
- Plain-language consumer headline (max 10 words)
- 2-sentence key takeaway for a non-medical audience
- Direct URL (PubMed link or DOI)
- Study type

### Step 3: Update the Data File
- Open `/home/ubuntu/pauseandflourish/client/src/lib/researchArticles.ts`
- Add new article objects to the `researchArticles` array
- Use the next sequential ID (e.g., `article-078`, `article-079`, etc.)
- Set `date_added` to today's date in YYYY-MM-DD format

### Step 4: Build and Commit
```bash
cd /home/ubuntu/pauseandflourish
pnpm run build
git add client/src/lib/researchArticles.ts
git commit -m "content: add weekly research articles [YYYY-MM-DD]"
git push origin main
```

## Article Object Format
```json
{
  "id": "article-078",
  "citation": "Author A, Author B. Title of study. Journal Name. 2025;12(3):456-467. doi:10.xxxx/xxxxx",
  "headline": "Plain-language headline in 10 words or fewer",
  "takeaway": "First sentence summarising the key finding. Second sentence explaining what it means for the reader.",
  "url": "https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX/",
  "study_type": "Meta-Analysis",
  "stage_id": "early-perimenopause",
  "date_added": "2025-05-10"
}
```

## Valid Values
- `study_type`: `"Meta-Analysis"` | `"RCT"` | `"Systematic Review"` | `"Cohort Study"` | `"Cross-Sectional"` | `"Review"` | `"Clinical Trial"` | `"Observational"`
- `stage_id`: `"early-perimenopause"` | `"late-perimenopause"` | `"active-menopause"` | `"early-postmenopause"` | `"late-postmenopause"` | `"general"`
