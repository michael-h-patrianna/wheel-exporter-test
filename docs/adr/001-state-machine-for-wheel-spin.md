# 1. Use State Machine Pattern for Wheel Spin Logic

**Date:** 2025-10-12

**Status:** Accepted

**Context:** None

## Context and Problem Statement

The wheel spin functionality requires managing complex asynchronous behavior including:
- Multiple distinct states (idle, spinning, complete)
- Deterministic transitions between states
- Animation timing coordination
- Predetermined prize selection from backend
- User interaction handling
- State persistence across multiple spins

How should we model and manage the wheel's lifecycle to ensure predictable, testable, and maintainable behavior?

## Decision Drivers

* Need for deterministic, predictable state transitions
* Requirement to integrate with backend prize system (predetermined winning segments)
* Complex timing coordination between state changes and animations
* Need for explicit, auditable state management for debugging
* Support for reset and multi-spin scenarios
* Testability of state logic in isolation
* Clear mental model for developers

## Considered Options

* **Option 1:** State machine with explicit states and events (useReducer-based)
* **Option 2:** Boolean flags (isSpinning, isComplete, etc.)
* **Option 3:** Single state string with ad-hoc transition logic
* **Option 4:** External state management library (Redux, Zustand)

## Decision Outcome

Chosen option: "State machine with explicit states and events (useReducer-based)", because it provides the best combination of predictability, testability, and maintainability for managing complex state transitions while keeping the implementation lightweight.

### Positive Consequences

* **Explicit state transitions:** All valid transitions are clearly defined in the reducer (lines 87-159 in useWheelStateMachine.ts)
* **Invalid transition prevention:** Attempts to transition from invalid states are logged but don't crash (line 153)
* **Deterministic behavior:** Given same inputs, always produces same state changes
* **Testability:** State transitions can be tested in isolation without DOM or timers
* **Logging and debugging:** All state changes are logged with context (lines 100, 115, 129, 138)
* **Integration with backend:** Supports predetermined winning segments via `winningSegmentIndex` (line 236)
* **Type safety:** TypeScript ensures only valid events can be dispatched

### Negative Consequences

* More verbose than simple boolean flags for basic use cases
* Requires understanding of reducer pattern
* Slightly more boilerplate code

## Pros and Cons of the Options

### Option 1: State Machine with Explicit States and Events

Implementation: `src/lib/hooks/useWheelStateMachine.ts`

* Good, because state transitions are explicit and validated (lines 97-150)
* Good, because supports logging and debugging at transition points
* Good, because enforces valid state flow (IDLE -> SPINNING -> COMPLETE -> IDLE)
* Good, because allows auto-reset from COMPLETE to SPINNING (line 137)
* Good, because integrates cleanly with predetermined prize selection
* Good, because separates state logic from UI rendering
* Bad, because requires more code than simple boolean flags

### Option 2: Boolean Flags

* Good, because simple and familiar pattern
* Good, because less boilerplate
* Bad, because allows invalid state combinations (isSpinning && isComplete)
* Bad, because transitions are implicit and hard to track
* Bad, because difficult to add logging/debugging hooks
* Bad, because hard to test edge cases

### Option 3: Single State String

* Good, because simpler than full state machine
* Bad, because transition logic scattered across components
* Bad, because no enforcement of valid transitions
* Bad, because difficult to extend with new states

### Option 4: External State Management Library

* Good, because provides additional tooling and dev tools
* Good, because familiar to developers using Redux/Zustand
* Bad, because overkill for component-local state
* Bad, because adds external dependency
* Bad, because increases bundle size
* Bad, because adds learning curve for contributors

## Links

* Related implementation: `src/lib/hooks/__tests__/useWheelStateMachine.test.ts`
* Related component: `src/lib/components/WheelViewer.tsx` (consumer of state machine)

## Implementation Notes

### State Definitions (lines 7-25)

```typescript
export type WheelState = 'IDLE' | 'SPINNING' | 'COMPLETE';

export type WheelEvent =
  | { type: 'START_SPIN'; targetSegment: number; finalRotation: number }
  | { type: 'SPIN_COMPLETE' }
  | { type: 'RESET' };
```

### State Machine Reducer (lines 87-159)

The reducer enforces valid transitions:

- **IDLE**: Can transition to SPINNING via START_SPIN
- **SPINNING**: Can transition to COMPLETE via SPIN_COMPLETE
- **COMPLETE**: Can transition to IDLE via RESET, or directly to SPINNING via START_SPIN (auto-reset)

Invalid transitions are logged but don't change state (line 153).

### Integration with Backend Prize System (lines 234-257)

The state machine accepts a `winningSegmentIndex` from the prize session:

```typescript
const targetSegment = winningSegmentIndex != null
  ? winningSegmentIndex
  : Math.floor(Math.random() * segmentCount);
```

This ensures the spin is deterministic when the backend provides a predetermined winner.

### Animation Timing Coordination (lines 260-267)

State transitions are synchronized with CSS animations via setTimeout:

```typescript
spinCompleteTimeoutRef.current = setTimeout(() => {
  dispatch({ type: 'SPIN_COMPLETE' });
  if (onSpinComplete) {
    onSpinComplete(targetSegment);
  }
}, TIMING.SPIN); // 8000ms
```

### Rotation Calculation (lines 45-82)

The state machine calculates deterministic rotation values including:
- Current rotation normalization (0-360 range)
- Random full spins (4-5 rotations for excitement)
- Exact angle to target segment center
- No overshoot (single smooth animation)

## References

* [State Machine Pattern](https://en.wikipedia.org/wiki/Finite-state_machine)
* [React useReducer Hook](https://react.dev/reference/react/useReducer)
* [Explicit State Machines in React](https://kentcdodds.com/blog/usestate-vs-usereducer)
