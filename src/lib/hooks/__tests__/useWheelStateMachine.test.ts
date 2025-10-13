/**
 * Comprehensive test suite for useWheelStateMachine
 * Tests state transitions, timing, cleanup, and edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWheelStateMachine } from '../useWheelStateMachine';
import { logger } from '../../services/logger';
import { vi } from 'vitest';

// Mock logger to prevent console spam and verify telemetry
vi.mock('../../services/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useWheelStateMachine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clear all timers without running them to avoid act warnings
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      expect(result.current.state).toBe('IDLE');
      expect(result.current.rotation).toBe(0);
      expect(result.current.targetRotation).toBe(0);
      expect(result.current.isSpinning).toBe(false);
    });

    it('should provide startSpin and reset functions', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      expect(typeof result.current.startSpin).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('State Transitions - IDLE -> SPINNING', () => {
    it('should transition from IDLE to SPINNING when startSpin is called', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should log state transition to SPINNING', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

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
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      const firstState = result.current.state;

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe(firstState);
      expect(logger.warn).toHaveBeenCalledWith(
        'Attempted to start spin while not in IDLE or COMPLETE state',
        expect.objectContaining({ currentState: 'SPINNING' })
      );
    });
  });

  describe('State Transitions - SPINNING -> COMPLETE', () => {
    it('should transition to COMPLETE after 8 seconds', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.isSpinning).toBe(false);
    });

    it('should call onSpinComplete callback with target segment', () => {
      const onSpinComplete = vi.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Number));
      expect(onSpinComplete).toHaveBeenCalledTimes(1);
    });

    it('should log state transition to COMPLETE', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      vi.clearAllMocks();

      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: SPINNING -> COMPLETE',
        expect.objectContaining({
          currentState: 'SPINNING',
          event: 'SPIN_COMPLETE',
          targetSegment: expect.any(Number),
        })
      );
    });
  });

  describe('State Transitions - COMPLETE -> IDLE', () => {
    it('should transition back to IDLE when reset is called', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe('IDLE');
      expect(result.current.isSpinning).toBe(false);
    });

    it('should log state transition to IDLE', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      vi.clearAllMocks();

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

  describe('State Transitions - COMPLETE -> SPINNING', () => {
    it('should allow starting a new spin from COMPLETE state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should log auto-reset when spinning from COMPLETE', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      vi.clearAllMocks();

      act(() => {
        result.current.startSpin();
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Wheel state: COMPLETE -> SPINNING (auto-reset)',
        expect.objectContaining({
          currentState: 'COMPLETE',
          event: 'START_SPIN',
          targetSegment: expect.any(Number),
        })
      );
    });
  });

  describe('Rotation Calculations', () => {
    it('should calculate rotation for 8 segments', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      // Target rotation should be set during SPINNING
      expect(result.current.targetRotation).toBeGreaterThan(0);
      // Should have at least 4 full spins (4 * 360 = 1440 degrees)
      expect(result.current.targetRotation).toBeGreaterThanOrEqual(1440);
    });

    it("should account for 90° offset to align with segment rendering at 12 o'clock", () => {
      // Mock Math.random to target segment 0
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.1) as any; // Will select segment 0

      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8, winningSegmentIndex: 0 })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;

      // With 8 segments, segment angle = 45°
      // Segment 0 center is at: 0 * 45 + 22.5 - 90 = -67.5°
      // To land at -90° (12 o'clock pointer position), we rotate by (-90 - (-67.5)) = -22.5° = 337.5°
      const normalizedRotation = ((targetRotation % 360) + 360) % 360;

      // Expected rotation: 337.5° (which lands the segment at -90°/12 o'clock)
      expect(normalizedRotation).toBeCloseTo(337.5, 1);

      Math.random = originalRandom;
    });

    it('should align segment centers correctly for different segment counts', () => {
      const testCases = [
        { segmentCount: 3, winningIndex: 0, expectedNormalized: 300 }, // 0*120+60-90 = -30, rotation = -60 = 300
        { segmentCount: 4, winningIndex: 0, expectedNormalized: 315 }, // 0*90+45-90 = -45, rotation = -45 = 315
        { segmentCount: 6, winningIndex: 0, expectedNormalized: 330 }, // 0*60+30-90 = -60, rotation = -30 = 330
        { segmentCount: 8, winningIndex: 0, expectedNormalized: 337.5 }, // 0*45+22.5-90 = -67.5, rotation = -22.5 = 337.5
      ];

      testCases.forEach(({ segmentCount, winningIndex, expectedNormalized }) => {
        const { result } = renderHook(() =>
          useWheelStateMachine({ segmentCount, winningSegmentIndex: winningIndex })
        );

        act(() => {
          result.current.startSpin();
        });

        const normalizedRotation = ((result.current.targetRotation % 360) + 360) % 360;
        expect(normalizedRotation).toBeCloseTo(expectedNormalized, 1);
      });
    });

    it('should calculate rotation for 12 segments', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 12 }));

      act(() => {
        result.current.startSpin();
      });

      // Should have at least 4 full spins (4 * 360 = 1440 degrees)
      expect(result.current.targetRotation).toBeGreaterThanOrEqual(1440);
    });

    it('should update rotation to final value when COMPLETE', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;

      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.rotation).toBe(targetRotation);
    });
  });

  describe('Deterministic Behavior', () => {
    it('should always select a segment within valid range', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      // Run multiple spins to ensure randomness is within bounds
      for (let i = 0; i < 10; i++) {
        act(() => {
          if (result.current.state === 'COMPLETE') {
            result.current.reset();
          }
          result.current.startSpin();
          vi.advanceTimersByTime(8000);
        });

        // Check that debug log was called with valid segment
        const debugCalls = vi.mocked(logger.debug).mock.calls;
        const spinCall = debugCalls.find((call) => call[0] === 'Starting wheel spin');
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
      Math.random = vi.fn(() => 0.5) as any;

      const { result: result1 } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result1.current.startSpin();
      });

      const rotation1 = result1.current.targetRotation;

      const { result: result2 } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

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
      const { result, unmount } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      // Spy on clearTimeout
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); // One timeout for 8s animation
      clearTimeoutSpy.mockRestore();
    });

    it('should cleanup timeouts when reset is called', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      act(() => {
        result.current.reset();
      });

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); // One timeout for 8s animation
      clearTimeoutSpy.mockRestore();
    });

    it('should not trigger transitions after cleanup', () => {
      const onSpinComplete = vi.fn();
      const { result, unmount } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 8, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Callback should not be called after unmount
      expect(onSpinComplete).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/reset cycles', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

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
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 1 }));

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.targetRotation).toBeGreaterThan(0);
    });

    it('should handle large segmentCount', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 100 }));

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
    });

    it('should not crash with missing onSpinComplete callback', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      expect(() => {
        act(() => {
          result.current.startSpin();
          vi.advanceTimersByTime(8000);
        });
      }).not.toThrow();
    });

    it('should warn on invalid transitions', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      // Start a spin
      act(() => {
        result.current.startSpin();
      });

      // Try to start another spin while already spinning (invalid transition)
      act(() => {
        result.current.startSpin();
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Attempted to start spin while not in IDLE or COMPLETE state',
        expect.objectContaining({
          currentState: 'SPINNING',
        })
      );
    });

    it('should allow reset from SPINNING state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      // Start a spin
      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.isSpinning).toBe(true);

      // Reset while spinning (simulates generating new prize table)
      act(() => {
        result.current.reset();
      });

      // Should be back to IDLE state with rotation reset to 0
      expect(result.current.state).toBe('IDLE');
      expect(result.current.isSpinning).toBe(false);
      expect(result.current.rotation).toBe(0);
      expect(result.current.targetRotation).toBe(0);

      // Should be able to start a new spin
      act(() => {
        result.current.startSpin();
      });

      expect(result.current.state).toBe('SPINNING');
      expect(result.current.isSpinning).toBe(true);
    });

    it('should reset rotation to 0 from any state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      // Spin to accumulate rotation
      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.rotation).toBeGreaterThan(0);

      // Reset should clear rotation
      act(() => {
        result.current.reset();
      });

      expect(result.current.rotation).toBe(0);
      expect(result.current.targetRotation).toBe(0);
    });
  });

  describe('Integration with Different Wheel Configurations', () => {
    it('should work with 6-segment wheel', async () => {
      const onSpinComplete = vi.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 6, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Number));
      const segment = onSpinComplete.mock.calls[0][0];
      expect(segment).toBeGreaterThanOrEqual(0);
      expect(segment).toBeLessThan(6);
    });

    it('should work with 16-segment wheel', async () => {
      const onSpinComplete = vi.fn();
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount: 16, onSpinComplete })
      );

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
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
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
      });

      expect(result.current.isSpinning).toBe(true);
    });

    it('should be false during IDLE state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      expect(result.current.isSpinning).toBe(false);
    });

    it('should be false during COMPLETE state', () => {
      const { result } = renderHook(() => useWheelStateMachine({ segmentCount: 8 }));

      act(() => {
        result.current.startSpin();
        vi.advanceTimersByTime(8000);
      });

      expect(result.current.state).toBe('COMPLETE');
      expect(result.current.isSpinning).toBe(false);
    });
  });
});
