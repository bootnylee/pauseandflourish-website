#!/bin/bash
# This script creates all 5 remaining email HTML templates

# Template function - takes stage name, badge text, stage slug, symptom text, product1 name, product1 slug, product1 desc, product2 name, product2 slug, product2 desc, product3 name, product3 slug, product3 desc
create_email() {
  STAGE="$1"
  BADGE="$2"
  SLUG="$3"
  SYMPTOMS="$4"
  P1_NAME="$5"
  P1_SLUG="$6"
  P1_DESC="$7"
  P2_NAME="$8"
  P2_SLUG="$9"
  P2_DESC="${10}"
  P3_NAME="${11}"
  P3_SLUG="${12}"
  P3_DESC="${13}"
  BODY_TEXT="${14}"
  FILE="welcome-${SLUG}.html"

  cat > "/home/ubuntu/pauseandflourish/email-templates/html/$FILE" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pause &amp; Flourish</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f9f5f0; font-family: Georgia, 'Times New Roman', serif; }
    .wrapper { background-color: #f9f5f0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background-color: #1a6b6b; padding: 36px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-family: Georgia, serif; font-size: 26px; margin: 0 0 6px 0; font-weight: normal; letter-spacing: 0.5px; }
    .header p { color: #b8d8d8; font-size: 14px; margin: 0; font-family: Arial, sans-serif; }
    .stage-badge { display: inline-block; background-color: #c8693a; color: #ffffff; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-top: 14px; }
    .body { padding: 40px; }
    .greeting { font-size: 18px; color: #2d2d2d; margin: 0 0 20px 0; line-height: 1.6; }
    .body p { font-size: 16px; color: #4a4a4a; line-height: 1.8; margin: 0 0 18px 0; font-family: Arial, sans-serif; }
    .highlight-box { background-color: #f0f7f7; border-left: 4px solid #1a6b6b; padding: 20px 24px; margin: 24px 0; border-radius: 0 6px 6px 0; }
    .highlight-box p { margin: 0 0 8px 0; font-size: 15px; }
    .highlight-box p:last-child { margin: 0; }
    .highlight-box strong { color: #1a6b6b; }
    .products-section { margin: 28px 0; }
    .products-section h2 { font-family: Georgia, serif; font-size: 20px; color: #1a6b6b; margin: 0 0 16px 0; font-weight: normal; }
    .product-card { border: 1px solid #e8e0d8; border-radius: 6px; padding: 16px 20px; margin-bottom: 12px; display: block; text-decoration: none; }
    .product-name { font-family: Arial, sans-serif; font-weight: bold; font-size: 15px; color: #2d2d2d; margin: 0 0 4px 0; }
    .product-desc { font-family: Arial, sans-serif; font-size: 13px; color: #777; margin: 0; }
    .cta-button { display: block; background-color: #c8693a; color: #ffffff; text-align: center; padding: 16px 32px; border-radius: 6px; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; margin: 28px 0; letter-spacing: 0.5px; }
    .divider { border: none; border-top: 1px solid #e8e0d8; margin: 28px 0; }
    .footer { background-color: #f9f5f0; padding: 28px 40px; text-align: center; }
    .footer p { font-family: Arial, sans-serif; font-size: 12px; color: #999; margin: 0 0 8px 0; line-height: 1.6; }
    .footer a { color: #1a6b6b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Pause &amp; Flourish</h1>
        <p>Your trusted guide to menopause wellness</p>
        <div class="stage-badge">${BADGE}</div>
      </div>
      <div class="body">
        <p class="greeting">Welcome, {{FirstName}}!</p>
        <p>${BODY_TEXT}</p>
        <div class="highlight-box">
          <p><strong>What to expect in ${STAGE}:</strong></p>
          <p>${SYMPTOMS}</p>
        </div>
        <div class="products-section">
          <h2>Recommended for Your Stage</h2>
          <p>These are the products our editors have reviewed and recommended specifically for women in ${STAGE}:</p>
          <a href="https://www.pauseandflourish.com/review/${P1_SLUG}" class="product-card" style="display:block;text-decoration:none;">
            <p class="product-name">${P1_NAME}</p>
            <p class="product-desc">${P1_DESC}</p>
          </a>
          <a href="https://www.pauseandflourish.com/review/${P2_SLUG}" class="product-card" style="display:block;text-decoration:none;">
            <p class="product-name">${P2_NAME}</p>
            <p class="product-desc">${P2_DESC}</p>
          </a>
          <a href="https://www.pauseandflourish.com/review/${P3_SLUG}" class="product-card" style="display:block;text-decoration:none;">
            <p class="product-name">${P3_NAME}</p>
            <p class="product-desc">${P3_DESC}</p>
          </a>
        </div>
        <a href="https://www.pauseandflourish.com/stage/${SLUG}" class="cta-button">View Your Full ${STAGE} Guide</a>
        <hr class="divider">
        <p>Every week, we publish honest, research-backed reviews of menopause supplements and wellness products. You'll hear from us weekly with insights tailored to your stage.</p>
        <p>Have a question? Just reply to this email — we read every message.</p>
        <p>With warmth,<br><strong>The Pause &amp; Flourish Team</strong></p>
      </div>
      <div class="footer">
        <p>You're receiving this because you signed up at <a href="https://www.pauseandflourish.com">pauseandflourish.com</a>.</p>
        <p>{{SenderInfo}}</p>
        <p><a href="{{UnsubscribeURL}}">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>
HTMLEOF
  echo "Created $FILE"
}

# Late Perimenopause
create_email \
  "Late Perimenopause" \
  "Late Perimenopause" \
  "late-perimenopause" \
  "Frequent hot flashes &middot; Significant sleep disruption &middot; Mood changes &middot; Irregular or missed periods" \
  "Estroven Complete Menopause Relief" \
  "estroven-complete-menopause-relief" \
  "Multi-symptom formula targeting hot flashes, sleep, and mood in late perimenopause" \
  "Amberen Multi-Symptom Menopause Relief" \
  "amberen-multi-symptom-menopause-relief" \
  "Clinically studied formula for women experiencing multiple symptoms simultaneously" \
  "Magnesium Glycinate Sleep Support" \
  "magnesium-glycinate-sleep-support" \
  "Highly absorbable magnesium to restore deep sleep disrupted by hormonal changes" \
  "You're in the most active phase of the transition — and you're not alone. Late Perimenopause brings the most noticeable symptoms for many women, but the right support makes a significant difference. Based on your quiz results, we've curated the products most likely to help you right now."

# Early Postmenopause
create_email \
  "Early Postmenopause" \
  "Early Postmenopause" \
  "early-postmenopause" \
  "Lingering hot flashes &middot; Vaginal dryness beginning &middot; Bone density concerns &middot; Mood stabilizing" \
  "Citracal Calcium + D3 Slow Release" \
  "citracal-calcium-d3-slow-release" \
  "Bone-density support formulated for postmenopausal women — slow-release for better absorption" \
  "Replens Long-Lasting Vaginal Moisturizer" \
  "replens-long-lasting-vaginal-moisturizer" \
  "Clinician-recommended for vaginal dryness — hormone-free, long-lasting relief" \
  "Remifemin Menopause Supplement" \
  "remifemin-menopause-supplement" \
  "Black cohosh formula for lingering hot flashes and mood support in early postmenopause" \
  "Congratulations on reaching Early Postmenopause — your period has stopped and your body is settling into a new hormonal baseline. While many symptoms begin to ease, this stage brings its own priorities: protecting bone density, addressing vaginal health, and maintaining energy. We've reviewed the products that matter most right now."

# Late Postmenopause
create_email \
  "Late Postmenopause" \
  "Late Postmenopause" \
  "late-postmenopause" \
  "Bone health critical &middot; Vaginal and urinary health &middot; Cognitive clarity &middot; Cardiovascular wellness" \
  "Garden of Life Bone Strength Calcium" \
  "garden-of-life-bone-strength-calcium" \
  "Plant-based calcium and D3 for long-term bone health in postmenopausal women" \
  "Alpha GPC Cognitive Support" \
  "alpha-gpc-cognitive-support" \
  "Clinically studied choline compound for memory, focus, and mental clarity" \
  "Hyalogic Intimate Serum" \
  "hyalogic-intimate-serum" \
  "Hyaluronic acid serum for long-term vaginal and intimate tissue health" \
  "You've navigated the full menopause transition — and you're thriving. Late Postmenopause is about long-term wellness: protecting your bones, supporting cognitive health, and maintaining vitality for decades ahead. Our editors have reviewed the products with the strongest evidence for women at your stage."

# Surgical/Induced Menopause
create_email \
  "Surgical Menopause" \
  "Surgical Menopause" \
  "surgical-menopause" \
  "Sudden, intense hot flashes &middot; Rapid hormonal shift &middot; Sleep disruption &middot; Emotional adjustment" \
  "Estroven Complete Menopause Relief" \
  "estroven-complete-menopause-relief" \
  "Multi-symptom formula for rapid-onset symptoms common in surgical menopause" \
  "Amberen Multi-Symptom Menopause Relief" \
  "amberen-multi-symptom-menopause-relief" \
  "Clinically studied for women experiencing sudden, severe menopause symptoms" \
  "Magnesium Glycinate Sleep Support" \
  "magnesium-glycinate-sleep-support" \
  "Essential magnesium support for sleep and mood during abrupt hormonal transition" \
  "Surgical or medically induced menopause brings an abrupt hormonal shift that can feel more intense than natural menopause. Your symptoms may come on suddenly and strongly — and you deserve support that matches that reality. We've selected the products most reviewed and recommended for women navigating this path."

echo "All email templates created."
