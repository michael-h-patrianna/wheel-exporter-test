/**
 * Test utilities and mock data for unit and integration tests
 * @jest-environment jsdom
 */

import { WheelExport, ExtractedAssets, Gradient, Fill, WheelSegmentStyles } from '../types';

/**
 * Creates a mock gradient for testing
 * Provides all required properties with sensible defaults
 */
export function createMockGradient(overrides?: Partial<Gradient>): Gradient {
  const defaults: Gradient = {
    type: 'linear',
    stops: [
      { color: '#FF0000', position: 0 },
      { color: '#0000FF', position: 1 },
    ],
    transform: [
      [1, 0, 0],
      [0, 1, 0],
    ] as const,
    rotation: 0,
    handleOrigin: { x: 0.5, y: 0.5 },
    handleVectors: [
      { x: 0.5, y: 0.5 }, // p0 origin
      { x: 0.5, y: 0 },   // p1 primary axis
      { x: 1, y: 0.5 },   // p2 secondary axis
    ] as const,
  };

  return {
    ...defaults,
    ...overrides,
    // Ensure transform is always present
    transform: overrides?.transform || defaults.transform,
  };
}

/**
 * Creates a mock fill for testing
 */
export function createMockFill(type: 'solid' | 'gradient' = 'solid'): Fill {
  if (type === 'solid') {
    return {
      type: 'solid',
      color: '#FF0000',
    };
  }
  return {
    type: 'gradient',
    gradient: createMockGradient(),
  };
}

/**
 * Creates mock segment styles for testing
 */
export function createMockSegmentStyles(overrides?: Partial<WheelSegmentStyles>): WheelSegmentStyles {
  return {
    odd: {
      outer: {
        fill: createMockFill('gradient'),
        stroke: {
          width: 2,
          fill: createMockFill('solid'),
        },
      },
    },
    even: {
      outer: {
        fill: {
          type: 'gradient',
          gradient: createMockGradient({ rotation: 45 }),
        },
      },
    },
    ...overrides,
  };
}

/**
 * Creates a minimal mock WheelExport for testing
 */
export function createMockWheelData(overrides?: Partial<WheelExport>): WheelExport {
  return {
    wheelId: 'test-wheel-001',
    frameSize: {
      width: 800,
      height: 600,
    },
    background: {
      exportUrl: 'background.png',
    },
    header: {
      stateBounds: {
        active: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
        success: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
        fail: { x: 100, y: 50, w: 600, h: 80, rotation: 0 },
      },
      activeImg: 'header_active.png',
      successImg: 'header_success.png',
      failImg: 'header_fail.png',
    },
    wheelBg: {
      bounds: { x: 400, y: 300, w: 400, h: 400 },
      img: 'wheel_bg.png',
    },
    segments: createMockSegmentStyles(),
    buttonSpin: {
      stateBounds: {
        default: { x: 350, y: 250, w: 100, h: 100, rotation: 0 },
        spinning: { x: 350, y: 250, w: 100, h: 100, rotation: 0 },
      },
      defaultImg: 'button_spin_default.png',
      spinningImg: 'button_spin_spinning.png',
    },
    center: {
      x: 400,
      y: 300,
      radius: 50,
    },
    pointer: {
      bounds: { x: 400, y: 100, w: 40, h: 60, rotation: 0 },
      img: 'pointer.png',
    },
    wheelTop1: {
      bounds: { x: 400, y: 300, w: 380, h: 380 },
      img: 'wheel_top_1.png',
    },
    wheelTop2: {
      bounds: { x: 400, y: 300, w: 360, h: 360 },
      img: 'wheel_top_2.png',
    },
    exportedAt: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      exportFormat: 'test',
    },
    ...overrides,
  };
}

/**
 * Creates mock extracted assets with blob URLs for testing
 */
export function createMockExtractedAssets(overrides?: Partial<ExtractedAssets>): ExtractedAssets {
  return {
    wheelData: createMockWheelData(),
    backgroundImage: 'blob:http://localhost/background',
    headerImages: {
      active: 'blob:http://localhost/header-active',
      success: 'blob:http://localhost/header-success',
      fail: 'blob:http://localhost/header-fail',
    },
    wheelBgImage: 'blob:http://localhost/wheel-bg',
    wheelTop1Image: 'blob:http://localhost/wheel-top-1',
    wheelTop2Image: 'blob:http://localhost/wheel-top-2',
    buttonSpinImages: {
      default: 'blob:http://localhost/button-default',
      spinning: 'blob:http://localhost/button-spinning',
    },
    pointerImage: 'blob:http://localhost/pointer',
    ...overrides,
  };
}

/**
 * Creates a mock File object for testing file uploads
 */
export function createMockZipFile(name: string = 'test-wheel.zip'): File {
  const blob = new Blob(['mock zip content'], { type: 'application/zip' });
  return new File([blob], name, { type: 'application/zip' });
}

/**
 * Creates a mock Blob for testing
 */
export function createMockBlob(content: string = 'mock content'): Blob {
  return new Blob([content], { type: 'application/octet-stream' });
}

/**
 * Mock JSZip file structure for testing
 */
export function createMockJSZipFile() {
  return {
    async: jest.fn().mockResolvedValue('mock content'),
  };
}

/**
 * Utility to wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to create a mock image load event
 */
export function mockImageLoad() {
  const originalImage = global.Image;

  (global as any).Image = class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';

    constructor() {
      setTimeout(() => {
        if (this.onload) {
          this.onload();
        }
      }, 0);
    }
  };

  return () => {
    global.Image = originalImage;
  };
}
