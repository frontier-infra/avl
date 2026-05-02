# AVL vNext Proposals

This document captures forward-looking protocol proposals for improving AVL adoption, validation, and eventual standards-track readiness. These ideas are not part of `text/agent-view; version=1` until promoted through the project governance process.

## Goals

- Keep AVL simple enough for broad adoption.
- Make conformance testable.
- Improve trust and provenance for agent consumers.
- Interoperate cleanly with `llms.txt`, schema.org, OpenAPI, MCP, robots.txt, and sitemaps.
- Preserve the core idea: producer-owned page-level agent views.

## Proposal 1: Companion Links

Add an optional `@companions` section for related machine-readable resources.

```text
@companions
  llms_txt: /llms.txt
  schema_org: /schema.jsonld
  openapi: /openapi.json
  mcp: /.well-known/mcp
  sitemap: /sitemap.xml
  robots: /robots.txt
  validation: https://aeocheck.ai/?url=https%3A%2F%2Fexample.com%2F
```

Rationale: Agents should not infer the relationship between AVL and other producer-owned signals. A standard companion section makes the graph explicit.

Compatibility: Existing `@nav` links remain valid. Producers may use either while this is experimental.

## Proposal 2: Provenance And Trust

Add an optional `@provenance` section for freshness, authorship, and later signature support.

```text
@provenance
  canonical: https://example.com/pricing
  generated: 2026-05-02T16:00:00Z
  source: wordpress
  plugin: avl-agent-view-layer 0.1.0
  content_hash: sha256:...
  signed_by: example.com
  signature: ed25519:...
```

Phase 1 should standardize `canonical`, `source`, `plugin`, and `content_hash`. Signature fields should remain experimental until a practical signing profile exists.

## Proposal 3: Well-Known Discovery

Add optional well-known discovery endpoints:

```text
/.well-known/agent-view
/.well-known/avl
```

These should either return the same content as `/agent.txt` or redirect to `/agent.txt`.

Rationale: `/agent.txt` is readable and memorable. Well-known endpoints are easier for crawlers and standards bodies to recognize.

## Proposal 4: Media Descriptors

Add an optional `@media` section for multimodal agents.

```text
@media
  images[1]{url,alt,purpose}:
    /og-image.png,"Dashboard showing AEO score","report preview"
  videos[1]{url,caption,purpose}:
    /demo.mp4,"Product walkthrough","onboarding"
```

Rationale: Agents increasingly reason over images and video. Producers can describe important media without forcing pixel inspection.

## Proposal 5: Formal TOON Grammar

Document TOON with a formal grammar and publish parser fixtures.

Minimum deliverables:

- Grammar for scalar, list, object, tabular object arrays, quoting, escaping, nulls, booleans, and numbers.
- Golden encode/decode fixtures.
- CLI validator.
- Cross-language parser notes.

Rationale: TOON is one of AVL's biggest practical advantages. It needs a stable, testable grammar before broader adoption.

## Proposal 6: Section-Level Cache Hints

Allow optional section TTLs for dynamic pages.

```text
@meta
  ttl: 5m
  state_ttl: 30s
  actions_ttl: 5m
```

Rationale: Many pages combine stable intent with fast-changing state. Section hints let agents cache conservatively.

## Proposal 7: Conformance Badges

Define machine-verifiable conformance output:

```text
conformance:
  level: L2
  checked_at: 2026-05-02T16:00:00Z
  checks:
    - id: avl.meta
      pass: true
    - id: discovery.html-link
      pass: true
```

Rationale: A public badge ecosystem should be backed by objective validator output, not marketing claims.

## Promotion Criteria

A proposal can move into the main spec when:

- It has at least two independent implementations or one implementation plus validator support.
- It has test fixtures.
- It does not break existing `version=1` documents.
- Security and privacy implications are documented.
- Maintainers approve it through the governance process.
