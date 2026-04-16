# Never Do

## AVL surface

- Never expose state in `@state` that the human UI hides for this user.
  The agent view is a mirror, not a back door.
- Never enumerate `@actions` the user lacks the role to invoke.
  Server-side filter, always.
- Never invent fields that don't exist in the underlying data. The
  AVL view is a translation, not a fabrication.
- Never let an action description drift from the API it claims to call.
  If the contract changes, both must change in the same commit.

## Format

- Never ship an AVL document without `@meta` and `@intent`.
- Never claim a conformance level you don't meet.
- Never bump the format major version without an RFC and a deprecation
  window for v(N-1).

## Ops

- Never start work without claiming a slice in `slices/REGISTRY.md`.
- Never finish work without writing a journal entry.
- Never push without verifying the build is green.
- Never merge to `main` without the spec and runtime in sync (a spec
  change without a runtime change, or vice versa, is a smell).

## Coordination

- Never assume Jason has approved a feature based on a single chat message.
  Approval lives in Linear or a commit you can point to.
- Never destroy local work to "make a problem go away." If state is
  unfamiliar, investigate before deleting.
