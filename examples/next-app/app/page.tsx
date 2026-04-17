import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>AVL — Agent View Layer</h1>
      <p className="muted">
        Producer-side rendering for AI agents. Every page ships a parallel
        agent-native view at <code>/path.agent</code>.
      </p>

      <div className="card">
        <h2>Demo routes</h2>
        <ul>
          <li>
            <Link href="/dashboard">/dashboard</Link>
            <Link className="agent-link" href="/dashboard.agent">.agent</Link>
          </li>
          <li>
            <Link href="/journey/J-101">/journey/J-101</Link>
            <Link className="agent-link" href="/journey/J-101.agent">.agent</Link>
          </li>
          <li>
            <Link href="/journey/J-102">/journey/J-102</Link>
            <Link className="agent-link" href="/journey/J-102.agent">.agent</Link>
          </li>
          <li>
            <Link href="/journey/J-103">/journey/J-103</Link>
            <Link className="agent-link" href="/journey/J-103.agent">.agent</Link>
          </li>
        </ul>
      </div>

      <div className="card">
        <h2>Discovery</h2>
        <ul>
          <li>URL suffix: <code>GET /dashboard.agent</code></li>
          <li>Content negotiation: <code>GET /dashboard</code> with <code>Accept: text/agent-view</code></li>
          <li>Site manifest: <Link href="/agent.txt">/agent.txt</Link></li>
        </ul>
      </div>

      <div className="card">
        <h2>Try with curl</h2>
        <pre style={{ margin: 0, color: "var(--muted)", fontSize: "13px" }}>
{`curl -s http://localhost:3002/dashboard.agent
curl -s -H "Accept: text/agent-view" http://localhost:3002/dashboard
curl -s http://localhost:3002/agent.txt`}
        </pre>
      </div>
    </>
  );
}
