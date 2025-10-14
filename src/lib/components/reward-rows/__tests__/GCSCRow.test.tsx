/**
 * Tests for GCSCRow component
 */

import { GCSCRow } from '@components/reward-rows/GCSCRow';
import { RewardsComponent } from '@lib-types';
import { render } from '@testing-library/react';

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
    const { getByTestId } = render(<GCSCRow {...defaultProps} />);
    expect(getByTestId('result-highlight-box')).toBeInTheDocument();
  });

  it('displays GC and SC values', () => {
    const { getByTestId } = render(<GCSCRow {...defaultProps} />);
    expect(getByTestId('gc-value')).toBeInTheDocument();
    expect(getByTestId('gc-value')).toHaveTextContent('100');
    expect(getByTestId('sc-value')).toBeInTheDocument();
    expect(getByTestId('sc-value')).toHaveTextContent('50');
  });

  it('displays GC and SC labels', () => {
    const { getByTestId } = render(<GCSCRow {...defaultProps} />);
    expect(getByTestId('gc-label')).toBeInTheDocument();
    expect(getByTestId('gc-label')).toHaveTextContent('GC');
    expect(getByTestId('sc-label')).toBeInTheDocument();
    expect(getByTestId('sc-label')).toHaveTextContent('SC');
  });

  it('displays plus sign', () => {
    const { getByTestId } = render(<GCSCRow {...defaultProps} />);
    expect(getByTestId('plus-sign')).toBeInTheDocument();
    expect(getByTestId('plus-sign')).toHaveTextContent('+');
  });

  it('renders GC icon when provided', () => {
    const { getByTestId } = render(
      <GCSCRow {...defaultProps} gcIcon="data:image/png;base64,test-gc" />
    );
    const gcIcon = getByTestId('gc-icon');
    expect(gcIcon).toBeInTheDocument();
    expect(gcIcon).toHaveAttribute('src', 'data:image/png;base64,test-gc');
  });

  it('renders SC icon when provided', () => {
    const { getByTestId } = render(
      <GCSCRow {...defaultProps} scIcon="data:image/png;base64,test-sc" />
    );
    const scIcon = getByTestId('sc-icon');
    expect(scIcon).toBeInTheDocument();
    expect(scIcon).toHaveAttribute('src', 'data:image/png;base64,test-sc');
  });

  it('applies scaled icon size', () => {
    const { getByTestId } = render(
      <GCSCRow {...defaultProps} gcIcon="test.png" scaledIconSize={48} />
    );
    const icon = getByTestId('gc-icon');
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
    const { getByTestId } = render(<GCSCRow {...defaultProps} />);
    const box = getByTestId('result-highlight-box');
    const content = box.querySelector('.result-highlight-content');
    expect(content).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
});
