# AVL Agent View Layer for Strapi

This folder contains the Strapi 5 plugin MVP for AVL.

## What It Adds

- `GET /avl/agent.txt`
- `GET /avl/llms.txt`
- `GET /avl/.agent`
- `GET /avl/:contentType/:documentId.agent`

## Install

Copy or link `strapi-plugin-avl` into a Strapi project and enable it in the Strapi plugin configuration.

## Notes

The MVP uses Strapi services to read public collection documents through `strapi.documents`. Production deployments should map public front-end routes to content types and add collection-level allowlists.
