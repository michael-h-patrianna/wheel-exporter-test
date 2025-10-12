import { useReducer, useEffect, useRef, useCallback } from 'react';
import { logger } from '../services/logger';

/**
 * Wheel spin states
 */
export type WheelState = 'IDLE' | 'SPINNING' | 'SETTLING' | 'COMPLETE';

/**
 * Events that trigger state transitions
 */
export type WheelEvent =
  | { type: 'START_SPIN'; targetSegment: number; rotationWithOvershoot: number; finalRotation: number }
  | { type: 'SPIN_COMPLETE'; finalRotation: number }
  | { type: 'SETTLE_COMPLETE' }
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
  MAIN_SPIN: 5000,
  SETTLE: 1500,
  TOTAL: 6500, // MAIN_SPIN + SETTLE
} as const;

/**
 * Rotation calculation parameters
 */
const ROTATION_CONFIG = {
  MIN_FULL_SPINS: 5,
  MAX_FULL_SPINS: 7,
  MIN_OVERSHOOT: 15,
  MAX_OVERSHOOT: 25,
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

  // Calculate where the chosen segment should end up
  const targetSegmentAngle = targetSegment * segmentAngle;

  // Add multiple full rotations (5-7 spins) for excitement
  const fullSpins =
    ROTATION_CONFIG.MIN_FULL_SPINS +
    Math.floor(Math.random() * (ROTATION_CONFIG.MAX_FULL_SPINS - ROTATION_CONFIG.MIN_FULL_SPINS + 1));

  // Total rotation: spin multiple times and land on target
  const baseRotation = fullSpins * 360 - targetSegmentAngle;

  // Add overshoot (15-25 degrees)
  const overshoot =
    ROTATION_CONFIG.MIN_OVERSHOOT +
    Math.random() * (ROTATION_CONFIG.MAX_OVERSHOOT - ROTATION_CONFIG.MIN_OVERSHOOT);

  return {
    withOvershoot: currentRotation + baseRotation + overshoot,
    final: currentRotation + baseRotation,
    overshoot,
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
          targetRotation: event.rotationWithOvershoot,
        };
      }
      break;

    case 'SPINNING':
      if (event.type === 'SPIN_COMPLETE') {
        logger.info('Wheel state: SPINNING -> SETTLING', logContext);
        return {
          ...state,
          state: 'SETTLING',
          targetRotation: event.finalRotation,
        };
      }
      break;

    case 'SETTLING':
      if (event.type === 'SETTLE_COMPLETE') {
        logger.info('Wheel state: SETTLING -> COMPLETE', {
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
          targetRotation: event.rotationWithOvershoot,
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
 * - SPINNING: Main spin animation (5s)
 * - SETTLING: Bounce-back from overshoot (1.5s)
 * - COMPLETE: Spin finished, showing result
 *
 * @param config - Configuration object
 * @returns State machine interface
 */
export function useWheelStateMachine(
  config: UseWheelStateMachineConfig
): UseWheelStateMachineReturn {
  const { segmentCount, onSpinComplete } = config;

  // Initialize state
  const [machineState, dispatch] = useReducer(wheelStateMachineReducer, {
    state: 'IDLE',
    rotation: 0,
    targetRotation: 0,
    targetSegment: null,
  });

  // Use refs for timeout IDs to avoid re-renders and enable cleanup
  const spinCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settleCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup all timeouts
   */
  const cleanupTimeouts = useCallback(() => {
    if (spinCompleteTimeoutRef.current) {
      clearTimeout(spinCompleteTimeoutRef.current);
      spinCompleteTimeoutRef.current = null;
    }
    if (settleCompleteTimeoutRef.current) {
      clearTimeout(settleCompleteTimeoutRef.current);
      settleCompleteTimeoutRef.current = null;
    }
  }, []);

  /**
   * Start a spin with a random segment
   */
  const startSpin = useCallback(() => {
    // Allow spinning from IDLE or COMPLETE states
    if (machineState.state !== 'IDLE' && machineState.state !== 'COMPLETE') {
      logger.warn('Attempted to start spin while not in IDLE or COMPLETE state', {
        currentState: machineState.state,
      });
      return;
    }

    // Pick random segment (0 to segmentCount-1)
    const randomSegment = Math.floor(Math.random() * segmentCount);

    // Calculate rotation angles
    const rotation = calculateRotation(machineState.rotation, randomSegment, segmentCount);

    // Dispatch START_SPIN event with rotation values
    dispatch({
      type: 'START_SPIN',
      targetSegment: randomSegment,
      rotationWithOvershoot: rotation.withOvershoot,
      finalRotation: rotation.final,
    });

    logger.debug('Starting wheel spin', {
      targetSegment: randomSegment,
      fullSpins: Math.floor((rotation.final - machineState.rotation) / 360),
      overshoot: rotation.overshoot,
      finalRotation: rotation.final,
    });

    // Schedule SPIN_COMPLETE after main animation
    spinCompleteTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SPIN_COMPLETE', finalRotation: rotation.final });
    }, TIMING.MAIN_SPIN);

    // Schedule SETTLE_COMPLETE after bounce back
    settleCompleteTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SETTLE_COMPLETE' });

      // Call completion callback
      if (onSpinComplete) {
        onSpinComplete(randomSegment);
      }
    }, TIMING.TOTAL);
  }, [machineState.state, machineState.rotation, segmentCount, onSpinComplete]);

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
    isSpinning: machineState.state === 'SPINNING' || machineState.state === 'SETTLING',
    startSpin,
    reset,
  };
}
