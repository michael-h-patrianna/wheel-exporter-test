import type { ExtractedAssets, RewardsBackgroundStyle, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';
import type { ButtonState } from '../renderers/ButtonRenderer';
import { ButtonRenderer } from '../renderers/ButtonRenderer';
import type { RewardRowData } from '../reward-rows';
import { RewardRow } from '../reward-rows';

interface WinFreeViewProps {
  wheelData: ExtractedAssets['wheelData'];
  assets: ExtractedAssets;
  scale: number;
  rewardRows: RewardRowData[];
  iconSize: number;
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
}

/**
 * WinFreeView Component - Displays the "Win Free" result view
 * This shows the current/default ResultViewer content with reward rows
 */
export const WinFreeView: React.FC<WinFreeViewProps> = ({
  wheelData,
  assets,
  scale,
  rewardRows,
  iconSize,
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
}) => {
  const rewards = wheelData.rewards;
  const scaledIconSize = Math.round(iconSize * scale);

  return (
    <div
      className="result-content"
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
            style={{
              width: `${Math.round(headerBounds.w * scale)}px`,
              height: `${Math.round(headerBounds.h * scale)}px`,
              maxWidth: '100%',
            }}
          />
        </div>
      )}

      {/* Reward Rows */}
      {rewardRows.map((rowData, index) => (
        <RewardRow
          key={`reward-row-${index}`}
          rowData={rowData}
          index={index}
          rewards={rewards}
          gcIcon={assets.rewardsPrizeImages?.gc}
          scIcon={assets.rewardsPrizeImages?.sc}
          scaledIconSize={scaledIconSize}
          buildTextStyle={buildTextStyle}
          buildBoxStyle={buildBoxStyle}
          scale={scale}
        />
      ))}

      {/* Collect Button */}
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
