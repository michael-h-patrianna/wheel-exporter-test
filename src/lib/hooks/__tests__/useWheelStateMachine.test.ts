/**
 * Comprehensive test suite for useWheelStateMachine
 * Tests state transitions, timing, cleanup, and edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWheelStateMachine } from '../useWheelStateMachine';
import { logger } from '../../services/logger';

// Mock logger to prevent console spam and verify telemetry
jest.mock('../../services/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useWheelStateMachine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      expect(result.current.state).toBe('IDLE');
      expect(result.current.rotation).toBe(0);
      expect(result.current.targetRotation).toBe(0);
      expect(result.current.isSpinning).toBe(false);
    });

    it('should provide startSpin and reset functions', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      expect(typeof result.current.startSpin).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('State Transitions - IDLE -> SPINNING', () => {
    it('should transition from IDLE to SPINNING when startSpin is called', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should log state transition to SPINNING', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: IDLE -> SPINNING',
        expect.objectContaining({
          currentState: 'IDLE',
          event: 'START_SPIN',
          targetSegment: expect.any(Number),
        })
      );
    });

    it('should not transition if already spinning', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      const firstState = result.current.state;

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe(firstState);
      expect(logger.warn).toHaveBeenCalledWith(
        'Attempted to start spin while not in IDLE state',
        expect.objectContaining({ currentState: 'SPINNING' })
      );
    });
  });

  describe('State Transitions - SPINNING -> SETTLING', () => {
    it('should transition to SETTLING after 5 seconds', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.state).toBe('SETTLING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should log state transition to SETTLING', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: SPINNING -> SETTLING',
        expect.objectContaining({
          currentState: 'SPINNING',
          event: 'SPIN_COMPLETE',
        })
      );
    });
  });

  describe('State Transitions - SETTLING -> COMPLETE', () => {
    it('should transition to COMPLETE after 6.5 seconds total', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.isSpinning).toBe(false);
    });

    it('should call onSpinComplete callback with target segment', () => {
      const onSpinComplete = jest.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        jest.advanceTimersByTime(6500);
      });

      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Number));
      expect(onSpinComplete).toHaveBeenCalledTimes(1);
    });

    it('should log state transition to COMPLETE', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      jest.clearAllMocks();

      act(() => {
        jest.advanceTimersByTime(6500);
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: SETTLING -> COMPLETE',
        expect.objectContaining({
          currentState: 'SETTLING',
          event: 'SETTLE_COMPLETE',
          targetSegment: expect.any(Number),
        })
      );
    });
  });

  describe('State Transitions - COMPLETE -> IDLE', () => {
    it('should transition back to IDLE when reset is called', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe('IDLE');
      expect(result.current.isSpinning).toBe(false);
    });

    it('should log state transition to IDLE', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(6500);
      });

      jest.clearAllMocks();

      act(() => {
        result.current.reset();
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: COMPLETE -> IDLE',
        expect.objectContaining({
          currentState: 'COMPLETE',
          event: 'RESET',
        })
      );
    });
  });

  describe('Rotation Calculations', () => {
    it('should calculate rotation for 8 segments', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      // Target rotation should be set during SPINNING
      expect(result.current.targetRotation).toBeGreaterThan(0);
      // Should have at least 5 full spins minus max segment angle (5 * 360 - 360 = 1440 degrees)
      // Account for overshoot (15-25 degrees added)
      expect(result.current.targetRotation).toBeGreaterThanOrEqual(1440);
    });

    it('should calculate rotation for 12 segments', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 12 })
      );

      act(() => {
        result.current.startSpin();
      });

      // Should have at least 5 full spins minus max segment angle (5 * 360 - 360 = 1440 degrees)
      expect(result.current.targetRotation).toBeGreaterThanOrEqual(1440);
    });

    it('should apply overshoot during SPINNING', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      const spinningRotation = result.current.targetRotation;

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const settlingRotation = result.current.targetRotation;

      // Settling rotation should be less than spinning rotation (overshoot removed)
      expect(settlingRotation).toBeLessThan(spinningRotation);
      // Difference should be between 15-25 degrees
      const overshoot = spinningRotation - settlingRotation;
      expect(overshoot).toBeGreaterThanOrEqual(15);
      expect(overshoot).toBeLessThanOrEqual(25);
    });

    it('should update rotation to final value when COMPLETE', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(5000);
      });

      const targetBeforeComplete = result.current.targetRotation;

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.rotation).toBe(targetBeforeComplete);
    });
  });

  describe('Deterministic Behavior', () => {
    it('should always select a segment within valid range', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      // Run multiple spins to ensure randomness is within bounds
      for (let i = 0; i < 10; i++) {
        act(() => {
          if (result.current.state === 'COMPLETE') {
            result.current.reset();
          }
          result.current.startSpin();
          jest.advanceTimersByTime(6500);
        });

        // Check that debug log was called with valid segment
        const debugCalls = (logger.debug as jest.Mock).mock.calls;
        const spinCall = debugCalls.find(call => call[0] === 'Starting wheel spin');
        if (spinCall) {
          const segment = spinCall[1].targetSegment;
          expect(segment).toBeGreaterThanOrEqual(0);
          expect(segment).toBeLessThan(8);
        }
      }
    });

    it('should produce consistent rotation for same segment and count', () => {
      // Mock Math.random to produce deterministic results
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      const { result: result1 } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result1.current.startSpin();
      });

      const rotation1 = result1.current.targetRotation;

      const { result: result2 } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result2.current.startSpin();
      });

      const rotation2 = result2.current.targetRotation;

      // Same random seed should produce same rotation
      expect(rotation1).toBe(rotation2);

      Math.random = originalRandom;
    });
  });

  describe('Timeout Cleanup', () => {
    it('should cleanup timeouts on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(2); // Two timeouts
      clearTimeoutSpy.mockRestore();
    });

    it('should cleanup timeouts when reset is called', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      act(() => {
        result.current.reset();
      });

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
      clearTimeoutSpy.mockRestore();
    });

    it('should not trigger transitions after cleanup', () => {
      const onSpinComplete = jest.fn();
      const { result, unmount } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Callback should not be called after unmount
      expect(onSpinComplete).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/reset cycles', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
        result.current.reset();
        result.current.startSpin();
        result.current.reset();
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
    });

    it('should handle segmentCount of 1', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 1 })
      );

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.targetRotation).toBeGreaterThan(0);
    });

    it('should handle large segmentCount', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 100 })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');
    });

    it('should not crash with missing onSpinComplete callback', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      expect(() => {
        act(() => {
          result.current.startSpin();
          jest.advanceTimersByTime(6500);
        });
      }).not.toThrow();
    });

    it('should warn on invalid transitions', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      // Try to reset from IDLE (invalid transition)
      act(() => {
        result.current.reset();
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid state transition attempted',
        expect.objectContaining({
          currentState: 'IDLE',
          attemptedEvent: 'RESET',
        })
      );
    });
  });

  describe('Integration with Different Wheel Configurations', () => {
    it('should work with 6-segment wheel', async () => {
      const onSpinComplete = jest.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 6, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Number));
      const segment = onSpinComplete.mock.calls[0][0];
      expect(segment).toBeGreaterThanOrEqual(0);
      expect(segment).toBeLessThan(6);
    });

    it('should work with 16-segment wheel', async () => {
      const onSpinComplete = jest.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 16, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Number));
      const segment = onSpinComplete.mock.calls[0][0];
      expect(segment).toBeGreaterThanOrEqual(0);
      expect(segment).toBeLessThan(16);
    });
  });

  describe('isSpinning Flag', () => {
    it('should be true during SPINNING state', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.isSpinning).toBe(true);
    });

    it('should be true during SETTLING state', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.state).toBe('SETTLING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should be false during IDLE state', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      expect(result.current.isSpinning).toBe(false);
    });

    it('should be false during COMPLETE state', () => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8 })
      );

      act(() => {
        result.current.startSpin();
        jest.advanceTimersByTime(6500);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.isSpinning).toBe(false);
    });
  });
});
