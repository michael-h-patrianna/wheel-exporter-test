// vitest setup file
// @testing-library/jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Make vi available as jest for backwards compatibility
interface GlobalWithJest {
  jest: typeof vi;
  fail: (message?: string) => never;
}

(globalThis as unknown as GlobalWithJest).jest = vi;

// Add fail function for Jest compatibility
(globalThis as unknown as GlobalWithJest).fail = (message?: string): never => {
  throw new Error(message || 'Test failed');
};
