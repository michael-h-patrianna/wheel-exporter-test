# Codebase Review

## Strengths
- Multi-layer wheel rendering is decomposed into orchestrator and per-layer renderers with clear contracts (`src/lib/components/WheelViewer.tsx:1-260`, `src/lib/components/renderers/SegmentRenderer.tsx:1-380`), enabling feature toggles, dynamic scaling, and spin orchestration without bleeding UI concerns into services.
- Deterministic wheel behavior is encapsulated in a reducer-driven state machine with thorough timer and edge-case coverage (`src/lib/hooks/useWheelStateMachine.ts:1-280`, `src/lib/hooks/__tests__/useWheelStateMachine.test.ts:1-220`), demonstrating senior-level rigor around async state and regression protection.
- Tooling and automated validation are extensive: service and utility suites exercise ZIP parsing and style builders (`src/lib/services/__tests__/wheelLoader.test.ts:1-220`, `src/tests/utils/styleBuilders.test.ts:1-220`), while Playwright flows validate end-to-end UX, uploads, toggles, and animation gating (`scripts/playwright/wheel-app.e2e.test.ts:1-360`).

## Weaknesses
- `SegmentRenderer` remains a 700+ line module combining SVG geometry, layout strategies, and memoization glue (`src/lib/components/renderers/SegmentRenderer.tsx:1-720`); the breadth increases cognitive load and makes introducing new layouts or fixing rendering bugs risky.
- Documentation drift undermines onboarding: both `README.md:21-120` and `docs/architecture.md:25-120` still describe Create React App workflows and `npm start`, while the actual toolchain is Vite (`package.json:7-58`), leading to incorrect setup steps.
- Dependency hygiene needs attention; multiple packages are duplicated across dependencies and devDependencies (`package.json:10-60` lists `@testing-library/react`, `@testing-library/user-event`, `@types/node`, etc. twice), signaling release-process friction and potential version skew.

## Flaws & Blatant Bugs
- Running the documented quick-start command `npm start` fails because the script is not defined in `package.json` (`README.md:40-74` vs `package.json:19-34`), blocking new contributors until they discover `npm run dev` manually.
- Purchase-segment rendering hard-codes the label to `"200%"`, ignoring actual offer metadata (`src/lib/utils/prizeSegmentMapper.ts:129-150`), so themed purchase offers display incorrect copy in the wheel.

## Seniority Assessment
- Overall Estimate: senior
- Rationale vs Google/Meta Junior Expectations: Exceeds baseline by delivering typed domain models, a reusable component API (`src/lib/index.ts:1-120`), and comprehensive automated tests that exercise async behavior and UI flows—work a strong junior would rarely deliver solo.
- Rationale vs Google/Meta Senior/Staff Expectations: Falls short of staff-level polish; architectural docs are outdated, high-complexity modules lack incremental boundaries, and dependency/process drift remains unresolved, signaling gaps in cross-team communication and long-term operability expected of staff engineers.

## Growth Opportunities Toward Staff-Level Excellence
- Coding Style & Practices: Invest in splitting `SegmentRenderer` into composable layout modules and shared geometry utilities with targeted tests to reduce reviewer workload and future-proof edits.
- Architectural/Structural Improvements: Establish formal layering (e.g., renderers vs. data mappers) with package boundaries or directory ownership docs so future themes/layouts can evolve without touching monolith files.
- Solution Approach & Strategy: Align documentation and scripts with the actual build system and capture deltas in ADRs to sustain trust and support production hand-offs.
- Process & Collaboration: Introduce dependency review checklists or automated linting for `package.json` to prevent duplicate entries and keep the toolchain reproducible for collaborators.

## Future Recommendations
1. Replace the hard-coded purchase copy in `mapPrizesToSegments` with data-driven strings (e.g., use `prize.purchaseOffer.title`) and add regression coverage to `src/tests`.
2. Refactor `SegmentRenderer` into smaller renderer/layout modules, complemented by storybook-style fixtures or visual regression tests focused on new layout strategies.
3. Refresh onboarding docs (`README.md`, `docs/architecture.md`) to reflect the Vite workflow and consolidated scripts, and enforce ongoing accuracy via release checklists or automated docs validation.
