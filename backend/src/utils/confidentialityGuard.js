/**
 * AI Confidentiality Guard
 * 
 * Uses Google Gemini API to scan weekly report text for potentially
 * confidential information before it enters the monitoring workflow.
 * 
 * Falls back gracefully if the AI service is unavailable.
 * API keys are NEVER exposed to the frontend.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

const SYSTEM_PROMPT = `You are a privacy-compliance assistant for an internship management platform.

Your job is to analyze student weekly report text and identify potentially confidential company information.

Flag content that may include:
- API keys, tokens, passwords, credentials
- Customer or personal data (names, emails, IDs)
- Financial or transaction data
- Internal URLs, endpoints, or system paths
- Source code snippets or proprietary algorithms
- Internal project or product names that seem confidential
- NDA references or "confidential" markers
- Proprietary business processes

Do NOT flag:
- General technology names (React, Python, MongoDB)
- Generic learning descriptions
- Skill names
- Public domain knowledge
- Vague descriptions without specific confidential details

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH",
  "flaggedCategories": ["string"],
  "flaggedItems": ["short excerpt or description"],
  "suggestion": "brief guidance for the student"
}`;

/**
 * Check report text for confidential content via Gemini API.
 * @param {string} text - The report text to analyze
 * @returns {object} - { riskLevel, flaggedCategories, flaggedItems, suggestion, checkedAt, skipped }
 */
async function checkConfidentiality(text) {
  const checkedAt = new Date();

  if (!GEMINI_API_KEY) {
    console.warn('[ConfidentialityGuard] GEMINI_API_KEY not set — skipping AI check.');
    return {
      riskLevel: null,
      flaggedCategories: [],
      flaggedItems: [],
      suggestion: null,
      checkedAt,
      skipped: true,
    };
  }

  if (!text || text.trim().length < 20) {
    return { riskLevel: 'SAFE', flaggedCategories: [], flaggedItems: [], suggestion: null, checkedAt, skipped: false };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nREPORT TEXT:\n${text.substring(0, 4000)}` }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ConfidentialityGuard] Gemini API error:', errText);
      return { riskLevel: null, flaggedCategories: [], flaggedItems: [], suggestion: null, checkedAt, skipped: true };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonText);

    return {
      riskLevel: result.riskLevel || 'SAFE',
      flaggedCategories: result.flaggedCategories || [],
      flaggedItems: result.flaggedItems || [],
      suggestion: result.suggestion || null,
      checkedAt,
      skipped: false,
    };
  } catch (err) {
    console.error('[ConfidentialityGuard] Error during AI check:', err.message);
    // Graceful failure — do NOT falsely claim the report passed
    return {
      riskLevel: null,
      flaggedCategories: [],
      flaggedItems: [],
      suggestion: null,
      checkedAt,
      skipped: true,
    };
  }
}

module.exports = { checkConfidentiality };
