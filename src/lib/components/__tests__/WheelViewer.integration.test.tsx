/**
 * Simplified integration tests for WheelViewer
 * These tests verify basic rendering and state management without extensive mocking
 * Full E2E integration testing is done via Playwright tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { WheelViewer } from '../WheelViewer';
import { WheelExport, ExtractedAssets } from '../../types';

describe('WheelViewer Integration', () => {
  const mockWheelData: WheelExport = {
    wheelId: 'test-wheel-1',
    frameSize: { width: 800, height: 600 },
    background: { exportUrl: 'background.png' },
    center: { x: 400, y: 300, radius: 50 },
    segments: {},
    exportedAt: '2024-01-01T00:00:00Z',
    metadata: { exportFormat: 'test', version: '1.0.0' },
  };

  const mockAssets: ExtractedAssets = {
    wheelData: mockWheelData,
  };

  const defaultComponentVisibility = {
    background: false,
    header: false,
    wheelBg: false,
    wheelTop1: false,
    wheelTop2: false,
    lights: false,
    buttonSpin: false,
    center: false,
    pointer: false,
    segments: false,
  };

  const defaultProps = {
    wheelData: mockWheelData,
    assets: mockAssets,
    wheelWidth: 800,
    wheelHeight: 600,
    segmentCount: 8,
    componentVisibility: defaultComponentVisibility,
    onToggleCenter: jest.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<WheelViewer {...defaultProps} />);
    expect(container.querySelector('.wheel-viewer')).toBeInTheDocument();
  });

  it('should render debug controls', () => {
    const { container } = render(<WheelViewer {...defaultProps} />);
    expect(container.querySelector('.debug-controls')).toBeInTheDocument();
  });

  it('should calculate container dimensions based on scale', () => {
    const { container } = render(
      <WheelViewer {...defaultProps} wheelWidth={400} wheelHeight={300} />
    );
    const wheelContainer = container.querySelector('.wheel-container');

    // Scale should be 0.5 (min(400/800, 300/600))
    expect(wheelContainer).toHaveStyle({
      width: '400px',
      height: '300px',
    });
  });
});
