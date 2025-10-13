/**
 * FreeSpinsRow - Free spins reward row
 * Displays free spins value and label
 */

import React from 'react';
import { RewardsComponent, RewardsPrizeTextStyle, RewardsBackgroundStyle } from '@lib-types';

export interface FreeSpinsRowProps {
  value: string;
  label?: string;
  rewards: RewardsComponent | undefined;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const FreeSpinsRow: React.FC<FreeSpinsRowProps> = React.memo(
  ({ value, label = 'FREE SPINS', rewards, buildTextStyle, buildBoxStyle, scale }) => {
    const bgStyle = rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    const labelParts = label.split(' ');
    const firstPart = labelParts[0] || 'FREE';
    const secondPart = labelParts[1] || 'SPINS';

    return (
      <div className="result-default-box result-freespins-box" style={buildBoxStyle(bgStyle)}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span
            style={buildTextStyle(
              rewards?.prizes?.texts?.freeSpinsValue ?? rewards?.prizes?.texts?.freeSpins,
              24 * scale
            )}
          >
            {value}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={buildTextStyle(
                rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                14 * scale
              )}
            >
              {firstPart}
            </span>
            <span
              style={buildTextStyle(
                rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                14 * scale
              )}
            >
              {secondPart}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

FreeSpinsRow.displayName = 'FreeSpinsRow';
