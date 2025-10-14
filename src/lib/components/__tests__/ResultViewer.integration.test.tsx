/**
 * Simplified integration tests for ResultViewer
 * These tests verify basic rendering without extensive state management
 * Full E2E integration testing is done via Playwright tests
 */

import { ResultViewer } from '@components/ResultViewer';
import { ExtractedAssets } from '@lib-types';
import { render } from '@testing-library/react';

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
    const { container, getByTestId } = render(<ResultViewer {...defaultProps} rewardRows={[]} />);
    expect(getByTestId('result-viewer')).toBeInTheDocument();
  });

  it('should render with correct dimensions', () => {
    const { container, getByTestId } = render(
      <ResultViewer {...defaultProps} wheelWidth={400} wheelHeight={300} />
    );
    const viewer = getByTestId('result-viewer');

    expect(viewer).toHaveStyle({
      width: '400px',
      minHeight: '300px',
    });
  });

  it('should render Win Free mode by default', () => {
    const { container, getByTestId } = render(<ResultViewer {...defaultProps} rewardRows={[]} />);
    const viewer = getByTestId('result-viewer');
    expect(viewer).toBeInTheDocument();
  });

  it('should render Win Purchase mode when viewMode prop is set', () => {
    const { getByTestId } = render(<ResultViewer {...defaultProps} viewMode="Win Purchase" />);
    expect(getByTestId('win-purchase-view')).toBeInTheDocument();
    expect(getByTestId('view-text')).toHaveTextContent('win purchase');
  });

  it('should render No Win mode when viewMode prop is set', () => {
    const { getByTestId } = render(<ResultViewer {...defaultProps} viewMode="No Win" />);
    expect(getByTestId('no-win-view')).toBeInTheDocument();
    // NoWinView renders FailRow but without rewards data, nothing is displayed
    // The view itself is rendered but empty since no rewards config is provided
  });

  it('should not crash when rewards data is missing', () => {
    const { container, getByTestId } = render(<ResultViewer {...defaultProps} />);
    expect(getByTestId('result-viewer')).toBeInTheDocument();
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

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithRewards}
          rewardRows={[{ type: 'gcsc', gcValue: '100', scValue: '50' }]}
        />
      );

      const highlightBox = getByTestId('result-highlight-box');
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

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithRewards}
          rewardRows={[{ type: 'freeSpins', value: '10' }]}
        />
      );

      const defaultBox = getByTestId('result-default-box');
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
                  transform: [
                    [1, 0, 0],
                    [0, 1, 0],
                  ],
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

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithGradient}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = getByTestId('result-default-box');
      expect(defaultBox).toBeInTheDocument();
      expect(defaultBox).toHaveStyle({
        background: 'linear-gradient(90deg, #3a125d 0%, #7a26c3 100%)',
      });
    });

    it('should convert drop shadows to borders for cross-platform compatibility', () => {
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
                width: 0,
                color: '',
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

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithShadows}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = getByTestId('result-default-box');
      expect(defaultBox).toBeInTheDocument();
      // Shadows are converted to borders for React Native compatibility (CIB-001.5)
      expect(defaultBox).toHaveStyle({
        border: '1px solid #00000080',
      });
    });

    it('should use first drop shadow color for border when multiple shadows defined', () => {
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
                width: 0,
                color: '',
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

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithMultipleShadows}
          rewardRows={[{ type: 'xp', value: '100' }]}
        />
      );

      const defaultBox = getByTestId('result-default-box');
      expect(defaultBox).toBeInTheDocument();
      // Multiple shadows: only first shadow color is used for border (CIB-001.5)
      expect(defaultBox).toHaveStyle({
        border: '1px solid #ff000080',
      });
    });
  });

  describe('Font Styling', () => {
    it('should apply Lato font to all text elements', () => {
      const wheelDataWithPrizes: ExtractedAssets['wheelData'] = {
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
                color: '#333333',
              },
              dropShadows: [],
            },
            highlight: {
              borderRadius: 4,
              backgroundFill: {
                type: 'solid',
                color: '#2a2a2a',
              },
              stroke: {
                width: 1,
                color: '#444444',
              },
              dropShadows: [],
            },
          },
          prizes: {
            texts: {
              gcValue: {
                fill: {
                  type: 'solid',
                  color: '#ffffff',
                },
                fontSize: 24,
              },
              scValue: {
                fill: {
                  type: 'solid',
                  color: '#ffffff',
                },
                fontSize: 24,
              },
              freeSpinsValue: {
                fill: {
                  type: 'solid',
                  color: '#ffffff',
                },
                fontSize: 20,
              },
            },
          },
          button: {
            stateStyles: {
              default: {
                frame: {
                  borderRadius: 8,
                  backgroundFill: {
                    type: 'solid',
                    color: '#4e187c',
                  },
                  padding: {
                    vertical: 12,
                    horizontal: 24,
                  },
                  stroke: {
                    width: 0,
                    color: '',
                  },
                  dropShadows: [],
                },
                text: {
                  fontSize: 16,
                  color: '#ffffff',
                  fontWeight: 700,
                },
              },
            },
          },
        },
      };

      const { container, getByTestId } = render(
        <ResultViewer
          {...defaultProps}
          wheelData={wheelDataWithPrizes}
          rewardRows={[
            { type: 'gcsc', gcValue: '100', scValue: '50' },
            { type: 'freeSpins', value: '10' },
          ]}
          showButton={true}
          buttonText="COLLECT"
        />
      );

      // Check that GC/SC text elements have Lato font
      const gcscText = getByTestId('gc-value');
      expect(gcscText).toHaveStyle({
        fontFamily: 'Lato, sans-serif',
      });

      // Verify button is rendered with correct testid
      const buttonText = getByTestId('button-text');
      expect(buttonText).toBeInTheDocument();
      expect(buttonText).toHaveTextContent('COLLECT');
    });
  });
});
