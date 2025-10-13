import { useReducer, useEffect, useRef, useCallback } from 'react';
import { logger } from '@services/logger';

/**
 * Wheel spin states
 */
export type WheelState = 'IDLE' | 'SPINNING' | 'COMPLETE';

/**
 * Events that trigger state transitions
 */
export type WheelEvent =
  | { type: 'START_SPIN'; targetSegment: number; finalRotation: number }
  | { type: 'SPIN_COMPLETE' }
  | { type: 'RESET'; initialRotation?: number };

/**
 * State machine data
 */
interface WheelStateMachineState {
  state: WheelState;
  rotation: number;
  targetRotation: number;
  targetSegment: number | null;
}

/**
 * Animation timing constants (milliseconds)
 */
const TIMING = {
  SPIN: 8000, // Single 8-second animation with natural deceleration
} as const;

/**
 * Rotation calculation parameters
 */
const ROTATION_CONFIG = {
  MIN_FULL_SPINS: 4, // 4-5 full rotations for excitement
  MAX_FULL_SPINS: 5,
} as const;

/**
 * Calculate initial rotation to position a segment at 12 o'clock
 * Used to position the jackpot segment at the top when the wheel loads
 *
 * @param jackpotSegmentIndex - Index of the jackpot segment to position at 12 o'clock
 * @param segmentCount - Total number of segments
 * @returns Initial rotation in degrees
 */
function calculateInitialRotation(jackpotSegmentIndex: number, segmentCount: number): number {
  // Calculate angle for each segment
  const segmentAngle = 360 / segmentCount;

  // Calculate where the jackpot segment's center naturally sits (before rotation)
  // Segments start at -90° (12 o'clock), so segment N center is at:
  const segmentOriginalAngle = jackpotSegmentIndex * segmentAngle + segmentAngle / 2 - 90;

  // To position this segment at -90° (pointer position), we need to rotate by:
  // pointerAngle (-90°) - segmentOriginalAngle
  const pointerAngle = -90;
  const initialRotation = (pointerAngle - segmentOriginalAngle + 360) % 360;

  return initialRotation;
}

/**
 * Calculate rotation needed to land winning segment at 12 o'clock position
 *
 * The wheel segments are fixed to the wheel. When we rotate the wheel,
 * the segments rotate with it. To land a segment at 12 o'clock (0° absolute),
 * we need to calculate how much to rotate the wheel.
 *
 * Segments are rendered starting at -90° (12 o'clock), so:
 * - Segment 0 center is at: 0 * segmentAngle + segmentAngle/2 - 90°
 * - Segment 1 center is at: 1 * segmentAngle + segmentAngle/2 - 90°
 * - etc.
 *
 * To land the target segment at 12 o'clock (0° absolute), we rotate the wheel
 * by the NEGATIVE of the segment's offset, normalized to positive degrees.
 */
function calculateRotation(
  currentRotation: number,
  targetSegment: number,
  segmentCount: number
): { withOvershoot: number; final: number; overshoot: number } {
  // Calculate angle for each segment (in degrees)
  const segmentAngle = 360 / segmentCount;

  // Calculate the segment's ORIGINAL position (before any rotation)
  // Segments start at -90° (top), so segment center is at:
  const segmentOriginalAngle = targetSegment * segmentAngle + segmentAngle / 2 - 90;

  // Calculate where this segment CURRENTLY is (after previous rotations)
  // The wheel has already rotated by currentRotation degrees, so the segment moved with it
  const segmentCurrentAngle = (segmentOriginalAngle + currentRotation) % 360;

  // The pointer is at -90° (12 o'clock, top of wheel)
  // Calculate how much ADDITIONAL rotation needed from the segment's CURRENT position
  const pointerAngle = -90;
  const additionalRotationNeeded = (pointerAngle - segmentCurrentAngle + 360) % 360;

  // Add 4-5 full rotations for excitement (minimum 1440°, maximum 1800°)
  const fullSpins =
    ROTATION_CONFIG.MIN_FULL_SPINS +
    Math.floor(
      Math.random() * (ROTATION_CONFIG.MAX_FULL_SPINS - ROTATION_CONFIG.MIN_FULL_SPINS + 1)
    );

  // Calculate total rotation:
  // Current position + full spins for excitement + additional rotation to reach pointer
  const totalRotation = currentRotation + fullSpins * 360 + additionalRotationNeeded;

  return {
    withOvershoot: totalRotation,
    final: totalRotation,
    overshoot: 0,
  };
}

/**
 * State machine reducer with explicit transitions
 */
function wheelStateMachineReducer(
  state: WheelStateMachineState,
  event: WheelEvent
): WheelStateMachineState {
  const logContext = {
    currentState: state.state,
    event: event.type,
    rotation: state.rotation,
  };

  switch (state.state) {
    case 'IDLE':
      if (event.type === 'START_SPIN') {
        logger.info('Wheel state: IDLE -> SPINNING', {
          ...logContext,
          targetSegment: event.targetSegment,
        });
        return {
          ...state,
          state: 'SPINNING',
          targetSegment: event.targetSegment,
          targetRotation: event.finalRotation,
        };
      }
      // Allow reset from IDLE state (idempotent operation)
      if (event.type === 'RESET') {
        const resetRotation = event.initialRotation ?? 0;
        logger.debug('Wheel state: IDLE -> IDLE (reset called)', logContext);
        return {
          state: 'IDLE',
          rotation: resetRotation,
          targetRotation: resetRotation,
          targetSegment: null,
        };
      }
      break;

    case 'SPINNING':
      if (event.type === 'SPIN_COMPLETE') {
        logger.info('Wheel state: SPINNING -> COMPLETE', {
          ...logContext,
          targetSegment: state.targetSegment,
        });
        return {
          ...state,
          state: 'COMPLETE',
          rotation: state.targetRotation,
        };
      }
      // Allow reset from SPINNING state (e.g., when generating new prize table)
      if (event.type === 'RESET') {
        const resetRotation = event.initialRotation ?? 0;
        logger.info('Wheel state: SPINNING -> IDLE (forced reset)', logContext);
        return {
          state: 'IDLE',
          rotation: resetRotation,
          targetRotation: resetRotation,
          targetSegment: null,
        };
      }
      break;

    case 'COMPLETE':
      if (event.type === 'RESET') {
        const resetRotation = event.initialRotation ?? 0;
        logger.info('Wheel state: COMPLETE -> IDLE', logContext);
        return {
          state: 'IDLE',
          rotation: resetRotation,
          targetRotation: resetRotation,
          targetSegment: null,
        };
      }
      // Allow starting a new spin directly from COMPLETE state
      if (event.type === 'START_SPIN') {
        logger.info('Wheel state: COMPLETE -> SPINNING (auto-reset)', {
          ...logContext,
          targetSegment: event.targetSegment,
        });
        return {
          ...state,
          state: 'SPINNING',
          targetSegment: event.targetSegment,
          targetRotation: event.finalRotation,
        };
      }
      break;
  }

  // Invalid transition - log warning but maintain current state
  logger.warn('Invalid state transition attempted', {
    ...logContext,
    attemptedEvent: event.type,
  });

  return state;
}

/**
 * Hook configuration
 */
interface UseWheelStateMachineConfig {
  segmentCount: number;
  onSpinComplete?: (segment: number) => void;
  winningSegmentIndex?: number | null; // Pre-determined winning segment from prize session
  jackpotSegmentIndex?: number | null; // Index of jackpot segment to position at 12 o'clock initially
}

/**
 * Hook return value
 */
interface UseWheelStateMachineReturn {
  state: WheelState;
  rotation: number;
  targetRotation: number;
  isSpinning: boolean;
  startSpin: () => void;
  reset: () => void;
}

/**
 * Deterministic state machine hook for wheel spin logic
 *
 * States:
 * - IDLE: Wheel at rest, ready to spin
 * - SPINNING: Single 8-second animation with natural deceleration (creates "near miss" excitement)
 * - COMPLETE: Spin finished, showing result
 *
 * The extreme ease-out curve creates excitement by making the wheel crawl past
 * several segments slowly enough that players believe it could stop on each one.
 *
 * @param config - Configuration object
 * @returns State machine interface
 */
export function useWheelStateMachine(
  config: UseWheelStateMachineConfig
): UseWheelStateMachineReturn {
  const { segmentCount, onSpinComplete, winningSegmentIndex, jackpotSegmentIndex } = config;

  // Calculate initial rotation to position jackpot at 12 o'clock
  const initialRotation =
    jackpotSegmentIndex != null ? calculateInitialRotation(jackpotSegmentIndex, segmentCount) : 0;

  // Store initial rotation in a ref so it doesn't change during re-renders
  const initialRotationRef = useRef(initialRotation);

  // Update initial rotation ref when jackpot segment changes
  useEffect(() => {
    initialRotationRef.current =
      jackpotSegmentIndex != null ? calculateInitialRotation(jackpotSegmentIndex, segmentCount) : 0;
  }, [jackpotSegmentIndex, segmentCount]);

  // Initialize state
  const [machineState, dispatch] = useReducer(wheelStateMachineReducer, {
    state: 'IDLE',
    rotation: initialRotation,
    targetRotation: initialRotation,
    targetSegment: null,
  });

  // Use ref for timeout ID to avoid re-renders and enable cleanup
  const spinCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup timeout
   */
  const cleanupTimeouts = useCallback(() => {
    if (spinCompleteTimeoutRef.current) {
      clearTimeout(spinCompleteTimeoutRef.current);
      spinCompleteTimeoutRef.current = null;
    }
  }, []);

  /**
   * Start a spin to a target segment (from prize session) or random
   */
  const startSpin = useCallback(() => {
    // Allow spinning from IDLE or COMPLETE states
    if (machineState.state !== 'IDLE' && machineState.state !== 'COMPLETE') {
      logger.warn('Attempted to start spin while not in IDLE or COMPLETE state', {
        currentState: machineState.state,
      });
      return;
    }

    // Use predetermined winning segment if available, otherwise random
    // IMPORTANT: Access the latest winningSegmentIndex value from config
    const targetSegment =
      winningSegmentIndex != null ? winningSegmentIndex : Math.floor(Math.random() * segmentCount);

    // Calculate final rotation
    const rotation = calculateRotation(machineState.rotation, targetSegment, segmentCount);
    const finalRotation = rotation.final;

    // Dispatch START_SPIN event
    dispatch({
      type: 'START_SPIN',
      targetSegment,
      finalRotation,
    });

    logger.debug('Starting wheel spin', {
      targetSegment,
      predeterminedWinner: winningSegmentIndex != null,
      winningSegmentIndex,
      fullSpins: Math.floor((finalRotation - machineState.rotation) / 360),
      finalRotation,
    });

    // Schedule SPIN_COMPLETE after 8-second animation
    spinCompleteTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SPIN_COMPLETE' });

      // Call completion callback
      if (onSpinComplete) {
        onSpinComplete(targetSegment);
      }
    }, TIMING.SPIN);
  }, [
    machineState.state,
    machineState.rotation,
    segmentCount,
    onSpinComplete,
    winningSegmentIndex,
  ]);

  /**
   * Reset to IDLE state with initial rotation (jackpot at 12 o'clock)
   */
  const reset = useCallback(() => {
    cleanupTimeouts();
    dispatch({ type: 'RESET', initialRotation: initialRotationRef.current });
  }, [cleanupTimeouts]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return cleanupTimeouts;
  }, [cleanupTimeouts]);

  return {
    state: machineState.state,
    rotation: machineState.rotation,
    targetRotation: machineState.targetRotation,
    isSpinning: machineState.state === 'SPINNING',
    startSpin,
    reset,
  };
}
