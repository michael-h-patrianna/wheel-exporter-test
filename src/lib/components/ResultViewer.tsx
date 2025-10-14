import { useRewardStyles } from '@hooks/useRewardStyles';
import { ExtractedAssets } from '@lib-types';
import React, { useState } from 'react';
import { ButtonState } from './renderers/ButtonRenderer';
import { NoWinView, WinFreeView, WinPurchaseView } from './result-views';
import styles from './ResultViewer.module.css';
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
export type { RewardRowData, RewardRowType } from './reward-rows';

/**
 * Result view mode types
 */
export type ResultViewMode = 'Win Free' | 'Win Purchase' | 'No Win';

interface ResultViewerProps {
  wheelData: ExtractedAssets['wheelData'];
  assets: ExtractedAssets;
  wheelWidth: number;
  wheelHeight: number;
  // Reward rows to display (in order)
  rewardRows?: RewardRowData[];
  // Button configuration
  buttonText?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  // Display options
  iconSize?: number; // Size in pixels (will be scaled)
  showButton?: boolean;
  // Result view mode (controlled by parent)
  viewMode?: ResultViewMode;
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
  buttonDisabled = false,
  onButtonClick,
  iconSize = 36,
  showButton = true,
  viewMode = 'Win Free',
}) => {
  // Button state management (follows questline-exporter-test pattern)
  const [buttonState, setButtonState] = useState<ButtonState>(
    buttonDisabled ? 'disabled' : 'default'
  );

  const frameSize = wheelData.frameSize;
  const scale = Math.min(wheelWidth / frameSize.width, wheelHeight / frameSize.height);

  const header = wheelData.header;

  // Get header success image and bounds
  const headerBounds = header?.stateBounds.success;
  const headerImage = assets.headerImages?.success;

  // Use memoized style builders from hook
  const { buildTextStyle, buildBoxStyle } = useRewardStyles(scale);

  // Update button state when disabled prop changes
  React.useEffect(() => {
    if (buttonDisabled) {
      setButtonState('disabled');
    } else if (buttonState === 'disabled') {
      setButtonState('default');
    }
  }, [buttonDisabled, buttonState]);

  // Render the appropriate view based on mode
  const renderView = () => {
    switch (viewMode) {
      case 'Win Free':
        return (
          <WinFreeView
            wheelData={wheelData}
            assets={assets}
            scale={scale}
            rewardRows={rewardRows}
            iconSize={iconSize}
            buildTextStyle={buildTextStyle}
            buildBoxStyle={buildBoxStyle}
            headerImage={headerImage}
            headerBounds={headerBounds}
            showButton={showButton}
            buttonText={buttonText}
            buttonState={buttonState}
            onButtonMouseEnter={() => !buttonDisabled && setButtonState('hover')}
            onButtonMouseLeave={() => !buttonDisabled && setButtonState('default')}
            onButtonClick={onButtonClick}
          />
        );
      case 'Win Purchase':
        return <WinPurchaseView />;
      case 'No Win':
        return <NoWinView />;
      default:
        return null;
    }
  };

  return (
    <div
      className={styles.resultViewer}
      data-testid="result-viewer"
      style={{
        width: `${wheelWidth}px`,
        minHeight: `${wheelHeight}px`,
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {renderView()}
    </div>
  );
};
