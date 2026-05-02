# AVL for Ghost

This package is the Ghost-facing AVL adapter work area.

Ghost is not a WordPress-style plugin platform for arbitrary public route handling, so this package is structured as a helper service and document renderer that can be connected to Ghost through Content API, theme, proxy, or deployment-specific routing.

## What It Includes

- TOON serialization for AVL documents.
- Ghost post/page data mapping into the six AVL sections.
- A small HTTP server for `.agent` and `agent.txt` style responses.
- Tests for serialization, document generation, and server behavior.

## Intended Integration Shapes

Choose the lightest integration that fits the Ghost deployment:

1. Theme integration: add HTML discovery links and badge markup in the active Ghost theme.
2. Reverse proxy route: route `/*.agent` and `/agent.txt` to the helper service.
3. Static generation: generate `.agent` files from Ghost Content API during deploy.
4. Admin/API workflow: use Ghost Admin API only when write access is truly needed.

Do not commit Ghost API keys or local `.env` files. Document required environment variables instead.

## Development

```bash
cd plugins/Ghost
npm install
npm test
```

## Release Checklist

- Document the selected integration shape.
- Verify public `.agent` responses return `text/agent-view; version=1`.
- Verify `agent.txt` advertises available routes.
- Verify theme discovery links point at page-specific `.agent` companions.
- Verify API credentials are loaded from environment only.
