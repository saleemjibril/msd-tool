import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client, { setAdminToken } from "../../api/client.js";
import ResultsDisplay from "../../components/ResultsDisplay.jsx";

const TOKEN_KEY = "msd_admin_token";

export default function AdminSurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setAdminToken(t);
  }, [navigate]);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await client.get(`/admin/surveys/${id}`);
        if (cancelled) return;
        setData(res.data);
      } catch (e) {
        if (!cancelled) {
          if (e.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            setAdminToken(null);
            navigate("/admin/login", { replace: true });
          } else {
            setError(e.response?.data?.error || "Failed to load");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return <div className="p-10 text-center text-slate-600">Loading…</div>;
  }

  if (error || !data) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">{error || "Not found"}</p>
        <Link to="/admin/surveys" className="mt-4 inline-block text-brand-700 underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/admin/surveys" className="text-sm text-brand-700 hover:underline">
          ← All submissions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{data.respondentName}</h1>
        <p className="mt-1 font-mono text-sm text-slate-600">{data.phoneNormalized}</p>
        <p className="mt-1 text-sm text-slate-600">
          Completed:{" "}
          {data.completedAt ? new Date(data.completedAt).toLocaleString() : "—"} ·{" "}
          {data.frameworkVersion}
        </p>

        <div className="mt-8">
          <ResultsDisplay result={data.result} />
        </div>
      </div>
    </div>
  );
}
