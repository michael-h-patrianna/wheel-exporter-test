/**
 * Hook for memoized reward style builders
 * Provides stable style building functions across re-renders
 */

import { useCallback } from 'react';
import {
  buildGradient,
  buildTextStyle,
  buildBoxStyle,
  buildButtonStyle,
} from '@utils/styleBuilders';
import { Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle, RewardsButtonStyle } from '@lib-types';

export interface UseRewardStylesReturn {
  buildGradient: (fill: Fill | undefined) => string;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  buildButtonStyle: (
    btnStyle: RewardsButtonStyle | undefined,
    buttonState: 'default' | 'disabled' | 'hover' | 'active'
  ) => { container: React.CSSProperties; text: React.CSSProperties };
}

/**
 * Custom hook that provides memoized style building functions
 *
 * @param scale - Scale factor for dimensions
 * @returns Object with memoized style builders
 */
export function useRewardStyles(scale: number): UseRewardStylesReturn {
  // Memoize buildGradient (no scale dependency)
  const memoizedBuildGradient = useCallback((fill: Fill | undefined) => {
    return buildGradient(fill);
  }, []);

  // Memoize buildTextStyle with scale
  const memoizedBuildTextStyle = useCallback(
    (textStyle: RewardsPrizeTextStyle | undefined, fontSize: number) => {
      return buildTextStyle(textStyle, fontSize, scale);
    },
    [scale]
  );

  // Memoize buildBoxStyle with scale
  const memoizedBuildBoxStyle = useCallback(
    (bgStyle: RewardsBackgroundStyle | undefined) => {
      return buildBoxStyle(bgStyle, scale);
    },
    [scale]
  );

  // Memoize buildButtonStyle with scale
  const memoizedBuildButtonStyle = useCallback(
    (
      btnStyle: RewardsButtonStyle | undefined,
      buttonState: 'default' | 'disabled' | 'hover' | 'active'
    ) => {
      return buildButtonStyle(btnStyle, buttonState, scale);
    },
    [scale]
  );

  return {
    buildGradient: memoizedBuildGradient,
    buildTextStyle: memoizedBuildTextStyle,
    buildBoxStyle: memoizedBuildBoxStyle,
    buildButtonStyle: memoizedBuildButtonStyle,
  };
}
