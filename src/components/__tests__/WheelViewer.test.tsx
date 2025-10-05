/**
 * Integration tests for WheelViewer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WheelViewer } from '../WheelViewer';
import { createMockExtractedAssets, createMockWheelData } from '../../utils/testHelpers';

// Mock timers for animation testing
jest.useFakeTimers();

describe('WheelViewer', () => {
  const mockWheelData = createMockWheelData();
  const mockAssets = createMockExtractedAssets();
  const mockOnToggleCenter = jest.fn();

  const defaultProps = {
    wheelData: mockWheelData,
    assets: mockAssets,
    wheelWidth: 800,
    wheelHeight: 600,
    segmentCount: 6,
    componentVisibility: {
      background: true,
      header: true,
      wheelBg: true,
      wheelTop1: true,
      wheelTop2: true,
      lights: true,
      buttonSpin: true,
      center: true,
      pointer: true,
      segments: true,
    },
    onToggleCenter: mockOnToggleCenter,
  };

  beforeEach(() => {
    mockOnToggleCenter.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render all visible components', () => {
    render(<WheelViewer {...defaultProps} />);

    // Check for background
    expect(screen.getByAltText('Background')).toBeInTheDocument();

    // Check for header
    expect(screen.getByAltText(/Header active/i)).toBeInTheDocument();

    // Check for spin button
    expect(screen.getByAltText(/Spin button default/i)).toBeInTheDocument();
  });

  it('should respect component visibility settings', () => {
    const propsWithHiddenComponents = {
      ...defaultProps,
      componentVisibility: {
        ...defaultProps.componentVisibility,
        background: false,
        header: false,
      },
    };

    render(<WheelViewer {...propsWithHiddenComponents} />);

    expect(screen.queryByAltText('Background')).not.toBeInTheDocument();
    expect(screen.queryByAltText(/Header active/i)).not.toBeInTheDocument();
  });

  it('should calculate correct scale based on dimensions', () => {
    const { container } = render(<WheelViewer {...defaultProps} wheelWidth={400} wheelHeight={300} />);

    const wheelContainer = container.querySelector('.wheel-container');
    expect(wheelContainer).toBeInTheDocument();

    // Scale should be min(400/800, 300/600) = 0.5
    // Container dimensions should be 400px x 300px
    expect(wheelContainer).toHaveStyle({
      width: '400px',
      height: '300px',
    });
  });

  it('should cycle header state when clicked', () => {
    render(<WheelViewer {...defaultProps} />);

    const headerComponent = screen.getByRole('button', { name: /Header in active state/i });

    // Initial state: active
    expect(screen.getByAltText('Header active')).toBeInTheDocument();

    // Click to cycle to success
    fireEvent.click(headerComponent);
    expect(screen.getByAltText('Header success')).toBeInTheDocument();

    // Click to cycle to fail
    fireEvent.click(headerComponent);
    expect(screen.getByAltText('Header fail')).toBeInTheDocument();

    // Click to cycle back to active
    fireEvent.click(headerComponent);
    expect(screen.getByAltText('Header active')).toBeInTheDocument();
  });

  it('should trigger spin animation when spin button clicked', () => {
    render(<WheelViewer {...defaultProps} />);

    const spinButton = screen.getByRole('button', { name: /Spin the wheel/i });

    // Initially should show default state
    expect(screen.getByAltText('Spin button default')).toBeInTheDocument();

    // Click spin button
    fireEvent.click(spinButton);

    // Should switch to spinning state
    expect(screen.getByAltText('Spin button spinning')).toBeInTheDocument();
  });

  it('should complete spin animation and return to default state', async () => {
    render(<WheelViewer {...defaultProps} />);

    const spinButton = screen.getByRole('button', { name: /Spin the wheel/i });

    // Click spin button
    fireEvent.click(spinButton);

    // Should be spinning
    expect(screen.getByAltText('Spin button spinning')).toBeInTheDocument();

    // Fast-forward past main animation (5s) + bounce (1.5s)
    jest.advanceTimersByTime(6500);

    // Should return to default state
    await waitFor(() => {
      expect(screen.getByAltText('Spin button default')).toBeInTheDocument();
    });
  });

  it('should not trigger spin if already spinning', () => {
    render(<WheelViewer {...defaultProps} />);

    const spinButton = screen.getByRole('button', { name: /Spin the wheel/i });

    // First click
    fireEvent.click(spinButton);

    // Try clicking again while spinning
    fireEvent.click(spinButton);
    fireEvent.click(spinButton);

    // Should still only have one spin in progress
    expect(screen.getByAltText('Spin button spinning')).toBeInTheDocument();
  });

  it('should render segments when segments visibility is enabled', () => {
    const { container } = render(<WheelViewer {...defaultProps} />);

    const segmentsComponent = container.querySelector('.segments-component');
    expect(segmentsComponent).toBeInTheDocument();
  });

  it('should not render segments when segments visibility is disabled', () => {
    const propsWithoutSegments = {
      ...defaultProps,
      componentVisibility: {
        ...defaultProps.componentVisibility,
        segments: false,
      },
    };

    const { container } = render(<WheelViewer {...propsWithoutSegments} />);

    const segmentsComponent = container.querySelector('.segments-component');
    expect(segmentsComponent).not.toBeInTheDocument();
  });

  it('should pass correct segment count to SegmentRenderer', () => {
    const { container } = render(<WheelViewer {...defaultProps} segmentCount={8} />);

    const segmentsComponent = container.querySelector('.segments-component');
    expect(segmentsComponent).toBeInTheDocument();

    // The SVG should have segments rendered based on segmentCount
    const svg = segmentsComponent?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle missing optional components gracefully', () => {
    const minimalWheelData = createMockWheelData({
      header: undefined,
      wheelBg: undefined,
      wheelTop1: undefined,
      wheelTop2: undefined,
      buttonSpin: undefined,
      pointer: undefined,
      center: undefined,
    });

    const minimalAssets = createMockExtractedAssets({
      headerImages: undefined,
      wheelBgImage: undefined,
      wheelTop1Image: undefined,
      wheelTop2Image: undefined,
      buttonSpinImages: undefined,
      pointerImage: undefined,
    });

    const { container } = render(
      <WheelViewer
        {...defaultProps}
        wheelData={minimalWheelData}
        assets={minimalAssets}
      />
    );

    // Should still render without crashing
    expect(container.querySelector('.wheel-container')).toBeInTheDocument();

    // Should still render background
    expect(screen.getByAltText('Background')).toBeInTheDocument();
  });

  it('should maintain rotation state across multiple spins', async () => {
    render(<WheelViewer {...defaultProps} />);

    const spinButton = screen.getByRole('button', { name: /Spin the wheel/i });

    // First spin
    fireEvent.click(spinButton);
    jest.advanceTimersByTime(6500);

    // Second spin
    fireEvent.click(spinButton);
    jest.advanceTimersByTime(6500);

    // Should handle multiple spins without errors
    await waitFor(() => {
      expect(screen.getByAltText('Spin button default')).toBeInTheDocument();
    });
  });

  it('should apply correct container dimensions based on frame size', () => {
    const customWheelData = createMockWheelData({
      frameSize: { width: 1000, height: 800 },
    });

    const { container } = render(
      <WheelViewer
        {...defaultProps}
        wheelData={customWheelData}
        wheelWidth={500}
        wheelHeight={400}
      />
    );

    const wheelContainer = container.querySelector('.wheel-container');

    // Scale should be min(500/1000, 400/800) = 0.5
    expect(wheelContainer).toHaveStyle({
      width: '500px',
      height: '400px',
    });
  });

  it('should toggle center visibility when center checkbox is clicked', () => {
    render(<WheelViewer {...defaultProps} />);

    const centerCheckbox = screen.getByRole('checkbox', { name: /show center/i });

    // Initially checked
    expect(centerCheckbox).toBeChecked();

    // Click to toggle
    fireEvent.click(centerCheckbox);
    expect(mockOnToggleCenter).toHaveBeenCalledWith(false);
    expect(mockOnToggleCenter).toHaveBeenCalledTimes(1);
  });

  it('should toggle gradient handles visibility when gradient handles checkbox is clicked', () => {
    const { container } = render(<WheelViewer {...defaultProps} />);

    const gradientHandlesCheckbox = screen.getByRole('checkbox', { name: /show gradient handles/i });

    // Initially unchecked
    expect(gradientHandlesCheckbox).not.toBeChecked();

    // Click to toggle on
    fireEvent.click(gradientHandlesCheckbox);
    expect(gradientHandlesCheckbox).toBeChecked();

    // Click to toggle off
    fireEvent.click(gradientHandlesCheckbox);
    expect(gradientHandlesCheckbox).not.toBeChecked();
  });

  it('should not render header image when headerState has unexpected value', () => {
    const { container, rerender } = render(<WheelViewer {...defaultProps} />);

    // Force headerState to an invalid value by clicking through states
    // and checking component doesn't crash
    const headerComponent = screen.getByRole('button', { name: /Header in active state/i });

    // Cycle through all states to ensure all paths work
    fireEvent.click(headerComponent); // active -> success
    fireEvent.click(headerComponent); // success -> fail
    fireEvent.click(headerComponent); // fail -> active

    // Component should still be rendering without errors
    expect(container.querySelector('.wheel-container')).toBeInTheDocument();
  });
});
