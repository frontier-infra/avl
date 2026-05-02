# AVL Agent View Layer for Drupal

This folder contains the Drupal module MVP for AVL.

## What It Adds

- `GET /agent.txt` for site-level AVL discovery.
- `GET /.agent` for the front page companion.
- `GET /{path}.agent` for node-backed public content resolved through Drupal path aliases.
- `GET /llms.txt` and `GET /lm.txt` for AEO/GEO/LM readiness metadata.

## Install

Copy `avl_agent_view_layer/` into `web/modules/custom/`, then enable it:

```bash
drush en avl_agent_view_layer
drush cr
```

## Notes

This module is intentionally dependency-light and uses Drupal routing/controllers. A production deployment should add configurable bundle support, cache metadata tuned to the site, and deeper field extraction for custom content models.
