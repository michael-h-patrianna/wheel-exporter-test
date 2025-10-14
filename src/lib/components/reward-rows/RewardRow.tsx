/**
 * RewardRow - Wrapper component with type discrimination
 * Routes to the appropriate reward row component based on type
 */

import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';
import { FailRow } from './FailRow';
import { FreeSpinsRow } from './FreeSpinsRow';
import { GCSCRow } from './GCSCRow';
import { RRRow } from './RRRow';
import { RewardRowData } from './types';
import { XPRow } from './XPRow';

export interface RewardRowProps {
  rowData: RewardRowData;
  index: number;
  rewards: RewardsComponent | undefined;
  gcIcon?: string;
  scIcon?: string;
  xpIcon?: string;
  rrIcon?: string;
  scaledIconSize: number;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const RewardRow: React.FC<RewardRowProps> = React.memo(
  ({
    rowData,
    index,
    rewards,
    gcIcon,
    scIcon,
    xpIcon,
    rrIcon,
    scaledIconSize,
    buildTextStyle,
    buildBoxStyle,
    scale,
  }) => {
    const { type } = rowData;

    // Type-based row rendering
    switch (type) {
      case 'gcsc':
        return (
          <GCSCRow
            key={`reward-row-${index}`}
            gcValue={rowData.gcValue || '0'}
            scValue={rowData.scValue || '0'}
            rewards={rewards}
            gcIcon={gcIcon}
            scIcon={scIcon}
            scaledIconSize={scaledIconSize}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      case 'freeSpins':
        return (
          <FreeSpinsRow
            key={`reward-row-${index}`}
            value={rowData.value || '0'}
            label={rowData.label}
            rewards={rewards}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      case 'xp':
        return (
          <XPRow
            key={`reward-row-${index}`}
            value={rowData.value || '0'}
            label={rowData.label}
            rewards={rewards}
            xpIcon={xpIcon}
            scaledIconSize={scaledIconSize}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      case 'rr':
        return (
          <RRRow
            key={`reward-row-${index}`}
            value={rowData.value}
            label={rowData.label}
            rewards={rewards}
            rrIcon={rrIcon}
            scaledIconSize={scaledIconSize}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      case 'fail':
        return (
          <FailRow
            key={`reward-row-${index}`}
            message={rowData.message}
            rewards={rewards}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      default:
        return null;
    }
  }
);

RewardRow.displayName = 'RewardRow';
