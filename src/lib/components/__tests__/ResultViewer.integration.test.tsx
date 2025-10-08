/**
 * Simplified integration tests for ResultViewer
 * These tests verify basic rendering without extensive state management
 * Full E2E integration testing is done via Playwright tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultViewer } from '../ResultViewer';
import { ExtractedAssets } from '../../types';

describe('ResultViewer Integration', () => {
  const mockWheelData: ExtractedAssets['wheelData'] = {
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

  const defaultProps = {
    wheelData: mockWheelData,
    assets: mockAssets,
    wheelWidth: 800,
    wheelHeight: 600,
  };

  it('should render without crashing', () => {
    const { container } = render(<ResultViewer {...defaultProps} rewardRows={[]} />);
    expect(container.querySelector('.result-viewer')).toBeInTheDocument();
  });

  it('should render with correct dimensions', () => {
    const { container } = render(<ResultViewer {...defaultProps} wheelWidth={400} wheelHeight={300} />);
    const viewer = container.querySelector('.result-viewer');

    expect(viewer).toHaveStyle({
      width: '400px',
      height: '300px',
    });
  });

  it('should not crash when rewards data is missing', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    expect(container.querySelector('.result-viewer')).toBeInTheDocument();
  });
});
