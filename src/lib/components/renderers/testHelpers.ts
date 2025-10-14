/**
 * Shared test utilities for renderer component tests
 * Consolidates common test patterns and reduces duplication
 */

import { screen } from '@testing-library/react';

/**
 * Test that an image loads with error handling
 *
 * @param altText - Alt text to find the image
 * @param expectedUrl - Expected image URL
 * @param componentName - Name of component for console.warn assertion
 */
export function testImageErrorHandling(
  altText: string,
  expectedUrl: string,
  componentName: string
) {
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  const img = screen.getByAltText(altText);
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute('src', expectedUrl);

  // Trigger error
  img.dispatchEvent(new Event('error'));

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining(componentName),
    expectedUrl
  );

  consoleSpy.mockRestore();
}

/**
 * Test that CSS variables are correctly applied to an element
 *
 * @param selector - CSS selector to find element
 * @param expectedVars - Object of CSS variable name/value pairs
 */
export function testCssVariables(
  selector: string,
  expectedVars: Record<string, string>
) {
  const element = document.querySelector(selector);
  expect(element).toBeInTheDocument();
  expect(element).toHaveStyle(expectedVars);
}

/**
 * Test ARIA attributes on a component
 *
 * @param role - ARIA role
 * @param name - Accessible name
 * @param additionalChecks - Additional assertions to run on the element
 */
export function testAriaAttributes(
  role: string,
  name: string,
  additionalChecks?: (element: HTMLElement) => void
) {
  const element = screen.getByRole(role, { name });
  expect(element).toBeInTheDocument();

  if (additionalChecks) {
    additionalChecks(element);
  }
}

/**
 * Test that an image is non-draggable
 *
 * @param altText - Alt text to find the image
 */
export function testImageNonDraggable(altText: string) {
  const img = screen.getByAltText(altText);
  expect(img).toHaveAttribute('draggable', 'false');
}

/**
 * Generate test cases for different scale factors
 *
 * @param baseWidth - Base width without scale
 * @param baseHeight - Base height without scale
 * @returns Array of test cases with scale, expectedWidth, expectedHeight
 */
export function generateScaleTestCases(baseWidth: number, baseHeight: number) {
  return [
    { scale: 0.25, expectedWidth: `${baseWidth * 0.25}px`, expectedHeight: `${baseHeight * 0.25}px` },
    { scale: 0.5, expectedWidth: `${baseWidth * 0.5}px`, expectedHeight: `${baseHeight * 0.5}px` },
    { scale: 1, expectedWidth: `${baseWidth}px`, expectedHeight: `${baseHeight}px` },
    { scale: 1.5, expectedWidth: `${baseWidth * 1.5}px`, expectedHeight: `${baseHeight * 1.5}px` },
    { scale: 2, expectedWidth: `${baseWidth * 2}px`, expectedHeight: `${baseHeight * 2}px` },
  ];
}
