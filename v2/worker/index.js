/**
 * NEET AI Planner V2 — Cloudflare Worker
 * Required Worker secrets: GEMINI_API_KEY, ACCESS_CODE
 * Required plain variable: ALLOWED_ORIGIN (exact GitHub Pages origin)
 * Optional plain variable: GEMINI_MODEL (default gemini-3.8-flash)
 *
 * Never put secrets in GitHub or the browser bundle.
 */
const MAX_BODY = 6 * 1024 * 1024;
const MAX_TEXT = 12000;
const MAX_OUTPUT_TOKENS = 1800;

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGIN || "").trim();
  if (!allowed || origin !== allowed) return {};
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-App-Access",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers }
  });
}
function cleanContext(ctx) {
  if (!ctx || typeof ctx !== "object") return "";
  const allowed = ["date", "totalLectures", "completed", "inProgress", "notStarted", "overdue", "revisionsDue", "subjects"];
  const out = {};
  for (const k of allowed) if (ctx[k] !== undefined) out[k] = ctx[k];
  return JSON.stringify(out).slice(0, 5000);
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin, env);
    if (request.method === "OPTIONS") {
      if (!headers["Access-Control-Allow-Origin"]) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, headers);
    if (!headers["Access-Control-Allow-Origin"]) return json({ error: "Origin not allowed." }, 403);
    if (!env.GEMINI_API_KEY || !env.ACCESS_CODE || !env.ALLOWED_ORIGIN) {
      return json({ error: "AI Tutor backend is not configured yet." }, 503, headers);
    }
    if (request.headers.get("X-App-Access") !== env.ACCESS_CODE) {
      return json({ error: "Access code incorrect. Check AI Tutor settings." }, 401, headers);
    }
    const len = Number(request.headers.get("Content-Length") || 0);
    if (len > MAX_BODY) return json({ error: "Request too large. Use an image under 4 MB." }, 413, headers);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request format." }, 400, headers); }
    if (JSON.stringify(body).length > MAX_BODY) return json({ error: "Request too large." }, 413, headers);
    const mode = ["text", "image", "planner", "mcq"].includes(body.mode) ? body.mode : "text";
    const question = String(body.question || "").trim().slice(0, MAX_TEXT);
    if (!question && mode !== "image") return json({ error: "Please enter a question." }, 400, headers);
    const parts = [];
    const context = cleanContext(body.plannerContext);
    const instructions = [
      "You are the NEET UG 2027 study tutor inside a personal study planner.",
      "Explain accurately in clear, student-friendly Hindi/Hinglish unless the student asks for English.",
      "For Physics and Chemistry, show equations, units, assumptions and steps. For Biology, use precise NCERT-level terminology.",
      "Do not invent NCERT page numbers, PYQ years, citations, coaching-note contents or official syllabus claims.",
      "If uncertain or the question is ambiguous, say so and ask a focused clarification.",
      "Distinguish established facts from assumptions. Never claim to have read source notes that were not provided.",
      "For MCQ mode, create or solve NEET-style single-correct MCQs, explain why the correct option is correct and why distractors are wrong.",
      "For planner mode, use only the supplied planner snapshot; do not fabricate tasks or dates. Keep the user's study plan realistic and protect revision, tests and sleep."
    ].join("\n");
    parts.push({ text: instructions + "\n\nMode: " + mode + "\nPlanner snapshot (may be empty): " + context + "\n\nStudent request:\n" + question });
    if (mode === "image") {
      const image = body.image || {};
      const mime = String(image.mimeType || "");
      const data = String(image.data || "");
      if (!/^image\/(png|jpeg|webp)$/.test(mime) || !data || data.length > 5_500_000) {
        return json({ error: "Upload a PNG, JPG or WebP image smaller than 4 MB." }, 400, headers);
      }
      parts.push({ inline_data: { mime_type: mime, data } });
    }
    const model = /^[a-zA-Z0-9.-]+$/.test(env.GEMINI_MODEL || "") ? env.GEMINI_MODEL : "gemini-3.8-flash";
    let upstream;
    try {
      upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.35, maxOutputTokens: MAX_OUTPUT_TOKENS }
        })
      });
    } catch {
      return json({ error: "AI service is temporarily unreachable. Please try again later." }, 502, headers);
    }
    if (upstream.status === 429) return json({ error: "Free AI quota/rate limit is exhausted for now. Tutor has stopped; no paid fallback is enabled. Try after the quota resets." }, 429, headers);
    if (upstream.status === 403 || upstream.status === 400) {
      const detail = await upstream.text();
      return json({ error: "Gemini rejected this request. Check that the key, free-tier project and model are valid.", detail: detail.slice(0, 500) }, upstream.status, headers);
    }
    if (!upstream.ok) return json({ error: "AI provider error (" + upstream.status + "). No paid fallback is enabled." }, 502, headers);
    const data = await upstream.json();
    const answer = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n").trim();
    if (!answer) return json({ error: "The AI returned no text. Please try a shorter question." }, 502, headers);
    return json({ answer, model, usage: data.usageMetadata || null }, 200, headers);
  }
};
