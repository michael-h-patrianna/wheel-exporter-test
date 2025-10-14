/**
 * Tests for XPRow component
 */

import { XPRow } from '@components/reward-rows/XPRow';
import { RewardsComponent } from '@lib-types';
import { render } from '@testing-library/react';

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
    xpIcon: undefined, // Will fallback to local xp.png asset
    scaledIconSize: 36,
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

  it('displays XP icon image', () => {
    const { getByTestId } = render(<XPRow {...defaultProps} />);
    const icon = getByTestId('xp-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('alt', 'XP');
  });

  it('uses custom xpIcon when provided', () => {
    const customIcon = 'https://example.com/custom-xp.png';
    const { getByTestId } = render(<XPRow {...defaultProps} xpIcon={customIcon} />);
    const icon = getByTestId('xp-icon');
    expect(icon).toHaveAttribute('src', customIcon);
  });

  it('falls back to local xp asset when xpIcon not provided', () => {
    const { getByTestId } = render(<XPRow {...defaultProps} />);
    const icon = getByTestId('xp-icon');
    expect(icon).toHaveAttribute('src');
    expect(icon.getAttribute('src')).toContain('xp.png');
  });

  it('calls buildBoxStyle with default background', () => {
    render(<XPRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.default);
  });

  it('calls buildTextStyle for value only', () => {
    render(<XPRow {...defaultProps} />);
    // Called once - only for value (label is now an image)
    expect(mockBuildTextStyle).toHaveBeenCalledTimes(1);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.xp,
      expect.any(Number)
    );
  });

  it('applies scaled icon size', () => {
    const { getByTestId } = render(<XPRow {...defaultProps} scaledIconSize={48} />);
    const icon = getByTestId('xp-icon');
    expect(icon).toHaveStyle({ width: 'auto', height: '48px' });
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
      gap: '8px',
    });
  });
});
