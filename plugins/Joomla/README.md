# AVL Agent View Layer for Joomla

This folder contains the Joomla system plugin MVP for AVL.

## What It Adds

- `GET /agent.txt`
- `GET /llms.txt` and `GET /lm.txt`
- `GET /.agent`
- `GET /{path}.agent` generic companions for routed public pages

## Install

Zip `plg_system_avl/`, install it through Joomla Extensions, then enable **System - AVL Agent View Layer**.

## Notes

The MVP emits site and route-level companion documents from Joomla application/menu context. Future versions should add richer article/category resolution through Joomla content services.
