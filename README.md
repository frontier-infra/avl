# AVL — Agent View Layer

Producer-side rendering for AI agents. Every page ships a parallel
agent-native view at `/<route>.agent`.

> i18n, but the target locale is "agent."

## Why

Web apps are designed for humans. When AI agents arrive, they scrape HTML
and reverse-engineer meaning from the DOM. AVL flips this: the application
itself ships the agent-native view, with explicit intent, action affordances,
and compressed state — alongside the human view.

See `specs/avl-agent-view-layer.md` for the full specification.

## Quick start

```bash
npm install
npm run dev
```

Then visit:

- http://localhost:3002/                       — index with demo links
- http://localhost:3002/dashboard              — human view
- http://localhost:3002/dashboard.agent        — AVL view (text/agent-view)
- http://localhost:3002/journey/J-101          — human view
- http://localhost:3002/journey/J-101.agent    — AVL view

Or via curl:

```bash
curl -s http://localhost:3002/dashboard.agent
curl -s -H "Accept: text/agent-view" http://localhost:3002/dashboard
curl -s http://localhost:3002/agent.txt
```

## Layout

```
avl/
├── app/
│   ├── page.tsx                       # index
│   ├── dashboard/
│   │   ├── page.tsx                   # human view
│   │   └── agent.ts                   # AVL manifest
│   ├── journey/[id]/
│   │   ├── page.tsx
│   │   └── agent.ts
│   ├── agent/[[...path]]/route.ts     # AVL runtime catch-all (also at /agent/<route>)
│   └── api/journey/[id]/advance/      # mock action endpoint
├── lib/avl/
│   ├── types.ts                       # AgentView, Action, etc.
│   ├── toon.ts                        # TOON encoder
│   ├── serialize.ts                   # AVL document serializer
│   ├── define.ts                      # defineAgentView() helper
│   ├── registry.ts                    # pattern → view registry
│   ├── auth.ts                        # mock session
│   └── index.ts                       # public surface
├── data/mock.ts                       # in-memory demo data
├── proxy.ts                           # discovery (.agent + Accept) — Next 16+
├── public/agent.txt                   # site manifest
├── specs/
│   └── avl-agent-view-layer.md        # the spec
└── ops/                               # operations hub
    ├── README.md
    ├── projects/ACTIVE.md
    ├── slices/REGISTRY.md
    ├── log/JOURNAL.md
    ├── rules/never-do.md
    └── runbooks/dev-workflow.md
```

## Authoring an agent view

Add `agent.ts` next to `page.tsx`:

```ts
// app/clients/agent.ts
import { defineAgentView } from "@/lib/avl";
import { getClients } from "@/data/clients";

export default defineAgentView({
  intent: {
    purpose: "Client list",
    audience: ["attorney", "paralegal"],
    capability: ["browse", "drilldown"],
  },
  state: async ({ user }) => ({
    clients: await getClients({ userId: user.id }),
  }),
  actions: [
    { id: "view_client", method: "GET", href: "/clients/{id}.agent" },
  ],
  nav: { parents: ["/dashboard"], drilldown: "/clients/{id}" },
});
```

Then register the route in `lib/avl/registry.ts`:

```ts
{ pattern: "/clients", view: clientsAgent }
```

## Discovery

Three mechanisms:

| Mechanism | How |
|---|---|
| URL suffix | `GET /<route>.agent` |
| Native runtime URL | `GET /agent/<route>` (same response, no proxy hop) |
| Content negotiation | `Accept: text/agent-view` on the human URL |
| Site manifest | `GET /agent.txt` |

## Conformance levels

| Level | Required sections |
|---|---|
| L0 | `@meta`, `@intent` |
| L1 | + `@state` |
| L2 | + `@actions` |
| L3 | + `@nav` + `@context` |

Ship L0 across every route in a day. Upgrade routes incrementally.

## Operations

This project follows the ops/ pattern. Read `ops/README.md` before
touching code. Three rules:

1. Check before you act.
2. Claim before you touch.
3. Log when you're done.

## License

Specification and reference implementation are proposed for open release.
TBD.
