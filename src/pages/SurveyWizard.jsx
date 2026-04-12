import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client.js";
import {
  clearSurveyDraft,
  loadSurveyDraft,
  saveSurveyDraft,
} from "../utils/surveyDraftStorage.js";

const PHONE_KEY = "msd_survey_phone";
const NAME_KEY = "msd_survey_name";

function useDebouncedPatch(surveyId, phone) {
  const t = useRef(null);
  return useCallback(
    (body) => {
      if (!surveyId || !phone) return;
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(async () => {
        try {
          await client.patch(`/survey/${surveyId}`, { phone, ...body });
        } catch (e) {
          console.error(e);
        }
      }, 450);
    },
    [surveyId, phone]
  );
}

export default function SurveyWizard() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const phone = sessionStorage.getItem(PHONE_KEY) || "";
  const respondentName = sessionStorage.getItem(NAME_KEY) || "";

  const [framework, setFramework] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [answers, setAnswers] = useState({});
  const [foundation, setFoundation] = useState({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  /** `"cap:${id}"` | `"found:${id}"` for short highlight pulse */
  const [highlightKey, setHighlightKey] = useState(null);
  const clearHighlightLater = useRef(null);
  const draftHydratedRef = useRef(false);
  const draftSaveTimerRef = useRef(null);

  const debouncedPatch = useDebouncedPatch(surveyId, phone);

  useEffect(() => {
    draftHydratedRef.current = false;
  }, [surveyId]);

  useEffect(() => {
    if (!phone) {
      navigate("/survey", { replace: true });
    }
  }, [phone, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await client.get("/framework");
        if (!cancelled) setFramework(data);
      } catch (e) {
        if (!cancelled) setLoadError("Could not load survey content.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clearHighlightLater.current) {
        window.clearTimeout(clearHighlightLater.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!framework || !surveyId || !phone || draftHydratedRef.current) return;
    draftHydratedRef.current = true;
    const draft = loadSurveyDraft(surveyId);
    if (!draft || draft.phone?.trim() !== phone.trim()) return;
    const roles = framework.roles || [];
    const totalSteps = roles.length + 2;
    const maxStep = Math.max(0, totalSteps - 1);
    const s = Math.max(0, Math.min(draft.step, maxStep));
    setStep(s);
    setAnswers(draft.answers || {});
    setFoundation(draft.foundation || {});
  }, [framework, surveyId, phone]);

  useEffect(() => {
    if (!framework || !surveyId || !phone) return;
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      draftSaveTimerRef.current = null;
      saveSurveyDraft(surveyId, {
        phone,
        name: respondentName,
        step,
        answers,
        foundation,
      });
    }, 400);
    return () => {
      if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    };
  }, [framework, surveyId, phone, respondentName, step, answers, foundation]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [step]);

  const roles = framework?.roles || [];
  const foundationAttitudes = framework?.foundation?.attitudes || [];
  const foundationCapacities = framework?.foundation?.capacities || [];
  const totalSteps = roles.length + 2;

  const isFoundationStep = step === roles.length;
  const isReviewStep = step === roles.length + 1;
  const role = roles[step];

  const setLevel = (capacityId, level) => {
    setAnswers((prev) => {
      const next = { ...prev, [capacityId]: level };
      debouncedPatch({ answers: { [capacityId]: level }, currentStageIndex: step });
      return next;
    });
  };

  const setFound = (id, value) => {
    setFoundation((prev) => {
      const next = { ...prev, [id]: value };
      debouncedPatch({ foundation: { [id]: value }, currentStageIndex: step });
      return next;
    });
  };

  const pulseHighlight = (key) => {
    if (clearHighlightLater.current) {
      window.clearTimeout(clearHighlightLater.current);
    }
    setHighlightKey(key);
    clearHighlightLater.current = window.setTimeout(() => {
      setHighlightKey(null);
      clearHighlightLater.current = null;
    }, 2200);
  };

  const goNext = () => {
    if (isReviewStep) return;

    if (!isFoundationStep && !isReviewStep && role) {
      const missingCap = role.capacities.find(
        (cap) => answers[cap.id] !== 1 && answers[cap.id] !== 2 && answers[cap.id] !== 3
      );
      if (missingCap) {
        const el = document.getElementById(`survey-q-${missingCap.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        pulseHighlight(`cap:${missingCap.id}`);
        const firstRadio = el?.querySelector('input[type="radio"]');
        firstRadio?.focus({ preventScroll: true });
        return;
      }
    }

    if (isFoundationStep) {
      const order = [...foundationAttitudes, ...foundationCapacities];
      const missingItem = order.find((item) => typeof foundation[item.id] !== "boolean");
      if (missingItem) {
        const el = document.getElementById(`survey-foundation-${missingItem.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        pulseHighlight(`found:${missingItem.id}`);
        const btn = el?.querySelector("button");
        btn?.focus({ preventScroll: true });
        return;
      }
    }

    debouncedPatch({ currentStageIndex: Math.min(step + 1, totalSteps - 1) });
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    debouncedPatch({ currentStageIndex: Math.max(step - 1, 0) });
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleComplete = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const { data } = await client.post(`/survey/${surveyId}/complete`, {
        phone,
        answers,
        foundation,
      });
      clearSurveyDraft(surveyId);
      navigate(`/survey/results/${surveyId}`, {
        state: {
          result: data.result,
          completedAt: data.completedAt,
          respondentName,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Submit failed";
      const d = err.response?.data;
      const extra = d?.missingCaps?.length
        ? ` Missing ${d.missingCaps.length} capacity ratings.`
        : "";
      const extra2 = d?.missingFound?.length
        ? ` Missing ${d.missingFound.length} foundation answers.`
        : "";
      setSubmitError(msg + extra + extra2);
    } finally {
      setSubmitting(false);
    }
  };

  if (!phone) return null;

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-600">
        {loadError}{" "}
        <Link className="underline" to="/survey">
          Back
        </Link>
      </div>
    );
  }

  if (!framework) {
    return <div className="p-8 text-center text-slate-600">Loading survey</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/survey" className="text-sm text-brand-700 hover:underline">
            Exit
          </Link>
          <span className="text-sm text-slate-500">
            Step {step + 1} of {totalSteps}
          </span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {respondentName ? (
          <p className="text-sm text-slate-600">
            Hi <strong>{respondentName}</strong> — answer honestly for your current practice.
          </p>
        ) : null}

        {!isFoundationStep && !isReviewStep && role ? (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">{role.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{role.summary}</p>
            <div className="mt-8 space-y-10">
              {role.capacities.map((cap) => (
                <div
                  id={`survey-q-${cap.id}`}
                  key={cap.id}
                  className={`scroll-mt-24 border-t border-slate-100 pt-6 transition-shadow duration-300 first:border-t-0 first:pt-0 ${
                    highlightKey === `cap:${cap.id}`
                      ? "rounded-lg ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
                      : ""
                  }`}
                >
                  <h2 className="text-lg font-semibold text-slate-800">{cap.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{cap.definition}</p>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Which statement fits you best today?
                  </p>
                  <div className="mt-3 space-y-3">
                    {[1, 2, 3].map((lvl) => (
                      <label
                        key={lvl}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                          answers[cap.id] === lvl
                            ? "border-brand-600 bg-brand-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1"
                          name={cap.id}
                          checked={answers[cap.id] === lvl}
                          onChange={() => setLevel(cap.id, lvl)}
                        />
                        <span>
                          <span className="font-medium text-slate-800">Level {lvl}</span>
                          <span className="mt-1 block leading-relaxed text-slate-600">
                            {cap.levels[String(lvl)]}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {isFoundationStep ? (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              Foundation attitudes and capacities
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              For each item, indicate whether you consistently demonstrate it in your work.
            </p>
            <div className="mt-8 space-y-8">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Attitudes
                </h2>
                <ul className="mt-4 space-y-4">
                  {foundationAttitudes.map((item) => (
                    <li
                      id={`survey-foundation-${item.id}`}
                      key={item.id}
                      className={`scroll-mt-24 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-shadow duration-300 ${
                        highlightKey === `found:${item.id}`
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFound(item.id, true)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            foundation[item.id] === true
                              ? "bg-green-700 text-white"
                              : "bg-white text-slate-700 ring-1 ring-slate-300"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFound(item.id, false)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            foundation[item.id] === false
                              ? "bg-slate-700 text-white"
                              : "bg-white text-slate-700 ring-1 ring-slate-300"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Cross-cutting capacities
                </h2>
                <ul className="mt-4 space-y-4">
                  {foundationCapacities.map((item) => (
                    <li
                      id={`survey-foundation-${item.id}`}
                      key={item.id}
                      className={`scroll-mt-24 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-shadow duration-300 ${
                        highlightKey === `found:${item.id}`
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFound(item.id, true)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            foundation[item.id] === true
                              ? "bg-green-700 text-white"
                              : "bg-white text-slate-700 ring-1 ring-slate-300"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFound(item.id, false)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            foundation[item.id] === false
                              ? "bg-slate-700 text-white"
                              : "bg-white text-slate-700 ring-1 ring-slate-300"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {isReviewStep ? (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Review and submit</h1>
            <p className="mt-2 text-sm text-slate-600">
              You have answered every section. Use <strong>Back</strong> if you want to change
              anything. When you are ready, submit to see your radar charts and development tips.
            </p>
            {submitError ? <p className="mt-4 text-sm text-red-600">{submitError}</p> : null}
            <button
              type="button"
              disabled={submitting}
              onClick={handleComplete}
              className="mt-6 w-full rounded-lg bg-brand-700 py-3 font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting" : "Submit and see results"}
            </button>
          </section>
        ) : null}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={goBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-40"
          >
            Back
          </button>
          {!isReviewStep ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
