/**
 * Tests for FreeSpinsRow component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { FreeSpinsRow } from '../FreeSpinsRow';
import { RewardsComponent } from '../../../types';

describe('FreeSpinsRow', () => {
  const mockRewards: RewardsComponent = {
    backgrounds: {
      default: {
        borderRadius: 4,
        backgroundFill: {
          type: 'solid',
          color: '#1a1a1a',
        },
        stroke: { width: 1, color: '#333333' },
        dropShadows: [],
      },
    },
    prizes: {
      texts: {
        freeSpinsValue: {
          label: 'Free Spins Value',
          fill: { type: 'solid', color: '#ffffff' },
        },
        freeSpinsLabel: {
          label: 'Free Spins Label',
          fill: { type: 'solid', color: '#aaaaaa' },
        },
      },
    },
  };

  const mockBuildTextStyle = jest.fn((textStyle: any, fontSize: number) => ({
    fontSize: `${fontSize}px`,
    color: textStyle?.fill?.color || '#ffffff',
  }));

  const mockBuildBoxStyle = jest.fn((bgStyle: any) => ({
    background: bgStyle?.backgroundFill?.color || 'transparent',
    borderRadius: `${bgStyle?.borderRadius || 0}px`,
  }));

  const defaultProps = {
    value: '10',
    rewards: mockRewards,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    scale: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<FreeSpinsRow {...defaultProps} />);
    expect(container.querySelector('.result-freespins-box')).toBeInTheDocument();
  });

  it('displays free spins value', () => {
    const { getByText } = render(<FreeSpinsRow {...defaultProps} />);
    expect(getByText('10')).toBeInTheDocument();
  });

  it('displays default label when not provided', () => {
    const { getByText } = render(<FreeSpinsRow {...defaultProps} />);
    expect(getByText('FREE')).toBeInTheDocument();
    expect(getByText('SPINS')).toBeInTheDocument();
  });

  it('displays custom label when provided', () => {
    const { getByText } = render(<FreeSpinsRow {...defaultProps} label="BONUS ROUNDS" />);
    expect(getByText('BONUS')).toBeInTheDocument();
    expect(getByText('ROUNDS')).toBeInTheDocument();
  });

  it('handles single word label', () => {
    const { getAllByText } = render(<FreeSpinsRow {...defaultProps} label="SPINS" />);
    // Single word gets used for both first and second part
    const spinsElements = getAllByText('SPINS');
    expect(spinsElements).toHaveLength(2);
  });

  it('calls buildBoxStyle with default background', () => {
    render(<FreeSpinsRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for value and labels', () => {
    render(<FreeSpinsRow {...defaultProps} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.freeSpinsValue,
      expect.any(Number)
    );
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.freeSpinsLabel,
      expect.any(Number)
    );
  });

  it('falls back to freeSpins text style when specific styles are missing', () => {
    const rewardsWithLegacyStyle: RewardsComponent = {
      backgrounds: mockRewards.backgrounds,
      prizes: {
        texts: {
          freeSpins: {
            label: 'Free Spins',
            fill: { type: 'solid', color: '#ffffff' },
          },
        },
      },
    };

    render(<FreeSpinsRow {...defaultProps} rewards={rewardsWithLegacyStyle} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      rewardsWithLegacyStyle.prizes?.texts?.freeSpins,
      expect.any(Number)
    );
  });

  it('returns null when background style is missing', () => {
    const rewardsWithoutBg = { ...mockRewards, backgrounds: {} };
    const { container } = render(<FreeSpinsRow {...defaultProps} rewards={rewardsWithoutBg} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined rewards', () => {
    const { container } = render(<FreeSpinsRow {...defaultProps} rewards={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies proper CSS classes', () => {
    const { container } = render(<FreeSpinsRow {...defaultProps} />);
    const box = container.querySelector('.result-default-box');
    expect(box).toHaveClass('result-freespins-box');
  });
});
