/**
 * Example Usage of Theme Tokens
 *
 * This file demonstrates how to properly import and use theme tokens
 * in your components. These examples work identically on both web and
 * React Native (with appropriate platform-specific wrappers).
 *
 * NOTE: This is a reference file for developers. It's not imported
 * by the actual component library.
 */

import React from 'react';
import {
  spacing,
  colors,
  borderRadius,
  elevation,
  typography,
  duration,
  easing,
} from './index';

/**
 * Example 1: Basic Card with Elevation
 * Demonstrates border-based elevation instead of box-shadow
 */
export const ExampleCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      style={{
        padding: spacing.lg,
        backgroundColor: colors.surface.primary,
        borderRadius: borderRadius.lg,
        borderWidth: elevation.medium.borderWidth,
        borderColor: elevation.medium.borderColor,
        borderStyle: 'solid',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Example 2: Status Badge with Semantic Colors
 * Shows how to use semantic colors for feedback
 */
export const StatusBadge: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}> = ({ status, label }) => {
  const colorMap = {
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${spacing.xs}px ${spacing.sm}px`,
        backgroundColor: colorMap[status],
        color: colors.text.inverse,
        borderRadius: borderRadius.full,
        fontSize: typography.sm.fontSize,
        lineHeight: `${typography.sm.lineHeight}px`,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
};

/**
 * Example 3: Button with Hover Animation
 * Demonstrates proper animation timing with theme tokens
 */
export const ThemedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: `${spacing.sm}px ${spacing.md}px`,
        backgroundColor: isHovered
          ? colors.accent.primary
          : colors.accent.secondary,
        color: colors.text.inverse,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: typography.base.fontSize,
        cursor: 'pointer',
        transition: `all ${duration.fast}ms ${easing.easeOut}`,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  );
};

/**
 * Example 4: Input Field with Consistent Styling
 * Shows spacing, typography, and border usage
 */
export const ThemedInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}> = ({ placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        padding: spacing.sm,
        backgroundColor: colors.surface.secondary,
        color: colors.text.primary,
        border: `${elevation.low.borderWidth}px solid ${elevation.low.borderColor}`,
        borderRadius: borderRadius.md,
        fontSize: typography.base.fontSize,
        lineHeight: `${typography.base.lineHeight}px`,
        outline: 'none',
        transition: `border-color ${duration.fast}ms ${easing.ease}`,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.accent.primary;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = elevation.low.borderColor;
      }}
    />
  );
};

/**
 * Example 5: Overlay Modal
 * Demonstrates overlay colors and z-index usage
 */
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.overlay.dark,
          zIndex: 1000, // Note: using literal for demonstration, use zIndex.modal in production
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.surface.primary,
          padding: spacing.xl,
          borderRadius: borderRadius.xl,
          borderWidth: elevation.high.borderWidth,
          borderColor: elevation.high.borderColor,
          borderStyle: 'solid',
          zIndex: 1001, // Note: using literal for demonstration
          maxWidth: '500px',
          width: '90%',
        }}
      >
        {children}
      </div>
    </>
  );
};

/**
 * Example 6: Typography Hierarchy
 * Shows consistent text sizing across the app
 */
export const TextHierarchy: React.FC = () => {
  return (
    <div style={{ padding: spacing.lg }}>
      <h1
        style={{
          fontSize: typography.xxl.fontSize,
          lineHeight: `${typography.xxl.lineHeight}px`,
          color: colors.text.primary,
          marginBottom: spacing.md,
        }}
      >
        Heading 1
      </h1>

      <h2
        style={{
          fontSize: typography.xl.fontSize,
          lineHeight: `${typography.xl.lineHeight}px`,
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        Heading 2
      </h2>

      <p
        style={{
          fontSize: typography.base.fontSize,
          lineHeight: `${typography.base.lineHeight}px`,
          color: colors.text.secondary,
          marginBottom: spacing.sm,
        }}
      >
        This is body text using the base typography scale.
      </p>

      <small
        style={{
          fontSize: typography.sm.fontSize,
          lineHeight: `${typography.sm.lineHeight}px`,
          color: colors.text.tertiary,
        }}
      >
        This is small text for captions and footnotes.
      </small>
    </div>
  );
};

/**
 * Example 7: With TypeScript Types
 * Shows how to use theme types for props
 */
interface SpacerProps {
  /** Spacing size from theme */
  size?: keyof typeof spacing;
  /** Direction of spacing */
  direction?: 'horizontal' | 'vertical';
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  direction = 'vertical',
}) => {
  const spacingValue = spacing[size];

  return (
    <div
      style={{
        width: direction === 'horizontal' ? spacingValue : 1,
        height: direction === 'vertical' ? spacingValue : 1,
      }}
    />
  );
};

/**
 * REACT NATIVE COMPATIBILITY NOTES
 *
 * These examples use React (web) syntax, but the same tokens work in React Native:
 *
 * Web:
 * ```typescript
 * <div style={{ padding: spacing.md }}>
 * ```
 *
 * React Native:
 * ```typescript
 * <View style={{ padding: spacing.md }}>
 * ```
 *
 * The tokens themselves (spacing.md, colors.accent.primary, etc.) are identical!
 *
 * IMPORTANT: For web-specific enhancements like box-shadow, use platform detection:
 *
 * ```typescript
 * import { Platform } from 'react-native';
 *
 * const styles = {
 *   ...elevation.medium, // Base border styling (cross-platform)
 *   ...(Platform.OS === 'web' && {
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Web enhancement
 *   }),
 * };
 * ```
 */
