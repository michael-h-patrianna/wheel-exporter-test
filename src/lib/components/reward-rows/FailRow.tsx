/**
 * FailRow - Fail/loss state row
 * Displays failure message
 */

import React from 'react';
import { RewardsComponent, RewardsPrizeTextStyle, RewardsBackgroundStyle } from '@lib-types';

export interface FailRowProps {
  message?: string;
  rewards: RewardsComponent | undefined;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const FailRow: React.FC<FailRowProps> = React.memo(
  ({ message = 'TRY AGAIN', rewards, buildTextStyle, buildBoxStyle, scale }) => {
    const bgStyle = rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    return (
      <div className="result-default-box result-fail-box" style={buildBoxStyle(bgStyle)}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={buildTextStyle(rewards?.prizes?.texts?.fail, 20 * scale)}>{message}</span>
        </div>
      </div>
    );
  }
);

FailRow.displayName = 'FailRow';
