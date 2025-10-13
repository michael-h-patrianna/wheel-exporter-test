/**
 * Tests for GCSCRow component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { GCSCRow } from '@components/reward-rows/GCSCRow';
import { RewardsComponent } from '@lib-types';

describe('GCSCRow', () => {
  const mockRewards: RewardsComponent = {
    backgrounds: {
      highlight: {
        borderRadius: 8,
        backgroundFill: {
          type: 'solid',
          color: '#4e187c',
        },
        stroke: { width: 2, color: '#ffffff' },
        dropShadows: [],
      },
    },
    prizes: {
      texts: {
        gcTitle: {
          label: 'GC Title',
          fill: { type: 'solid', color: '#ffffff' },
        },
        gcValue: {
          label: 'GC Value',
          fill: { type: 'solid', color: '#ffd700' },
        },
        scTitle: {
          label: 'SC Title',
          fill: { type: 'solid', color: '#ffffff' },
        },
        scValue: {
          label: 'SC Value',
          fill: { type: 'solid', color: '#00ffff' },
        },
        plus: {
          label: 'Plus',
          fill: { type: 'solid', color: '#ffffff' },
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
    gcValue: '100',
    scValue: '50',
    rewards: mockRewards,
    scaledIconSize: 36,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    scale: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<GCSCRow {...defaultProps} />);
    expect(container.querySelector('.result-highlight-box')).toBeInTheDocument();
  });

  it('displays GC and SC values', () => {
    const { getByText } = render(<GCSCRow {...defaultProps} />);
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('50')).toBeInTheDocument();
  });

  it('displays GC and SC labels', () => {
    const { getByText } = render(<GCSCRow {...defaultProps} />);
    expect(getByText('GC')).toBeInTheDocument();
    expect(getByText('SC')).toBeInTheDocument();
  });

  it('displays plus sign', () => {
    const { getByText } = render(<GCSCRow {...defaultProps} />);
    expect(getByText('+')).toBeInTheDocument();
  });

  it('renders GC icon when provided', () => {
    const { container } = render(
      <GCSCRow {...defaultProps} gcIcon="data:image/png;base64,test-gc" />
    );
    const gcIcon = container.querySelector('img[alt="GC"]');
    expect(gcIcon).toBeInTheDocument();
    expect(gcIcon).toHaveAttribute('src', 'data:image/png;base64,test-gc');
  });

  it('renders SC icon when provided', () => {
    const { container } = render(
      <GCSCRow {...defaultProps} scIcon="data:image/png;base64,test-sc" />
    );
    const scIcon = container.querySelector('img[alt="SC"]');
    expect(scIcon).toBeInTheDocument();
    expect(scIcon).toHaveAttribute('src', 'data:image/png;base64,test-sc');
  });

  it('applies scaled icon size', () => {
    const { container } = render(
      <GCSCRow {...defaultProps} gcIcon="test.png" scaledIconSize={48} />
    );
    const icon = container.querySelector('img[alt="GC"]');
    expect(icon).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('calls buildBoxStyle with highlight background', () => {
    render(<GCSCRow {...defaultProps} />);
    expect(mockBuildBoxStyle).toHaveBeenCalledWith(mockRewards.backgrounds?.highlight);
  });

  it('calls buildTextStyle for each text element', () => {
    render(<GCSCRow {...defaultProps} />);
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.gcTitle,
      expect.any(Number)
    );
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.gcValue,
      expect.any(Number)
    );
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.plus,
      expect.any(Number)
    );
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.scTitle,
      expect.any(Number)
    );
    expect(mockBuildTextStyle).toHaveBeenCalledWith(
      mockRewards.prizes?.texts?.scValue,
      expect.any(Number)
    );
  });

  it('returns null when background style is missing', () => {
    const rewardsWithoutBg = { ...mockRewards, backgrounds: {} };
    const { container } = render(<GCSCRow {...defaultProps} rewards={rewardsWithoutBg} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined rewards', () => {
    const { container } = render(<GCSCRow {...defaultProps} rewards={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies proper layout structure', () => {
    const { container } = render(<GCSCRow {...defaultProps} />);
    const content = container.querySelector('.result-highlight-content');
    expect(content).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
});
