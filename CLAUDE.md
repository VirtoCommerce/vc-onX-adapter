# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

VirtoCommerce adapter (`@virtocommerce/mcp-onx`) for the Commerce Operations Foundation (COF) MCP Server. Implements the `IFulfillmentAdapter` interface to connect VirtoCommerce Platform to AI assistants via the Model Context Protocol.

## Development Commands

```bash
npm run build              # tsc → dist/
npm run dev                # tsc --watch
npm test                   # Jest with --experimental-vm-modules
npm run test:integration   # Build + run test-integration.js
npm run lint               # ESLint
```

**Build order matters**: This adapter depends on `@virtocommerce/cof-mcp` (the MCP server). When developing locally against the monorepo, build the server first (`cd ../server && npm run build`).

Running a single test:
```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/path/to/test.ts
```

## Architecture

```
src/
├── adapter.ts             — VirtoCommerceFulfillmentAdapter (main class, implements IFulfillmentAdapter)
├── index.ts               — Default + named exports for adapter factory loading
├── types.ts               — AdapterOptions, STATUS_MAP, REVERSE_STATUS_MAP, ErrorCode
├── services/              — Domain services (order, customer, fulfillment, product, return)
│   └── base.service.ts    — Base class with shared ApiClient access
├── transformers/          — Bidirectional VirtoCommerce ↔ MCP data mapping
│   └── base.ts            — Base transformer
├── mappers/               — MCP filter objects → VC search criteria conversion
│   └── filter.mappers.ts  — Maps tool input filters to VC SearchCriteria
├── models/                — TypeScript interfaces matching VirtoCommerce API shapes
└── utils/
    ├── api-client.ts      — Axios wrapper with retry, timeout, auth (api_key header)
    └── type-guards.ts     — Runtime type narrowing helpers
```

### Key Patterns

- **Status mapping**: VirtoCommerce uses mixed-case strings (`New`, `Not payed`, `Partially sent`), MCP uses lowercase snake_case (`pending`, `not_payed`, `partially_shipped`). See `STATUS_MAP` / `REVERSE_STATUS_MAP` in `types.ts`.
- **Order updates**: Three-step GET→modify→PUT (full replacement), not PATCH.
- **Customer enrichment**: Orders and customers fetched separately, merged via `customerMap` during `getOrders`.
- **Default export required**: The adapter factory loads adapters via `import()` and expects `default` export of the adapter class. See `index.ts`.

## Code Style

- **Prettier**: `printWidth: 120`, `singleQuote: true`, `trailingComma: 'es5'`
- **Naming**: Files kebab-case, classes PascalCase, functions camelCase, constants UPPER_SNAKE_CASE
- All imports use `.js` extensions (ESM — `type: "module"`)
- `import`/`export` only, no `require`

## TypeScript Strictness

Stricter than the server: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noImplicitOverride` all enabled. Note: `noImplicitAny` is `false`.

## Test Setup

- **Framework**: Jest with `ts-jest/presets/default-esm` and `--experimental-vm-modules`
- **Coverage threshold**: 80% (branches, functions, lines, statements)
- **Module mapping**: `@/` → `src/`, strips `.js` extensions, maps `@virtocommerce/cof-mcp` to dist
- **Setup file**: `tests/setup.ts`

## Git Conventions

- **Branch prefixes**: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **PRs target**: `develop` branch
