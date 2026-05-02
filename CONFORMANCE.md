# AVL Conformance

AVL conformance is intentionally layered so a site can become agent-readable in small, useful steps.

## Levels

| Level | Required Signals | Purpose |
|---|---|---|
| L0 | `@meta`, `@intent`, and page-level discovery | Agents can identify what a page is for. |
| L1 | L0 + `@state` | Agents can read structured page data without scraping. |
| L2 | L1 + `@actions` | Agents can understand available actions. |
| L3 | L2 + `@context` and `@nav` | Agents can reason over meaning and traverse related views. |

## Required Checks

### Document

- Response content type is `text/agent-view; version=1`.
- `@meta.v` is present.
- `@meta.route` is present.
- `@meta.generated` is present.
- `@intent.purpose` is present.
- `@intent.audience` is present.
- `@intent.capability` is present.

### Discovery

At least one discovery path is required for L0:

- `.agent` URL suffix.
- `Accept: text/agent-view` content negotiation.
- HTML `<link rel="alternate" type="text/agent-view">`.
- HTTP `Link` header.
- `/agent.txt` manifest.

Recommended discovery stack:

- `/agent.txt`
- `/.agent`
- Per-page `/{path}.agent`
- HTML head alternate link.
- Crawlable body link or badge.
- `/llms.txt` companion.

### Manifest

`/agent.txt` should include:

- `version`.
- `content-type`.
- producer/platform.
- discovery methods.
- route patterns.
- related companion resources where available.

### Security

- Public AVL documents must expose only public information.
- Authenticated AVL documents must inherit the same session and permissions as the human page.
- `@actions` must only list actions available to the represented viewer.
- External validation links must be user-initiated unless the plugin clearly discloses automatic calls.

## Validator Roadmap

The next validator should support:

```bash
avl validate https://example.com
avl validate --level L2 https://example.com/pricing
avl validate-file ./samples/page.agent
```

Check groups:

- `avl.document`
- `avl.discovery`
- `avl.manifest`
- `avl.llms`
- `avl.schema`
- `avl.actions`
- `avl.auth`
- `avl.provenance`

Initial grammar and document fixtures live under:

```text
specs/toon-grammar.md
specs/fixtures/valid/
specs/fixtures/invalid/
```

## CMS Adapter Conformance

CMS plugins should verify:

- `/agent.txt`.
- `/.agent`.
- `/{path}.agent`.
- `/llms.txt` and `/lm.txt` where supported.
- HTML discovery on public pages.
- Admin readiness checks.
- No automatic external calls without disclosure.

The WordPress plugin currently implements this pattern and should be treated as the reference CMS adapter.
