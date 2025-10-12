/**
 * XPRow - Experience points reward row
 * Displays XP value with label
 */

import React from 'react';
import { RewardsComponent } from '../../types';

export interface XPRowProps {
  value: string;
  label?: string;
  rewards: RewardsComponent | undefined;
  buildTextStyle: (textStyle: any, fontSize: number) => React.CSSProperties;
  buildBoxStyle: (bgStyle: any) => React.CSSProperties;
  scale: number;
}

export const XPRow: React.FC<XPRowProps> = React.memo(({
  value,
  label = 'XP',
  rewards,
  buildTextStyle,
  buildBoxStyle,
  scale,
}) => {
  const bgStyle = rewards?.backgrounds?.default;

  if (!bgStyle) return null;

  return (
    <div className="result-default-box result-xp-box" style={buildBoxStyle(bgStyle)}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span style={buildTextStyle(rewards?.prizes?.texts?.xp, 24 * scale)}>
          {value}
        </span>
        <span style={buildTextStyle(rewards?.prizes?.texts?.xp, 18 * scale)}>
          {label}
        </span>
      </div>
    </div>
  );
});

XPRow.displayName = 'XPRow';
