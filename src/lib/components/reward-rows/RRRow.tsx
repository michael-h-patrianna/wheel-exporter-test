/**
 * RRRow - Random Reward row
 * Displays random reward label
 */

import React from 'react';
import { RewardsComponent } from '../../types';

export interface RRRowProps {
  label?: string;
  rewards: RewardsComponent | undefined;
  buildTextStyle: (textStyle: any, fontSize: number) => React.CSSProperties;
  buildBoxStyle: (bgStyle: any) => React.CSSProperties;
  scale: number;
}

export const RRRow: React.FC<RRRowProps> = React.memo(({
  label = 'RANDOM REWARD',
  rewards,
  buildTextStyle,
  buildBoxStyle,
  scale,
}) => {
  const bgStyle = rewards?.backgrounds?.default;

  if (!bgStyle) return null;

  return (
    <div className="result-default-box result-rr-box" style={buildBoxStyle(bgStyle)}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span style={buildTextStyle(rewards?.prizes?.texts?.rr, 20 * scale)}>
          {label}
        </span>
      </div>
    </div>
  );
});

RRRow.displayName = 'RRRow';
