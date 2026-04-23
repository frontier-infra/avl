# examples/marketing-site

A tiny static site for a fictional local electrician ("Lonestar Electric"), showing how AVL ships a parallel agent view for marketing pages.

Demonstrates:

- `defineStaticAgentView` authoring for **3 different page types** a marketing site typically has (home, about, service area)
- `generateStaticAgentViews` emitting one `.agent` file per URL
- `@state` as **facts** — city, services, zip codes, response time, credentials — not user data
- `@actions` with **real-world schemes**: `tel:`, `mailto:`, and external booking / maps URLs — no authenticated POST endpoints required
- Nested URL → nested output path (`/services/austin` → `services/austin.agent`)

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  index.agent
  about-us.agent
  services/
    austin.agent
```

Checked-in expected output is in [`samples/`](samples/) — you can read them without running the build.

Serve them locally with any static file server:

```bash
npx serve dist
# then
curl -s http://localhost:3000/index.agent
curl -s http://localhost:3000/about-us.agent
curl -s http://localhost:3000/services/austin.agent
```

## What's here

| File | Purpose |
|---|---|
| `src/index.agent.ts` | Home — tagline, services, service area, starting price |
| `src/about.agent.ts` | About — founding date, owner, credentials, certifications |
| `src/services/austin.agent.ts` | Service area — Austin, zip codes, response time |
| `src/build.ts` | Build entrypoint — calls `generateStaticAgentViews` |
| `samples/` | Expected `.agent` output, checked in for reference |

## Why this example exists

Static marketing sites are the largest category of the public web — and the most obvious "every page means something to an agent" case. A site like this one has:

- **Facts it knows at build time** (service area, prices, credentials)
- **Actions it wants agents to take** (call dispatch, request a quote, get directions)
- **No authentication** — there's no session, no RBAC, no per-user state

AVL handles this natively. No server runtime required; a plain build step emits `.agent` files alongside your HTML.
