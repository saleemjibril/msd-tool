import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

/** Survey levels 1–3 only (centre = 0 is implicit). */
const RADIUS_TICKS = [1, 2, 3];

/**
 * Angle (degrees) for each radar spoke, same order as chart data.
 * Matches Recharts RadarChart defaults: first row at top (90°), then clockwise.
 */
function radarSpokeAnglesDeg(spokeCount) {
  if (spokeCount < 1) return [];
  return Array.from({ length: spokeCount }, (_, i) => 90 - (360 * i) / spokeCount);
}

/** Primary radius scale (id 0) for grid + Radar; per-spoke axes only draw 1–3 labels. */
function RadarRadiusScaleLayers({ spokeCount }) {
  const angles = useMemo(() => radarSpokeAnglesDeg(spokeCount), [spokeCount]);
  return (
    <>
      <PolarRadiusAxis
        radiusAxisId={0}
        domain={[0, 3]}
        ticks={RADIUS_TICKS}
        tick={false}
        axisLine={false}
      />
      {angles.map((angle, i) => (
        <PolarRadiusAxis
          key={`lvl-axis-${i}`}
          radiusAxisId={`lvl-${i}`}
          angle={angle}
          type="number"
          domain={[0, 3]}
          ticks={RADIUS_TICKS}
          allowDataOverflow
          axisLine={false}
          orientation="middle"
          tick={PolarLevelTick}
        />
      ))}
    </>
  );
}

/** Labels sit on each ring, nudged toward centre so they stay inside the radar (no radial axis line). */
function PolarLevelTick(props) {
  const { x, y, cx, cy, payload } = props;
  const raw = payload?.value ?? payload;
  const label = Number.isFinite(Number(raw)) ? String(Number(raw)) : String(raw);
  if (cx == null || cy == null) {
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#64748b"
        fontSize={10}
        className="recharts-polar-radius-axis-tick-value"
      >
        {label}
      </text>
    );
  }
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const inset = 8;
  const t = (len - inset) / len;
  const nx = cx + dx * t;
  const ny = cy + dy * t;
  return (
    <text
      x={nx}
      y={ny}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#64748b"
      fontSize={10}
      className="recharts-polar-radius-axis-tick-value"
    >
      {label}
    </text>
  );
}

function RoleRadar({ title, capacities }) {
  const data = capacities.map((c) => ({
    subject: c.axisLabel || c.title,
    level: c.level,
  }));
  const avg =
    capacities.length > 0
      ? (capacities.reduce((s, c) => s + c.level, 0) / capacities.length).toFixed(1)
      : "—";
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-center text-sm font-semibold text-slate-800">{title}</h3>
        <p className="py-8 text-center text-sm text-slate-500">No data for this role.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-center text-sm font-semibold text-slate-800">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <RadarRadiusScaleLayers spokeCount={data.length} />
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
      <p className="mt-1 text-center text-xs text-slate-500">
        Average: <span className="font-medium text-slate-800">{avg}</span> / 3
      </p>
    </div>
  );
}

export default function ResultsDisplay({ result, showFoundation = true, variant = "respondent" }) {
  if (!result) return null;

  const isAggregate = variant === "aggregate";

  const overallData = (result.overallRadar || []).map((r) => ({
    subject: r.subject,
    level: r.average,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {isAggregate ? "Overall — cohort role averages" : "Overall — role averages"}
        </h2>
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-72 w-full">
            {overallData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={overallData} outerRadius="75%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <RadarRadiusScaleLayers spokeCount={overallData.length} />
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
            ) : (
              <p className="flex h-72 items-center justify-center text-sm text-slate-500">
                Not enough data for a chart.
              </p>
            )}
          </div>
          <p className="mt-1 text-center text-sm text-slate-600">
            Overall average:{" "}
            <span className="font-semibold text-slate-900">{result.overallAverage}</span> / 3
            {/* <span className="block text-xs font-normal text-slate-500">
              {isAggregate
                ? "Each spoke is a role; distance from centre is the mean level (1–3) across completed submissions."
                : "Each spoke is a role; distance from centre is the average level (1–3)."}
            </span> */}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {isAggregate ? "By role — cohort capacity averages" : "By role"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(result.roleSummaries || []).map((r) => (
            <RoleRadar key={r.roleId} title={r.roleTitle} capacities={r.capacities} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-red-800">Where to improve</h2>
        <p className="mb-3 text-sm text-slate-600">
          {isAggregate
            ? "Capacities where the cohort mean is below 3 — strong practice (level 3) is the aim."
            : "Capacities below level 3 — next level describes what to aim for."}
        </p>
        {(result.weaknesses || []).length === 0 ? (
          <p className="rounded-lg bg-green-50 p-4 text-green-900">
            {isAggregate
              ? "No gaps flagged: every capacity is at cohort mean 3 or above."
              : "No gaps flagged: every capacity is already at level 3."}
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
                  {isAggregate ? (
                    <>
                      Cohort average: <span className="font-medium">{w.level}</span> → Aim for{" "}
                      <span className="font-medium">{w.nextLevel}</span>
                    </>
                  ) : (
                    <>
                      Your level: <span className="font-medium">{w.level}</span> → Target level{" "}
                      <span className="font-medium">{w.nextLevel}</span>
                    </>
                  )}
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
