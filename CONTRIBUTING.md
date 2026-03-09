# Contributing

Thank you for your interest in contributing to the VirtoCommerce onX Adapter.

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR-USERNAME/vc-onX-adapter.git
cd vc-onX-adapter
git remote add upstream https://github.com/VirtoCommerce/vc-onX-adapter.git
```

### 2. Install Dependencies

Requires Node.js 20+.

```bash
npm install
```

> **Note**: The adapter depends on `@virtocommerce/cof-mcp`. For local development against the MCP server source, use `npm link` or a `file:` reference.

### 3. Build and Test

```bash
npm run build    # tsc → dist/
npm test         # Jest with --experimental-vm-modules
npm run lint     # ESLint
```

## Contributing Code

### Branch Naming

- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation
- `refactor/` — code improvements
- `test/` — test changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add order sync API
fix: correct status mapping for partial shipments
docs: clarify configuration options
```

### Code Standards

- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`)
- All imports use `.js` extensions (ESM)
- Prettier: `printWidth: 120`, `singleQuote: true`, `trailingComma: 'es5'`
- Files use kebab-case, classes PascalCase, functions camelCase

### Pull Requests

- Open PRs against the `develop` branch
- Link related issues (e.g., `Fixes #123`)
- Ensure `npm run build`, `npm run lint`, and `npm test` pass
- Keep PRs focused and small

## Licensing

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
