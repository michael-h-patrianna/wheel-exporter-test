/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Vitest global mock helpers - makes 'vi' available globally

declare global {
  // Make vitest mocks available as jest for compatibility
  namespace jest {
    type Mock<T = unknown, Y extends unknown[] = unknown[]> = import('vitest').Mock<T, Y>;
    type MockedFunction<T extends (...args: unknown[]) => unknown> =
      import('vitest').MockedFunction<T>;
    type SpyInstance<T = unknown> = import('vitest').SpyInstance<T>;
  }

  const jest: (typeof import('vitest'))['vi'];

  // Add missing global test functions
  function fail(message?: string): never;
}

// Re-export vi as jest for backwards compatibility
export {};
