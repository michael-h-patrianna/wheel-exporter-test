/**
 * REAL consecutive spin test - same wheel instance, multiple spins
 * Tests the actual user scenario: spin, spin, spin on same wheel
 */

import { renderHook, act } from '@testing-library/react';
import { useWheelStateMachine } from '@hooks/useWheelStateMachine';

describe('useWheelStateMachine - REAL Consecutive Spins', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  function anglesEqual(angle1: number, angle2: number, tolerance = 0.1): boolean {
    const normalized1 = normalizeAngle(angle1);
    const normalized2 = normalizeAngle(angle2);
    const diff = Math.abs(normalized1 - normalized2);
    return Math.min(diff, 360 - diff) <= tolerance;
  }

  function calculateSegmentPositionAfterRotation(
    segmentIndex: number,
    segmentCount: number,
    wheelRotation: number
  ): number {
    const segmentAngle = 360 / segmentCount;
    const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle / 2 - 90;
    return normalizeAngle(segmentCenterAngle + wheelRotation);
  }

  it('should maintain perfect alignment across 10000 consecutive spins on SAME wheel instance', () => {
    const segmentCount = 6;
    const spins = 10000;
    const failures: Array<{
      spinNumber: number;
      winningSegment: number;
      currentRotation: number;
      targetRotation: number;
      finalPosition: number;
      error: number;
    }> = [];

    // Track which segment the hook actually chose for each spin
    const actualWinningSegments: number[] = [];

    // Create ONE wheel instance that will be used for all spins
    // Hook will pick random segments since no winningSegmentIndex provided
    const { result } = renderHook(() =>
      useWheelStateMachine({
        segmentCount,
        onSpinComplete: (segment) => {
          actualWinningSegments.push(segment);
        },
      })
    );

    for (let i = 0; i < spins; i++) {
      // Record state before spin
      const rotationBeforeSpin = result.current.rotation;

      // Start spin - hook will pick random segment
      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;

      // Complete the spin
      act(() => {
        jest.advanceTimersByTime(8000);
      });

      // After spin completes, rotation should equal targetRotation
      const finalRotation = result.current.rotation;

      // Get the segment that the hook ACTUALLY chose (from callback)
      const winningSegment = actualWinningSegments[i];

      // Calculate where winning segment ended up
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        finalRotation
      );

      if (!anglesEqual(finalPosition, -90, 0.5)) {
        failures.push({
          spinNumber: i + 1,
          winningSegment,
          currentRotation: rotationBeforeSpin,
          targetRotation,
          finalPosition,
          error: Math.min(
            Math.abs(normalizeAngle(finalPosition) - normalizeAngle(-90)),
            360 - Math.abs(normalizeAngle(finalPosition) - normalizeAngle(-90))
          ),
        });
      }

      // Transition back to COMPLETE state for next spin
      if (i < spins - 1 && result.current.state === 'COMPLETE') {
        // Wheel is ready for next spin
      }
    }

    if (failures.length > 0) {
      const errorReport = failures
        .slice(0, 20)
        .map(
          (f) =>
            `  Spin ${f.spinNumber}: winner=${f.winningSegment}, ` +
            `beforeRotation=${f.currentRotation.toFixed(2)}°, ` +
            `targetRotation=${f.targetRotation.toFixed(2)}°, ` +
            `landed at ${f.finalPosition.toFixed(2)}° instead of -90°, ` +
            `error=${f.error.toFixed(2)}°`
        )
        .join('\n');

      throw new Error(
        `${failures.length}/${spins} consecutive spins failed!\n` +
          `First 20 failures:\n${errorReport}\n\n` +
          `Success rate: ${(((spins - failures.length) / spins) * 100).toFixed(2)}%`
      );
    }

    expect(failures.length).toBe(0);
  });

  it('should handle consecutive spins with same winning segment', () => {
    const segmentCount = 8;
    const winningSegment = 3;
    const spins = 100;

    const { result } = renderHook(() =>
      useWheelStateMachine({ segmentCount, winningSegmentIndex: winningSegment })
    );

    for (let i = 0; i < spins; i++) {
      act(() => {
        result.current.startSpin();
      });

      act(() => {
        jest.advanceTimersByTime(8000);
      });

      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        result.current.rotation
      );

      expect(anglesEqual(finalPosition, -90, 0.5)).toBe(true);
    }
  });

  it('should detect drift if rotation calculation is broken', () => {
    // This test will FAIL if there's drift accumulation
    const segmentCount = 6;
    const spins = 50;
    const winningSegment = 2;

    const { result } = renderHook(() =>
      useWheelStateMachine({ segmentCount, winningSegmentIndex: winningSegment })
    );

    const positions: number[] = [];

    for (let i = 0; i < spins; i++) {
      act(() => {
        result.current.startSpin();
      });

      act(() => {
        jest.advanceTimersByTime(8000);
      });

      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        result.current.rotation
      );

      positions.push(normalizeAngle(finalPosition));
    }

    // All positions should be within 1° of -90° (or 270°)
    const target = 270; // -90° normalized
    const maxDeviation = Math.max(
      ...positions.map((p) => {
        const diff = Math.abs(p - target);
        return Math.min(diff, 360 - diff);
      })
    );

    expect(maxDeviation).toBeLessThan(1); // Max 1° deviation
  });
});
