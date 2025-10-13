# Copilot Instructions for Plinko

=== CRITICAL INSTRUCTION BLOCK (CIB-001)===

## MANDATORY TOOLS

### For Complex Tasks (research, analysis, debugging)

```
USE: mcp__mcp_docker__sequentialthinking
WHEN: Multi-step problems, research, complex reasoning
WHY: Prevents cognitive overload, ensures systematic approach
```

### For Task Management

```
USE: todo_write
WHEN: Any task with 3+ steps
WHY: Tracks progress, maintains focus
```

=== END CIB-001===

## Workflow & commands

- Run the app with `npm run dev` (dev tools enabled) or `npm run build` for production;
- Always execute tests through `npm test` (wrapper sets deterministic env and kills stray workers).
- End-to-end suites run through `npm run test:e2e` (or `...:headed`); the wrapper shares the same deterministic env variables as unit tests.
- If Vitest processes wedge, call `node scripts/cleanup-vitest.mjs` before re-running to avoid the historical memory leak.
- Lint with `npm run lint`; type-check with `npm run typecheck` when touching shared types.

## Reference docs

- Architecture overview: `docs/architecture.md`
