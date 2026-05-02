# AVL Governance

AVL is an open protocol and implementation project. Governance should keep the spec practical, producer-owned, and friendly to independent implementations.

## Principles

- Producer-owned truth is the center of AVL.
- Backward compatibility matters more than novelty.
- Simple adoption paths beat maximal expressiveness.
- Conformance must be testable.
- Security and privacy must be documented before new capabilities are promoted.
- AVL should complement `llms.txt`, schema.org, OpenAPI, MCP, robots.txt, and sitemaps rather than replace them.

## Proposal Process

1. Add a proposal under `specs/` or `proposals/`.
2. Include motivation, examples, compatibility notes, and security/privacy considerations.
3. Add validator fixtures or implementation notes when practical.
4. Discuss publicly in issues or pull requests.
5. Promote to the main spec only after maintainer approval.

## Spec Versioning

- `text/agent-view; version=1` is the current wire format.
- Experimental sections should be optional and ignored by parsers that do not understand them.
- Breaking changes require a new media type version.
- Non-breaking additions may be documented as optional sections.

## Standards Track Path

The realistic path is:

1. Build production adoption across multiple independent sites and CMSs.
2. Publish conformance tools and fixtures.
3. Form a public community group or standards discussion space.
4. Prepare an internet-draft or community report.
5. Seek participation from framework maintainers, CMS communities, AI labs, search/answer engines, and browser/tooling vendors.

## Implementation Registry

Reference implementations should be listed when they:

- Serve valid AVL documents.
- Document supported conformance level.
- Include tests or validation evidence.
- Are publicly inspectable.

Current implementation families:

- TypeScript package and Next.js adapter.
- Static site examples.
- WordPress plugin and builder add-ons.
- Ghost helper package.
- Drupal module MVP.
- Joomla system plugin MVP.
- Strapi plugin MVP.
- Directus endpoint extension MVP.
- Payload plugin MVP.
