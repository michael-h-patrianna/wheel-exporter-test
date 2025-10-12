/**
 * Tests for RewardRow wrapper component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RewardRow } from '../RewardRow';
import { RewardsComponent } from '../../../types';

describe('RewardRow', () => {
  const mockRewards: RewardsComponent = {
    backgrounds: {
      highlight: {
        borderRadius: 8,
        backgroundFill: { type: 'solid', color: '#4e187c' },
        stroke: { width: 2, color: '#ffffff' },
        dropShadows: [],
      },
      default: {
        borderRadius: 4,
        backgroundFill: { type: 'solid', color: '#1a1a1a' },
        stroke: { width: 1, color: '#333333' },
        dropShadows: [],
      },
    },
    prizes: {
      texts: {
        gcTitle: { label: 'GC Title', fill: { type: 'solid', color: '#ffffff' } },
        gcValue: { label: 'GC Value', fill: { type: 'solid', color: '#ffd700' } },
        scTitle: { label: 'SC Title', fill: { type: 'solid', color: '#ffffff' } },
        scValue: { label: 'SC Value', fill: { type: 'solid', color: '#00ffff' } },
        plus: { label: 'Plus', fill: { type: 'solid', color: '#ffffff' } },
        freeSpinsValue: { label: 'FS Value', fill: { type: 'solid', color: '#ffffff' } },
        freeSpinsLabel: { label: 'FS Label', fill: { type: 'solid', color: '#aaaaaa' } },
        xp: { label: 'XP', fill: { type: 'solid', color: '#00ff00' } },
        rr: { label: 'RR', fill: { type: 'solid', color: '#ff00ff' } },
        fail: { label: 'Fail', fill: { type: 'solid', color: '#ff0000' } },
      },
    },
  };

  const mockBuildTextStyle = jest.fn((textStyle: any, fontSize: number) => ({
    fontSize: `${fontSize}px`,
  }));

  const mockBuildBoxStyle = jest.fn((bgStyle: any) => ({
    background: bgStyle?.backgroundFill?.color || 'transparent',
  }));

  const defaultProps = {
    index: 0,
    rewards: mockRewards,
    scaledIconSize: 36,
    buildTextStyle: mockBuildTextStyle,
    buildBoxStyle: mockBuildBoxStyle,
    scale: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Type discrimination', () => {
    it('renders GCSCRow for gcsc type', () => {
      const { container } = render(
        <RewardRow
          {...defaultProps}
          rowData={{ type: 'gcsc', gcValue: '100', scValue: '50' }}
        />
      );
      expect(container.querySelector('.result-highlight-box')).toBeInTheDocument();
    });

    it('renders FreeSpinsRow for freeSpins type', () => {
      const { container } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'freeSpins', value: '10' }} />
      );
      expect(container.querySelector('.result-freespins-box')).toBeInTheDocument();
    });

    it('renders XPRow for xp type', () => {
      const { container } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'xp', value: '100' }} />
      );
      expect(container.querySelector('.result-xp-box')).toBeInTheDocument();
    });

    it('renders RRRow for rr type', () => {
      const { container } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'rr', label: 'RANDOM' }} />
      );
      expect(container.querySelector('.result-rr-box')).toBeInTheDocument();
    });

    it('renders FailRow for fail type', () => {
      const { container } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'fail', message: 'TRY AGAIN' }} />
      );
      expect(container.querySelector('.result-fail-box')).toBeInTheDocument();
    });

    it('returns null for unknown type', () => {
      const { container } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'unknown' as any }} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Props passing', () => {
    it('passes GC and SC icons to GCSCRow', () => {
      const { container } = render(
        <RewardRow
          {...defaultProps}
          rowData={{ type: 'gcsc', gcValue: '100', scValue: '50' }}
          gcIcon="gc.png"
          scIcon="sc.png"
        />
      );
      const gcIcon = container.querySelector('img[alt="GC"]');
      const scIcon = container.querySelector('img[alt="SC"]');
      expect(gcIcon).toHaveAttribute('src', 'gc.png');
      expect(scIcon).toHaveAttribute('src', 'sc.png');
    });

    it('passes custom label to FreeSpinsRow', () => {
      const { getByText } = render(
        <RewardRow
          {...defaultProps}
          rowData={{ type: 'freeSpins', value: '5', label: 'BONUS SPINS' }}
        />
      );
      expect(getByText('BONUS')).toBeInTheDocument();
    });

    it('passes custom label to XPRow', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'xp', value: '200', label: 'EXP' }} />
      );
      expect(getByText('EXP')).toBeInTheDocument();
    });

    it('passes custom label to RRRow', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'rr', label: 'MYSTERY' }} />
      );
      expect(getByText('MYSTERY')).toBeInTheDocument();
    });

    it('passes custom message to FailRow', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'fail', message: 'GAME OVER' }} />
      );
      expect(getByText('GAME OVER')).toBeInTheDocument();
    });
  });

  describe('Default values', () => {
    it('provides default GC value of 0', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'gcsc', scValue: '50' }} />
      );
      expect(getByText('0')).toBeInTheDocument();
    });

    it('provides default SC value of 0', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'gcsc', gcValue: '100' }} />
      );
      expect(getByText('0')).toBeInTheDocument();
    });

    it('provides default value for freeSpins', () => {
      const { getByText } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'freeSpins' }} />
      );
      expect(getByText('0')).toBeInTheDocument();
    });

    it('provides default value for xp', () => {
      const { getByText } = render(<RewardRow {...defaultProps} rowData={{ type: 'xp' }} />);
      expect(getByText('0')).toBeInTheDocument();
    });
  });

  describe('Key generation', () => {
    it('generates unique key based on index', () => {
      const { container: container1 } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'xp', value: '100' }} index={0} />
      );
      const { container: container2 } = render(
        <RewardRow {...defaultProps} rowData={{ type: 'xp', value: '100' }} index={1} />
      );

      // Both should render but with different keys (can't directly test keys, but verify rendering)
      expect(container1.querySelector('.result-xp-box')).toBeInTheDocument();
      expect(container2.querySelector('.result-xp-box')).toBeInTheDocument();
    });
  });
});
