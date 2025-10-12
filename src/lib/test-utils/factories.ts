/**
 * Type-safe test factories for creating mock wheel component data.
 * Eliminates the need for 'as any' assertions in tests.
 *
 * @packageDocumentation
 */

import {
  HeaderComponent,
  WheelOverlay,
  LightsComponent,
  ButtonSpinComponent,
  PointerComponent,
  CenterComponent,
  WheelExport,
  ExtractedAssets,
  ImageBounds,
  WheelElementBounds,
  WheelSegmentStyles,
  WheelSegmentKind,
  Fill,
} from '../types';

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Makes all properties of T optional recursively.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Primitive Factories
// ============================================================================

/**
 * Creates a mock ImageBounds with sensible defaults.
 *
 * @param overrides - Partial overrides for the bounds
 * @returns Complete ImageBounds object
 */
export function createMockImageBounds(
  overrides?: Partial<ImageBounds>
): ImageBounds {
  return {
    x: 400,
    y: 300,
    w: 200,
    h: 200,
    rotation: undefined,
    ...overrides,
  };
}

/**
 * Creates a mock WheelElementBounds with sensible defaults.
 *
 * @param overrides - Partial overrides for the bounds
 * @returns Complete WheelElementBounds object
 */
export function createMockWheelElementBounds(
  overrides?: Partial<WheelElementBounds>
): WheelElementBounds {
  return {
    x: 400,
    y: 300,
    w: 600,
    h: 600,
    ...overrides,
  };
}

/**
 * Creates a mock solid Fill with sensible defaults.
 *
 * @param color - Color to use (defaults to '#FF0000')
 * @returns Complete Fill object
 */
export function createMockSolidFill(color = '#FF0000'): Fill {
  return {
    type: 'solid',
    color,
  };
}

/**
 * Creates a mock gradient Fill with sensible defaults.
 *
 * @param overrides - Partial overrides for gradient properties
 * @returns Complete Fill object with gradient
 */
export function createMockGradientFill(overrides?: DeepPartial<Fill>): Fill {
  return {
    type: 'gradient',
    gradient: {
      type: 'linear',
      rotation: 90,
      stops: [
        { color: '#FF0000', position: 0 },
        { color: '#0000FF', position: 1 },
      ],
      transform: [
        [1, 0, 0],
        [0, 1, 0],
      ] as const,
      ...overrides?.gradient,
    },
  };
}

// ============================================================================
// Component Factories
// ============================================================================

/**
 * Creates a mock HeaderComponent with sensible defaults.
 * All state bounds use the same dimensions by default.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete HeaderComponent object
 *
 * @example
 * ```typescript
 * const header = createMockHeader({
 *   activeImg: 'custom-active.png',
 *   stateBounds: {
 *     active: { x: 500, y: 150, w: 300, h: 100 }
 *   }
 * });
 * ```
 */
export function createMockHeader(
  overrides?: DeepPartial<HeaderComponent>
): HeaderComponent {
  const defaultBounds: ImageBounds = {
    x: 400,
    y: 100,
    w: 200,
    h: 50,
  };

  return {
    stateBounds: {
      active: { ...defaultBounds, ...overrides?.stateBounds?.active },
      success: { ...defaultBounds, ...overrides?.stateBounds?.success },
      fail: { ...defaultBounds, ...overrides?.stateBounds?.fail },
    },
    activeImg: overrides?.activeImg ?? 'header-active.png',
    successImg: overrides?.successImg ?? 'header-success.png',
    failImg: overrides?.failImg ?? 'header-fail.png',
  };
}

/**
 * Creates a mock WheelOverlay (for wheelBg, wheelTop1, wheelTop2) with sensible defaults.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete WheelOverlay object
 *
 * @example
 * ```typescript
 * const wheelBg = createMockWheelBg({
 *   img: 'custom-background.png',
 *   bounds: { x: 450, y: 350, w: 700, h: 700 }
 * });
 * ```
 */
export function createMockWheelBg(
  overrides?: DeepPartial<WheelOverlay>
): WheelOverlay {
  return {
    bounds: {
      x: 400,
      y: 300,
      w: 600,
      h: 600,
      ...overrides?.bounds,
    },
    img: overrides?.img ?? 'wheelbg.png',
  };
}

/**
 * Creates a mock WheelOverlay for wheel top layer with sensible defaults.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete WheelOverlay object
 *
 * @example
 * ```typescript
 * const wheelTop = createMockWheelTop({
 *   img: 'wheeltop-custom.png',
 *   bounds: { w: 300, h: 300 }
 * });
 * ```
 */
export function createMockWheelTop(
  overrides?: DeepPartial<WheelOverlay>
): WheelOverlay {
  return {
    bounds: {
      x: 400,
      y: 300,
      w: 200,
      h: 200,
      ...overrides?.bounds,
    },
    img: overrides?.img ?? 'wheeltop.png',
  };
}

/**
 * Creates a mock LightsComponent with sensible defaults.
 * Includes 3 light positions by default.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete LightsComponent object
 *
 * @example
 * ```typescript
 * const lights = createMockLights({
 *   color: '#00FF00',
 *   positions: [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 200 }
 *   ]
 * });
 * ```
 */
export function createMockLights(
  overrides?: DeepPartial<LightsComponent>
): LightsComponent {
  const defaultPositions = [
    { x: 100, y: 50 },
    { x: 200, y: 100 },
    { x: 300, y: 150 },
  ];

  return {
    color: overrides?.color ?? '#FFFF00',
    positions: (overrides?.positions as Array<{ x: number; y: number }>) ?? defaultPositions,
  };
}

/**
 * Creates a mock ButtonSpinComponent with sensible defaults.
 * Both state bounds use the same dimensions by default.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete ButtonSpinComponent object
 *
 * @example
 * ```typescript
 * const button = createMockButtonSpin({
 *   defaultImg: 'btn-custom-default.png',
 *   stateBounds: {
 *     default: { x: 450, y: 500, w: 120, h: 120 }
 *   }
 * });
 * ```
 */
export function createMockButtonSpin(
  overrides?: DeepPartial<ButtonSpinComponent>
): ButtonSpinComponent {
  const defaultBounds: ImageBounds = {
    x: 400,
    y: 500,
    w: 100,
    h: 100,
  };

  return {
    stateBounds: {
      default: { ...defaultBounds, ...overrides?.stateBounds?.default },
      spinning: { ...defaultBounds, ...overrides?.stateBounds?.spinning },
    },
    defaultImg: overrides?.defaultImg ?? 'button-default.png',
    spinningImg: overrides?.spinningImg ?? 'button-spinning.png',
  };
}

/**
 * Creates a mock PointerComponent with sensible defaults.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete PointerComponent object
 *
 * @example
 * ```typescript
 * const pointer = createMockPointer({
 *   bounds: { x: 400, y: 50, w: 60, h: 80 },
 *   img: 'custom-pointer.png'
 * });
 * ```
 */
export function createMockPointer(
  overrides?: DeepPartial<PointerComponent>
): PointerComponent {
  return {
    bounds: {
      x: 400,
      y: 50,
      w: 60,
      h: 80,
      rotation: 0,
      ...overrides?.bounds,
    },
    img: overrides?.img ?? 'pointer.png',
  };
}

/**
 * Creates a mock CenterComponent with sensible defaults.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete CenterComponent object
 *
 * @example
 * ```typescript
 * const center = createMockCenter({
 *   x: 450,
 *   y: 350,
 *   radius: 300
 * });
 * ```
 */
export function createMockCenter(
  overrides?: Partial<CenterComponent>
): CenterComponent {
  return {
    x: 400,
    y: 300,
    radius: 250,
    ...overrides,
  };
}

/**
 * Creates a mock WheelSegmentStyles with all segment types defined.
 *
 * @param overrides - Partial overrides for any segment type
 * @returns Complete WheelSegmentStyles object
 *
 * @example
 * ```typescript
 * const segments = createMockWheelSegmentStyles({
 *   jackpot: {
 *     outer: { fill: { type: 'solid', color: '#FFD700' } }
 *   }
 * });
 * ```
 */
export function createMockWheelSegmentStyles(
  overrides?: Partial<WheelSegmentStyles>
): WheelSegmentStyles {
  const segmentKinds: WheelSegmentKind[] = ['odd', 'even', 'nowin', 'jackpot'];

  const defaultStyles: WheelSegmentStyles = {};
  segmentKinds.forEach((kind) => {
    defaultStyles[kind] = {
      outer: {
        fill: createMockSolidFill(kind === 'jackpot' ? '#FFD700' : '#FF0000'),
      },
      text: {
        fill: createMockSolidFill('#FFFFFF'),
      },
    };
  });

  return {
    ...defaultStyles,
    ...overrides,
  };
}

// ============================================================================
// Complex Data Factories
// ============================================================================

/**
 * Creates a complete mock WheelExport with all components.
 * All optional components are included by default for comprehensive testing.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete WheelExport object
 *
 * @example
 * ```typescript
 * const wheelData = createMockWheelExport({
 *   wheelId: 'custom-wheel-123',
 *   header: createMockHeader({ activeImg: 'custom-header.png' })
 * });
 * ```
 */
export function createMockWheelExport(
  overrides?: DeepPartial<WheelExport>
): WheelExport {
  return {
    wheelId: overrides?.wheelId ?? 'test-wheel-id',
    frameSize: {
      width: overrides?.frameSize?.width ?? 800,
      height: overrides?.frameSize?.height ?? 600,
    },
    background: {
      exportUrl: overrides?.background?.exportUrl ?? 'background.png',
    },
    header: overrides?.header !== undefined ? createMockHeader(overrides.header) : createMockHeader(),
    wheelBg: overrides?.wheelBg !== undefined ? createMockWheelBg(overrides.wheelBg) : createMockWheelBg(),
    wheelTop1: overrides?.wheelTop1 !== undefined ? createMockWheelTop(overrides.wheelTop1) : createMockWheelTop(),
    wheelTop2: overrides?.wheelTop2 !== undefined ? createMockWheelTop(overrides.wheelTop2) : createMockWheelTop(),
    buttonSpin: overrides?.buttonSpin !== undefined ? createMockButtonSpin(overrides.buttonSpin) : createMockButtonSpin(),
    center: overrides?.center !== undefined ? createMockCenter(overrides.center as Partial<CenterComponent>) : createMockCenter(),
    pointer: overrides?.pointer !== undefined ? createMockPointer(overrides.pointer) : createMockPointer(),
    lights: overrides?.lights !== undefined ? createMockLights(overrides.lights) : createMockLights(),
    segments: overrides?.segments !== undefined ? createMockWheelSegmentStyles(overrides.segments) : createMockWheelSegmentStyles(),
    rewards: overrides?.rewards,
    exportedAt: overrides?.exportedAt ?? new Date().toISOString(),
    metadata: {
      exportFormat: overrides?.metadata?.exportFormat ?? 'figma-plugin-v1',
      version: overrides?.metadata?.version ?? '1.0.0',
    },
  };
}

/**
 * Creates a complete mock ExtractedAssets with all asset URLs.
 * All optional image URLs are included by default.
 *
 * @param overrides - Partial overrides for any property
 * @returns Complete ExtractedAssets object
 *
 * @example
 * ```typescript
 * const assets = createMockExtractedAssets({
 *   backgroundImage: 'https://custom.com/bg.png',
 *   headerImages: {
 *     active: 'https://custom.com/header-active.png'
 *   }
 * });
 * ```
 */
export function createMockExtractedAssets(
  overrides?: DeepPartial<ExtractedAssets>
): ExtractedAssets {
  const wheelData = overrides?.wheelData
    ? createMockWheelExport(overrides.wheelData)
    : createMockWheelExport();

  return {
    wheelData,
    backgroundImage: overrides?.backgroundImage ?? 'https://example.com/background.png',
    headerImages: {
      active: overrides?.headerImages?.active ?? 'https://example.com/header-active.png',
      success: overrides?.headerImages?.success ?? 'https://example.com/header-success.png',
      fail: overrides?.headerImages?.fail ?? 'https://example.com/header-fail.png',
    },
    wheelBgImage: overrides?.wheelBgImage ?? 'https://example.com/wheelbg.png',
    wheelTop1Image: overrides?.wheelTop1Image ?? 'https://example.com/wheeltop1.png',
    wheelTop2Image: overrides?.wheelTop2Image ?? 'https://example.com/wheeltop2.png',
    buttonSpinImages: {
      default: overrides?.buttonSpinImages?.default ?? 'https://example.com/button-default.png',
      spinning: overrides?.buttonSpinImages?.spinning ?? 'https://example.com/button-spinning.png',
    },
    pointerImage: overrides?.pointerImage ?? 'https://example.com/pointer.png',
    rewardsPrizeImages: {
      gc: overrides?.rewardsPrizeImages?.gc ?? 'https://example.com/gc.png',
      sc: overrides?.rewardsPrizeImages?.sc ?? 'https://example.com/sc.png',
      purchase: overrides?.rewardsPrizeImages?.purchase ?? 'https://example.com/purchase.png',
      ...overrides?.rewardsPrizeImages,
    },
  };
}

// ============================================================================
// Partial Component Factories (for testing edge cases)
// ============================================================================

/**
 * Creates a header with missing fail state bounds (for testing edge cases).
 * DO NOT use 'as any' - this function uses type assertions properly.
 *
 * @returns HeaderComponent with incomplete state bounds
 */
export function createMockHeaderWithMissingFailState(): Partial<HeaderComponent> {
  return {
    stateBounds: {
      active: { x: 400, y: 100, w: 200, h: 50 },
      success: { x: 400, y: 100, w: 200, h: 50 },
      // 'fail' intentionally omitted
    } as HeaderComponent['stateBounds'],
    activeImg: 'header-active.png',
    successImg: 'header-success.png',
    failImg: 'header-fail.png',
  };
}

/**
 * Creates a wheel overlay with missing bounds (for testing edge cases).
 * DO NOT use 'as any' - this function uses type assertions properly.
 *
 * @returns Partial WheelOverlay with no bounds
 */
export function createMockWheelOverlayWithoutBounds(): Partial<WheelOverlay> {
  return {
    img: 'wheelbg.png',
    // bounds intentionally omitted
  };
}

/**
 * Creates lights component with missing positions (for testing edge cases).
 * DO NOT use 'as any' - this function uses type assertions properly.
 *
 * @returns Partial LightsComponent with no positions
 */
export function createMockLightsWithoutPositions(): Partial<LightsComponent> {
  return {
    color: '#FFFF00',
    // positions intentionally omitted
  };
}

/**
 * Creates a button spin with missing spinning state bounds (for testing edge cases).
 * DO NOT use 'as any' - this function uses type assertions properly.
 *
 * @returns ButtonSpinComponent with incomplete state bounds
 */
export function createMockButtonSpinWithMissingSpinningState(): Partial<ButtonSpinComponent> {
  return {
    stateBounds: {
      default: { x: 400, y: 500, w: 100, h: 100 },
      // 'spinning' intentionally omitted
    } as ButtonSpinComponent['stateBounds'],
    defaultImg: 'button-default.png',
    spinningImg: 'button-spinning.png',
  };
}
