/**
 * PurchaseRow - Purchase offer row
 * Displays purchase offer with images and text
 */

import { RewardsBackgroundStyle, RewardsComponent, RewardsPrizeTextStyle } from '@lib-types';
import React from 'react';

export interface PurchaseRowProps {
  purchaseImage?: string;
  title?: string;
  description?: string;
  rewards: RewardsComponent | undefined;
  buildTextStyle: (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ) => React.CSSProperties;
  buildBoxStyle: (bgStyle: RewardsBackgroundStyle | undefined) => React.CSSProperties;
  scale: number;
}

export const PurchaseRow: React.FC<PurchaseRowProps> = React.memo(
  ({
    purchaseImage,
    title = 'MEGA OFFER',
    description = '150% EXTRA',
    rewards,
    buildTextStyle,
    buildBoxStyle,
    scale,
  }) => {
    const bgStyle = rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    return (
      <div
        className="result-default-box result-purchase-box"
        data-testid="result-purchase-box"
        style={buildBoxStyle(bgStyle)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${8 * scale}px ${16 * scale}px`,
            gap: `${12 * scale}px`,
          }}
        >
          {/* Left Image */}
          {purchaseImage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={purchaseImage}
                alt="Purchase offer"
                data-testid="purchase-image-left"
                style={{
                  width: `${60 * scale}px`,
                  height: `${60 * scale}px`,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Center Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: `${4 * scale}px`,
            }}
          >
            <span
              data-testid="purchase-title"
              style={buildTextStyle(
                rewards?.prizes?.texts?.purchase ?? rewards?.prizes?.texts?.fail,
                24 * scale
              )}
            >
              {title}
            </span>
            <span
              data-testid="purchase-description"
              style={buildTextStyle(
                rewards?.prizes?.texts?.purchase ?? rewards?.prizes?.texts?.fail,
                20 * scale
              )}
            >
              {description}
            </span>
          </div>

          {/* Right Image */}
          {purchaseImage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={purchaseImage}
                alt="Purchase offer"
                data-testid="purchase-image-right"
                style={{
                  width: `${60 * scale}px`,
                  height: `${60 * scale}px`,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

PurchaseRow.displayName = 'PurchaseRow';
