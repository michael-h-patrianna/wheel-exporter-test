# 4. Use Strategy Pattern for Segment Layout Types

**Date:** 2025-10-12

**Status:** Accepted

**Context:** [ADR-002 Memoization Strategy in SegmentRenderer](002-memoization-strategy-segment-renderer.md)

## Context and Problem Statement

Wheel segments display diverse prize types with varying content:
- **Purchase offers:** Image only (offer icon)
- **Random rewards:** Image only (mystery box icon)
- **Jackpot prizes:** Image only (jackpot icon)
- **XP prizes:** Text on top + XP icon below
- **Currency prizes (GC/SC):** Two-line text (amount + currency)
- **Free spins:** Two-line text (count + "Free Spins")
- **No win:** Two-line text ("NO" + "WIN")

The current implementation ("original layout") uses conditional logic to select between three sub-layouts. Future designs may require completely different layout strategies (e.g., horizontal text, icon grids, minimalist, maximalist).

How should we structure the code to support multiple layout strategies while maintaining performance, testability, and extensibility?

## Decision Drivers

* Need to support the current "original" layout with three sub-layouts
* Requirement for future layout variants (design iterations, A/B testing)
* Must maintain memoization and performance optimizations
* Should be easy to add new layouts without modifying existing code
* Type safety for layout implementations
* Clear separation between layout logic and rendering infrastructure
* Support for layout selection at runtime (via props)

## Considered Options

* **Option 1:** Strategy pattern with dedicated layout components
* **Option 2:** Conditional rendering within single component
* **Option 3:** Configuration-driven layout system
* **Option 4:** Template-based rendering with slots

## Decision Outcome

Chosen option: "Strategy pattern with dedicated layout components", because it provides the best combination of extensibility, maintainability, and performance while keeping the implementation straightforward.

### Positive Consequences

* **Extensibility:** New layouts can be added without modifying existing code
* **Type safety:** TypeScript ensures layouts implement required interface
* **Testability:** Each layout can be tested in isolation
* **Maintainability:** Layout logic is isolated in dedicated files
* **Performance:** Memoization works per-layout, not globally
* **Clear intent:** Layout choice is explicit via `layoutType` prop
* **Discovery:** All layouts registered in `SEGMENT_LAYOUTS` array

### Negative Consequences

* Slightly more complex file structure (multiple layout files)
* Need to maintain common interface across layouts
* Potential code duplication between similar layouts
* Requires understanding of strategy pattern

## Pros and Cons of the Options

### Option 1: Strategy pattern with dedicated layout components

Implementation:
- Type definition: `src/lib/types/segmentLayoutTypes.ts`
- Original layout: `src/lib/components/renderers/layouts/OriginalLayout.tsx`
- Integration: `src/lib/components/renderers/SegmentRenderer.tsx` (lines 610-632)

**Type System (segmentLayoutTypes.ts):**

```typescript
export type SegmentLayoutType = 'original';  // lines 17-18

export interface SegmentLayoutProps {        // lines 23-44
  segment: { ... };
  styles: WheelSegmentTypeStyles;
  cx: number;
  cy: number;
  outerRadius: number;
  segmentAngle: number;
  scale: number;
  jackpotImageUrl?: string;
  purchaseImageUrl?: string;
}

export const SEGMENT_LAYOUTS: SegmentLayoutInfo[] = [  // lines 61-67
  {
    id: 'original',
    name: 'Original',
    description: 'Mixed layout with text and images based on prize type'
  }
];
```

**Layout Integration (SegmentRenderer.tsx, lines 610-632):**

```typescript
const contentElements = useMemo(() => {
  const layoutProps = {
    segment,
    styles,
    cx,
    cy,
    outerRadius,
    segmentAngle,
    scale,
    jackpotImageUrl,
    purchaseImageUrl
  };

  switch (layoutType) {
    case 'original':
    default:
      return <OriginalLayout {...layoutProps} />;
  }
}, [segment, styles, cx, cy, outerRadius, segmentAngle, scale, jackpotImageUrl, purchaseImageUrl, layoutType]);
```

**Original Layout Implementation (OriginalLayout.tsx):**

Three sub-layout components:
1. **SegmentImageOnly** (lines 26-55): Purchase/random reward/jackpot
2. **SegmentTextWithImage** (lines 58-165): XP prizes with icon
3. **SegmentTwoLineText** (lines 168-285): All other prizes

Main component routes to appropriate sub-layout (lines 303-368):

```typescript
export const OriginalLayout: React.FC<SegmentLayoutProps> = (props) => {
  const contentElements = useMemo(() => {
    const prizeSegment = segment.prizeSegment;

    // Layout 1: Image Only
    if (prizeSegment?.usePurchaseImage) {
      return <SegmentImageOnly ... />;
    }

    // Layout 2: Text with Image Below
    if (prizeSegment?.useXpImage) {
      return <SegmentTextWithImage ... />;
    }

    // Layout 3: Two Line Text
    return <SegmentTwoLineText ... />;
  }, [segment, styles, ...]);

  return <>{contentElements}</>;
};
```

* Good, because adding new layout is isolated (create new file, add to switch)
* Good, because layouts can share sub-components or diverge completely
* Good, because type system enforces consistent interface
* Good, because memoization works naturally with component boundaries
* Good, because easy to test layouts independently
* Good, because `SEGMENT_LAYOUTS` provides layout metadata for UI
* Bad, because requires multiple files for multiple layouts
* Bad, because some boilerplate (type definitions, registration)

### Option 2: Conditional rendering within single component

Example approach: All layout logic in SegmentRenderer with if/else

* Good, because everything in one file
* Good, because no abstraction overhead
* Bad, because becomes unmaintainable with multiple layouts
* Bad, because difficult to test layouts in isolation
* Bad, because mixing infrastructure with layout logic
* Bad, because adding layouts requires modifying existing code
* Bad, because high risk of breaking existing layouts when adding new ones

### Option 3: Configuration-driven layout system

Example: JSON/object configuration describing layouts

```typescript
const LAYOUTS = {
  imageOnly: {
    components: ['image'],
    positions: { image: { radius: 0.62, size: 0.55 } }
  },
  // ...
}
```

* Good, because potentially more flexible
* Good, because could support runtime configuration
* Bad, because loses type safety
* Bad, because complex configuration schema needed
* Bad, because less readable than code
* Bad, because difficult to support complex logic (conditionals, calculations)
* Bad, because harder to debug

### Option 4: Template-based rendering with slots

Example: Layout defines "slots" that are filled with content

* Good, because clear separation of structure and content
* Good, because potentially more reusable
* Bad, because added abstraction layer
* Bad, because may not fit all layout needs
* Bad, because more complex mental model
* Bad, because premature optimization (only one layout currently exists)

## Links

* Related: [ADR-002 Memoization Strategy](002-memoization-strategy-segment-renderer.md)
* Type definitions: `src/lib/types/segmentLayoutTypes.ts`
* Layout implementation: `src/lib/components/renderers/layouts/OriginalLayout.tsx`
* Integration point: `src/lib/components/renderers/SegmentRenderer.tsx`
* Prize mapping: `src/lib/utils/prizeSegmentMapper.ts`

## Implementation Notes

### Adding a New Layout Strategy

To add a new layout (e.g., "compact" layout):

**1. Add type to `segmentLayoutTypes.ts`:**

```typescript
export type SegmentLayoutType =
  | 'original'
  | 'compact';  // Add new type

export const SEGMENT_LAYOUTS: SegmentLayoutInfo[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Mixed layout with text and images based on prize type'
  },
  {
    id: 'compact',  // Register new layout
    name: 'Compact',
    description: 'Minimalist layout with smaller text and icons'
  }
];
```

**2. Create `CompactLayout.tsx`:**

```typescript
import React from 'react';
import type { SegmentLayoutProps } from '../../../types/segmentLayoutTypes';

export const CompactLayout: React.FC<SegmentLayoutProps> = (props) => {
  // Implement compact layout logic
  return <>{/* ... */}</>;
};
```

**3. Update `SegmentRenderer.tsx` switch statement:**

```typescript
switch (layoutType) {
  case 'original':
    return <OriginalLayout {...layoutProps} />;
  case 'compact':
    return <CompactLayout {...layoutProps} />;
  default:
    return <OriginalLayout {...layoutProps} />;
}
```

**4. Update consuming components:**

```typescript
<WheelViewer layoutType="compact" ... />
```

### Original Layout Sub-Strategies

The "original" layout itself uses a mini-strategy pattern with three sub-layouts:

**Decision Tree (OriginalLayout.tsx, lines 303-368):**

```
Is prizeSegment.usePurchaseImage?
  YES -> SegmentImageOnly (purchase image)
  NO -> Continue

Is prizeSegment.useRandomRewardImage?
  YES -> SegmentImageOnly (random reward image)
  NO -> Continue

Is kind === 'jackpot'?
  YES -> SegmentImageOnly (jackpot image)
  NO -> Continue

Is prizeSegment.useXpImage?
  YES -> SegmentTextWithImage (text + XP icon)
  NO -> Continue

DEFAULT -> SegmentTwoLineText (two-line text)
```

This allows each sub-layout to be optimized and memoized independently.

### Performance Considerations

**Memoization Integration:**

The strategy pattern works seamlessly with React.memo because:

1. Layout components are memoized independently
2. Layout selection happens in a useMemo (lines 611-632)
3. Props are stable (no new objects created on each render)
4. Custom comparator in Segment component includes layoutType (line 664)

**Render Count:**

Changing `layoutType` will cause all segments to re-render (expected), but:
- Within the same layout, segments only re-render when their data changes
- Rotation changes don't trigger re-renders (handled via useEffect)

### Testing Strategy

**Unit Tests for Individual Layouts:**

```typescript
// Test OriginalLayout in isolation
describe('OriginalLayout', () => {
  it('renders image only for purchase prizes', () => {
    const props = {
      segment: { prizeSegment: { usePurchaseImage: true } },
      // ... other props
    };
    const { container } = render(<OriginalLayout {...props} />);
    expect(container.querySelector('image')).toBeInTheDocument();
  });
});
```

**Integration Tests:**

Test layout selection in SegmentRenderer:

```typescript
it('uses original layout by default', () => {
  render(<SegmentRenderer layoutType="original" ... />);
  // Verify original layout rendering
});

it('switches layouts when layoutType changes', () => {
  const { rerender } = render(<SegmentRenderer layoutType="original" ... />);
  rerender(<SegmentRenderer layoutType="compact" ... />);
  // Verify layout changed
});
```

### Future Expansion Possibilities

**Potential New Layouts:**

1. **Compact Layout:** Smaller text/icons for dense wheels
2. **Minimalist Layout:** Text only, no images
3. **Maximalist Layout:** Large images, bold text, extra decoration
4. **Icon Grid Layout:** Grid of small icons for mystery prizes
5. **Horizontal Text Layout:** Text runs horizontally instead of curved
6. **Progressive Layout:** Reveal more info on hover/selection

**A/B Testing Support:**

The pattern naturally supports A/B testing:

```typescript
const layoutType = abTest.variant === 'control' ? 'original' : 'compact';
<WheelViewer layoutType={layoutType} ... />
```

**Theme-Specific Layouts:**

Layouts can be selected based on theme:

```typescript
const layoutType = theme === 'halloween' ? 'spooky' : 'original';
```

## References

* [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
* [React Component Composition](https://react.dev/learn/passing-props-to-a-component)
* [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
