import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

function RoleRadar({ title, capacities }) {
  const data = capacities.map((c) => ({
    subject: c.axisLabel || c.title,
    level: c.level,
  }));
  const avg =
    capacities.length > 0
      ? (capacities.reduce((s, c) => s + c.level, 0) / capacities.length).toFixed(1)
      : "—";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-center text-sm font-semibold text-slate-800">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} />
            <Radar
              name="Level"
              dataKey="level"
              stroke="#15803d"
              fill="#22c55e"
              fillOpacity={0.35}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-slate-500">
        Average: <span className="font-medium text-slate-800">{avg}</span> / 3
      </p>
    </div>
  );
}

export default function ResultsDisplay({ result, showFoundation = true }) {
  if (!result) return null;

  const overallData = (result.overallRadar || []).map((r) => ({
    subject: r.subject,
    level: r.average,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Overall — role averages</h2>
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={overallData} outerRadius="75%">
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} />
                <Radar
                  name="Avg level"
                  dataKey="level"
                  stroke="#1d4ed8"
                  fill="#3b82f6"
                  fillOpacity={0.35}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-600">
            Overall average:{" "}
            <span className="font-semibold text-slate-900">{result.overallAverage}</span> / 3
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">By role</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(result.roleSummaries || []).map((r) => (
            <RoleRadar key={r.roleId} title={r.roleTitle} capacities={r.capacities} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-red-800">Where to improve</h2>
        <p className="mb-3 text-sm text-slate-600">
          Capacities below level 3 — next level describes what to aim for.
        </p>
        {(result.weaknesses || []).length === 0 ? (
          <p className="rounded-lg bg-green-50 p-4 text-green-900">
            No gaps flagged: every capacity is already at level 3.
          </p>
        ) : (
          <ul className="space-y-3">
            {result.weaknesses.map((w) => (
              <li
                key={w.capacityId}
                className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm"
              >
                <div className="font-semibold text-slate-900">
                  {w.roleTitle} — {w.title}
                </div>
                <div className="mt-1 text-slate-600">
                  Your level: <span className="font-medium">{w.level}</span> → Target level{" "}
                  <span className="font-medium">{w.nextLevel}</span>
                </div>
                {w.improvementHint ? (
                  <p className="mt-2 border-l-2 border-amber-400 pl-3 text-slate-800">
                    {w.improvementHint}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showFoundation && result.foundation ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Foundation check-in</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Attitudes</h3>
              <ul className="space-y-1 text-sm">
                {result.foundation.attitudes.map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between gap-2 border-b border-slate-100 py-1"
                  >
                    <span>{a.title}</span>
                    <span className={a.demonstrated ? "text-green-700" : "text-slate-400"}>
                      {a.demonstrated ? "Yes" : "No"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Capacities</h3>
              <ul className="space-y-1 text-sm">
                {result.foundation.capacities.map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between gap-2 border-b border-slate-100 py-1"
                  >
                    <span>{a.title}</span>
                    <span className={a.demonstrated ? "text-green-700" : "text-slate-400"}>
                      {a.demonstrated ? "Yes" : "No"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
