import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setAdminToken } from "../../api/client.js";

const TOKEN_KEY = "msd_admin_token";

export default function AdminSurveys() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [queryName, setQueryName] = useState("");
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
        const { data } = await client.get("/admin/surveys", {
          params: {
            page,
            limit: 25,
            phone: queryPhone || undefined,
            name: queryName || undefined,
          },
        });
        if (cancelled) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
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
  }, [page, queryPhone, queryName, navigate]);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAdminToken(null);
    navigate("/admin/login", { replace: true });
  }

  function applyFilters(e) {
    e.preventDefault();
    setQueryPhone(phoneInput.trim());
    setQueryName(nameInput.trim());
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Survey submissions</h1>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            Log out
          </button>
        </div>

        <form
          onSubmit={applyFilters}
          className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600">Phone</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Digits"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Contains"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Filter
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="mt-8 text-slate-600">Loading…</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Phone</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Completed</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Framework</th>
                  <th className="px-4 py-3 font-medium text-slate-700" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3">{row.respondentName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.phoneNormalized}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.completedAt ? new Date(row.completedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{row.frameworkVersion}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/surveys/${row.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 ? (
              <p className="p-6 text-center text-slate-500">No completed surveys yet.</p>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {page} — {total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page * 25 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
