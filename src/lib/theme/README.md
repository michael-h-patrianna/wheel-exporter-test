# Theme System

Cross-platform design tokens for the wheel component library.

## Overview

This theme system provides a comprehensive set of design tokens that work consistently across both React (web) and React Native implementations. All tokens avoid platform-specific features that would break cross-platform compatibility.

## Usage

### Basic Import

```typescript
import { spacing, colors, borderRadius } from '@/lib/theme';

const styles = {
  padding: spacing.md,
  backgroundColor: colors.accent.primary,
  borderRadius: borderRadius.lg,
};
```

### TypeScript Types

```typescript
import type { Spacing, ColorSurface } from '@/lib/theme';

interface CardProps {
  padding?: Spacing;
  background?: ColorSurface;
}
```

## Available Tokens

### Spacing (`spacing`)
8px baseline grid for consistent spacing:
- `xs`: 4px - Minimum spacing
- `sm`: 8px - Compact spacing
- `md`: 16px - Default spacing
- `lg`: 24px - Generous spacing
- `xl`: 32px - Large spacing
- `xxl`: 48px - Extra large spacing

### Border Radius (`borderRadius`)
Consistent rounded corners:
- `sm`: 4px - Subtle
- `md`: 8px - Standard
- `lg`: 12px - Pronounced
- `xl`: 16px - Extra rounded
- `full`: 9999px - Circular

### Colors (`colors`)
Organized by purpose:
- `surface`: Background colors (primary, secondary, tertiary, dark)
- `text`: Text colors (primary, secondary, tertiary, inverse)
- `border`: Border colors (light, medium, dark)
- `semantic`: Status colors (success, warning, error, info)
- `accent`: Brand colors (primary, secondary)
- `overlay`: Transparent overlays (light, medium, dark, heavy)

### Elevation (`elevation`)
Border-based elevation system (cross-platform compatible):
- `none`: No elevation
- `low`: Subtle lift (1px border)
- `medium`: Standard lift (2px border)
- `high`: Prominent lift (4px border)

**Why borders instead of shadows?**
React Native doesn't support `box-shadow` consistently across platforms. The border-based approach provides visual hierarchy that works everywhere.

### Typography (`typography`)
Font size and line height pairs:
- `xs` to `xxl` with matching line heights
- Example: `typography.base` → `{ fontSize: 14, lineHeight: 20 }`

### Z-Index (`zIndex`)
Predefined layering to prevent conflicts:
- `background`: -1
- `base`: 0
- `raised`: 10
- `overlay`: 100
- `modal`: 1000
- `notification`: 2000
- `tooltip`: 3000

### Animation (`duration`, `easing`)
Consistent timing and motion:
- **Duration**: `instant`, `fast`, `normal`, `slow`, `verySlow` (in milliseconds)
- **Easing**: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, plus custom cubic-bezier functions

## Cross-Platform Constraints

### ✅ Safe to Use
- Transform-based animations (translate, rotate, scale)
- Opacity animations
- Color transitions
- **Linear gradients only** (via react-native-linear-gradient)
- Simple borders and border-radius

### ❌ Avoid (Web-Only)
- `box-shadow` (use `elevation` borders instead)
- Radial/conic gradients
- Blur effects or CSS filters
- `backdrop-filter`
- CSS pseudo-elements (`:before`, `:after`)
- Complex CSS selectors

## Examples

### Component with Elevation

```typescript
import { elevation, colors, borderRadius, spacing } from '@/lib/theme';

const Card = () => (
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
    Card Content
  </div>
);
```

### Semantic Colors

```typescript
import { colors, spacing, typography } from '@/lib/theme';

const StatusMessage = ({ type, message }) => {
  const colorMap = {
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
  };

  return (
    <div
      style={{
        padding: spacing.md,
        backgroundColor: colorMap[type],
        color: colors.text.inverse,
        fontSize: typography.base.fontSize,
        lineHeight: typography.base.lineHeight,
      }}
    >
      {message}
    </div>
  );
};
```

### Animation Timing

```typescript
import { duration, easing } from '@/lib/theme';

const AnimatedButton = () => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    transition={{
      duration: duration.fast / 1000, // Convert ms to seconds for Framer Motion
      ease: easing.easeOut,
    }}
  >
    Click Me
  </motion.button>
);
```

## Design Philosophy

1. **Cross-Platform First**: Every token works on both web and React Native
2. **Consistent Spacing**: 8px baseline grid for mathematical harmony
3. **Semantic Naming**: Names describe purpose, not appearance
4. **Type Safety**: Full TypeScript support with exported types
5. **No Magic Numbers**: All values centralized and documented

## Migration from Inline Styles

Before:
```typescript
const styles = {
  padding: '16px',
  backgroundColor: '#6200EE',
  borderRadius: '8px',
};
```

After:
```typescript
import { spacing, colors, borderRadius } from '@/lib/theme';

const styles = {
  padding: spacing.md,
  backgroundColor: colors.accent.primary,
  borderRadius: borderRadius.md,
};
```

## Extending the Theme

If you need to add new tokens:

1. Add to `tokens.ts` with JSDoc documentation
2. Export from `index.ts`
3. Add TypeScript type if needed
4. Update this README with examples
5. Ensure cross-platform compatibility (no web-only features)

## Related Documentation

- `docs/meta/styleguide.md` - Component coding standards
- `CLAUDE.md` [CIB-001.5] - Cross-platform requirements
- `docs/TEST_MEMORY_MANAGEMENT.md` - Testing best practices
