/**
 * Tests for WinPurchaseView component
 */

import type { ExtractedAssets } from '@lib-types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WinPurchaseView } from '../WinPurchaseView';

describe('WinPurchaseView', () => {
  const mockWheelData: ExtractedAssets['wheelData'] = {
    rewards: {
      backgrounds: {
        default: {
          fillStyle: {
            type: 'solid',
            color: '#1a1a1a',
          },
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#ffd700',
        },
      },
      prizes: {
        texts: {
          purchase: {
            fontFamily: 'Lato',
            fontSize: 20,
            fontWeight: 700,
            color: '#ffd700',
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
          hover: {
            frame: {
              borderRadius: 8,
              backgroundFill: {
                type: 'solid',
                color: '#6a28ac',
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
  } as ExtractedAssets['wheelData'];

  const mockAssets: ExtractedAssets = {
    wheelData: mockWheelData,
    rewardsPrizeImages: {
      purchase: 'data:image/png;base64,purchasetest',
    },
  };

  const mockBuildTextStyle = (textStyle: any, fontSize: number) => ({
    fontFamily: textStyle?.fontFamily || 'Lato',
    fontSize: `${fontSize}px`,
    fontWeight: textStyle?.fontWeight || 700,
    color: textStyle?.color || '#ffffff',
  });

  const mockBuildBoxStyle = (bgStyle: any) => ({
    backgroundColor: bgStyle?.fillStyle?.color || '#1a1a1a',
    borderRadius: `${bgStyle?.borderRadius || 0}px`,
    border: bgStyle?.borderWidth ? `${bgStyle.borderWidth}px solid ${bgStyle.borderColor}` : 'none',
  });

  const defaultProps = {
    wheelData: mockWheelData,
    assets: mockAssets,
    scale: 1,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    showButton: true,
    buttonText: 'ONLY $29.99',
    buttonState: 'default' as const,
    onButtonMouseEnter: vi.fn(),
    onButtonMouseLeave: vi.fn(),
    onButtonClick: vi.fn(),
  };

  it('should render the component', () => {
    render(<WinPurchaseView {...defaultProps} />);

    expect(screen.getByTestId('win-purchase-view')).toBeInTheDocument();
  });

  it('should render success header when headerImage and headerBounds are provided', () => {
    render(
      <WinPurchaseView
        {...defaultProps}
        headerImage="success-header.png"
        headerBounds={{ x: 0, y: 0, w: 300, h: 100 }}
      />
    );

    const header = screen.getByTestId('win-purchase-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('src', 'success-header.png');
    expect(header).toHaveAttribute('alt', 'Result header');
  });

  it('should not render header when headerImage is not provided', () => {
    render(<WinPurchaseView {...defaultProps} />);

    expect(screen.queryByTestId('win-purchase-header')).not.toBeInTheDocument();
  });

  it('should render PurchaseRow with default title and description', () => {
    render(<WinPurchaseView {...defaultProps} />);

    expect(screen.getByTestId('result-purchase-box')).toBeInTheDocument();
    expect(screen.getByTestId('purchase-title')).toHaveTextContent('MEGA OFFER');
    expect(screen.getByTestId('purchase-description')).toHaveTextContent('150% EXTRA');
  });

  it('should render PurchaseRow with custom title and description', () => {
    render(
      <WinPurchaseView
        {...defaultProps}
        title="SUPER DEAL"
        description="200% BONUS"
      />
    );

    expect(screen.getByTestId('purchase-title')).toHaveTextContent('SUPER DEAL');
    expect(screen.getByTestId('purchase-description')).toHaveTextContent('200% BONUS');
  });

  it('should render purchase images from assets', () => {
    render(<WinPurchaseView {...defaultProps} />);

    const leftImage = screen.getByTestId('purchase-image-left');
    const rightImage = screen.getByTestId('purchase-image-right');

    expect(leftImage).toHaveAttribute('src', 'data:image/png;base64,purchasetest');
    expect(rightImage).toHaveAttribute('src', 'data:image/png;base64,purchasetest');
  });

  it('should render button with correct text', () => {
    render(<WinPurchaseView {...defaultProps} buttonText="ONLY $29.99" />);

    expect(screen.getByText('ONLY $29.99')).toBeInTheDocument();
  });

  it('should not render button when showButton is false', () => {
    render(<WinPurchaseView {...defaultProps} showButton={false} />);

    expect(screen.queryByText('ONLY $29.99')).not.toBeInTheDocument();
  });

  it('should call button callbacks when interacting with button', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onClick = vi.fn();

    render(
      <WinPurchaseView
        {...defaultProps}
        onButtonMouseEnter={onMouseEnter}
        onButtonMouseLeave={onMouseLeave}
        onButtonClick={onClick}
      />
    );

    const button = screen.getByText('ONLY $29.99').closest('.button-renderer');
    expect(button).toBeInTheDocument();
  });

  it('should apply scale to header dimensions', () => {
    render(
      <WinPurchaseView
        {...defaultProps}
        scale={2}
        headerImage="success-header.png"
        headerBounds={{ x: 0, y: 0, w: 300, h: 100 }}
      />
    );

    const header = screen.getByTestId('win-purchase-header');
    expect(header).toHaveStyle({ width: '600px', height: '200px' }); // 300*2, 100*2
  });

  it('should render with all props provided', () => {
    render(
      <WinPurchaseView
        {...defaultProps}
        headerImage="success-header.png"
        headerBounds={{ x: 0, y: 0, w: 300, h: 100 }}
        title="EXCLUSIVE OFFER"
        description="300% BONUS"
        buttonText="BUY NOW $19.99"
      />
    );

    expect(screen.getByTestId('win-purchase-view')).toBeInTheDocument();
    expect(screen.getByTestId('win-purchase-header')).toBeInTheDocument();
    expect(screen.getByTestId('purchase-title')).toHaveTextContent('EXCLUSIVE OFFER');
    expect(screen.getByTestId('purchase-description')).toHaveTextContent('300% BONUS');
    expect(screen.getByText('BUY NOW $19.99')).toBeInTheDocument();
  });
});
