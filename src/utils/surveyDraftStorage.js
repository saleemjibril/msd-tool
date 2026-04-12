const PREFIX = "msd_survey_draft_";
const VERSION = 1;

export function surveyDraftKey(surveyId) {
  return `${PREFIX}${surveyId}`;
}

function sanitizeAnswers(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const n = Number(v);
    if (n === 1 || n === 2 || n === 3) out[k] = n;
  }
  return out;
}

function sanitizeFoundation(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === true || v === false) out[k] = v;
  }
  return out;
}

/**
 * @param {string} surveyId
 * @param {{ phone: string, name?: string, step: number, answers: object, foundation: object }} payload
 */
export function saveSurveyDraft(surveyId, { phone, name = "", step, answers, foundation }) {
  if (!surveyId || !phone) return;
  try {
    const payload = {
      v: VERSION,
      surveyId,
      phone: phone.trim(),
      name: String(name || "").trim(),
      step: Number(step) || 0,
      answers: sanitizeAnswers(answers),
      foundation: sanitizeFoundation(foundation),
      savedAt: Date.now(),
    };
    localStorage.setItem(surveyDraftKey(surveyId), JSON.stringify(payload));
  } catch (e) {
    console.warn("Survey draft save failed", e);
  }
}

/**
 * @param {string} surveyId
 * @returns {{ surveyId: string, phone: string, name: string, step: number, answers: object, foundation: object, savedAt: number } | null}
 */
export function loadSurveyDraft(surveyId) {
  if (!surveyId) return null;
  try {
    const raw = localStorage.getItem(surveyDraftKey(surveyId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== VERSION || data.surveyId !== surveyId) return null;
    return {
      ...data,
      answers: sanitizeAnswers(data.answers),
      foundation: sanitizeFoundation(data.foundation),
      step: Number(data.step) || 0,
    };
  } catch {
    return null;
  }
}

export function clearSurveyDraft(surveyId) {
  if (!surveyId) return;
  try {
    localStorage.removeItem(surveyDraftKey(surveyId));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Most recently saved in-progress draft for this phone (any survey id).
 * @param {string} phone
 */
export function findLatestDraftForPhone(phone) {
  const normalized = String(phone || "").trim();
  if (!normalized) return null;
  let best = null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      let d;
      try {
        d = JSON.parse(raw);
      } catch {
        continue;
      }
      if (d.v !== VERSION || String(d.phone || "").trim() !== normalized) continue;
      const savedAt = Number(d.savedAt) || 0;
      if (!best || savedAt > (best.savedAt || 0)) {
        best = {
          surveyId: d.surveyId,
          phone: d.phone,
          name: d.name || "",
          step: Number(d.step) || 0,
          answers: sanitizeAnswers(d.answers),
          foundation: sanitizeFoundation(d.foundation),
          savedAt,
        };
      }
    }
  } catch (_) {
    return null;
  }
  return best;
}
