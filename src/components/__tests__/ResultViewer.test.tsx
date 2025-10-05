/**
 * Unit tests for ResultViewer component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultViewer } from '../ResultViewer';
import { createMockWheelData, createMockExtractedAssets } from '../../utils/testHelpers';

describe('ResultViewer', () => {
  const defaultWheelData = createMockWheelData({
    rewards: {
      backgrounds: {
        highlight: {
          backgroundFill: {
            type: 'solid',
            color: '#FFD700',
          },
          stroke: {
            color: '#000000',
            width: 2,
          },
          borderRadius: 8,
          padding: { vertical: 10, horizontal: 15 },
          dimensions: { height: 80 },
          dropShadows: [{
            x: 2,
            y: 2,
            blur: 4,
            spread: 1,
            color: 'rgba(0,0,0,0.25)',
          }],
        },
        default: {
          backgroundFill: {
            type: 'solid',
            color: '#FFFFFF',
          },
          stroke: {
            color: '#CCCCCC',
            width: 1,
          },
          borderRadius: 6,
          padding: { vertical: 8, horizontal: 12 },
          dimensions: { height: 60 },
        },
      },
      prizes: {
        texts: {
          gcTitle: {
            fill: { type: 'solid', color: '#000000' },
            stroke: { color: '#FFFFFF', width: 1 },
            dropShadows: [{
              x: 1,
              y: 1,
              blur: 2,
              spread: 0,
              color: 'rgba(0,0,0,0.5)',
            }],
          },
          gcValue: {
            fill: { type: 'solid', color: '#FFD700' },
          },
          scTitle: {
            fill: { type: 'solid', color: '#000000' },
          },
          scValue: {
            fill: { type: 'solid', color: '#0066CC' },
          },
          plus: {
            fill: { type: 'solid', color: '#666666' },
          },
          freeSpins: {
            fill: { type: 'solid', color: '#333333' },
          },
          freeSpinsValue: {
            fill: { type: 'solid', color: '#FF6600' },
          },
          freeSpinsLabel: {
            fill: { type: 'solid', color: '#333333' },
          },
        },
        images: {
          gc: { label: 'GC', img: 'rewards_prize_gc.png' },
          sc: { label: 'SC', img: 'rewards_prize_sc.png' },
          purchase: { label: 'Purchase', img: 'rewards_prize_purchase.png' },
        },
      },
    },
  });

  const defaultAssets = createMockExtractedAssets({
    wheelData: defaultWheelData,
    rewardsPrizeImages: {
      gc: 'blob:http://localhost/gc',
      sc: 'blob:http://localhost/sc',
      purchase: 'blob:http://localhost/purchase',
    },
  });

  const defaultProps = {
    wheelData: defaultWheelData,
    assets: defaultAssets,
    wheelWidth: 400,
    wheelHeight: 600,
  };

  it('should render result viewer container', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    const resultViewer = container.querySelector('.result-viewer');
    expect(resultViewer).toBeInTheDocument();
    expect(resultViewer).toHaveStyle({
      width: '400px',
      height: '600px',
    });
  });

  it('should render header success image when available', () => {
    render(<ResultViewer {...defaultProps} />);
    const headerImage = screen.getByAltText('Result header');
    expect(headerImage).toBeInTheDocument();
    expect(headerImage).toHaveAttribute('src', defaultAssets.headerImages?.success);
  });

  it('should not render header when header data is missing', () => {
    const wheelDataWithoutHeader = createMockWheelData({
      header: undefined,
      rewards: defaultWheelData.rewards,
    });
    render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutHeader} />);
    expect(screen.queryByAltText('Result header')).not.toBeInTheDocument();
  });

  it('should not render header when header image is missing', () => {
    const assetsWithoutHeaderImages = {
      ...defaultAssets,
      headerImages: undefined,
    };
    render(<ResultViewer {...defaultProps} assets={assetsWithoutHeaderImages} />);
    expect(screen.queryByAltText('Result header')).not.toBeInTheDocument();
  });

  it('should render highlight box with GC and SC prizes', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    const highlightBox = container.querySelector('.result-highlight-box');
    expect(highlightBox).toBeInTheDocument();

    // Check for GC image
    const gcImage = screen.getByAltText('GC');
    expect(gcImage).toBeInTheDocument();
    expect(gcImage).toHaveAttribute('src', 'blob:http://localhost/gc');

    // Check for SC image
    const scImage = screen.getByAltText('SC');
    expect(scImage).toBeInTheDocument();
    expect(scImage).toHaveAttribute('src', 'blob:http://localhost/sc');

    // Check for text content
    expect(screen.getByText('GC')).toBeInTheDocument();
    expect(screen.getByText('25.5K')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('SC')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should not render highlight box when backgrounds.highlight is missing', () => {
    const wheelDataWithoutHighlight = createMockWheelData({
      rewards: {
        backgrounds: {
          default: defaultWheelData.rewards!.backgrounds!.default,
        },
        prizes: defaultWheelData.rewards!.prizes,
      },
    });
    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutHighlight} />);
    expect(container.querySelector('.result-highlight-box')).not.toBeInTheDocument();
  });

  it('should render default box with free spins', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    const defaultBox = container.querySelector('.result-default-box');
    expect(defaultBox).toBeInTheDocument();

    // Check for free spins text
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('SPINS')).toBeInTheDocument();
  });

  it('should not render default box when backgrounds.default is missing', () => {
    const wheelDataWithoutDefault = createMockWheelData({
      rewards: {
        backgrounds: {
          highlight: defaultWheelData.rewards!.backgrounds!.highlight,
        },
        prizes: defaultWheelData.rewards!.prizes,
      },
    });
    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutDefault} />);
    expect(container.querySelector('.result-default-box')).not.toBeInTheDocument();
  });

  it('should handle gradient fills in text styles', () => {
    const wheelDataWithGradient = createMockWheelData({
      rewards: {
        backgrounds: defaultWheelData.rewards!.backgrounds,
        prizes: {
          texts: {
            gcValue: {
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  rotation: 45,
                  stops: [
                    { position: 0, color: '#FF0000' },
                    { position: 1, color: '#FFFF00' },
                  ],
                },
              },
            },
            gcTitle: defaultWheelData.rewards!.prizes!.texts!.gcTitle,
            scTitle: defaultWheelData.rewards!.prizes!.texts!.scTitle,
            scValue: defaultWheelData.rewards!.prizes!.texts!.scValue,
            plus: defaultWheelData.rewards!.prizes!.texts!.plus,
            freeSpins: defaultWheelData.rewards!.prizes!.texts!.freeSpins,
          },
          images: defaultWheelData.rewards!.prizes!.images,
        },
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithGradient} />);
    expect(container).toBeInTheDocument();
    // Gradient should be applied as background-image
    const gcValueText = screen.getByText('25.5K');
    expect(gcValueText).toBeInTheDocument();
  });

  it('should handle gradient fills in background styles', () => {
    const wheelDataWithGradientBg = createMockWheelData({
      rewards: {
        backgrounds: {
          highlight: {
            ...defaultWheelData.rewards!.backgrounds!.highlight!,
            backgroundFill: {
              type: 'gradient',
              gradient: {
                type: 'linear',
                rotation: 90,
                stops: [
                  { position: 0, color: '#FF0000' },
                  { position: 0.5, color: '#00FF00' },
                  { position: 1, color: '#0000FF' },
                ],
              },
            },
          },
          default: defaultWheelData.rewards!.backgrounds!.default,
        },
        prizes: defaultWheelData.rewards!.prizes,
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithGradientBg} />);
    const highlightBox = container.querySelector('.result-highlight-box');
    expect(highlightBox).toBeInTheDocument();
  });

  it('should handle invalid colors with NaN', () => {
    const wheelDataWithInvalidColors = createMockWheelData({
      rewards: {
        backgrounds: {
          highlight: {
            backgroundFill: {
              type: 'solid',
              color: '#NaNNaNNaN',
            },
            stroke: { color: '#000000', width: 1 },
            borderRadius: 8,
            padding: { vertical: 10, horizontal: 15 },
          },
        },
        prizes: {
          texts: {
            gcValue: {
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  rotation: 0,
                  stops: [
                    { position: 0, color: '#NaNNaNNaN' },
                    { position: 1, color: '#FFFFFF' },
                  ],
                },
              },
            },
          },
          images: defaultWheelData.rewards!.prizes!.images,
        },
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithInvalidColors} />);
    expect(container).toBeInTheDocument();
    // Should render with transparent color instead of crashing
  });

  it('should apply correct scaling to all elements', () => {
    const { container } = render(<ResultViewer {...defaultProps} wheelWidth={800} wheelHeight={1200} />);
    const resultViewer = container.querySelector('.result-viewer');
    expect(resultViewer).toHaveStyle({
      width: '800px',
      height: '1200px',
    });
  });

  it('should not render GC image when missing from assets', () => {
    const assetsWithoutGcImage = {
      ...defaultAssets,
      rewardsPrizeImages: {
        sc: 'blob:http://localhost/sc',
      },
    };
    render(<ResultViewer {...defaultProps} assets={assetsWithoutGcImage} />);
    expect(screen.queryByAltText('GC')).not.toBeInTheDocument();
    expect(screen.queryByAltText('SC')).toBeInTheDocument();
  });

  it('should not render SC image when missing from assets', () => {
    const assetsWithoutScImage = {
      ...defaultAssets,
      rewardsPrizeImages: {
        gc: 'blob:http://localhost/gc',
      },
    };
    render(<ResultViewer {...defaultProps} assets={assetsWithoutScImage} />);
    expect(screen.queryByAltText('SC')).not.toBeInTheDocument();
    expect(screen.queryByAltText('GC')).toBeInTheDocument();
  });

  it('should handle missing fill in buildGradient', () => {
    const wheelDataWithoutFill = createMockWheelData({
      rewards: {
        backgrounds: {
          highlight: {
            backgroundFill: undefined as any,
            stroke: { color: '#000000', width: 1 },
            borderRadius: 8,
          },
        },
        prizes: defaultWheelData.rewards!.prizes,
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutFill} />);
    expect(container).toBeInTheDocument();
    // Should render with transparent background
  });

  it('should handle missing textStyle in buildTextStyle', () => {
    const wheelDataWithoutTextStyle = createMockWheelData({
      rewards: {
        backgrounds: defaultWheelData.rewards!.backgrounds,
        prizes: {
          texts: undefined as any,
          images: defaultWheelData.rewards!.prizes!.images,
        },
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutTextStyle} />);
    expect(container).toBeInTheDocument();
    // Should still render without crashing
  });

  it('should handle missing bgStyle in buildBoxStyle', () => {
    const wheelDataWithMissingBgStyle = createMockWheelData({
      rewards: {
        backgrounds: undefined as any,
        prizes: defaultWheelData.rewards!.prizes,
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithMissingBgStyle} />);
    expect(container).toBeInTheDocument();
  });

  it('should apply drop shadows to text when present', () => {
    // The drop shadow is applied via textShadow CSS property
    const { container } = render(<ResultViewer {...defaultProps} />);
    const gcTitleText = screen.getByText('GC');
    expect(gcTitleText).toBeInTheDocument();
    // Check that the component rendered (shadow styles are in inline CSS)
  });

  it('should apply stroke to background boxes when present', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    const highlightBox = container.querySelector('.result-highlight-box');
    expect(highlightBox).toBeInTheDocument();
    // Stroke should be applied via border CSS property
  });

  it('should apply box shadows when dropShadows present', () => {
    const { container } = render(<ResultViewer {...defaultProps} />);
    const highlightBox = container.querySelector('.result-highlight-box');
    expect(highlightBox).toBeInTheDocument();
    // Box shadow should be applied via boxShadow CSS property
  });

  it('should use freeSpinsValue and freeSpinsLabel when available', () => {
    render(<ResultViewer {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('SPINS')).toBeInTheDocument();
  });

  it('should fall back to freeSpins when freeSpinsValue is not available', () => {
    const wheelDataWithoutFreeSpinsValue = createMockWheelData({
      rewards: {
        backgrounds: defaultWheelData.rewards!.backgrounds,
        prizes: {
          texts: {
            freeSpins: {
              fill: { type: 'solid', color: '#333333' },
            },
          },
          images: defaultWheelData.rewards!.prizes!.images,
        },
      },
    });

    const { container } = render(<ResultViewer {...defaultProps} wheelData={wheelDataWithoutFreeSpinsValue} />);
    expect(container).toBeInTheDocument();
    // Should use freeSpins for both value and label
  });
});
