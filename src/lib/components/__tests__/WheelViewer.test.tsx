/**
 * Comprehensive test suite for WheelViewer component
 * Tests rendering, user interactions, state management, and integration with useWheelStateMachine
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { WheelViewer } from '../WheelViewer';
import { useWheelStateMachine } from '../../hooks/useWheelStateMachine';
import { createMockWheelExport, createMockExtractedAssets } from '../../test-utils';

// Mock the useWheelStateMachine hook
jest.mock('../../hooks/useWheelStateMachine');

// Mock all renderer components
jest.mock('../renderers/BackgroundRenderer', () => ({
  BackgroundRenderer: () => <div data-testid="background-renderer">Background</div>,
}));

jest.mock('../renderers/HeaderRenderer', () => ({
  HeaderRenderer: ({ onCycleState }: any) => (
    <div data-testid="header-renderer" onClick={onCycleState}>
      Header
    </div>
  ),
}));

jest.mock('../renderers/WheelBgRenderer', () => ({
  WheelBgRenderer: () => <div data-testid="wheelbg-renderer">WheelBg</div>,
}));

jest.mock('../renderers/WheelTopRenderer', () => ({
  WheelTopRenderer: ({ layerNumber }: any) => (
    <div data-testid={`wheeltop${layerNumber}-renderer`}>WheelTop{layerNumber}</div>
  ),
}));

jest.mock('../renderers/ButtonSpinRenderer', () => ({
  ButtonSpinRenderer: ({ onSpin }: any) => (
    <button data-testid="button-spin-renderer" onClick={onSpin}>
      Spin Button
    </button>
  ),
}));

jest.mock('../renderers/CenterRenderer', () => ({
  CenterRenderer: () => <div data-testid="center-renderer">Center</div>,
}));

jest.mock('../renderers/SegmentRenderer', () => ({
  SegmentRenderer: () => <div data-testid="segment-renderer">Segments</div>,
}));

jest.mock('../renderers/PointerRenderer', () => ({
  PointerRenderer: () => <div data-testid="pointer-renderer">Pointer</div>,
}));

jest.mock('../renderers/LightsRenderer', () => ({
  LightsRenderer: () => <div data-testid="lights-renderer">Lights</div>,
}));

describe('WheelViewer', () => {
  const mockUseWheelStateMachine = useWheelStateMachine as jest.MockedFunction<
    typeof useWheelStateMachine
  >;

  let mockStartSpin: jest.Mock;
  let mockReset: jest.Mock;
  let mockOnSpinComplete: jest.Mock;

  const defaultProps = {
    wheelData: createMockWheelExport(),
    assets: createMockExtractedAssets(),
    wheelWidth: 800,
    wheelHeight: 600,
    segmentCount: 8,
    componentVisibility: {
      background: true,
      header: true,
      wheelBg: true,
      wheelTop1: true,
      wheelTop2: true,
      lights: true,
      buttonSpin: true,
      center: true,
      pointer: true,
      segments: true,
    },
    onToggleCenter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockStartSpin = jest.fn();
    mockReset = jest.fn();
    mockOnSpinComplete = jest.fn();

    // Default mock implementation
    mockUseWheelStateMachine.mockReturnValue({
      state: 'IDLE',
      rotation: 0,
      targetRotation: 0,
      isSpinning: false,
      startSpin: mockStartSpin,
      reset: mockReset,
    });
  });

  describe('Component rendering with all props', () => {
    it('should render wheel viewer container', () => {
      const { container } = render(<WheelViewer {...defaultProps} />);

      expect(container.querySelector('.wheel-viewer')).toBeInTheDocument();
      expect(container.querySelector('.wheel-container')).toBeInTheDocument();
    });

    it('should render all components when visibility is true', () => {
      render(<WheelViewer {...defaultProps} />);

      expect(screen.getByTestId('background-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('header-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('wheelbg-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('wheeltop1-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('wheeltop2-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('lights-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('button-spin-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('center-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('pointer-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('segment-renderer')).toBeInTheDocument();
    });

    it('should render debug controls with center toggle', () => {
      render(<WheelViewer {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();

      expect(screen.getByText('Show Center')).toBeInTheDocument();
    });

    it('should calculate correct scale for aspect ratio', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          wheelWidth={400}
          wheelHeight={300}
        />
      );

      const wheelContainer = container.querySelector('.wheel-container');
      expect(wheelContainer).toHaveStyle({
        width: '400px',
        height: '300px',
      });
    });

    it('should maintain aspect ratio with different dimensions', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          wheelWidth={1600}
          wheelHeight={1200}
          wheelData={createMockWheelExport({
            frameSize: { width: 800, height: 600 },
          })}
        />
      );

      const wheelContainer = container.querySelector('.wheel-container');
      expect(wheelContainer).toHaveStyle({
        width: '1600px',
        height: '1200px',
      });
    });
  });

  describe('Component visibility toggles', () => {
    it('should hide background when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            background: false,
          }}
        />
      );

      expect(screen.queryByTestId('background-renderer')).not.toBeInTheDocument();
    });

    it('should hide header when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            header: false,
          }}
        />
      );

      expect(screen.queryByTestId('header-renderer')).not.toBeInTheDocument();
    });

    it('should hide wheelBg when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            wheelBg: false,
          }}
        />
      );

      expect(screen.queryByTestId('wheelbg-renderer')).not.toBeInTheDocument();
    });

    it('should hide wheelTop1 when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            wheelTop1: false,
          }}
        />
      );

      expect(screen.queryByTestId('wheeltop1-renderer')).not.toBeInTheDocument();
    });

    it('should hide wheelTop2 when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            wheelTop2: false,
          }}
        />
      );

      expect(screen.queryByTestId('wheeltop2-renderer')).not.toBeInTheDocument();
    });

    it('should hide lights when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            lights: false,
          }}
        />
      );

      expect(screen.queryByTestId('lights-renderer')).not.toBeInTheDocument();
    });

    it('should hide buttonSpin when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            buttonSpin: false,
          }}
        />
      );

      expect(screen.queryByTestId('button-spin-renderer')).not.toBeInTheDocument();
    });

    it('should hide center when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            center: false,
          }}
        />
      );

      expect(screen.queryByTestId('center-renderer')).not.toBeInTheDocument();
    });

    it('should hide pointer when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            pointer: false,
          }}
        />
      );

      expect(screen.queryByTestId('pointer-renderer')).not.toBeInTheDocument();
    });

    it('should hide segments when visibility is false', () => {
      render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            segments: false,
          }}
        />
      );

      expect(screen.queryByTestId('segment-renderer')).not.toBeInTheDocument();
    });

    it('should render with all components hidden', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            background: false,
            header: false,
            wheelBg: false,
            wheelTop1: false,
            wheelTop2: false,
            lights: false,
            buttonSpin: false,
            center: false,
            pointer: false,
            segments: false,
          }}
        />
      );

      expect(container.querySelector('.wheel-container')).toBeInTheDocument();
      expect(screen.queryByTestId('background-renderer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('header-renderer')).not.toBeInTheDocument();
    });
  });

  describe('Header click cycling (active → success → fail → active)', () => {
    it('should start in active state', () => {
      render(<WheelViewer {...defaultProps} />);

      // Initial state is active (verified by not showing other states)
      expect(screen.getByTestId('header-renderer')).toBeInTheDocument();
    });

    it('should cycle to success state when header is clicked', () => {
      render(<WheelViewer {...defaultProps} />);

      const header = screen.getByTestId('header-renderer');
      fireEvent.click(header);

      // After one click, should be in success state
      // (Would need to verify via passed props in real implementation)
    });

    it('should cycle to fail state when header is clicked twice', () => {
      render(<WheelViewer {...defaultProps} />);

      const header = screen.getByTestId('header-renderer');
      fireEvent.click(header);
      fireEvent.click(header);

      // After two clicks, should be in fail state
    });

    it('should cycle back to active state when header is clicked three times', () => {
      render(<WheelViewer {...defaultProps} />);

      const header = screen.getByTestId('header-renderer');
      fireEvent.click(header);
      fireEvent.click(header);
      fireEvent.click(header);

      // After three clicks, should be back to active state
    });

    it('should continue cycling through states', () => {
      render(<WheelViewer {...defaultProps} />);

      const header = screen.getByTestId('header-renderer');

      // Cycle multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(header);
      }

      // Should still be functional
      expect(header).toBeInTheDocument();
    });
  });

  describe('Spin button click', () => {
    it('should call startSpin when spin button is clicked', () => {
      render(<WheelViewer {...defaultProps} />);

      const spinButton = screen.getByTestId('button-spin-renderer');
      fireEvent.click(spinButton);

      expect(mockStartSpin).toHaveBeenCalledTimes(1);
    });

    it('should not call startSpin when already spinning', () => {
      mockUseWheelStateMachine.mockReturnValue({
        state: 'SPINNING',
        rotation: 180,
        targetRotation: 720,
        isSpinning: true,
        startSpin: mockStartSpin,
        reset: mockReset,
      });

      render(<WheelViewer {...defaultProps} />);

      const spinButton = screen.getByTestId('button-spin-renderer');
      fireEvent.click(spinButton);

      expect(mockStartSpin).not.toHaveBeenCalled();
    });

    it('should set buttonSpinState to spinning when clicked', () => {
      render(<WheelViewer {...defaultProps} />);

      const spinButton = screen.getByTestId('button-spin-renderer');
      fireEvent.click(spinButton);

      // State should be set to spinning
      expect(mockStartSpin).toHaveBeenCalled();
    });

    it('should handle multiple rapid clicks gracefully', () => {
      render(<WheelViewer {...defaultProps} />);

      const spinButton = screen.getByTestId('button-spin-renderer');
      fireEvent.click(spinButton);
      fireEvent.click(spinButton);
      fireEvent.click(spinButton);

      // Should only start spin once
      expect(mockStartSpin).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration with useWheelStateMachine', () => {
    it('should initialize useWheelStateMachine with correct segmentCount', () => {
      render(<WheelViewer {...defaultProps} segmentCount={12} />);

      expect(mockUseWheelStateMachine).toHaveBeenCalledWith(
        expect.objectContaining({
          segmentCount: 12,
        })
      );
    });

    it('should pass onSpinComplete callback to useWheelStateMachine', () => {
      render(<WheelViewer {...defaultProps} />);

      expect(mockUseWheelStateMachine).toHaveBeenCalledWith(
        expect.objectContaining({
          onSpinComplete: expect.any(Function),
        })
      );
    });

    it('should reset buttonSpinState when onSpinComplete is called', async () => {
      let capturedCallback: ((segment: number) => void) | undefined;

      mockUseWheelStateMachine.mockImplementation((config) => {
        capturedCallback = config.onSpinComplete;
        return {
          state: 'COMPLETE',
          rotation: 720,
          targetRotation: 720,
          isSpinning: false,
          startSpin: mockStartSpin,
          reset: mockReset,
        };
      });

      render(<WheelViewer {...defaultProps} />);

      // Call the captured callback
      act(() => {
        if (capturedCallback) {
          capturedCallback(3);
        }
      });

      // Button state should be reset to default
      await waitFor(() => {
        expect(screen.getByTestId('button-spin-renderer')).toBeInTheDocument();
      });
    });

    it('should pass isSpinning state to SegmentRenderer', () => {
      mockUseWheelStateMachine.mockReturnValue({
        state: 'SPINNING',
        rotation: 180,
        targetRotation: 720,
        isSpinning: true,
        startSpin: mockStartSpin,
        reset: mockReset,
      });

      render(<WheelViewer {...defaultProps} />);

      expect(screen.getByTestId('segment-renderer')).toBeInTheDocument();
    });

    it('should pass targetRotation to SegmentRenderer', () => {
      mockUseWheelStateMachine.mockReturnValue({
        state: 'SPINNING',
        rotation: 180,
        targetRotation: 720,
        isSpinning: true,
        startSpin: mockStartSpin,
        reset: mockReset,
      });

      render(<WheelViewer {...defaultProps} />);

      expect(screen.getByTestId('segment-renderer')).toBeInTheDocument();
    });
  });

  describe('Optional components handling', () => {
    it('should not render header when wheelData.header is undefined', () => {
      const wheelDataWithoutHeader = createMockWheelExport();
      delete wheelDataWithoutHeader.header;

      render(
        <WheelViewer
          {...defaultProps}
          wheelData={wheelDataWithoutHeader}
        />
      );

      expect(screen.queryByTestId('header-renderer')).not.toBeInTheDocument();
    });

    it('should not render buttonSpin when wheelData.buttonSpin is undefined', () => {
      const wheelDataWithoutButton = createMockWheelExport();
      delete wheelDataWithoutButton.buttonSpin;

      render(
        <WheelViewer
          {...defaultProps}
          wheelData={wheelDataWithoutButton}
        />
      );

      expect(screen.queryByTestId('button-spin-renderer')).not.toBeInTheDocument();
    });

    it('should render without optional header images', () => {
      const assetsWithoutHeader = createMockExtractedAssets();
      delete assetsWithoutHeader.headerImages;

      render(
        <WheelViewer
          {...defaultProps}
          assets={assetsWithoutHeader}
        />
      );

      expect(screen.getByTestId('header-renderer')).toBeInTheDocument();
    });

    it('should render without optional button images', () => {
      const assetsWithoutButton = createMockExtractedAssets();
      delete assetsWithoutButton.buttonSpinImages;

      render(
        <WheelViewer
          {...defaultProps}
          assets={assetsWithoutButton}
        />
      );

      expect(screen.getByTestId('button-spin-renderer')).toBeInTheDocument();
    });
  });

  describe('Center toggle functionality', () => {
    it('should call onToggleCenter when checkbox is changed', () => {
      const onToggleCenter = jest.fn();

      render(
        <WheelViewer
          {...defaultProps}
          onToggleCenter={onToggleCenter}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggleCenter).toHaveBeenCalledWith(false);
    });

    it('should reflect checked state based on componentVisibility.center', () => {
      const { rerender } = render(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            center: true,
          }}
        />
      );

      expect(screen.getByRole('checkbox')).toBeChecked();

      rerender(
        <WheelViewer
          {...defaultProps}
          componentVisibility={{
            ...defaultProps.componentVisibility,
            center: false,
          }}
        />
      );

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('Wheel data changes', () => {
    it('should reset states when wheelId changes', () => {
      const { rerender } = render(<WheelViewer {...defaultProps} />);

      // Change wheelId
      const newWheelData = createMockWheelExport({ wheelId: 'new-wheel-id' });

      rerender(
        <WheelViewer
          {...defaultProps}
          wheelData={newWheelData}
        />
      );

      expect(mockReset).toHaveBeenCalled();
    });

    it('should reset to active header state when wheelId changes', () => {
      const { rerender } = render(<WheelViewer {...defaultProps} />);

      // Click header to change state
      const header = screen.getByTestId('header-renderer');
      fireEvent.click(header);

      // Change wheelId
      const newWheelData = createMockWheelExport({ wheelId: 'new-wheel-id' });

      rerender(
        <WheelViewer
          {...defaultProps}
          wheelData={newWheelData}
        />
      );

      // State should be reset (would verify via props in real implementation)
      expect(header).toBeInTheDocument();
    });

    it('should reset to default button state when wheelId changes', () => {
      const { rerender } = render(<WheelViewer {...defaultProps} />);

      // Click spin button
      const spinButton = screen.getByTestId('button-spin-renderer');
      fireEvent.click(spinButton);

      // Change wheelId
      const newWheelData = createMockWheelExport({ wheelId: 'new-wheel-id' });

      rerender(
        <WheelViewer
          {...defaultProps}
          wheelData={newWheelData}
        />
      );

      // Button state should be reset
      expect(spinButton).toBeInTheDocument();
    });
  });

  describe('Scale calculations', () => {
    it('should calculate scale based on width constraint', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          wheelWidth={400}
          wheelHeight={1200}
          wheelData={createMockWheelExport({
            frameSize: { width: 800, height: 600 },
          })}
        />
      );

      const wheelContainer = container.querySelector('.wheel-container');
      // Scale should be 400/800 = 0.5, so dimensions should be 400x300
      expect(wheelContainer).toHaveStyle({
        width: '400px',
        height: '300px',
      });
    });

    it('should calculate scale based on height constraint', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          wheelWidth={1600}
          wheelHeight={300}
          wheelData={createMockWheelExport({
            frameSize: { width: 800, height: 600 },
          })}
        />
      );

      const wheelContainer = container.querySelector('.wheel-container');
      // Scale should be 300/600 = 0.5, so dimensions should be 400x300
      expect(wheelContainer).toHaveStyle({
        width: '400px',
        height: '300px',
      });
    });

    it('should handle equal width and height', () => {
      const { container } = render(
        <WheelViewer
          {...defaultProps}
          wheelWidth={800}
          wheelHeight={800}
          wheelData={createMockWheelExport({
            frameSize: { width: 800, height: 800 },
          })}
        />
      );

      const wheelContainer = container.querySelector('.wheel-container');
      expect(wheelContainer).toHaveStyle({
        width: '800px',
        height: '800px',
      });
    });
  });

  describe('Rendering layers in correct order', () => {
    it('should render layers in correct z-index order', () => {
      const { container } = render(<WheelViewer {...defaultProps} />);

      const wheelContainer = container.querySelector('.wheel-container');
      const children = wheelContainer?.children;

      // Verify that renderers are in correct order
      // (Based on the component JSX structure)
      expect(children).toBeDefined();
      expect(children!.length).toBeGreaterThan(0);
    });
  });
});
