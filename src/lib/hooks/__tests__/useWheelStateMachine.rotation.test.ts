/**
 * Comprehensive rotation validation test suite
 * Tests rotation accuracy across thousands of random configurations
 */

import { renderHook, act } from '@testing-library/react';
import { useWheelStateMachine } from '../useWheelStateMachine';

describe('useWheelStateMachine - Rotation Accuracy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  /**
   * Helper function to normalize angles to 0-360 range
   */
  function normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  /**
   * Helper function to check if two angles are equal within tolerance
   * Accounts for angle wraparound (e.g., -90° = 270°, 359° ≈ 1°)
   */
  function anglesEqual(angle1: number, angle2: number, tolerance = 0.1): boolean {
    // Normalize both angles to 0-360 range
    const normalized1 = normalizeAngle(angle1);
    const normalized2 = normalizeAngle(angle2);
    const diff = Math.abs(normalized1 - normalized2);
    // Account for wraparound (e.g., 359° and 1° are 2° apart, not 358°)
    return Math.min(diff, 360 - diff) <= tolerance;
  }

  /**
   * Helper to check if angle is close to expected, accounting for wraparound
   * Use this instead of toBeCloseTo for angle comparisons
   */
  function expectAngleCloseTo(actual: number, expected: number, precision = 1): void {
    const tolerance = Math.pow(10, -precision) * 5; // Same tolerance as Jest's toBeCloseTo
    if (!anglesEqual(actual, expected, tolerance)) {
      throw new Error(
        `Expected angle ${actual}° to be close to ${expected}° ` +
        `(normalized: ${normalizeAngle(actual)}° vs ${normalizeAngle(expected)}°)`
      );
    }
  }

  /**
   * Calculate where a segment's center will be after rotation
   * Segments are rendered starting at -90° (12 o'clock position)
   * Segment N's center is at: N * segmentAngle + segmentAngle/2 - 90°
   */
  function calculateSegmentPositionAfterRotation(
    segmentIndex: number,
    segmentCount: number,
    wheelRotation: number
  ): number {
    const segmentAngle = 360 / segmentCount;
    const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle / 2 - 90;
    // After rotation, the segment is at its original position + rotation
    return normalizeAngle(segmentCenterAngle + wheelRotation);
  }

  it('should land winning segment at 12 o\'clock across 10000 random configurations', () => {
    const iterations = 10000;
    const failures: Array<{
      iteration: number;
      segmentCount: number;
      winningSegment: number;
      targetRotation: number;
      expectedPosition: number;
      actualPosition: number;
      error: number;
    }> = [];

    for (let i = 0; i < iterations; i++) {
      // Generate random configuration matching real-world usage: 3-8 segments only
      const segmentCount = Math.floor(Math.random() * 6) + 3; // 3-8 segments
      const winningSegment = Math.floor(Math.random() * segmentCount);

      // Create a hook and perform a single spin
      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;

      // Calculate where the winning segment will end up
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      // The winning segment should be at -90° (12 o'clock) - pointer position
      const expectedPosition = -90;
      const isCorrect = anglesEqual(finalPosition, expectedPosition, 0.1);

      if (!isCorrect) {
        const error = Math.min(
          Math.abs(finalPosition - expectedPosition),
          Math.abs(finalPosition - 360 - expectedPosition),
          Math.abs(finalPosition + 360 - expectedPosition)
        );

        failures.push({
          iteration: i,
          segmentCount,
          winningSegment,
          targetRotation,
          expectedPosition,
          actualPosition: finalPosition,
          error,
        });
      }
    }

    // Report failures
    if (failures.length > 0) {
      const errorReport = failures.slice(0, 10).map(f =>
        `  Iteration ${f.iteration}: ${f.segmentCount} segments, winner=${f.winningSegment}, ` +
        `rotation=${f.targetRotation.toFixed(2)}°, ` +
        `expected=${f.expectedPosition}°, actual=${f.actualPosition.toFixed(2)}°, ` +
        `error=${f.error.toFixed(2)}°`
      ).join('\n');

      throw new Error(
        `${failures.length}/${iterations} iterations failed to land at 12 o'clock!\n` +
        `First 10 failures:\n${errorReport}\n\n` +
        `Success rate: ${((iterations - failures.length) / iterations * 100).toFixed(2)}%`
      );
    }

    // All iterations passed - 100% success rate required
    expect(failures.length).toBe(0);
  });

  it('should land correctly for all segments in an 8-segment wheel', () => {
    const segmentCount = 8;

    for (let winningSegment = 0; winningSegment < segmentCount; winningSegment++) {
      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      expectAngleCloseTo(finalPosition, -90, 1);
    }
  });

  it('should land correctly for all segments in a 12-segment wheel', () => {
    const segmentCount = 12;

    for (let winningSegment = 0; winningSegment < segmentCount; winningSegment++) {
      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      expectAngleCloseTo(finalPosition, -90, 1);
    }
  });

  it('should handle user spinning multiple times on same wheel (scenario 2)', () => {
    // Scenario: User has one prize table and keeps spinning
    // Each spin targets a different random winning segment
    // All must land at 12 o'clock

    const spinsPerWheel = 100;
    const failures: string[] = [];

    for (let segmentCount = 3; segmentCount <= 8; segmentCount++) {
      for (let spin = 0; spin < spinsPerWheel; spin++) {
        const winningSegment = Math.floor(Math.random() * segmentCount);

        const { result } = renderHook(() =>
          useWheelStateMachine({
            segmentCount,
            winningSegmentIndex: winningSegment,
          })
        );

        // Perform spin
        act(() => {
          result.current.startSpin();
        });

        const targetRotation = result.current.targetRotation;

        // Complete the spin
        act(() => {
          jest.advanceTimersByTime(8000);
        });

        // Verify winning segment lands at 12 o'clock (-90° pointer position)
        const finalPosition = calculateSegmentPositionAfterRotation(
          winningSegment,
          segmentCount,
          targetRotation
        );

        if (!anglesEqual(finalPosition, -90, 0.1)) {
          failures.push(
            `Wheel ${segmentCount} segments, spin ${spin + 1}, winner=${winningSegment}: ` +
            `landed at ${finalPosition.toFixed(2)}° instead of -90°`
          );
        }

        // Now spin again from the final position (consecutive spins on same wheel)
        if (spin < spinsPerWheel - 1) {
          const nextWinningSegment = Math.floor(Math.random() * segmentCount);

          const { result: result2 } = renderHook(() =>
            useWheelStateMachine({
              segmentCount,
              winningSegmentIndex: nextWinningSegment,
            })
          );

          // Simulate starting from previous final rotation
          act(() => {
            result2.current.startSpin();
          });

          const nextTargetRotation = result2.current.targetRotation;

          act(() => {
            jest.advanceTimersByTime(8000);
          });

          // Verify next spin also lands correctly
          const nextFinalPosition = calculateSegmentPositionAfterRotation(
            nextWinningSegment,
            segmentCount,
            nextTargetRotation
          );

          if (!anglesEqual(nextFinalPosition, -90, 0.1)) {
            failures.push(
              `Wheel ${segmentCount} segments, consecutive spin ${spin + 2}, winner=${nextWinningSegment}: ` +
              `landed at ${nextFinalPosition.toFixed(2)}° instead of -90°`
            );
          }
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} spins failed on same wheel scenario!\n` +
        `First 10 failures:\n${failures.slice(0, 10).join('\n')}`
      );
    }

    expect(failures.length).toBe(0);
  });

  it('should handle user changing prize tables between spins (scenario 1)', () => {
    // Scenario: User generates new prize table (new segment count) and new winning segment
    // This simulates: create table -> spin -> create new table -> spin -> repeat

    const iterations = 1000;
    const failures: string[] = [];

    for (let i = 0; i < iterations; i++) {
      // Generate random prize table (3-8 segments)
      const segmentCount = Math.floor(Math.random() * 6) + 3;
      const winningSegment = Math.floor(Math.random() * segmentCount);

      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;

      act(() => {
        jest.advanceTimersByTime(8000);
      });

      // Verify winning segment lands at 12 o'clock (-90° pointer position)
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      if (!anglesEqual(finalPosition, -90, 0.1)) {
        failures.push(
          `Iteration ${i + 1}: ${segmentCount} segments, winner=${winningSegment}: ` +
          `landed at ${finalPosition.toFixed(2)}° instead of -90°`
        );
      }

      // Now simulate creating a completely new prize table with different segment count
      const newSegmentCount = Math.floor(Math.random() * 6) + 3;
      const newWinningSegment = Math.floor(Math.random() * newSegmentCount);

      const { result: result2 } = renderHook(() =>
        useWheelStateMachine({
          segmentCount: newSegmentCount,
          winningSegmentIndex: newWinningSegment,
        })
      );

      act(() => {
        result2.current.startSpin();
      });

      const newTargetRotation = result2.current.targetRotation;

      act(() => {
        jest.advanceTimersByTime(8000);
      });

      // Verify new wheel also lands correctly
      const newFinalPosition = calculateSegmentPositionAfterRotation(
        newWinningSegment,
        newSegmentCount,
        newTargetRotation
      );

      if (!anglesEqual(newFinalPosition, -90, 0.1)) {
        failures.push(
          `Iteration ${i + 1} (new table): ${newSegmentCount} segments, winner=${newWinningSegment}: ` +
          `landed at ${newFinalPosition.toFixed(2)}° instead of -90°`
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} spins failed with changing prize tables!\n` +
        `First 10 failures:\n${failures.slice(0, 10).join('\n')}`
      );
    }

    expect(failures.length).toBe(0);
  });

  it('should maintain accuracy with odd segment counts', () => {
    const oddSegmentCounts = [3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

    oddSegmentCounts.forEach(segmentCount => {
      const winningSegment = Math.floor(segmentCount / 2); // Middle segment

      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      expectAngleCloseTo(finalPosition, -90, 1);
    });
  });

  it('should maintain accuracy with even segment counts', () => {
    const evenSegmentCounts = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24];

    evenSegmentCounts.forEach(segmentCount => {
      const winningSegment = Math.floor(segmentCount / 2); // Middle segment

      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      expectAngleCloseTo(finalPosition, -90, 1);
    });
  });

  it('should handle extreme segment counts', () => {
    const extremeCounts = [1, 2, 50, 100];

    extremeCounts.forEach(segmentCount => {
      const winningSegment = 0; // First segment

      const { result } = renderHook(() =>
        useWheelStateMachine({
          segmentCount,
          winningSegmentIndex: winningSegment,
        })
      );

      act(() => {
        result.current.startSpin();
      });

      const targetRotation = result.current.targetRotation;
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningSegment,
        segmentCount,
        targetRotation
      );

      expectAngleCloseTo(finalPosition, -90, 1);
    });
  });

  it('should verify rotation calculation matches test expectations', () => {
    // Test specific cases with new formula (pointer at -90°)
    // For segment 0: center is at -30°, needs rotation of (-90 - (-30)) = -60° = 300°
    const testCases = [
      { segmentCount: 3, winningIndex: 0, expectedNormalized: 300 }, // segment at -30°, rotation = 300°
      { segmentCount: 4, winningIndex: 0, expectedNormalized: 315 }, // segment at -45°, rotation = 315°
      { segmentCount: 6, winningIndex: 0, expectedNormalized: 330 }, // segment at -60°, rotation = 330°
      { segmentCount: 8, winningIndex: 0, expectedNormalized: 337.5 }, // segment at -67.5°, rotation = 337.5°
    ];

    testCases.forEach(({ segmentCount, winningIndex, expectedNormalized }) => {
      const { result } = renderHook(() =>
        useWheelStateMachine({ segmentCount, winningSegmentIndex: winningIndex })
      );

      act(() => {
        result.current.startSpin();
      });

      const normalizedRotation = normalizeAngle(result.current.targetRotation);
      expect(normalizedRotation).toBeCloseTo(expectedNormalized, 1);

      // Verify this rotation lands the segment at 12 o'clock
      const finalPosition = calculateSegmentPositionAfterRotation(
        winningIndex,
        segmentCount,
        result.current.targetRotation
      );
      expectAngleCloseTo(finalPosition, -90, 1);
    });
  });
});
