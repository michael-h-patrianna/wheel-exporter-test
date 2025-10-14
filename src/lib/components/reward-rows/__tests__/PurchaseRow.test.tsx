/**
 * Tests for PurchaseRow component
 */

import type { RewardsComponent } from '@lib-types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PurchaseRow } from '../PurchaseRow';

describe('PurchaseRow', () => {
  const mockRewards: RewardsComponent = {
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

  it('should render with default title and description', () => {
    render(
      <PurchaseRow
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    expect(screen.getByTestId('result-purchase-box')).toBeInTheDocument();
    expect(screen.getByTestId('purchase-title')).toHaveTextContent('MEGA OFFER');
    expect(screen.getByTestId('purchase-description')).toHaveTextContent('150% EXTRA');
  });

  it('should render with custom title and description', () => {
    render(
      <PurchaseRow
        title="SUPER DEAL"
        description="200% BONUS"
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    expect(screen.getByTestId('purchase-title')).toHaveTextContent('SUPER DEAL');
    expect(screen.getByTestId('purchase-description')).toHaveTextContent('200% BONUS');
  });

  it('should render purchase images when provided', () => {
    const purchaseImage = 'data:image/png;base64,test';

    render(
      <PurchaseRow
        purchaseImage={purchaseImage}
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    const leftImage = screen.getByTestId('purchase-image-left');
    const rightImage = screen.getByTestId('purchase-image-right');

    expect(leftImage).toBeInTheDocument();
    expect(leftImage).toHaveAttribute('src', purchaseImage);
    expect(rightImage).toBeInTheDocument();
    expect(rightImage).toHaveAttribute('src', purchaseImage);
  });

  it('should not render images when purchaseImage is not provided', () => {
    render(
      <PurchaseRow
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    expect(screen.queryByTestId('purchase-image-left')).not.toBeInTheDocument();
    expect(screen.queryByTestId('purchase-image-right')).not.toBeInTheDocument();
  });

  it('should apply scale to sizes', () => {
    const purchaseImage = 'data:image/png;base64,test';

    render(
      <PurchaseRow
        purchaseImage={purchaseImage}
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={2}
      />
    );

    const leftImage = screen.getByTestId('purchase-image-left');
    expect(leftImage).toHaveStyle({ width: '120px', height: '120px' }); // 60 * 2
  });

  it('should return null when rewards.backgrounds.default is undefined', () => {
    const rewardsWithoutBg = {
      ...mockRewards,
      backgrounds: undefined,
    };

    const { container } = render(
      <PurchaseRow
        rewards={rewardsWithoutBg}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should call buildTextStyle with correct parameters', () => {
    let titleStyleCalls = 0;
    let descStyleCalls = 0;

    const trackingBuildTextStyle = (textStyle: any, fontSize: number) => {
      if (fontSize === 24) titleStyleCalls++;
      if (fontSize === 20) descStyleCalls++;
      return mockBuildTextStyle(textStyle, fontSize);
    };

    render(
      <PurchaseRow
        rewards={mockRewards}
        buildTextStyle={trackingBuildTextStyle}
        buildBoxStyle={mockBuildBoxStyle}
        scale={1}
      />
    );

    expect(titleStyleCalls).toBe(1);
    expect(descStyleCalls).toBe(1);
  });

  it('should call buildBoxStyle with background style', () => {
    let boxStyleCalls = 0;

    const trackingBuildBoxStyle = (bgStyle: any) => {
      boxStyleCalls++;
      return mockBuildBoxStyle(bgStyle);
    };

    render(
      <PurchaseRow
        rewards={mockRewards}
        buildTextStyle={mockBuildTextStyle}
        buildBoxStyle={trackingBuildBoxStyle}
        scale={1}
      />
    );

    expect(boxStyleCalls).toBe(1);
  });
});
