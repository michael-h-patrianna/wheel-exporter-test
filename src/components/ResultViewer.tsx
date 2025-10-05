import React from 'react';
import { ExtractedAssets, Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle } from '../types';

interface ResultViewerProps {
  wheelData: ExtractedAssets['wheelData'];
  assets: ExtractedAssets;
  wheelWidth: number;
  wheelHeight: number;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  wheelData,
  assets,
  wheelWidth,
  wheelHeight,
}) => {
  const frameSize = wheelData.frameSize;
  const scale = Math.min(wheelWidth / frameSize.width, wheelHeight / frameSize.height);

  const rewards = wheelData.rewards;
  const header = wheelData.header;

  // Get header success image and bounds
  const headerBounds = header?.stateBounds.success;
  const headerImage = assets.headerImages?.success;

  // Get reward prize images
  const gcImage = assets.rewardsPrizeImages?.gc;
  const scImage = assets.rewardsPrizeImages?.sc;

  // Helper function to build CSS gradient
  const buildGradient = (fill: Fill | undefined): string => {
    if (!fill) return 'transparent';

    if (fill.type === 'solid') {
      const color = fill.color || 'transparent';
      // Handle invalid colors from Figma (e.g., #NaNNaNNaNNaN)
      if (color.includes('NaN')) {
        return 'transparent';
      }
      return color;
    } else if (fill.type === 'gradient' && fill.gradient) {
      const stops = fill.gradient.stops
        .map((stop) => {
          // Handle invalid colors in gradient stops
          const color = stop.color.includes('NaN') ? 'transparent' : stop.color;
          return `${color} ${Math.round(stop.position * 100)}%`;
        })
        .join(', ');
      const angle = fill.gradient.rotation ?? 0;
      return `linear-gradient(${angle}deg, ${stops})`;
    }
    return 'transparent';
  };

  // Helper function to build text styles with gradient support
  const buildTextStyle = (
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ): React.CSSProperties => {
    if (!textStyle) return {};

    const style: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      lineHeight: `${fontSize}px`,
      fontWeight: 600,
      textAlign: 'center',
      display: 'block',
    };

    // Handle fill (solid or gradient)
    if (textStyle.fill.type === 'solid') {
      style.color = textStyle.fill.color || '#ffffff';
    } else if (textStyle.fill.type === 'gradient' && textStyle.fill.gradient) {
      const gradient = buildGradient(textStyle.fill);
      style.backgroundImage = gradient;
      style.WebkitBackgroundClip = 'text';
      style.WebkitTextFillColor = 'transparent';
      style.backgroundClip = 'text';
      style.color = 'transparent';
    }

    // Handle stroke
    if (textStyle.stroke) {
      const strokeWidth = textStyle.stroke.width ?? 0;
      style.WebkitTextStroke = `${strokeWidth}px ${textStyle.stroke.color}`;
    }

    // Handle drop shadows
    if (textStyle.dropShadows && textStyle.dropShadows.length > 0) {
      const shadows = textStyle.dropShadows
        .map((shadow) => {
          const x = Math.round(shadow.x ?? 0);
          const y = Math.round(shadow.y ?? 0);
          const blur = Math.round(shadow.blur ?? 0);
          return `${x}px ${y}px ${blur}px ${shadow.color}`;
        })
        .join(', ');
      style.textShadow = shadows;
    }

    return style;
  };

  // Helper function to build background box styles
  const buildBoxStyle = (
    bgStyle: RewardsBackgroundStyle | undefined
  ): React.CSSProperties => {
    if (!bgStyle) return {};

    const style: React.CSSProperties = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderRadius: `${Math.round(bgStyle.borderRadius * scale)}px`,
      padding: `${Math.round((bgStyle.padding?.vertical ?? 0) * scale)}px ${Math.round((bgStyle.padding?.horizontal ?? 0) * scale)}px`,
      minHeight: `${Math.round((bgStyle.dimensions?.height || 60) * scale)}px`,
      background: buildGradient(bgStyle.backgroundFill),
    };

    // Handle stroke
    if (bgStyle.stroke && bgStyle.stroke.width > 0) {
      style.border = `${Math.round(bgStyle.stroke.width * scale)}px solid ${bgStyle.stroke.color}`;
    }

    // Handle drop shadows
    if (bgStyle.dropShadows && bgStyle.dropShadows.length > 0) {
      const shadows = bgStyle.dropShadows
        .map((shadow) => {
          const x = Math.round(shadow.x * scale);
          const y = Math.round(shadow.y * scale);
          const blur = Math.round(shadow.blur * scale);
          const spread = Math.round(shadow.spread * scale);
          return `${x}px ${y}px ${blur}px ${spread}px ${shadow.color}`;
        })
        .join(', ');
      style.boxShadow = shadows;
    }

    return style;
  };

  return (
    <div
      className="result-viewer"
      style={{
        width: `${wheelWidth}px`,
        height: `${wheelHeight}px`,
        position: 'relative',
        margin: '0 auto',
      }}
    >
      <div
        className="result-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Header - Success State */}
        {headerImage && headerBounds && (
          <div className="result-header" style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={headerImage}
              alt="Result header"
              style={{
                width: `${Math.round(headerBounds.w * scale)}px`,
                height: `${Math.round(headerBounds.h * scale)}px`,
                maxWidth: '100%',
              }}
            />
          </div>
        )}

        {/* Highlight Row - GC + SC */}
        {rewards?.backgrounds?.highlight && (
          <div className="result-highlight-box" style={buildBoxStyle(rewards.backgrounds.highlight)}>
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
              {gcImage && (
                <img
                  src={gcImage}
                  alt="GC"
                  style={{ width: '36px', height: '36px', flexShrink: 0 }}
                />
              )}

              {/* GC Text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={buildTextStyle(rewards.prizes?.texts?.gcTitle, 14)}>GC</span>
                <span style={buildTextStyle(rewards.prizes?.texts?.gcValue, 18)}>25.5K</span>
              </div>

              {/* Plus */}
              <span style={buildTextStyle(rewards.prizes?.texts?.plus, 19)}>+</span>

              {/* SC Icon */}
              {scImage && (
                <img
                  src={scImage}
                  alt="SC"
                  style={{ width: '36px', height: '36px', flexShrink: 0 }}
                />
              )}

              {/* SC Text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={buildTextStyle(rewards.prizes?.texts?.scTitle, 14)}>SC</span>
                <span style={buildTextStyle(rewards.prizes?.texts?.scValue, 18)}>50</span>
              </div>
            </div>
          </div>
        )}

        {/* Free Spins Row */}
        {rewards?.backgrounds?.default && (
          <div className="result-default-box" style={buildBoxStyle(rewards.backgrounds.default)}>
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
                  rewards.prizes?.texts?.freeSpinsValue ?? rewards.prizes?.texts?.freeSpins,
                  24
                )}
              >
                10
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={buildTextStyle(
                    rewards.prizes?.texts?.freeSpinsLabel ?? rewards.prizes?.texts?.freeSpins,
                    14
                  )}
                >
                  FREE
                </span>
                <span
                  style={buildTextStyle(
                    rewards.prizes?.texts?.freeSpinsLabel ?? rewards.prizes?.texts?.freeSpins,
                    14
                  )}
                >
                  SPINS
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
