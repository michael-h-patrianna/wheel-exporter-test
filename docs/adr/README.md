# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) documenting significant architectural and design decisions made in the wheel-exporter project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand why certain decisions were made
- Onboard new team members more effectively
- Avoid revisiting already-resolved discussions
- Track the evolution of the architecture over time

## ADR Format

We follow the [MADR (Markdown Architecture Decision Record)](https://adr.github.io/madr/) format. See `template.md` for the standard template.

## Current ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-state-machine-for-wheel-spin.md) | Use State Machine Pattern for Wheel Spin Logic | Accepted | 2025-10-12 |
| [002](002-memoization-strategy-segment-renderer.md) | Use React.memo and useMemo for SegmentRenderer Performance | Accepted | 2025-10-12 |
| [003](003-cross-platform-visual-constraints.md) | Restrict Visual Effects for React Native Compatibility | Accepted | 2025-10-12 |
| [004](004-strategy-pattern-segment-layouts.md) | Use Strategy Pattern for Segment Layout Types | Accepted | 2025-10-12 |

## ADR Summaries

### ADR-001: State Machine Pattern for Wheel Spin Logic

**Decision:** Use useReducer-based state machine with explicit states (IDLE, SPINNING, COMPLETE) and events.

**Why:** Provides deterministic, testable state transitions with clear logging and debugging capabilities. Integrates cleanly with backend prize system for predetermined winning segments.

**Key Files:**
- `src/lib/hooks/useWheelStateMachine.ts`
- `src/lib/hooks/__tests__/useWheelStateMachine.test.ts`

### ADR-002: Memoization Strategy in SegmentRenderer

**Decision:** Use strategic React.memo and useMemo throughout SegmentRenderer to prevent unnecessary re-renders during animations.

**Why:** Maintains 60 FPS during 8-second spin animation by preventing segment re-renders when only rotation changes. With 12 segments and 100+ SVG elements, memoization is critical for performance.

**Key Files:**
- `src/lib/components/renderers/SegmentRenderer.tsx` (lines 52-668)
- Custom comparator at lines 647-665
- Direct DOM manipulation for rotation at lines 779-786

### ADR-003: Cross-Platform Visual Constraints

**Decision:** Restrict visual effects to cross-platform compatible features only (no blur, no radial gradients, no shadows except SVG).

**Why:** Enables future React Native portability with minimal migration cost. Constraining the design space now avoids expensive rewrites later.

**Key Files:**
- `CLAUDE.md` (lines 80-117, CIB-001.5)
- All components in `src/lib/components/`

**Allowed:**
- Transforms (translate, scale, rotate)
- Opacity animations
- Linear gradients
- Color transitions
- SVG drop shadow filters

**Forbidden:**
- CSS blur/filters
- Radial/conic gradients
- box-shadow/text-shadow
- backdrop-filter
- clip-path

### ADR-004: Strategy Pattern for Segment Layouts

**Decision:** Use strategy pattern with dedicated layout components for different segment display styles.

**Why:** Enables adding new layout strategies without modifying existing code. Supports A/B testing, theme-specific layouts, and design iterations while maintaining performance and type safety.

**Key Files:**
- `src/lib/types/segmentLayoutTypes.ts` (type definitions)
- `src/lib/components/renderers/layouts/OriginalLayout.tsx` (current implementation)
- `src/lib/components/renderers/SegmentRenderer.tsx` (lines 610-632, integration)

**Current Layouts:**
- **Original:** Mixed layout with three sub-strategies (image-only, text+image, two-line text)

**Future Possibilities:**
- Compact, minimalist, maximalist, icon grid, horizontal text, progressive reveal

## Creating a New ADR

1. Copy `template.md` to a new file with the next sequential number:
   ```bash
   cp docs/adr/template.md docs/adr/005-your-decision-title.md
   ```

2. Fill in the template sections:
   - **Context and Problem Statement:** What problem are you solving?
   - **Decision Drivers:** What factors influenced the decision?
   - **Considered Options:** What alternatives did you evaluate?
   - **Decision Outcome:** What did you choose and why?
   - **Consequences:** What are the positive and negative outcomes?

3. Include code references with file paths and line numbers where applicable

4. Update this README with a summary of the new ADR

## ADR Lifecycle

- **Proposed:** Under discussion, not yet decided
- **Accepted:** Decision made and being implemented
- **Deprecated:** No longer recommended, but not yet replaced
- **Superseded:** Replaced by a newer ADR (link to the new one)

## References

- [Architecture Decision Records](https://adr.github.io/)
- [MADR Template](https://adr.github.io/madr/)
- [Why Write ADRs](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
