/**
 * RewardRow - Wrapper component with type discrimination
 * Routes to the appropriate reward row component based on type
 */

import React from 'react';
import { RewardRowData } from './types';
import { GCSCRow } from './GCSCRow';
import { FreeSpinsRow } from './FreeSpinsRow';
import { XPRow } from './XPRow';
import { RRRow } from './RRRow';
import { FailRow } from './FailRow';
import { RewardsComponent, RewardsPrizeTextStyle, RewardsBackgroundStyle } from '../../types';

export interface RewardRowProps {
  rowData: RewardRowData;
  index: number;
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

export const RewardRow: React.FC<RewardRowProps> = React.memo(
  ({
    rowData,
    index,
    rewards,
    gcIcon,
    scIcon,
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
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        );

      case 'rr':
        return (
          <RRRow
            key={`reward-row-${index}`}
            label={rowData.label}
            rewards={rewards}
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
