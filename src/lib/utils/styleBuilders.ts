/**
 * Style building utilities for reward components
 * Cross-platform compatible (React Web + React Native future support)
 */

import { Fill, RewardsPrizeTextStyle, RewardsBackgroundStyle, RewardsButtonStyle } from '../types';

/**
 * Build CSS gradient string from Fill object
 * Handles invalid colors from Figma exports
 */
export function buildGradient(fill: Fill | undefined): string {
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
}

/**
 * Build text styles with gradient support
 * NOTE: Text shadows removed for React Native cross-platform compatibility
 */
export function buildTextStyle(
  textStyle: RewardsPrizeTextStyle | undefined,
  fontSize: number,
  scale: number
): React.CSSProperties {
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

  // NOTE: Drop shadows removed for React Native cross-platform compatibility (CLAUDE.md CIB-001.5)
  // Text shadows are not supported in React Native
  // If shadows are needed, they must be implemented using platform-specific abstractions

  return style;
}

/**
 * Build background box styles
 * Supports linear gradients only (cross-platform compatible)
 */
export function buildBoxStyle(
  bgStyle: RewardsBackgroundStyle | undefined,
  scale: number
): React.CSSProperties {
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
}

/**
 * Build button styles for different states
 */
export function buildButtonStyle(
  btnStyle: RewardsButtonStyle | undefined,
  buttonState: 'default' | 'disabled' | 'hover' | 'active',
  scale: number
): { container: React.CSSProperties; text: React.CSSProperties } {
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
}
