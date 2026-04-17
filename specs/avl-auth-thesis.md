# AVL Auth Thesis — Same Session, Different Rendering

> The AI agent is not a new principal. It is a delegate of an existing human session.

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Authors | Argent OS |
| Date | 2026-04-16 |
| Companion to | `avl-agent-view-layer.md` §5, §10 |

---

## 1. The Problem

AI agents need to access authenticated web pages on behalf of human users.
Every current approach to this breaks something.

**Scraping with stolen cookies.** Agents extract session cookies from
browsers and replay them. This works until the cookie rotates, the IP
doesn't match, or the site detects the anomaly. The application never
consented to this access pattern. It's duct tape.

**Separate API keys per bot.** The application issues a dedicated token
for the AI agent — a first-class identity with its own permissions.
Now you have a second principal to manage: its own RBAC, its own audit
trail, its own blast radius. The bot can drift from what the human can
see. Two permission surfaces to keep in sync is one too many.

**Screen scraping from rendered DOM.** The agent reads the HTML and
infers what the user can do. This recovers data but not intent, not
affordances, not permission boundaries. The DOM says "here's a button."
It doesn't say "this user is allowed to press it." Every inference is
a guess.

All three approaches share the same flaw: they treat the AI agent as a
separate entity that must independently discover what the human already
knows. AVL's auth model starts from the opposite premise.

---

## 2. The Position

**The agent inherits the user's session. Not its own.**

When a user loads `/dashboard`, the server authenticates them via cookie,
resolves their role and permissions, and renders a human view. When an
agent loads `/dashboard.agent`, the server does the same authentication,
resolves the same role and permissions, and renders an agent view.

Same session. Same RBAC evaluation. Different rendering target.

This is the i18n analogy carried to its conclusion. A French-locale
render and an English-locale render don't have different auth models.
They have different *output formats* for the same authenticated
principal. The agent locale works the same way.

The consequence: an AI agent can only see what the human can see. It
cannot access routes the user cannot access. It cannot invoke actions
the user's role does not permit. **The agent view is a projection of
the human session, not an elevation of it.**

---

## 3. The Delegation Spectrum

If the agent *is* the user's session, how does the session reach the
agent? Three delivery mechanisms, one identity model.

### 3.1 Same-Browser (Cookie Forwarding)

The agent operates inside the user's browser context — a browser
extension, an in-page assistant, a copilot sidebar. The session cookie
is already present. The agent's `fetch("/dashboard.agent")` carries
the cookie automatically.

**When this applies:** Browser-embedded agents. ChatGPT canvas mode.
Claude artifacts that call back to the host app.

**What AVL needs to do:** Nothing. The cookie is already there.

### 3.2 Local AI (Scoped Bearer Token)

The agent runs outside the browser but on the user's behalf — a
desktop app, a CLI tool, a local model. The user generates a token
from within the application (settings page, CLI command, OAuth device
flow). The agent presents it:

```
GET /dashboard.agent
Authorization: Bearer avl_tk_<token>
```

The server resolves this token to the same `AgentSession` as the
cookie would have produced. Same user, same role, same permissions.

**When this applies:** Local AI assistants. MCP clients. Agents
running on the user's own machine (e.g., DGX Spark running a local
model).

**What AVL needs to do:** The host app's `resolveSession()` checks
cookie OR bearer token and returns the same session object either way.
AVL doesn't define the token format — the host app already has one.

### 3.3 Third-Party AI (OAuth Delegation)

The agent is a third-party service — an AI product that acts on many
users' behalf. Standard OAuth2 delegation: the user authorizes the
agent, the agent receives a scoped token, the server resolves it.

```
GET /dashboard.agent
Authorization: Bearer <oauth-access-token>
```

**When this applies:** Third-party AI services. Multi-tenant agent
platforms. Any agent the user doesn't directly control.

**What AVL needs to do:** Still nothing new. OAuth is the host app's
concern. The token resolves to an `AgentSession` with whatever scopes
the user granted.

### 3.4 What These Have in Common

All three deliver the same thing: **an authenticated identity that
maps to an existing human account.** The delivery mechanism varies.
The security invariant does not.

---

## 4. The Security Invariant — Surface Equivalence

> The AVL view never exposes more than the human view would for the
> same authenticated session.

This is the test (already defined in the AVL spec, §10.5):

1. Every `@state` field is visible to this user in the human UI.
2. Every `@actions` entry corresponds to a UI affordance the user can
   invoke.

If either fails, the AVL view is leaking.

Surface Equivalence holds **regardless of which delegation mechanism
delivered the session.** Cookie, bearer token, OAuth token — the
session resolves to the same principal, the same RBAC rules apply,
the same filtering produces the same `@actions` and `@state`.

This is why AVL can be "zero new auth surface." There is no new
permission model to design, audit, or get wrong. The existing model
is the model.

### 4.1 What Surface Equivalence Prevents

- **Privilege escalation.** The agent cannot see admin routes the user
  cannot access. The server returns 403 or 404 — same as it would for
  the human view.
- **Data leakage.** `@meta.redacted` declares fields the user cannot
  see. Those fields are absent from `@state`, not masked — they are
  never serialized.
- **Action injection.** `@actions` is server-rendered per role. An
  agent for a read-only user has no POST actions. There is no
  client-side filtering to bypass.
- **Scope creep via separate identity.** Because the agent IS the
  user's session, there is no second principal whose permissions can
  drift from the human's.

---

## 5. Why AVL Stays Out of the Token Business

AVL is a rendering layer. It serializes what the authenticated user
can see into a format AI agents can consume. It is not an auth
provider, an identity service, or a token issuer.

The host application already solved authentication. It has cookies,
JWTs, OAuth, API keys, SSO — whatever it uses for the human view.
AVL's contract is deliberately minimal:

```typescript
resolveSession: (req: Request) => Promise<AgentSession | null>
```

One function. Takes a request, returns a session. The implementation
is the host app's concern. AVL calls it and renders accordingly.

This is the same boundary Next.js draws with `getServerSession()`, or
Rails with `current_user`. The framework doesn't own auth. It
provides a hook for the app to plug in its own. AVL does the same.

### 5.1 What the Package Exports

```typescript
// avl/next
export function createAgentViewHandler(options: {
  resolveSession: (req: Request) => Promise<AgentSession | null>;
  // ... other options
}): (req: Request) => Promise<Response>;
```

The developer provides `resolveSession`. AVL handles everything after
identity is established: route matching, view rendering,
serialization, caching headers.

### 5.2 The Mock Is the Example

The current `getSession()` in `lib/avl/auth.ts` returns a hardcoded
session. In the published package, this becomes a documented example:

```typescript
// Example: resolveSession for NextAuth
resolveSession: async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name,
  };
}
```

---

## 6. Format Implications

### 6.1 `@meta.auth`

The `auth` field in `@meta` is informational, not cryptographic:

```
@meta
  auth: session(attorney:42)
```

It tells the consuming agent "this document was rendered for this
principal." It does not prove it. It aids debugging and audit logging.

### 6.2 `agent.txt` Session Declaration

The site manifest at `/agent.txt` declares how sessions are
delivered:

```
session:
  mechanisms: [cookie, bearer, oauth]
  cookie: session_token
  bearer_prefix: Bearer
  scopes: [read, write, admin]
```

This tells the agent how to authenticate before it hits its first
`.agent` URL. Discovery + auth in one manifest.

### 6.3 Unauthenticated Routes

Public pages produce public AVL documents. No session needed. The
`@meta.auth` field is absent or `auth: anonymous`. `@actions` may
still be present (e.g., `search` on a public catalog).

---

## 7. Summary

| Principle | Implication |
|---|---|
| Agent = delegate, not principal | No second identity to manage |
| Same session, different render | Existing RBAC applies unchanged |
| Surface Equivalence invariant | AVL view ≤ human view, always |
| Host owns auth, AVL owns render | `resolveSession()` is the boundary |
| Three mechanisms, one model | Cookie / bearer / OAuth deliver the same session |
| No token format defined | Host app already has one |

The AI doesn't need its own key to the building. It walks in with
the human's badge — and sees exactly the same rooms.
