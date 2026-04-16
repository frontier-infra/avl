# Dev Workflow

## Local dev

```bash
npm install
npm run dev          # http://localhost:3002
```

## Verifying an AVL view

```bash
# URL suffix
curl -s http://localhost:3002/dashboard.agent

# Content negotiation
curl -s -H "Accept: text/agent-view" http://localhost:3002/dashboard

# Site manifest
curl -s http://localhost:3002/agent.txt
```

The response Content-Type should be `text/agent-view; version=1`.

## Adding a new AVL view

1. Create the page: `app/<route>/page.tsx`.
2. Create the manifest: `app/<route>/agent.ts` exporting
   `defineAgentView({...})`.
3. Register in `lib/avl/registry.ts`:
   ```ts
   { pattern: "/<route>", view: <yourAgent> }
   ```
4. Hit `/<route>.agent` in a browser to verify.
5. Add a row to `ops/slices/REGISTRY.md` if this is a new slice.
6. Update the spec's "Examples" section if the new view exercises a
   format feature not yet illustrated.

## Commit conventions

- One slice per commit (or per logical step within a slice).
- Reference the slice name in the commit body.
- Log the commit in `ops/log/JOURNAL.md` for any non-trivial change.

## Before pushing

- `npm run build` passes
- `npm run lint` passes (when configured)
- `ops/projects/ACTIVE.md` reflects the current state
- `ops/slices/REGISTRY.md` either still has the active row or has
  moved it to Completed
- `ops/log/JOURNAL.md` has an entry for the work
