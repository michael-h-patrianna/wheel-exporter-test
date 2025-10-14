/**
 * Comprehensive test suite for HeaderRenderer
 */

import { HeaderRenderer } from '@components/renderers/HeaderRenderer';
import { HeaderComponent, HeaderState } from '@lib-types';
import { createMockHeader, createMockHeaderWithMissingFailState } from '@test-utils';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

describe('HeaderRenderer', () => {
  const mockHeader = createMockHeader();

  const defaultProps = {
    header: mockHeader,
    currentState: 'active' as HeaderState,
    scale: 1,
    headerImage: 'https://example.com/header-active.png',
    onCycleState: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header image with correct props', () => {
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} />);

    const img = getByTestId('header-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.headerImage);
  });

  it('should return null when header is not provided', () => {
    const { container, getByTestId } = render(
      <HeaderRenderer {...defaultProps} header={undefined as unknown as HeaderComponent} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when headerImage is not provided', () => {
    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} headerImage={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('should return null when bounds for current state are missing', () => {
    const headerWithoutBounds =
      createMockHeaderWithMissingFailState() as unknown as HeaderComponent;

    const { container, getByTestId } = render(
      <HeaderRenderer
        {...defaultProps}
        header={headerWithoutBounds}
        currentState="fail" // 'fail' is missing from stateBounds
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate correct CSS variables for positioning and dimensions', () => {
    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} />);

    const headerDiv = getByTestId('header-component');
    // Position: center to top-left conversion
    // left = (x * scale) - (width / 2) = 400 - 100 = 300
    // top = (y * scale) - (height / 2) = 100 - 25 = 75
    expect(headerDiv).toHaveStyle({
      '--header-left': '300px',
      '--header-top': '75px',
      '--header-width': '200px',
      '--header-height': '50px',
      '--header-transform': 'none',
    });
  });

  it('should scale dimensions correctly', () => {
    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} scale={0.5} />);

    const headerDiv = getByTestId('header-component');
    // width = 200 * 0.5 = 100, height = 50 * 0.5 = 25
    // left = (400 * 0.5) - (100 / 2) = 200 - 50 = 150
    // top = (100 * 0.5) - (25 / 2) = 50 - 12.5 = 37.5
    expect(headerDiv).toHaveStyle({
      '--header-left': '150px',
      '--header-top': '37.5px',
      '--header-width': '100px',
      '--header-height': '25px',
    });
  });

  it('should apply rotation when provided', () => {
    const headerWithRotation = createMockHeader({
      stateBounds: {
        active: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
        success: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
        fail: { x: 400, y: 100, w: 200, h: 50, rotation: 45 },
      },
    });

    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} header={headerWithRotation} />);

    const headerDiv = getByTestId('header-component');
    expect(headerDiv).toHaveStyle({
      '--header-transform': 'rotate(45deg)',
    });
  });

  it('should call onCycleState when clicked', () => {
    const onCycleState = vi.fn();
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = getByTestId('header-component');
    fireEvent.click(headerDiv);

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should call onCycleState when Enter key is pressed', () => {
    const onCycleState = vi.fn();
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = getByTestId('header-component');
    fireEvent.keyDown(headerDiv, { key: 'Enter' });

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should call onCycleState when Space key is pressed', () => {
    const onCycleState = vi.fn();
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = getByTestId('header-component');
    fireEvent.keyDown(headerDiv, { key: ' ' });

    expect(onCycleState).toHaveBeenCalledTimes(1);
  });

  it('should not call onCycleState for other keys', () => {
    const onCycleState = vi.fn();
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} onCycleState={onCycleState} />);

    const headerDiv = getByTestId('header-component');
    fireEvent.keyDown(headerDiv, { key: 'a' });
    fireEvent.keyDown(headerDiv, { key: 'Escape' });

    expect(onCycleState).not.toHaveBeenCalled();
  });

  it('should display correct state in data attribute', () => {
    const { container, getByTestId, rerender } = render(<HeaderRenderer {...defaultProps} />);

    let headerDiv = getByTestId('header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'active');

    rerender(<HeaderRenderer {...defaultProps} currentState="success" />);
    headerDiv = getByTestId('header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'success');

    rerender(<HeaderRenderer {...defaultProps} currentState="fail" />);
    headerDiv = getByTestId('header-component');
    expect(headerDiv).toHaveAttribute('data-header-state', 'fail');
  });

  it('should have correct ARIA attributes', () => {
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} currentState="success" />);

    const headerDiv = getByTestId('header-component');
    expect(headerDiv).toBeInTheDocument();
    expect(headerDiv).toHaveAttribute('tabIndex', '0');
    expect(headerDiv).toHaveAttribute('role', 'button');
  });

  it('should make image non-draggable', () => {
    const { getByTestId } = render(<HeaderRenderer {...defaultProps} />);

    const img = getByTestId('header-image');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should have correct title attribute', () => {
    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} currentState="fail" />);

    const headerDiv = getByTestId('header-component');
    expect(headerDiv).toHaveAttribute('title', 'Header Component (FAIL) - Click to cycle states');
  });

  it('should handle image load errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByTestId } = render(<HeaderRenderer {...defaultProps} currentState="success" />);
    const img = getByTestId('header-image');

    // Trigger error
    img.dispatchEvent(new Event('error'));

    // Verify logger.warn was called with structured logging
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArg = consoleSpy.mock.calls[0][0];
    expect(callArg).toContain('[WARN]');
    expect(callArg).toContain('Header image failed to load');
    expect(callArg).toContain(defaultProps.headerImage);

    consoleSpy.mockRestore();
  });

  it('should apply correct CSS class names', () => {
    const { container, getByTestId } = render(<HeaderRenderer {...defaultProps} />);

    expect(getByTestId('header-component')).toBeInTheDocument();
    expect(getByTestId('header-image')).toBeInTheDocument();
  });
});
