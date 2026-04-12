import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import ResultsDisplay from "../components/ResultsDisplay.jsx";
import { findLatestDraftForPhone } from "../utils/surveyDraftStorage.js";

const PHONE_KEY = "msd_survey_phone";
const NAME_KEY = "msd_survey_name";

export default function SurveyStart() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previous, setPrevious] = useState(null);
  /** True only after a successful Continue (lookup) for the current name/phone. */
  const [lookupDone, setLookupDone] = useState(false);

  const draftForPhone = useMemo(
    () => findLatestDraftForPhone(phone.trim()),
    [phone]
  );

  function resumeLocalDraft() {
    const d = findLatestDraftForPhone(phone.trim());
    if (!d?.surveyId) return;
    sessionStorage.setItem(PHONE_KEY, d.phone.trim());
    sessionStorage.setItem(NAME_KEY, (d.name || name).trim());
    navigate(`/survey/${d.surveyId}`);
  }

  function resetLookupState() {
    setLookupDone(false);
    setPrevious(null);
    setError("");
  }

  async function handleLookup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPrevious(null);
    setLookupDone(false);
    try {
      const { data } = await client.post("/survey/lookup", { phone });
      setLookupDone(true);
      if (data.hasPrevious) {
        setPrevious(data.lastCompleted);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  async function startNewSurvey() {
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/survey", { name: name.trim(), phone });
      sessionStorage.setItem(NAME_KEY, name.trim());
      sessionStorage.setItem(PHONE_KEY, phone.trim());
      navigate(`/survey/${data.surveyId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not start survey");
    } finally {
      setLoading(false);
    }
  }

  function viewPreviousFull() {
    if (!previous) return;
    sessionStorage.setItem(PHONE_KEY, phone.trim());
    navigate(`/survey/results/${previous.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your details</h1>
        <p className="mt-2 text-slate-600">
          Enter your name and phone. If you completed the survey before, we will show your last
          results before you start again.
        </p>

        <form onSubmit={handleLookup} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                resetLookupState();
              }}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                resetLookupState();
              }}
              required
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
          {draftForPhone && phone.trim() ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 p-4">
              <p className="text-sm font-medium text-amber-950">Continue on this device</p>
              <p className="mt-1 text-sm text-amber-900/90">
                A saved survey for this phone was found in your browser
                {draftForPhone.savedAt
                  ? ` (last updated ${new Date(draftForPhone.savedAt).toLocaleString()})`
                  : ""}
                .
              </p>
              <button
                type="button"
                onClick={resumeLocalDraft}
                className="mt-3 w-full rounded-lg bg-amber-700 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Resume where I left off
              </button>
            </div>
          ) : null}
        </form>

        {previous ? (
          <div className="mt-8 space-y-4 rounded-xl border border-brand-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-900">Previous survey</h2>
            <p className="text-sm text-slate-600">
              Last completed{" "}
              {previous.completedAt
                ? new Date(previous.completedAt).toLocaleString()
                : "—"}{" "}
              as <strong>{previous.respondentName}</strong>. Overall average:{" "}
              <strong>{previous.result?.overallAverage}</strong> / 3 —{" "}
              <strong>{previous.result?.gapCount}</strong> capacity gaps below level 3.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={viewPreviousFull}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                View full previous results
              </button>
              <button
                type="button"
                onClick={startNewSurvey}
                disabled={loading || !name.trim()}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Start new survey
              </button>
            </div>
            <details className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Preview charts (previous run)
              </summary>
              <div className="mt-4">
                <ResultsDisplay result={previous.result} />
              </div>
            </details>
          </div>
        ) : null}

        {lookupDone && !previous && name.trim() && phone.trim() ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={startNewSurvey}
              disabled={loading}
              className="w-full rounded-lg bg-brand-700 py-3 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "Starting…" : "Start survey (first time)"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              No previous submission found for this phone. You can start a new survey.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
