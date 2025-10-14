/**
 * Tests for RRRow component
 */

import { RRRow } from '@components/reward-rows/RRRow';
import { RewardsComponent } from '@lib-types';
import { render } from '@testing-library/react';

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
    scaledIconSize: 48,
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

  it('displays default value when not provided', () => {
    const { getByText } = render(<RRRow {...defaultProps} />);
    expect(getByText('1')).toBeInTheDocument();
  });

  it('displays custom value when provided', () => {
    const { getByText } = render(<RRRow {...defaultProps} value="5" />);
    expect(getByText('5')).toBeInTheDocument();
  });

  it('displays random reward icon by default', () => {
    const { getByTestId } = render(<RRRow {...defaultProps} />);
    const icon = getByTestId('rr-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', expect.stringContaining('random_reward.png'));
    expect(icon).toHaveAttribute('alt', 'Random Reward');
  });

  it('displays custom icon when rrIcon prop is provided', () => {
    const { getByTestId } = render(<RRRow {...defaultProps} rrIcon="custom-icon.png" />);
    const icon = getByTestId('rr-icon');
    expect(icon).toHaveAttribute('src', 'custom-icon.png');
  });

  it('calls buildBoxStyle with default background', () => {
    render(<RRRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for value', () => {
    render(<RRRow {...defaultProps} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.rr,
      24 // 24 * scale (1)
    );
  });

  it('applies scaled icon size', () => {
    const { getByTestId } = render(<RRRow {...defaultProps} />);
    const icon = getByTestId('rr-icon');
    expect(icon).toHaveStyle({ width: 'auto', height: '48px' });
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
    });
  });
});
