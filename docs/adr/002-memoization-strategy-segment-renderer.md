# 2. Use React.memo and useMemo for SegmentRenderer Performance

**Date:** 2025-10-12

**Status:** Accepted

**Context:** [ADR-001 State Machine for Wheel Spin](001-state-machine-for-wheel-spin.md)

## Context and Problem Statement

The wheel can have 8-12 segments, each requiring complex SVG rendering including:
- Gradient definitions (up to 4 per segment)
- Filter definitions (drop shadows)
- Arc path definitions for text
- Wedge paths with fills and strokes
- Text elements with textPath references
- Image elements

With 12 segments, this means rendering 100+ SVG elements that update during animations. During wheel spin, the rotation changes continuously but segment properties remain constant.

How can we optimize rendering performance to maintain 60 FPS during animations without unnecessary re-renders?

## Decision Drivers

* Need to maintain 60 FPS during 8-second spin animation
* Segment properties (colors, text, positions) don't change during spin
* Only rotation angle changes during animation
* React re-renders all children by default when parent re-renders
* Complex SVG calculations (paths, gradients, text sizing) are expensive
* Need to minimize JavaScript execution during animation frames
* Must support dynamic segment counts (8-12 segments)
* Prize data can change between spins

## Considered Options

* **Option 1:** Strategic React.memo + useMemo (granular memoization)
* **Option 2:** No optimization (re-render everything on each frame)
* **Option 3:** Move all rendering to Canvas API
* **Option 4:** Use React Context to prevent prop drilling
* **Option 5:** Virtual DOM diffing only (rely on React's default optimization)

## Decision Outcome

Chosen option: "Strategic React.memo + useMemo (granular memoization)", because it provides optimal rendering performance by preventing unnecessary re-renders while maintaining the benefits of SVG rendering and React's declarative API.

### Positive Consequences

* **60 FPS maintained:** Segments don't re-render during rotation (only transform changes)
* **Selective updates:** Only segments with changed props re-render
* **Stable references:** useMemo prevents expensive calculations on every render
* **Granular control:** Different memoization strategies for different component levels
* **Type-safe:** Custom comparison functions ensure correctness
* **Maintainable:** Clear optimization boundaries with displayName for debugging
* **Scalable:** Performance remains consistent from 8 to 12 segments

### Negative Consequences

* More complex code with memoization wrappers
* Custom comparison functions require maintenance
* Developers must understand when to use memo vs useMemo
* Slightly increased memory usage for memoized values
* Risk of stale closures if dependencies are incorrect

## Pros and Cons of the Options

### Option 1: Strategic React.memo + useMemo (granular memoization)

Implementation: `src/lib/components/renderers/SegmentRenderer.tsx`

**Memoized Components:**

1. **GradientDefs** (lines 52-132): Memoized gradient SVG definitions
2. **FilterDefs** (lines 145-168): Memoized drop shadow filters
3. **ArcPathDefs** (lines 185-229): Memoized text arc paths
4. **SegmentImageOnly** (lines 245-274): Memoized image-only layout
5. **SegmentTextWithImage** (lines 293-403): Memoized text + image layout
6. **SegmentTwoLineText** (lines 421-540): Memoized two-line text layout
7. **Segment** (lines 562-668): Memoized individual segment with custom comparator

**Memoized Values:**

- Segment angle calculation (lines 691-694)
- Segment data array (lines 697-716)
- Image URLs (lines 719-732)
- Center position and radius (lines 735-739)
- SVG style object (lines 745-776)
- Paint values and paths within Segment component (lines 575-608)
- Content elements within Segment (lines 611-632)

* Good, because eliminates re-renders during animation (rotation-only changes)
* Good, because expensive calculations (paths, gradients) only run when needed
* Good, because custom comparator for Segment prevents deep prop changes (lines 647-665)
* Good, because maintains React's declarative API
* Good, because easy to profile and debug with React DevTools
* Good, because works well with SVG rendering
* Bad, because requires careful dependency tracking
* Bad, because adds code complexity
* Bad, because risk of stale values if dependencies are wrong

### Option 2: No optimization (re-render everything)

* Good, because simplest implementation
* Good, because no risk of stale memoized values
* Bad, because would re-render all segments on every frame (poor performance)
* Bad, because expensive SVG path calculations run unnecessarily
* Bad, because would likely drop below 60 FPS with 12 segments
* Bad, because wastes CPU and battery on mobile devices

### Option 3: Move all rendering to Canvas API

* Good, because potentially better performance for pixel-based operations
* Good, because more control over rendering pipeline
* Bad, because loses SVG benefits (crisp scaling, text rendering)
* Bad, because much more complex imperative code
* Bad, because harder to maintain and debug
* Bad, because no React DevTools integration
* Bad, because accessibility challenges
* Bad, because would require complete rewrite

### Option 4: Use React Context to prevent prop drilling

* Good, because reduces prop passing
* Bad, because doesn't solve re-render problem (Context changes trigger re-renders)
* Bad, because makes data flow less explicit
* Bad, because adds another abstraction layer
* Bad, because doesn't address performance root cause

### Option 5: Virtual DOM diffing only

* Good, because no additional code needed
* Good, because React handles optimization automatically
* Bad, because React doesn't know which calculations are expensive
* Bad, because re-creates complex objects (paths, gradients) on every render
* Bad, because still executes JavaScript for all segments every frame
* Bad, because insufficient for maintaining 60 FPS with 12 segments

## Links

* Related: [ADR-001 State Machine for Wheel Spin](001-state-machine-for-wheel-spin.md)
* Related: [ADR-004 Strategy Pattern for Segment Layouts](004-strategy-pattern-segment-layouts.md)
* Implementation: `src/lib/components/renderers/SegmentRenderer.tsx`
* Layout implementation: `src/lib/components/renderers/layouts/OriginalLayout.tsx`

## Implementation Notes

### Custom Comparator for Segment Component (lines 647-665)

```typescript
(prevProps, nextProps) => {
  // Only re-render if props that affect appearance change
  return (
    prevProps.segment.index === nextProps.segment.index &&
    prevProps.segment.startAngle === nextProps.segment.startAngle &&
    prevProps.segment.endAngle === nextProps.segment.endAngle &&
    prevProps.segment.kind === nextProps.segment.kind &&
    prevProps.segment.prizeSegment === nextProps.segment.prizeSegment &&
    prevProps.styles === nextProps.styles &&
    prevProps.cx === nextProps.cx &&
    prevProps.cy === nextProps.cy &&
    prevProps.outerRadius === nextProps.outerRadius &&
    prevProps.segmentAngle === nextProps.segmentAngle &&
    prevProps.scale === nextProps.scale &&
    prevProps.jackpotImageUrl === nextProps.jackpotImageUrl &&
    prevProps.purchaseImageUrl === nextProps.purchaseImageUrl &&
    prevProps.layoutType === nextProps.layoutType
  );
});
```

This ensures segments only re-render when their visual properties change, not when parent rotation updates.

### Rotation Handled via Direct DOM Manipulation (lines 779-786)

Instead of passing rotation as a prop (which would break memoization), rotation is applied via useEffect:

```typescript
useEffect(() => {
  if (!svgRef.current) return;
  const svg = svgRef.current;
  svg.style.transform = `rotate(${targetRotation}deg)`;
}, [targetRotation]);
```

This allows the rotation to update without triggering React re-renders of child components.

### Memoized Definitions Components (lines 52-229)

GradientDefs, FilterDefs, and ArcPathDefs are memoized and only re-render when segment data or styles change:

```typescript
const GradientDefs: React.FC<GradientDefsProps> = React.memo(({ segmentData, segments }) => {
  const gradientDefs = useMemo(() => {
    // ... expensive gradient creation logic
  }, [segmentData, segments]);

  if (gradientDefs.length === 0) return null;
  return <>{gradientDefs}</>;
});
```

### Memoized Paint Values (lines 587-608)

Within the Segment component, paint values are memoized to avoid recalculating on every render:

```typescript
const outerFillPaint = useMemo(() =>
  fillToSvgPaint(
    styles.outer.fill,
    `segment-outer-fill-${segment.index}`
  ),
  [styles.outer.fill, segment.index]
);
```

### Performance Impact

**Without memoization:**
- All 12 segments re-render on every frame (60 FPS = 720 segment renders/second)
- All gradients, filters, and paths recalculated
- Likely frame drops below 60 FPS

**With memoization:**
- Segments render once, then only when props change
- Rotation updates via transform without triggering re-renders
- Maintains 60 FPS even with 12 segments

## References

* [React.memo Documentation](https://react.dev/reference/react/memo)
* [useMemo Hook](https://react.dev/reference/react/useMemo)
* [Optimizing Performance in React](https://react.dev/learn/render-and-commit)
* [React Profiler for Performance Analysis](https://react.dev/learn/react-developer-tools)
