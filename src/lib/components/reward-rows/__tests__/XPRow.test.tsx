/**
 * Tests for XPRow component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { XPRow } from '@components/reward-rows/XPRow';
import { RewardsComponent } from '@lib-types';

describe('XPRow', () => {
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
        xp: {
          label: 'XP',
          fill: { type: 'solid', color: '#00ff00' },
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
    value: '100',
    rewards: mockRewards,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    scale: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<XPRow {...defaultProps} />);
    expect(container.querySelector('.result-xp-box')).toBeInTheDocument();
  });

  it('displays XP value', () => {
    const { getByText } = render(<XPRow {...defaultProps} />);
    expect(getByText('100')).toBeInTheDocument();
  });

  it('displays default label when not provided', () => {
    const { getByText } = render(<XPRow {...defaultProps} />);
    expect(getByText('XP')).toBeInTheDocument();
  });

  it('displays custom label when provided', () => {
    const { getByText } = render(<XPRow {...defaultProps} label="EXPERIENCE" />);
    expect(getByText('EXPERIENCE')).toBeInTheDocument();
  });

  it('calls buildBoxStyle with default background', () => {
    render(<XPRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for value and label', () => {
    render(<XPRow {...defaultProps} />);
    // Called twice - once for value, once for label
    expect(mockBuildTextStyle).toHaveBeenCalledTimes(2);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.xp,
      expect.any(Number)
    );
  });

  it('returns null when background style is missing', () => {
    const rewardsWithoutBg = { ...mockRewards, backgrounds: {} };
    const { container } = render(<XPRow {...defaultProps} rewards={rewardsWithoutBg} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined rewards', () => {
    const { container } = render(<XPRow {...defaultProps} rewards={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies proper CSS classes', () => {
    const { container } = render(<XPRow {...defaultProps} />);
    const box = container.querySelector('.result-default-box');
    expect(box).toHaveClass('result-xp-box');
  });

  it('applies proper layout with gap', () => {
    const { container } = render(<XPRow {...defaultProps} />);
    const content = container.querySelector('.result-xp-box > div');
    expect(content).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    });
  });
});
