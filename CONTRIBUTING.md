# Contributing to AVL

We welcome contributions from anyone interested in making the web agent-native.

## Getting Started

```bash
git clone https://github.com/frontier-infra/avl.git
cd avl
npm install
npm run build
```

To run the example app:

```bash
cd examples/next-app
npm install
npm run dev
# Visit http://localhost:3002
# Try: curl -s http://localhost:3002/dashboard.agent
```

## How to Contribute

### Report a Bug
Open an issue with a clear description, expected behavior, and steps to reproduce.

### Suggest a Feature
Open an issue describing the use case. We especially welcome:
- Framework adapters (SvelteKit, Remix, Nuxt, Rails, etc.)
- Real-world agent view examples
- TOON parser implementations in other languages
- MCP bridge ideas

### Submit a Pull Request
1. Fork the repo and create a branch from `main`.
2. Make your changes in `src/` (library code) or `examples/` (demo code).
3. Run `npm run build` to verify the package builds.
4. Run `npm run typecheck` to verify type correctness.
5. Write a clear PR description explaining what and why.

### Spec Changes
Changes to the format specification (`specs/avl-agent-view-layer.md`) require discussion in an issue first. The spec is versioned — breaking changes require a major version bump.

## Code Style

- TypeScript strict mode
- No runtime dependencies in the core package
- Keep the library small — AVL is a rendering layer, not a framework

## Conformance Levels

When adding examples or documentation, reference the conformance levels:
- **L0**: `@meta` + `@intent` (minimum viable agent view)
- **L1**: L0 + `@state`
- **L2**: L1 + `@actions`
- **L3**: L2 + `@nav` + `@context`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
