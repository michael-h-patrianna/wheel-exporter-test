/**
 * FreeSpinsRow - Free spins reward row
 * Displays free spins value and label
 */

import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';

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
      <div className="result-default-box result-freespins-box" data-testid="result-default-box" style={buildBoxStyle(bgStyle)}>
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
              ...buildTextStyle(
                rewards?.prizes?.texts?.freeSpinsValue ?? rewards?.prizes?.texts?.freeSpins,
                24 * scale
              ),
              width: '50%',
              textAlign: 'right',
            }}
          >
            {value}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', width: '50%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <div>
            <span
              style={buildTextStyle(
                rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                18 * scale
              )}
            >
              {firstPart}
            </span>
            <span
              style={buildTextStyle(
                rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                18 * scale
              )}
            >
              {secondPart}
            </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FreeSpinsRow.displayName = 'FreeSpinsRow';
