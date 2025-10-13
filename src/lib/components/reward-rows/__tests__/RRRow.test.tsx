/**
 * Tests for RRRow component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RRRow } from '@components/reward-rows/RRRow';
import { RewardsComponent } from '@lib-types';

describe('RRRow', () => {
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
        rr: {
          label: 'Random Reward',
          fill: { type: 'solid', color: '#ff00ff' },
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
    rewards: mockRewards,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    scale: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<RRRow {...defaultProps} />);
    expect(container.querySelector('.result-rr-box')).toBeInTheDocument();
  });

  it('displays default label when not provided', () => {
    const { getByText } = render(<RRRow {...defaultProps} />);
    expect(getByText('RANDOM REWARD')).toBeInTheDocument();
  });

  it('displays custom label when provided', () => {
    const { getByText } = render(<RRRow {...defaultProps} label="MYSTERY PRIZE" />);
    expect(getByText('MYSTERY PRIZE')).toBeInTheDocument();
  });

  it('calls buildBoxStyle with default background', () => {
    render(<RRRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for label', () => {
    render(<RRRow {...defaultProps} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.rr,
      expect.any(Number)
    );
  });

  it('returns null when background style is missing', () => {
    const rewardsWithoutBg = { ...mockRewards, backgrounds: {} };
    const { container } = render(<RRRow {...defaultProps} rewards={rewardsWithoutBg} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined rewards', () => {
    const { container } = render(<RRRow {...defaultProps} rewards={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies proper CSS classes', () => {
    const { container } = render(<RRRow {...defaultProps} />);
    const box = container.querySelector('.result-default-box');
    expect(box).toHaveClass('result-rr-box');
  });

  it('applies proper layout', () => {
    const { container } = render(<RRRow {...defaultProps} />);
    const content = container.querySelector('.result-rr-box > div');
    expect(content).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
});
