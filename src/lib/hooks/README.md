# useWheelStateMachine Hook

A deterministic state machine hook for managing wheel spin logic with proper cleanup and telemetry.

## Overview

The `useWheelStateMachine` hook provides a predictable, type-safe way to manage the wheel spinning animation lifecycle. It uses `useReducer` for deterministic state transitions and properly cleans up all timeouts to prevent memory leaks.

## States

The state machine has 4 explicit states:

- **IDLE**: Wheel at rest, ready to spin
- **SPINNING**: Main spin animation (5 seconds)
- **SETTLING**: Bounce-back from overshoot (1.5 seconds)
- **COMPLETE**: Spin finished, showing result

## State Transitions

```
IDLE --[START_SPIN]--> SPINNING --[SPIN_COMPLETE]--> SETTLING --[SETTLE_COMPLETE]--> COMPLETE --[RESET]--> IDLE
```

All state transitions are explicit and logged via telemetry.

## Usage

```typescript
import { useWheelStateMachine } from './hooks/useWheelStateMachine';

function WheelComponent() {
  const { state, rotation, targetRotation, isSpinning, startSpin, reset } = useWheelStateMachine({
    segmentCount: 8,
    onSpinComplete: (segment) => {
      console.log(`Landed on segment ${segment}`);
    },
  });

  return (
    <div>
      <div
        className="wheel"
        style={{
          transform: `rotate(${targetRotation}deg)`,
          transition: state === 'SPINNING'
            ? 'transform 5s cubic-bezier(0.15, 0, 0.25, 1)'
            : state === 'SETTLING'
            ? 'transform 1.5s cubic-bezier(0.35, 0, 0.25, 1)'
            : 'none',
        }}
      >
        {/* Wheel segments */}
      </div>
      <button onClick={startSpin} disabled={isSpinning}>
        Spin
      </button>
      <button onClick={reset} disabled={state !== 'COMPLETE'}>
        Reset
      </button>
    </div>
  );
}
```

## API

### Configuration

```typescript
interface UseWheelStateMachineConfig {
  segmentCount: number;
  onSpinComplete?: (segment: number) => void;
}
```

### Return Value

```typescript
interface UseWheelStateMachineReturn {
  state: WheelState; // Current state: IDLE | SPINNING | SETTLING | COMPLETE
  rotation: number; // Current rotation (degrees)
  targetRotation: number; // Target rotation for animation (degrees)
  isSpinning: boolean; // True during SPINNING or SETTLING
  startSpin: () => void; // Start a spin (only works in IDLE state)
  reset: () => void; // Reset to IDLE (only works in COMPLETE state)
}
```

## Rotation Logic

The rotation calculation ensures exciting spins with realistic physics:

1. **Random segment selection**: `Math.floor(Math.random() * segmentCount)`
2. **Base rotation**: 5-7 full spins (1800-2520 degrees) to land on target segment
3. **Overshoot**: 15-25 degrees added during SPINNING
4. **Bounce-back**: Overshoot removed during SETTLING

### Animation Timing

- **Main spin**: 5 seconds with `cubic-bezier(0.15, 0, 0.25, 1)`
- **Settle**: 1.5 seconds with `cubic-bezier(0.35, 0, 0.25, 1)`
- **Total**: 6.5 seconds

## Features

### Deterministic Behavior

- All state transitions go through a reducer
- No race conditions from multiple `useState` calls
- Predictable behavior for testing and debugging

### Proper Cleanup

- All timeouts are stored in refs
- Timeouts are cleared on unmount
- Timeouts are cleared on reset
- No memory leaks or lingering callbacks

### Telemetry

State transitions are automatically logged:

```typescript
logger.info('Wheel state: IDLE -> SPINNING', { targetSegment, ... });
logger.info('Wheel state: SPINNING -> SETTLING', { ... });
logger.info('Wheel state: SETTLING -> COMPLETE', { targetSegment, ... });
logger.warn('Invalid state transition attempted', { currentState, attemptedEvent });
```

### Type Safety

- Fully typed with TypeScript
- Explicit event types prevent invalid transitions
- State machine prevents impossible states

## Testing

The hook includes comprehensive tests covering:

- All state transitions
- Rotation calculations for various segment counts
- Timeout cleanup on unmount and reset
- Edge cases (rapid cycles, invalid transitions)
- Deterministic behavior

Run tests:

```bash
npm test -- useWheelStateMachine.test.ts
```

## Migration from WheelViewer

The old implementation in `WheelViewer.tsx` used scattered `useState` calls:

```typescript
// OLD: Multiple useState calls
const [isSpinning, setIsSpinning] = useState(false);
const [targetRotation, setTargetRotation] = useState(0);
const [currentRotation, setCurrentRotation] = useState(0);

// NEW: Single state machine
const { state, rotation, targetRotation, isSpinning, startSpin } = useWheelStateMachine({
  segmentCount,
});
```

Benefits of migration:

- No more scattered state
- No more manual timeout cleanup
- Automatic telemetry
- Deterministic, testable behavior
- No race conditions
