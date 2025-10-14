/**
 * GCSCRow - Gold Coins + Sweeps Coins combination row
 * Displays both GC and SC values with icons and styled text
 */

import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';

export interface GCSCRowProps {
  gcValue: string;
  scValue: string;
  rewards: RewardsComponent | undefined;
  gcIcon?: string;
  scIcon?: string;
  scaledIconSize: number;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const GCSCRow: React.FC<GCSCRowProps> = React.memo(
  ({
    gcValue,
    scValue,
    rewards,
    gcIcon,
    scIcon,
    scaledIconSize,
    buildTextStyle,
    buildBoxStyle,
    scale,
  }) => {
    const bgStyle = rewards?.backgrounds?.highlight;

    if (!bgStyle) return null;

    return (
      <div className="result-highlight-box" data-testid="result-highlight-box" style={buildBoxStyle(bgStyle)}>
        <div
          className="result-highlight-content"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          {/* GC Icon */}
          {gcIcon && (
            <img
              src={gcIcon}
              alt="GC"
              data-testid="gc-icon"
              style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px`, flexShrink: 0 }}
            />
          )}

          {/* GC Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span data-testid="gc-label" style={buildTextStyle(rewards?.prizes?.texts?.gcTitle, 14 * scale)}>GC</span>
            <span
              className="gcsc-value"
              data-testid="gc-value"
              style={buildTextStyle(rewards?.prizes?.texts?.gcValue, 18 * scale)}
            >
              {gcValue}
            </span>
          </div>

          {/* Plus */}
          <span data-testid="plus-sign" style={buildTextStyle(rewards?.prizes?.texts?.plus, 19 * scale)}>+</span>

          {/* SC Icon */}
          {scIcon && (
            <img
              src={scIcon}
              alt="SC"
              data-testid="sc-icon"
              style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px`, flexShrink: 0 }}
            />
          )}

          {/* SC Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span data-testid="sc-label" style={buildTextStyle(rewards?.prizes?.texts?.scTitle, 14 * scale)}>SC</span>
            <span
              className="gcsc-value"
              data-testid="sc-value"
              style={buildTextStyle(rewards?.prizes?.texts?.scValue, 18 * scale)}
            >
              {scValue}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

GCSCRow.displayName = 'GCSCRow';
