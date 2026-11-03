# NEET AI Tutor — secure Cloudflare Worker setup

The V2 website is static GitHub Pages. This Worker is the private server-side bridge to Gemini. The Gemini key is **never** placed in this repository or browser code.

## Free-only behavior

- Uses only `gemini-3.5-flash-lite`, whose Standard tier currently lists free input/output tokens.
- No paid-model fallback, search grounding, or paid tools are called.
- If Gemini returns HTTP 429, the Worker stops and returns a free-quota message.
- **Important:** To keep the bill at ₹0, create/use a Google AI Studio project that is not linked to a paid billing account. If you attach billing, Google's paid tier could apply. The free tier has limited model access and quotas; check AI Studio before use.
- Google states free-tier content may be used to improve its products. Do not send personal, medical, financial, or otherwise sensitive information.

## Deploy

1. Sign in to Cloudflare and open **Workers & Pages** → **Create** → **Worker**.
2. Create a Worker named e.g. `neet-ai-tutor`.
3. Replace the starter code with the complete contents of `v2/worker/index.js`, then Deploy.
4. Open the Worker **Settings → Variables and Secrets**.
5. Add these two as **Secrets** (not plain text variables):
   - `GEMINI_API_KEY` — create in Google AI Studio. Do not paste it into GitHub or ChatGPT.
   - `ACCESS_CODE` — create a long random private code. Keep it private; enter the same value in the V2 Tutor settings on your device.
6. Add this plain-text variable:
   - `ALLOWED_ORIGIN` = `https://arshadali05932-dotcom.github.io`
   The Worker checks the exact browser origin. Do not add a trailing slash.
7. Save changes / redeploy. Copy the Worker URL, e.g. `https://neet-ai-tutor.<your-subdomain>.workers.dev`.

## Connect the website

1. Open the V2 planner: https://arshadali05932-dotcom.github.io/neet-ai-planner/v2/
2. Open **AI Assistant**.
3. Enter the Worker URL and the same private `ACCESS_CODE`.
4. Save connection on this device. The Gemini API key is not entered on this page.
5. Try a short text question first, then test image, planner, and MCQ modes.

## Security notes

- Never commit `GEMINI_API_KEY` or `ACCESS_CODE` to GitHub.
- The browser stores only the Worker URL and the private access code in local storage on that device. This is a personal-use access gate, not a full user-account system.
- CORS origin checks are a browser restriction, not a substitute for the access code. Keep the access code private; rotate it in Worker Secrets if it is exposed.
- The Worker accepts only POST requests at `/api/tutor`, limits text and image sizes, sends only the planner summary in planner mode, and does not store prompts or uploaded images.
- Cloudflare Workers Free currently includes 100,000 requests/day. Gemini's own free-tier quotas are separate and may be much lower.
- If you see 429/quota errors, wait for the quota reset. Do not enable billing or switch to a paid model if maintaining ₹0 is essential.

## Current feature scope

- Text tutor: concept doubts and worked explanations.
- Image tutor: PNG/JPG/WebP question images up to 4 MB.
- Planner mode: sends only the current date, subject-level completion counts, overdue count, and revision count.
- MCQ mode: asks Gemini to generate or solve NEET-style single-correct MCQs.
- The 655-entry lecture catalogue contains titles and schedule metadata, not full lecture transcripts or source PDFs. Answers are not guaranteed to be verbatim from coaching material.
