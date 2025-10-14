/**
 * XPRow - Experience points reward row
 * Displays XP value with XP icon image
 */

import xpPng from '@assets/xp.png';
import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';

export interface XPRowProps {
  value: string;
  label?: string;
  rewards: RewardsComponent | undefined;
  xpIcon?: string;
  scaledIconSize: number;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const XPRow: React.FC<XPRowProps> = React.memo(
  ({ value, rewards, xpIcon, scaledIconSize, buildTextStyle, buildBoxStyle, scale }) => {
    const bgStyle = rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    // Use provided xpIcon from theme, or fallback to local asset
    const xpImageSrc = xpIcon || xpPng;

    return (
      <div className="result-default-box result-xp-box" data-testid="result-default-box" style={buildBoxStyle(bgStyle)}>
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
              ...buildTextStyle(rewards?.prizes?.texts?.xp, 24 * scale),
              width: '50%',
              textAlign: 'right',
            }}
          >
            {value}
          </span>

          <span style={{ width: '50%', textAlign: 'left' }}>
          <img
            src={xpImageSrc}
            alt="XP"
            data-testid="xp-icon"
            style={{ width: 'auto', height: `${scaledIconSize}px` }}
          />
          </span>



        </div>
      </div>
    );
  }
);

XPRow.displayName = 'XPRow';
