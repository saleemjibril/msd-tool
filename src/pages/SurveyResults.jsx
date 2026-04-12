import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import client from "../api/client.js";
import ResultsDisplay from "../components/ResultsDisplay.jsx";

const PHONE_KEY = "msd_survey_phone";

export default function SurveyResults() {
  const { surveyId } = useParams();
  const location = useLocation();
  const phone = sessionStorage.getItem(PHONE_KEY) || "";

  const [result, setResult] = useState(location.state?.result || null);
  const [meta, setMeta] = useState({
    completedAt: location.state?.completedAt,
    respondentName: location.state?.respondentName,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (location.state?.result) {
      setLoading(false);
      return;
    }
    if (!phone || !surveyId) {
      setError("Missing phone or survey. Return to the survey start page.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await client.get(`/survey/completed/${surveyId}`, {
          params: { phone },
        });
        if (cancelled) return;
        setResult(data.result);
        setMeta({
          completedAt: data.completedAt,
          respondentName: data.respondentName,
        });
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || "Could not load results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surveyId, phone, location.state?.result]);

  if (loading) {
    return <div className="p-10 text-center text-slate-600">Loading results</div>;
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <p className="text-red-600">{error || "No results."}</p>
        <Link className="mt-4 inline-block text-brand-700 underline" to="/survey">
          Back to survey start
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your results</h1>
        {meta.respondentName ? (
          <p className="mt-1 text-slate-600">
            {meta.respondentName}
            {meta.completedAt ? ` - ${new Date(meta.completedAt).toLocaleString()}` : null}
          </p>
        ) : null}

        <div className="mt-8">
          <ResultsDisplay result={result} />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/survey"
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Take another survey
          </Link>
        </div>
      </div>
    </div>
  );
}
