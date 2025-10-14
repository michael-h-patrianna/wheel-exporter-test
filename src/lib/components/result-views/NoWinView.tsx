import type { ExtractedAssets, RewardsBackgroundStyle, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';
import type { ButtonState } from '../renderers/ButtonRenderer';
import { ButtonRenderer } from '../renderers/ButtonRenderer';
import { FailRow } from '../reward-rows/FailRow';

interface NoWinViewProps {
  wheelData: ExtractedAssets['wheelData'];
  scale: number;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  headerImage?: string;
  headerBounds?: { w: number; h: number; x: number; y: number };
  showButton: boolean;
  buttonText: string;
  buttonState: ButtonState;
  onButtonMouseEnter: () => void;
  onButtonMouseLeave: () => void;
  onButtonClick?: () => void;
  message?: string;
}

/**
 * NoWinView Component - Displays the "No Win" result view
 * Shows fail header, fail message, and close button
 */
export const NoWinView: React.FC<NoWinViewProps> = ({
  wheelData,
  scale,
  buildTextStyle,
  buildBoxStyle,
  headerImage,
  headerBounds,
  showButton,
  buttonText,
  buttonState,
  onButtonMouseEnter,
  onButtonMouseLeave,
  onButtonClick,
  message = 'Lady Luck took a coffee break... better luck next time, high roller.',
}) => {
  const rewards = wheelData.rewards;

  return (
    <div
      className="result-content"
      data-testid="no-win-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header - Fail State */}
      {headerImage && headerBounds && (
        <div className="result-header" style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={headerImage}
            alt="Result header"
            data-testid="no-win-header"
            style={{
              width: `${Math.round(headerBounds.w * scale)}px`,
              height: `${Math.round(headerBounds.h * scale)}px`,
              maxWidth: '100%',
            }}
          />
        </div>
      )}

      {/* Fail Row */}
      <FailRow
        message={message}
        rewards={rewards}
        buildTextStyle={buildTextStyle}
        buildBoxStyle={buildBoxStyle}
        scale={scale}
      />

      {/* Close Button */}
      {showButton && rewards?.button?.stateStyles && (
        <div
          className="result-button-container"
          style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}
        >
          <ButtonRenderer
            buttonStyles={rewards.button.stateStyles}
            currentState={buttonState}
            text={buttonText}
            onMouseEnter={onButtonMouseEnter}
            onMouseLeave={onButtonMouseLeave}
            onClick={onButtonClick}
            scale={scale}
          />
        </div>
      )}
    </div>
  );
};
