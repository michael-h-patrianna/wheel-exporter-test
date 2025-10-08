import React, { useCallback } from 'react';
import { ExtractedAssets, Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle, RewardsButtonStyle } from '../types';

/**
 * ResultViewer Component - Renders the reward/result view using theme data from Figma plugin export
 *
 * ⚠️ IMPORTANT: If backgrounds don't show, check positions.json backgrounds.highlight and
 * backgrounds.default for transparent colors (#00000000). The Figma plugin may export
 * transparent backgrounds by default. Set proper colors/gradients in Figma before exporting.
 *
 * ✅ BACKGROUND STYLING: This component fully supports:
 * - Solid color fills and linear gradients
 * - Border radius and strokes (borders)
 * - Drop shadows (box-shadow for backgrounds, applied with scaling)
 * - Automatic selection of highlight vs default backgrounds based on row type
 *
 * ===================================================================================
 * POSITIONS.JSON → VISUAL STYLE MAPPING DOCUMENTATION
 * ===================================================================================
 *
 * REWARDS STRUCTURE:
 * positions.json contains a `rewards` object with three main sections:
 *
 * 1. backgrounds: Defines container styles for prize displays
 *    - backgrounds.highlight: Style for highlighted prizes (e.g., GC + SC combination)
 *    - backgrounds.default: Style for standard prizes (e.g., free spins)
 *
 * 2. button: Defines button styles for user interaction
 *    - button.stateStyles.default: Normal button appearance
 *    - button.stateStyles.disabled: Disabled state (grayed out)
 *    - button.stateStyles.hover: Mouse hover state
 *    - button.stateStyles.active: Pressed/active state
 *
 * 3. prizes: Defines content styles (text and images)
 *    - prizes.texts: Text styling for various prize types
 *    - prizes.images: Image assets for prize icons
 *
 * ===================================================================================
 * BACKGROUND STYLE PROPERTIES (RewardsBackgroundStyle):
 * ===================================================================================
 *
 * Property: borderRadius (number)
 * → CSS: border-radius (scaled)
 * → Purpose: Rounds container corners
 *
 * Property: backgroundFill (Fill)
 * → CSS: background (solid) or background-image (gradient)
 * → Purpose: Container background color/gradient
 * → Types:
 *   - solid: { type: 'solid', color: '#RRGGBBAA' }
 *   - gradient: { type: 'gradient', gradient: { type, rotation, stops[] } }
 *
 * Property: padding.vertical / padding.horizontal (number)
 * → CSS: padding (scaled)
 * → Purpose: Inner spacing around content
 *
 * Property: dimensions.width / dimensions.height (number)
 * → CSS: width / min-height (scaled)
 * → Purpose: Container size constraints
 *
 * Property: stroke.width (number), stroke.color (string)
 * → CSS: border (scaled width + color)
 * → Purpose: Container border/outline
 *
 * Property: dropShadows[] (array of {x, y, blur, spread, color})
 * → CSS: box-shadow (scaled, multiple shadows supported)
 * → Purpose: Container shadow effects
 *
 * ===================================================================================
 * BUTTON STYLE PROPERTIES (RewardsButtonStyle):
 * ===================================================================================
 *
 * Property: frame.borderRadius (number)
 * → CSS: border-radius (scaled)
 *
 * Property: frame.backgroundFill (Fill)
 * → CSS: background / background-image
 * → Same structure as background fills above
 *
 * Property: frame.dimensions.width / frame.dimensions.height (number)
 * → CSS: width / height (scaled)
 *
 * Property: frame.padding.vertical / frame.padding.horizontal (number)
 * → CSS: padding (scaled)
 *
 * Property: frame.stroke.width / frame.stroke.color
 * → CSS: border (scaled)
 *
 * Property: frame.dropShadows[]
 * → CSS: box-shadow (scaled)
 *
 * Property: text.fontSize (number)
 * → CSS: font-size (scaled)
 *
 * Property: text.color (string)
 * → CSS: color
 *
 * Property: text.fontWeight (number)
 * → CSS: font-weight
 *
 * Property: text.lineHeightPx (number)
 * → CSS: line-height (scaled)
 *
 * ===================================================================================
 * TEXT STYLE PROPERTIES (RewardsPrizeTextStyle):
 * ===================================================================================
 *
 * Property: fill (Fill)
 * → CSS:
 *   - solid: color property
 *   - gradient: background-image + background-clip: text + -webkit-text-fill-color: transparent
 * → Purpose: Text color or gradient fill
 *
 * Property: stroke.width (number), stroke.color (string)
 * → CSS: -webkit-text-stroke (scaled width + color)
 * → Purpose: Text outline/border
 *
 * Property: dropShadows[] (array of {x, y, blur, color})
 * → CSS: text-shadow (scaled, multiple shadows supported)
 * → Purpose: Text shadow effects (no spread property for text)
 *
 * ===================================================================================
 * PRIZE TEXT STYLE KEYS (prizes.texts.*):
 * ===================================================================================
 *
 * - gcTitle: Gold Coins title text style
 * - gcValue: Gold Coins value text style
 * - scTitle: Sweeps Coins title text style
 * - scValue: Sweeps Coins value text style
 * - plus: Plus sign connector style
 * - freeSpins: Free spins text style (legacy, use specific ones below)
 * - freeSpinsValue: Free spins numeric value style
 * - freeSpinsLabel: Free spins label text style
 * - xp: Experience points text style
 * - rr: Risk/reward text style
 * - fail: Failure state text style
 * - [custom]: Any custom prize type key
 *
 * ===================================================================================
 * IMAGE PROPERTIES (prizes.images.*):
 * ===================================================================================
 *
 * Property: img (string)
 * → Purpose: Filename reference for prize icon
 * → Loaded via: assets.rewardsPrizeImages[key]
 * → Note: Dimensions not exported by Figma plugin, must be sized appropriately
 *
 * Common keys:
 * - gc: Gold Coins icon
 * - sc: Sweeps Coins icon
 * - purchase: Purchase/shopping icon
 * - [custom]: Any custom prize icon key
 *
 * ===================================================================================
 * GRADIENT RENDERING:
 * ===================================================================================
 *
 * Gradients are rendered using CSS linear-gradient with rotation and color stops:
 *
 * gradient: {
 *   type: 'linear',           // Only linear supported in result view
 *   rotation: 183,             // Degrees (0-360)
 *   stops: [                   // Array of color stops
 *     { color: '#ffd671', position: 0 },      // Start color at 0%
 *     { color: '#ff8800', position: 1 }       // End color at 100%
 *   ]
 * }
 *
 * → CSS: linear-gradient(183deg, #ffd671 0%, #ff8800 100%)
 *
 * For text gradients, additional properties are applied:
 * - background-image: linear-gradient(...)
 * - -webkit-background-clip: text
 * - -webkit-text-fill-color: transparent
 * - background-clip: text
 *
 * ===================================================================================
 * SCALING:
 * ===================================================================================
 *
 * All dimensions from positions.json are in the original Figma frame coordinate space.
 * They must be scaled based on the target render dimensions:
 *
 * scale = min(wheelWidth / frameSize.width, wheelHeight / frameSize.height)
 *
 * Apply scaling to:
 * - borderRadius
 * - padding values
 * - dimension values
 * - stroke widths
 * - shadow offsets, blur, and spread
 * - fontSize and lineHeight
 *
 * ===================================================================================
 */

/**
 * Reward row types supported by the Figma plugin:
 * - gcsc: Gold Coins + Sweeps Coins combo (uses backgrounds.highlight)
 * - freeSpins: Free spins reward (uses backgrounds.default)
 * - xp: Experience points reward (uses backgrounds.default)
 * - rr: Random reward (uses backgrounds.default)
 * - fail: Fail/loss state (uses backgrounds.default)
 */
export type RewardRowType = 'gcsc' | 'freeSpins' | 'xp' | 'rr' | 'fail';

export interface RewardRowData {
  type: RewardRowType;
  gcValue?: string;      // For 'gcsc' type
  scValue?: string;      // For 'gcsc' type
  value?: string;        // For 'freeSpins', 'xp', 'rr' types
  label?: string;        // Optional custom label
  message?: string;      // For 'fail' type
}

interface ResultViewerProps {
  wheelData: ExtractedAssets['wheelData'];
  assets: ExtractedAssets;
  wheelWidth: number;
  wheelHeight: number;
  // Reward rows to display (in order)
  rewardRows?: RewardRowData[];
  // Button configuration
  buttonText?: string;
  buttonState?: 'default' | 'disabled' | 'hover' | 'active';
  onButtonClick?: () => void;
  // Display options
  iconSize?: number; // Size in pixels (will be scaled)
  showButton?: boolean;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  wheelData,
  assets,
  wheelWidth,
  wheelHeight,
  rewardRows = [
    { type: 'gcsc', gcValue: '25.5K', scValue: '50' },
    { type: 'freeSpins', value: '10' },
    { type: 'xp', value: '100', label: 'XP' },
    { type: 'rr', label: 'RANDOM REWARD' },
  ],
  buttonText = 'COLLECT',
  buttonState = 'default',
  onButtonClick,
  iconSize = 36,
  showButton = true,
}) => {
  const frameSize = wheelData.frameSize;
  const scale = Math.min(wheelWidth / frameSize.width, wheelHeight / frameSize.height);

  const rewards = wheelData.rewards;
  const header = wheelData.header;

  // Get header success image and bounds
  const headerBounds = header?.stateBounds.success;
  const headerImage = assets.headerImages?.success;

  // Reward prize images are accessed directly in render functions below

  // Scale icon size
  const scaledIconSize = Math.round(iconSize * scale);

  // Helper function to build CSS gradient (memoized for performance)
  const buildGradient = useCallback((fill: Fill | undefined): string => {
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
  }, []);

  // Helper function to build text styles with gradient support (memoized)
  const buildTextStyle = useCallback((
    textStyle: RewardsPrizeTextStyle | undefined,
    fontSize: number
  ): React.CSSProperties => {
    if (!textStyle) return {};

    const style: React.CSSProperties = {
      fontSize: `${Math.round(fontSize)}px`,
      lineHeight: `${Math.round(fontSize)}px`,
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

    // Handle stroke (scaled)
    if (textStyle.stroke) {
      const strokeWidth = Math.round((textStyle.stroke.width ?? 0) * scale);
      style.WebkitTextStroke = `${strokeWidth}px ${textStyle.stroke.color}`;
    }

    // NOTE: Drop shadows removed for React Native cross-platform compatibility
    // Text shadows are not supported in React Native (per CLAUDE.md CIB-001.5)
    // If shadows are needed, they must be implemented using platform-specific abstractions

    return style;
  }, [scale, buildGradient]);

  // Helper function to build background box styles (memoized)
  const buildBoxStyle = useCallback((
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

    // Handle drop shadows (scaled)
    if (bgStyle.dropShadows && bgStyle.dropShadows.length > 0) {
      style.boxShadow = bgStyle.dropShadows
        .map((shadow) => {
          const x = Math.round(shadow.x * scale);
          const y = Math.round(shadow.y * scale);
          const blur = Math.round(shadow.blur * scale);
          const spread = Math.round(shadow.spread * scale);
          return `${x}px ${y}px ${blur}px ${spread}px ${shadow.color}`;
        })
        .join(', ');
    }

    return style;
  }, [scale, buildGradient]);

  // Helper function to build button styles (memoized)
  const buildButtonStyle = useCallback((
    btnStyle: RewardsButtonStyle | undefined
  ): { container: React.CSSProperties; text: React.CSSProperties } => {
    if (!btnStyle) {
      return {
        container: {},
        text: {},
      };
    }

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      cursor: buttonState === 'disabled' ? 'not-allowed' : 'pointer',
      borderRadius: `${Math.round(btnStyle.frame.borderRadius * scale)}px`,
      padding: `${Math.round(btnStyle.frame.padding.vertical * scale)}px ${Math.round(btnStyle.frame.padding.horizontal * scale)}px`,
      background: buildGradient(btnStyle.frame.backgroundFill),
      transition: 'all 0.2s ease',
    };

    // Apply dimensions if provided
    if (btnStyle.frame.dimensions) {
      containerStyle.width = `${Math.round(btnStyle.frame.dimensions.width * scale)}px`;
      containerStyle.height = `${Math.round(btnStyle.frame.dimensions.height * scale)}px`;
    }

    // Handle stroke
    if (btnStyle.frame.stroke && btnStyle.frame.stroke.width > 0) {
      containerStyle.border = `${Math.round(btnStyle.frame.stroke.width * scale)}px solid ${btnStyle.frame.stroke.color}`;
    }

    // Handle drop shadows (scaled)
    if (btnStyle.frame.dropShadows && btnStyle.frame.dropShadows.length > 0) {
      containerStyle.boxShadow = btnStyle.frame.dropShadows
        .map((shadow) => {
          const x = Math.round(shadow.x * scale);
          const y = Math.round(shadow.y * scale);
          const blur = Math.round(shadow.blur * scale);
          const spread = Math.round(shadow.spread * scale);
          return `${x}px ${y}px ${blur}px ${spread}px ${shadow.color}`;
        })
        .join(', ');
    }

    const textStyle: React.CSSProperties = {
      fontSize: `${Math.round(btnStyle.text.fontSize * scale)}px`,
      color: btnStyle.text.color,
      fontWeight: btnStyle.text.fontWeight,
      lineHeight: btnStyle.text.lineHeightPx
        ? `${Math.round(btnStyle.text.lineHeightPx * scale)}px`
        : 'normal',
      textAlign: 'center',
    };

    return {
      container: containerStyle,
      text: textStyle,
    };
  }, [scale, buttonState, buildGradient]);

  // Helper function to render a single reward row
  const renderRewardRow = (rowData: RewardRowData, index: number) => {
    const { type } = rowData;

    // Determine which background style to use
    const bgStyle = type === 'gcsc' ? rewards?.backgrounds?.highlight : rewards?.backgrounds?.default;

    if (!bgStyle) return null;

    // Render different content based on row type
    switch (type) {
      case 'gcsc':
        // GC + SC combo row
        return (
          <div key={`reward-row-${index}`} className="result-highlight-box" style={buildBoxStyle(bgStyle)}>
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
              {assets.rewardsPrizeImages?.gc && (
                <img
                  src={assets.rewardsPrizeImages.gc}
                  alt="GC"
                  style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px`, flexShrink: 0 }}
                />
              )}

              {/* GC Text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={buildTextStyle(rewards?.prizes?.texts?.gcTitle, 14 * scale)}>GC</span>
                <span style={buildTextStyle(rewards?.prizes?.texts?.gcValue, 18 * scale)}>{rowData.gcValue || '0'}</span>
              </div>

              {/* Plus */}
              <span style={buildTextStyle(rewards?.prizes?.texts?.plus, 19 * scale)}>+</span>

              {/* SC Icon */}
              {assets.rewardsPrizeImages?.sc && (
                <img
                  src={assets.rewardsPrizeImages.sc}
                  alt="SC"
                  style={{ width: `${scaledIconSize}px`, height: `${scaledIconSize}px`, flexShrink: 0 }}
                />
              )}

              {/* SC Text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={buildTextStyle(rewards?.prizes?.texts?.scTitle, 14 * scale)}>SC</span>
                <span style={buildTextStyle(rewards?.prizes?.texts?.scValue, 18 * scale)}>{rowData.scValue || '0'}</span>
              </div>
            </div>
          </div>
        );

      case 'freeSpins':
        // Free spins row
        return (
          <div key={`reward-row-${index}`} className="result-default-box result-freespins-box" style={buildBoxStyle(bgStyle)}>
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
                {rowData.value || '0'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={buildTextStyle(
                    rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                    14 * scale
                  )}
                >
                  {rowData.label?.split(' ')[0] || 'FREE'}
                </span>
                <span
                  style={buildTextStyle(
                    rewards?.prizes?.texts?.freeSpinsLabel ?? rewards?.prizes?.texts?.freeSpins,
                    14 * scale
                  )}
                >
                  {rowData.label?.split(' ')[1] || 'SPINS'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'xp':
        // XP row
        return (
          <div key={`reward-row-${index}`} className="result-default-box result-xp-box" style={buildBoxStyle(bgStyle)}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={buildTextStyle(rewards?.prizes?.texts?.xp, 24 * scale)}>
                {rowData.value || '0'}
              </span>
              <span style={buildTextStyle(rewards?.prizes?.texts?.xp, 18 * scale)}>
                {rowData.label || 'XP'}
              </span>
            </div>
          </div>
        );

      case 'rr':
        // Random Reward row
        return (
          <div key={`reward-row-${index}`} className="result-default-box result-rr-box" style={buildBoxStyle(bgStyle)}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={buildTextStyle(rewards?.prizes?.texts?.rr, 20 * scale)}>
                {rowData.label || 'RANDOM REWARD'}
              </span>
            </div>
          </div>
        );

      case 'fail':
        // Fail/loss row
        return (
          <div key={`reward-row-${index}`} className="result-default-box result-fail-box" style={buildBoxStyle(bgStyle)}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={buildTextStyle(rewards?.prizes?.texts?.fail, 20 * scale)}>
                {rowData.message || 'TRY AGAIN'}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
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

        {/* Reward Rows */}
        {rewardRows.map((rowData, index) => renderRewardRow(rowData, index))}

        {/* Collect Button */}
        {showButton && rewards?.button?.stateStyles?.[buttonState] && (
          <div className="result-button-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button
              className={`result-button result-button-${buttonState}`}
              style={buildButtonStyle(rewards.button.stateStyles[buttonState]).container}
              onClick={onButtonClick}
              disabled={buttonState === 'disabled'}
            >
              <span style={buildButtonStyle(rewards.button.stateStyles[buttonState]).text}>
                {buttonText}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
