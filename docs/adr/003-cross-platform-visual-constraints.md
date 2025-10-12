# 3. Restrict Visual Effects for React Native Compatibility

**Date:** 2025-10-12

**Status:** Accepted

**Context:** None

## Context and Problem Statement

This project is currently a React web application but has a requirement for future React Native portability. React Native has significant limitations in its rendering capabilities compared to web browsers:

- No CSS filters (blur, drop-shadow with filter property, grayscale, etc.)
- Limited gradient support (linear only, no radial or conic)
- No box-shadow or text-shadow CSS properties
- No backdrop-filter or clip-path
- No CSS pseudo-elements (:before, :after)
- Different text rendering and layout engines

Visual effects that work perfectly on the web may be impossible or require complete rewrites for React Native. This creates a choice: optimize for web now and rewrite later, or constrain the design space now for easier future migration.

## Decision Drivers

* Requirement for future React Native portability
* Cost and risk of future migration vs current constraint
* Designer and developer expectations for visual polish
* Existing design system and component library
* Performance considerations (shadows and blur are expensive)
* User experience consistency across platforms
* Development velocity and maintainability

## Considered Options

* **Option 1:** Restrict to cross-platform compatible visual effects only
* **Option 2:** Use all web features now, rewrite for React Native later
* **Option 3:** Implement platform-specific abstractions from the start
* **Option 4:** Defer React Native support, optimize for web only

## Decision Outcome

Chosen option: "Restrict to cross-platform compatible visual effects only", because it minimizes future migration cost while still allowing rich visual design. The constraint is documented in CLAUDE.md and enforced through code review.

### Positive Consequences

* **Reduced migration cost:** Visual components will work on React Native with minimal changes
* **Consistent behavior:** Same visual language across platforms
* **Performance benefits:** Avoiding expensive effects (blur, shadows) improves performance
* **Clear guidelines:** Developers know what is allowed without ambiguity
* **Simpler architecture:** No platform detection or conditional rendering needed
* **Focus on transforms:** Encourages GPU-accelerated animations (transform, opacity)

### Negative Consequences

* Designers must work within constraints (no blur, no radial gradients)
* Some modern web effects are off-limits (glassmorphism, advanced shadows)
* Potentially less visually impressive compared to web-only implementations
* Requires discipline to maintain constraints over time
* May feel limiting to web developers familiar with full CSS capabilities

## Pros and Cons of the Options

### Option 1: Restrict to cross-platform compatible effects

Implementation: `CLAUDE.md` lines 95-107

**Allowed Effects:**
- Transforms: translateX, translateY, scale, rotate
- Opacity animations
- Linear gradients only (via react-native-linear-gradient)
- Color transitions
- Layout animations (position, size)

**Forbidden Effects:**
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (:before, :after)
- Complex CSS selectors

**Current Implementation Examples:**

1. **SegmentRenderer** (`src/lib/components/renderers/SegmentRenderer.tsx`):
   - Uses only linear gradients (lines 65-92)
   - No blur or shadow effects on segments
   - Transform-based rotation animation (line 785)

2. **Drop Shadows** (`src/lib/utils/segmentUtils.ts`):
   - Uses SVG `<feDropShadow>` filter instead of CSS box-shadow
   - Compatible with React Native via react-native-svg

3. **Animation Strategy**:
   - Pure transform: `rotate(${targetRotation}deg)` (line 785)
   - Smooth easing via CSS cubic-bezier (lines 751-761)
   - No filter animations

* Good, because minimizes future migration work
* Good, because enforces consistent visual language
* Good, because improves performance (no expensive filters)
* Good, because clear rules documented in CLAUDE.md
* Good, because leverages GPU acceleration (transforms/opacity)
* Bad, because limits visual design options
* Bad, because requires explaining constraints to designers
* Bad, because some modern web effects are unavailable

### Option 2: Use all web features now, rewrite later

* Good, because no current design constraints
* Good, because developers can use full CSS capabilities
* Good, because potentially more impressive visuals
* Bad, because high migration cost later (complete visual rewrite)
* Bad, because risk of designs that cannot be replicated on React Native
* Bad, because inconsistent experience across platforms
* Bad, because technical debt accumulates

### Option 3: Platform-specific abstractions from the start

Example: Separate implementation for web and React Native with shared API

* Good, because optimal experience on each platform
* Good, because no visual constraints
* Bad, because doubles maintenance burden
* Bad, because complex abstraction layer needed
* Bad, because premature optimization (React Native not yet implemented)
* Bad, because testing complexity (must test both implementations)
* Bad, because risk of behavior divergence

### Option 4: Defer React Native support

* Good, because no current constraints
* Good, because simpler development process
* Bad, because ignores stated requirement for portability
* Bad, because may make React Native support impractical later
* Bad, because uncertain future direction

## Links

* Project documentation: `CLAUDE.md` (lines 80-117, CIB-001.5)
* Related implementations: All components in `src/lib/components/`
* Enforcement: Code review guidelines for animation-specialist and ui-polish-specialist agents

## Implementation Notes

### Enforcement Strategy

**1. Documentation** (`CLAUDE.md` lines 95-107):

Clear lists of allowed and forbidden visual effects with rationale.

**2. Agent Responsibilities** (lines 61-65):

- **animation-specialist**: Primary enforcer of animation constraints
- **ui-polish-specialist**: Primary enforcer of visual constraints
- **integration-coordinator**: Ensures cross-platform strategy in architecture
- All agents: Aware of constraints when adding visual features

**3. Code Review Checklist:**

Before merging visual changes, verify:
- No CSS `filter` properties (use SVG filters if needed)
- No `box-shadow` or `text-shadow`
- Only linear gradients (`background: linear-gradient(...)`)
- No `backdrop-filter`
- No pseudo-elements with visual content
- Animations use only transform and opacity

### React Native Migration Path

When implementing React Native support:

**1. Replace Framer Motion with Moti/Reanimated:**
```typescript
// Web (current)
<motion.div animate={{ rotate: rotation }} />

// React Native (future)
<MotiView animate={{ rotate: rotation }} />
```

**2. Replace CSS gradients with react-native-linear-gradient:**
```typescript
// Web (current)
<div style={{ background: 'linear-gradient(45deg, red, blue)' }} />

// React Native (future)
<LinearGradient colors={['red', 'blue']} angle={45} />
```

**3. SVG components remain mostly compatible:**
- react-native-svg provides similar API
- Gradients and filters work the same way
- Text layout may need minor adjustments

### Current Compliance Status

**Compliant Components:**
- SegmentRenderer: Uses only transforms and linear gradients
- WheelBgRenderer: Uses linear gradients
- WheelTopRenderer: Uses linear gradients
- All animation uses transform/opacity only

**Areas to Monitor:**
- Future text effects (avoid text-shadow)
- Future UI polish (avoid blur/glassmorphism trends)
- Third-party component integration

### Exceptions and Special Cases

**SVG Drop Shadows (Allowed):**

SVG `<feDropShadow>` filters ARE allowed because react-native-svg supports them:

```typescript
// Compliant: SVG filter (works on React Native)
<filter id="shadow">
  <feDropShadow dx="0" dy="2" stdDeviation="4" />
</filter>

// Non-compliant: CSS shadow (doesn't work on React Native)
style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
```

**Linear Gradients (Allowed):**

Both CSS and SVG linear gradients are allowed:

```typescript
// CSS linear gradient (convertible to react-native-linear-gradient)
background: linear-gradient(to bottom, #fff, #000)

// SVG linear gradient (works with react-native-svg)
<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#fff" />
  <stop offset="100%" stopColor="#000" />
</linearGradient>
```

## References

* [React Native Limitations](https://reactnative.dev/docs/view-style-props)
* [react-native-linear-gradient](https://github.com/react-native-linear-gradient/react-native-linear-gradient)
* [react-native-svg](https://github.com/software-mansion/react-native-svg)
* [Moti Animation Library](https://moti.fyi/)
* [Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
