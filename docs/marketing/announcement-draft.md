# Announcement Draft: AVL v0.2 Release Candidate

Title options:

- AVL v0.2 RC: From Agent Views To CMS Adoption
- Making Websites Agent-Readable: AVL v0.2 RC
- AVL v0.2: WordPress, CMS Adapters, Agent Skills, And Conformance

## Short Version

AVL is a producer-owned Agent View Layer for the web. Every human page gets a parallel `text/agent-view` representation with intent, state, actions, context, and navigation so agents do not have to scrape meaning from pixels.

The v0.2 release candidate expands AVL beyond a TypeScript/Next.js package:

- WordPress plugin with page-builder add-ons.
- Ghost, Drupal, Joomla, Strapi, Directus, and Payload adapter MVPs.
- `llms.txt`/`lm.txt` readiness metadata.
- Codex, Claude Code, and Gemini agent skill packaging.
- Conformance, governance, adoption strategy, and vNext proposal docs.

## Why It Matters

AI agents are moving from reading the web to using the web. HTML is a human rendering target. AVL gives producers a way to publish the same page meaning directly to agents without handing control to scrapers.

## What To Try

```bash
curl -H "Accept: text/agent-view" https://ainode.dev/
curl https://ainode.dev/.agent
curl https://ainode.dev/agent.txt
```

## Call For Feedback

We are especially looking for feedback from:

- CMS maintainers.
- Framework maintainers.
- Technical SEO/AEO/GEO practitioners.
- Agent framework developers.
- AI crawler and answer-engine teams.
- Standards community members.

Key open questions:

- What should the formal TOON grammar accept or reject?
- Should `/.well-known/agent-view` become the preferred crawler probe?
- How should provenance and signatures work without making L0 adoption harder?
- Which framework adapter should come next?
