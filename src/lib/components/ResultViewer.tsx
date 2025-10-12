import React from 'react';
import { ExtractedAssets } from '../types';
import { useRewardStyles } from '../hooks/useRewardStyles';
import { RewardRow } from './reward-rows';
import type { RewardRowData } from './reward-rows';

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

// Export types for external use
export type { RewardRowType, RewardRowData } from './reward-rows';

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

  // Scale icon size
  const scaledIconSize = Math.round(iconSize * scale);

  // Use memoized style builders from hook
  const { buildTextStyle, buildBoxStyle, buildButtonStyle } = useRewardStyles(scale);

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
        {rewardRows.map((rowData, index) => (
          <RewardRow
            key={`reward-row-${index}`}
            rowData={rowData}
            index={index}
            rewards={rewards}
            gcIcon={assets.rewardsPrizeImages?.gc}
            scIcon={assets.rewardsPrizeImages?.sc}
            scaledIconSize={scaledIconSize}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            scale={scale}
          />
        ))}

        {/* Collect Button */}
        {showButton && rewards?.button?.stateStyles?.[buttonState] && (
          <div className="result-button-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button
              className={`result-button result-button-${buttonState}`}
              style={buildButtonStyle(rewards.button.stateStyles[buttonState], buttonState).container}
              onClick={onButtonClick}
              disabled={buttonState === 'disabled'}
            >
              <span style={buildButtonStyle(rewards.button.stateStyles[buttonState], buttonState).text}>
                {buttonText}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
