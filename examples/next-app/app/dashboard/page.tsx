import Link from "next/link";
import { getAlerts, getJourneys } from "@/data/mock";

export const metadata = {
  alternates: {
    types: {
      "text/agent-view": "/dashboard.agent",
    },
  },
};

export default function DashboardPage() {
  const journeys = getJourneys({ userId: "u-42" });
  const alerts = getAlerts({ userId: "u-42" });

  return (
    <>
      <h1>
        Dashboard
        <Link
          className="agent-link"
          href="/dashboard.agent"
          rel="alternate agent-view"
          type="text/agent-view"
          data-avl-companion="page"
        >
          .agent
        </Link>
      </h1>
      <p className="muted">Active matters for Sarah Kim, Smith Law.</p>

      {alerts.length > 0 && (
        <div className="card">
          <h2>Alerts</h2>
          <ul>
            {alerts.map(a => (
              <li key={a.journey}>
                <strong>{a.kind}</strong> — {a.note} ({a.journey})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Active matters ({journeys.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Stage</th>
              <th>Next step</th>
              <th>Deadline</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map(j => (
              <tr key={j.id}>
                <td>
                  <Link href={`/journey/${j.id}`}>{j.id}</Link>
                </td>
                <td>{j.client}</td>
                <td>{j.stage}</td>
                <td>{j.next_step}</td>
                <td>{j.deadline}</td>
                <td><span className={`badge ${j.risk}`}>{j.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
