import Link from "next/link";
import { notFound } from "next/navigation";
import { ACTIVITY, getJourney } from "@/data/mock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    alternates: {
      types: {
        "text/agent-view": `/journey/${id}.agent`,
      },
    },
  };
}

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journey = getJourney(id);
  if (!journey) notFound();

  const activity = ACTIVITY[id] ?? [];

  return (
    <>
      <h1>
        {journey.client}
        <Link
          className="agent-link"
          href={`/journey/${journey.id}.agent`}
          rel="alternate agent-view"
          type="text/agent-view"
          data-avl-companion="page"
        >
          .agent
        </Link>
      </h1>
      <p className="muted">
        {journey.id} · {journey.stage} · attorney {journey.attorney}
      </p>

      <div className="card">
        <h2>State</h2>
        <table>
          <tbody>
            <tr><th>Stage</th><td>{journey.stage}</td></tr>
            <tr><th>Next step</th><td>{journey.next_step}</td></tr>
            <tr><th>Deadline</th><td>{journey.deadline}</td></tr>
            <tr><th>Risk</th><td><span className={`badge ${journey.risk}`}>{journey.risk}</span></td></tr>
            <tr><th>Opened</th><td>{journey.opened}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Recent activity ({activity.length})</h2>
        {activity.length === 0 ? (
          <p className="muted">No activity yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>When</th><th>Actor</th><th>Event</th></tr>
            </thead>
            <tbody>
              {activity.map((a, i) => (
                <tr key={i}>
                  <td>{a.at}</td>
                  <td>{a.actor}</td>
                  <td>{a.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="muted">
        <Link href="/dashboard">← Dashboard</Link>
      </p>
    </>
  );
}
