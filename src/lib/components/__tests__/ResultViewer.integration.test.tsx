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

  describe('Background Styling', () => {
    it('should apply highlight background to gcsc row type', () => {
      const wheelDataWithRewards: ExtractedAssets['wheelData'] = {
        ...mockWheelData,
        rewards: {
          backgrounds: {
            highlight: {
              borderRadius: 8,
              backgroundFill: {
                type: 'solid',
                color: '#4e187c',
              },
              stroke: {
                width: 2,
                color: '#ffffff',
              },
              dropShadows: [],
            },
            default: {
              borderRadius: 4,
              backgroundFill: {
                type: 'solid',
                color: '#000000',
              },
              stroke: {
                width: 1,
                color: '#333333',
              },
              dropShadows: [],
            },
          },
        },
      };

      const { container } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithRewards}
          rewardRows={[{ type: 'gcsc', gcValue: '100', scValue: '50' }]}
        />
      );

      const highlightBox = container.querySelector('.result-highlight-box');
      expect(highlightBox).toBeInTheDocument();
      expect(highlightBox).toHaveStyle({
        background: '#4e187c',
        border: '2px solid #ffffff',
        borderRadius: '8px',
      });
    });

    it('should apply default background to non-gcsc row types', () => {
      const wheelDataWithRewards: ExtractedAssets['wheelData'] = {
        ...mockWheelData,
        rewards: {
          backgrounds: {
            highlight: {
              borderRadius: 8,
              backgroundFill: {
                type: 'solid',
                color: '#4e187c',
              },
              stroke: {
                width: 2,
                color: '#ffffff',
              },
              dropShadows: [],
            },
            default: {
              borderRadius: 4,
              backgroundFill: {
                type: 'solid',
                color: '#1a1a1a',
              },
              stroke: {
                width: 1,
                color: '#333333',
              },
              dropShadows: [],
            },
          },
        },
      };

      const { container } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithRewards}
          rewardRows={[{ type: 'freeSpins', value: '10' }]}
        />
      );

      const defaultBox = container.querySelector('.result-default-box');
      expect(defaultBox).toBeInTheDocument();
      expect(defaultBox).toHaveStyle({
        background: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '4px',
      });
    });

    it('should apply gradient backgrounds correctly', () => {
      const wheelDataWithGradient: ExtractedAssets['wheelData'] = {
        ...mockWheelData,
        rewards: {
          backgrounds: {
            default: {
              borderRadius: 4,
              backgroundFill: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  rotation: 90,
                  transform: [[1, 0, 0], [0, 1, 0]],
                  stops: [
                    { color: '#3a125d', position: 0 },
                    { color: '#7a26c3', position: 1 },
                  ],
                },
              },
              stroke: {
                width: 1,
                color: '#ffffff',
              },
              dropShadows: [],
            },
          },
        },
      };

      const { container } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithGradient}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = container.querySelector('.result-default-box');
      expect(defaultBox).toBeInTheDocument();
      expect(defaultBox).toHaveStyle({
        background: 'linear-gradient(90deg, #3a125d 0%, #7a26c3 100%)',
      });
    });

    it('should apply drop shadows when defined', () => {
      const wheelDataWithShadows: ExtractedAssets['wheelData'] = {
        ...mockWheelData,
        rewards: {
          backgrounds: {
            default: {
              borderRadius: 4,
              backgroundFill: {
                type: 'solid',
                color: '#1a1a1a',
              },
              stroke: {
                width: 1,
                color: '#ffffff',
              },
              dropShadows: [
                {
                  x: 10,
                  y: 10,
                  blur: 20,
                  spread: 5,
                  color: '#00000080',
                },
              ],
            },
          },
        },
      };

      const { container } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithShadows}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = container.querySelector('.result-default-box');
      expect(defaultBox).toBeInTheDocument();
      expect(defaultBox).toHaveStyle({
        boxShadow: '10px 10px 20px 5px #00000080',
      });
    });

    it('should apply multiple drop shadows correctly', () => {
      const wheelDataWithMultipleShadows: ExtractedAssets['wheelData'] = {
        ...mockWheelData,
        rewards: {
          backgrounds: {
            default: {
              borderRadius: 4,
              backgroundFill: {
                type: 'solid',
                color: '#1a1a1a',
              },
              stroke: {
                width: 1,
                color: '#ffffff',
              },
              dropShadows: [
                {
                  x: 5,
                  y: 5,
                  blur: 10,
                  spread: 2,
                  color: '#ff000080',
                },
                {
                  x: -5,
                  y: -5,
                  blur: 10,
                  spread: 2,
                  color: '#0000ff80',
                },
              ],
            },
          },
        },
      };

      const { container } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithMultipleShadows}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = container.querySelector('.result-default-box');
      expect(defaultBox).toBeInTheDocument();
      expect(defaultBox).toHaveStyle({
        boxShadow: '5px 5px 10px 2px #ff000080, -5px -5px 10px 2px #0000ff80',
      });
    });
  });
});
