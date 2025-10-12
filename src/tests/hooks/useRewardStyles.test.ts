/**
 * Tests for useRewardStyles hook
 */

import { renderHook } from '@testing-library/react';
import { useRewardStyles } from '../../lib/hooks/useRewardStyles';
import { Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle, RewardsButtonStyle } from '../../lib/types';

describe('useRewardStyles', () => {
  it('returns memoized style builder functions', () => {
    const { result } = renderHook(() => useRewardStyles(1));

    expect(result.current.buildGradient).toBeInstanceOf(Function);
    expect(result.current.buildTextStyle).toBeInstanceOf(Function);
    expect(result.current.buildBoxStyle).toBeInstanceOf(Function);
    expect(result.current.buildButtonStyle).toBeInstanceOf(Function);
  });

  it('buildGradient handles solid colors', () => {
    const { result } = renderHook(() => useRewardStyles(1));
    const fill: Fill = { type: 'solid', color: '#ff0000' };

    expect(result.current.buildGradient(fill)).toBe('#ff0000');
  });

  it('buildGradient handles gradients', () => {
    const { result } = renderHook(() => useRewardStyles(1));
    const fill: Fill = {
      type: 'gradient',
      gradient: {
        type: 'linear',
        rotation: 90,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 1 },
        ],
        transform: [[1, 0, 0], [0, 1, 0]],
      },
    };

    expect(result.current.buildGradient(fill)).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
  });

  it('buildTextStyle applies scale correctly', () => {
    const { result } = renderHook(() => useRewardStyles(2));
    const textStyle: RewardsPrizeTextStyle = {
      label: 'Test',
      fill: { type: 'solid', color: '#ffffff' },
      stroke: { width: 2, color: '#000000' },
    };

    const style = result.current.buildTextStyle(textStyle, 16);
    expect(style.fontSize).toBe('16px');
    expect(style.WebkitTextStroke).toBe('4px #000000'); // stroke width scaled by 2
  });

  it('buildBoxStyle applies scale correctly', () => {
    const { result } = renderHook(() => useRewardStyles(2));
    const bgStyle: RewardsBackgroundStyle = {
      borderRadius: 8,
      backgroundFill: { type: 'solid', color: '#000000' },
      padding: { vertical: 10, horizontal: 20 },
    };

    const style = result.current.buildBoxStyle(bgStyle);
    expect(style.borderRadius).toBe('16px'); // 8 * 2
    expect(style.padding).toBe('20px 40px'); // 10 * 2, 20 * 2
  });

  it('buildButtonStyle applies scale correctly', () => {
    const { result } = renderHook(() => useRewardStyles(2));
    const btnStyle: RewardsButtonStyle = {
      frame: {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#ff0000' },
        padding: { vertical: 8, horizontal: 16 },
      },
      text: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 700,
      },
    };

    const styles = result.current.buildButtonStyle(btnStyle, 'default');
    expect(styles.container.borderRadius).toBe('8px'); // 4 * 2
    expect(styles.container.padding).toBe('16px 32px'); // 8 * 2, 16 * 2
    expect(styles.text.fontSize).toBe('28px'); // 14 * 2
  });

  it('memoizes functions based on scale', () => {
    const { result, rerender } = renderHook(({ scale }) => useRewardStyles(scale), {
      initialProps: { scale: 1 },
    });

    const firstBuildTextStyle = result.current.buildTextStyle;
    const firstBuildBoxStyle = result.current.buildBoxStyle;
    const firstBuildButtonStyle = result.current.buildButtonStyle;

    // Re-render with same scale
    rerender({ scale: 1 });
    expect(result.current.buildTextStyle).toBe(firstBuildTextStyle);
    expect(result.current.buildBoxStyle).toBe(firstBuildBoxStyle);
    expect(result.current.buildButtonStyle).toBe(firstBuildButtonStyle);

    // Re-render with different scale
    rerender({ scale: 2 });
    expect(result.current.buildTextStyle).not.toBe(firstBuildTextStyle);
    expect(result.current.buildBoxStyle).not.toBe(firstBuildBoxStyle);
    expect(result.current.buildButtonStyle).not.toBe(firstBuildButtonStyle);
  });

  it('buildGradient is not dependent on scale', () => {
    const { result, rerender } = renderHook(({ scale }) => useRewardStyles(scale), {
      initialProps: { scale: 1 },
    });

    const firstBuildGradient = result.current.buildGradient;

    // Re-render with different scale
    rerender({ scale: 2 });
    expect(result.current.buildGradient).toBe(firstBuildGradient);
  });

  it('handles all button states correctly', () => {
    const { result } = renderHook(() => useRewardStyles(1));
    const btnStyle: RewardsButtonStyle = {
      frame: {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#ff0000' },
        padding: { vertical: 8, horizontal: 16 },
      },
      text: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 700,
      },
    };

    const defaultStyles = result.current.buildButtonStyle(btnStyle, 'default');
    expect(defaultStyles.container.cursor).toBe('pointer');

    const disabledStyles = result.current.buildButtonStyle(btnStyle, 'disabled');
    expect(disabledStyles.container.cursor).toBe('not-allowed');

    const hoverStyles = result.current.buildButtonStyle(btnStyle, 'hover');
    expect(hoverStyles.container.cursor).toBe('pointer');

    const activeStyles = result.current.buildButtonStyle(btnStyle, 'active');
    expect(activeStyles.container.cursor).toBe('pointer');
  });
});
