/**
 * Tests for FailRow component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { FailRow } from '../FailRow';
import { RewardsComponent } from '../../../types';

describe('FailRow', () => {
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
        fail: {
          label: 'Fail',
          fill: { type: 'solid', color: '#ff0000' },
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
    const { container } = render(<FailRow {...defaultProps} />);
    expect(container.querySelector('.result-fail-box')).toBeInTheDocument();
  });

  it('displays default message when not provided', () => {
    const { getByText } = render(<FailRow {...defaultProps} />);
    expect(getByText('TRY AGAIN')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    const { getByText } = render(<FailRow {...defaultProps} message="BETTER LUCK NEXT TIME" />);
    expect(getByText('BETTER LUCK NEXT TIME')).toBeInTheDocument();
  });

  it('calls buildBoxStyle with default background', () => {
    render(<FailRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for message', () => {
    render(<FailRow {...defaultProps} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.fail,
      expect.any(Number)
    );
  });

  it('returns null when background style is missing', () => {
    const rewardsWithoutBg = { ...mockRewards, backgrounds: {} };
    const { container } = render(<FailRow {...defaultProps} rewards={rewardsWithoutBg} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined rewards', () => {
    const { container } = render(<FailRow {...defaultProps} rewards={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies proper CSS classes', () => {
    const { container } = render(<FailRow {...defaultProps} />);
    const box = container.querySelector('.result-default-box');
    expect(box).toHaveClass('result-fail-box');
  });

  it('applies proper layout', () => {
    const { container } = render(<FailRow {...defaultProps} />);
    const content = container.querySelector('.result-fail-box > div');
    expect(content).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
});
