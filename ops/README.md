# AVL Operations Hub

> Every agent session starts here. Read this file before touching code.

This is the operational source of truth for AVL development.

> **Note:** This ops/ scaffold is derived from Jason's "maintainer Blueprint"
> pattern as a placeholder. The canonical version lives in the maintainer
> Blueprint repo and should be reconciled here once accessible from this
> environment. See `projects/ACTIVE.md` § Pinned.

## How to Use This

1. New session? Read this file, then check `slices/REGISTRY.md` and
   `projects/ACTIVE.md`.
2. Starting work? Claim your slice in `REGISTRY.md` before creating branches.
3. Finishing work? Update `REGISTRY.md`, update `projects/ACTIVE.md`,
   write a log entry in `log/JOURNAL.md`.
4. Need a process? Check `runbooks/` before improvising.
5. Unsure about a rule? Check `rules/` — they override your instincts.

## Directory Layout

```
ops/
├── README.md
├── projects/
│   └── ACTIVE.md         # current sprint, pinned items, blockers
├── slices/
│   └── REGISTRY.md       # active and completed work claims
├── log/
│   └── JOURNAL.md        # append-only agent log
├── rules/
│   └── never-do.md       # hard rules
└── runbooks/
    └── dev-workflow.md   # develop, commit, push
```

## Issue Tracker

- **Linear**: project TBD (waiting on API key — see `projects/ACTIVE.md`)
- **GitHub**: repo TBD (waiting on repo creation — see `projects/ACTIVE.md`)

## The Three Rules

1. Check before you act.
2. Claim before you touch.
3. Log when you're done.
