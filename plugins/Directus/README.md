# AVL Agent View Layer for Directus

This folder contains the Directus custom endpoint extension MVP for AVL.

## What It Adds

- `GET /avl/agent.txt`
- `GET /avl/llms.txt`
- `GET /avl/lm.txt`
- `GET /avl/.agent`
- `GET /avl/:collection/:id.agent`

## Install

Build or copy `directus-extension-avl` into the Directus `extensions` directory. Directus endpoint extensions are loaded from extension folders or packages.

## Notes

The MVP uses Directus item services and schema context. Production deployments should add collection allowlists and route mapping to front-end URLs.
