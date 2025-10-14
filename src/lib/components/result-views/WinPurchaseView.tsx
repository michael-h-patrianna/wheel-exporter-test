import type { ExtractedAssets, RewardsBackgroundStyle, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';
import type { ButtonState } from '../renderers/ButtonRenderer';
import { ButtonRenderer } from '../renderers/ButtonRenderer';
import { PurchaseRow } from '../reward-rows/PurchaseRow';

interface WinPurchaseViewProps {
  wheelData: ExtractedAssets['wheelData'];
  assets: ExtractedAssets;
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
  title?: string;
  description?: string;
}

/**
 * WinPurchaseView Component - Displays the "Win Purchase" result view
 * Shows success header, purchase offer row, and purchase button
 */
export const WinPurchaseView: React.FC<WinPurchaseViewProps> = ({
  wheelData,
  assets,
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
  title,
  description,
}) => {
  const rewards = wheelData?.rewards;

  return (
    <div
      className="result-content"
      data-testid="win-purchase-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header - Success State */}
      {headerImage && headerBounds && (
        <div className="result-header" style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={headerImage}
            alt="Result header"
            data-testid="win-purchase-header"
            style={{
              width: `${Math.round(headerBounds.w * scale)}px`,
              height: `${Math.round(headerBounds.h * scale)}px`,
              maxWidth: '100%',
            }}
          />
        </div>
      )}

      {/* Purchase Row */}
      <PurchaseRow
        purchaseImage={assets?.rewardsPrizeImages?.purchase}
        title={title}
        description={description}
        rewards={rewards}
        buildTextStyle={buildTextStyle}
        buildBoxStyle={buildBoxStyle}
        scale={scale}
      />

      {/* Purchase Button */}
      {showButton && rewards?.button?.stateStyles && (
        <div
          className="result-button-container"
          style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}
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
