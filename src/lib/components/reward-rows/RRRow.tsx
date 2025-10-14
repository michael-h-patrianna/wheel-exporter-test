/**
 * RRRow - Random Reward row
 * Displays random reward value with random reward icon image
 */

import randomRewardPng from '@assets/random_reward.png';
import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';

export interface RRRowProps {
  value?: string;
  label?: string;
  rewards: RewardsComponent | undefined;
  rrIcon?: string;
  scaledIconSize: number;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const RRRow: React.FC<RRRowProps> = React.memo(
  ({ value = '1', rewards, rrIcon, scaledIconSize, buildTextStyle, buildBoxStyle, scale }) => {
    const bgStyle = rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    // Use provided rrIcon from theme, or fallback to local asset
    const rrImageSrc = rrIcon || randomRewardPng;

    return (
      <div className="result-default-box result-rr-box" data-testid="result-default-box" style={buildBoxStyle(bgStyle)}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span
            style={{
              ...buildTextStyle(rewards?.prizes?.texts?.rr, 24 * scale),
              width: '50%',
              textAlign: 'right',
            }}
          >
            {value}
          </span>
          <span style={{ width: '50%', textAlign: 'left' }}>
          <img
            src={rrImageSrc}
            alt="Random Reward"
            data-testid="rr-icon"
            style={{ width: 'auto', height: `${scaledIconSize}px` }}
          />
          </span>
        </div>
      </div>
    );
  }
);

RRRow.displayName = 'RRRow';
