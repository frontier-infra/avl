# AVL Badge Program

The AVL badge should mean more than "we like AI." It should point to a real, crawlable agent view and a measurable conformance level.

## Badge Levels

| Badge | Meaning |
|---|---|
| AVL L0 Ready | Page declares `@meta` and `@intent` and has discovery. |
| AVL L1 Ready | L0 plus structured `@state`. |
| AVL L2 Ready | L1 plus actionable `@actions`. |
| AVL L3 Ready | L2 plus `@context` and `@nav`. |

## Badge Requirements

- Badge links to the current page's `.agent` companion.
- Badge includes `rel="alternate agent-view"`.
- Badge includes `type="text/agent-view; version=1"`.
- Badge includes `data-avl-endpoint`.
- Conformance level must be backed by validator output.

## Example

```html
<a
  href="/pricing.agent"
  rel="alternate agent-view"
  type="text/agent-view; version=1"
  data-avl-endpoint="/pricing.agent"
  data-avl-level="L2"
>
  AVL L2 Ready
</a>
```

## Directory Criteria

A public adopter directory should list sites only when:

- The site owner opts in.
- Validator output is recent.
- The agent view is publicly fetchable.
- The listed conformance level matches observed output.

## AEOCheck.ai

AEOCheck.ai can provide a user-friendly validation/reporting surface. The open-source AVL repo should still own the conformance definitions and fixtures.
