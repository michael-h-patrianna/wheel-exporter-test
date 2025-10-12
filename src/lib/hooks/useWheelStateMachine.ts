import { useReducer, useEffect, useRef, useCallback } from 'react';
import { logger } from '../services/logger';

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
  | { type: 'RESET' };

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
 * Calculate rotation angles for a spin
 */
function calculateRotation(
  currentRotation: number,
  targetSegment: number,
  segmentCount: number
): { withOvershoot: number; final: number; overshoot: number } {
  // Calculate angle for each segment
  const segmentAngle = 360 / segmentCount;

  // Calculate target position: center of the target segment
  // Subtract 90° to align with rendering coordinate system (segments start at -90°/12 o'clock)
  const targetSegmentAngle = targetSegment * segmentAngle + segmentAngle / 2 - 90;

  // Normalize current rotation to 0-360 range to find current position
  const normalizedCurrent = ((currentRotation % 360) + 360) % 360;

  // Calculate the angle difference needed to reach target from current position
  // We need to go from normalizedCurrent to targetSegmentAngle
  let angleDelta = targetSegmentAngle - normalizedCurrent;

  // If the delta is positive but small, we might want to go the "long way" with full spins
  // If negative, add 360 to go forward
  if (angleDelta < 0) {
    angleDelta += 360;
  }

  // Add 4-5 full rotations for excitement
  const fullSpins =
    ROTATION_CONFIG.MIN_FULL_SPINS +
    Math.floor(Math.random() * (ROTATION_CONFIG.MAX_FULL_SPINS - ROTATION_CONFIG.MIN_FULL_SPINS + 1));

  // Calculate total rotation: current + full spins + angle to target
  const totalRotation = currentRotation + fullSpins * 360 + angleDelta;

  return {
    withOvershoot: totalRotation, // No actual overshoot, single smooth animation
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
      break;

    case 'COMPLETE':
      if (event.type === 'RESET') {
        logger.info('Wheel state: COMPLETE -> IDLE', logContext);
        return {
          ...state,
          state: 'IDLE',
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
  const { segmentCount, onSpinComplete, winningSegmentIndex } = config;

  // Initialize state
  const [machineState, dispatch] = useReducer(wheelStateMachineReducer, {
    state: 'IDLE',
    rotation: 0,
    targetRotation: 0,
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
    const targetSegment = winningSegmentIndex != null
      ? winningSegmentIndex
      : Math.floor(Math.random() * segmentCount);

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
  }, [machineState.state, machineState.rotation, segmentCount, onSpinComplete, winningSegmentIndex]);

  /**
   * Reset to IDLE state
   */
  const reset = useCallback(() => {
    cleanupTimeouts();
    dispatch({ type: 'RESET' });
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
