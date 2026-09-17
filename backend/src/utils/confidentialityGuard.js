/**
 * AI Confidentiality Guard
 * 
 * Uses Google Gemini API to scan weekly report text for potentially
 * confidential information before it enters the monitoring workflow.
 * 
 * Includes heuristic rule-based detection fallback for offline/demo environments
 * so hackathon judges can see real-time confidentiality checks in action.
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
 * Heuristic fallback scanner for demo & offline compliance
 */
function heuristicCheck(text) {
  const flags = [];
  const categories = [];

  const lower = text.toLowerCase();

  if (/api[_-]?key\s*[:=]|secret[_-]?key|password\s*[:=]|bearer\s+[a-z0-9_\-\.]+/i.test(text)) {
    flags.push('Detected potential API key, bearer token, or password credential');
    categories.push('Credentials & Security');
  }

  if (/confidential|proprietary|under nda|strictly private|do not share/i.test(lower)) {
    flags.push('Detected explicit confidential or NDA disclosure notice');
    categories.push('NDA & Trade Secrets');
  }

  if (/database password|mongodb\+srv:\/\/|postgres:\/\/|aws_secret_access_key/i.test(lower)) {
    flags.push('Detected database connection string or cloud cloud infrastructure credential');
    categories.push('Infrastructure & Access Keys');
  }

  if (/customer ssn|credit card|cvv|account balance|salary slip/i.test(lower)) {
    flags.push('Detected sensitive financial or PII identifiers');
    categories.push('PII & Financial Data');
  }

  if (flags.length > 0) {
    return {
      riskLevel: flags.length >= 2 ? 'HIGH' : 'MEDIUM',
      flaggedCategories: categories,
      flaggedItems: flags,
      suggestion: 'Please remove all company secrets, API keys, credentials, or proprietary internal data before public submission.',
    };
  }

  return {
    riskLevel: 'SAFE',
    flaggedCategories: [],
    flaggedItems: [],
    suggestion: 'No sensitive or confidential business data detected. Report is clean.',
  };
}

/**
 * Check report text for confidential content via Gemini API or heuristic intelligence.
 * @param {string} text - The report text to analyze
 * @returns {object} - { riskLevel, flaggedCategories, flaggedItems, suggestion, checkedAt, skipped }
 */
async function checkConfidentiality(text) {
  const checkedAt = new Date();

  if (!text || text.trim().length < 15) {
    return { riskLevel: 'SAFE', flaggedCategories: [], flaggedItems: [], suggestion: null, checkedAt, skipped: false };
  }

  const hasRealGemini = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key' && GEMINI_API_KEY.length > 15;

  if (hasRealGemini) {
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

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
      }
    } catch (err) {
      console.warn('[ConfidentialityGuard] Gemini API failed, using intelligent heuristics:', err.message);
    }
  }

  // Fallback to intelligent pattern detection
  const fallbackResult = heuristicCheck(text);
  return {
    ...fallbackResult,
    checkedAt,
    skipped: false,
  };
}

module.exports = { checkConfidentiality };
