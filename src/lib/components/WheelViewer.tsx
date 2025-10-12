import React, { useState, useEffect, useMemo, useCallback, CSSProperties } from 'react';
import { WheelExport, ExtractedAssets, HeaderState, ButtonSpinState } from '../types';
import { useWheelStateMachine } from '../hooks/useWheelStateMachine';
import type { PrizeProviderResult } from '../services/prizeProvider';
import type { SegmentLayoutType } from '../types/segmentLayoutTypes';

// Import all renderer components
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { HeaderRenderer } from './renderers/HeaderRenderer';
import { WheelBgRenderer } from './renderers/WheelBgRenderer';
import { WheelTopRenderer } from './renderers/WheelTopRenderer';
import { ButtonSpinRenderer } from './renderers/ButtonSpinRenderer';
import { CenterRenderer } from './renderers/CenterRenderer';
import { SegmentRenderer } from './renderers/SegmentRenderer';
import { PointerRenderer } from './renderers/PointerRenderer';
import { LightsRenderer } from './renderers/LightsRenderer';

interface ComponentVisibility {
  background: boolean;
  header: boolean;
  wheelBg: boolean;
  wheelTop1: boolean;
  wheelTop2: boolean;
  lights: boolean;
  buttonSpin: boolean;
  center: boolean;
  pointer: boolean;
  segments: boolean;
}

interface WheelViewerProps {
  wheelData: WheelExport;
  assets: ExtractedAssets;
  wheelWidth: number;
  wheelHeight: number;
  segmentCount: number;
  componentVisibility: ComponentVisibility;
  onToggleCenter: (show: boolean) => void;
  prizeSession?: PrizeProviderResult | null;
  onResetReady?: (resetFn: () => void) => void;
  layoutType?: SegmentLayoutType;
}

export const WheelViewer: React.FC<WheelViewerProps> = ({
  wheelData,
  assets,
  wheelWidth,
  wheelHeight,
  segmentCount,
  componentVisibility,
  onToggleCenter,
  prizeSession,
  onResetReady,
  layoutType = 'original',
}) => {
  // Component state management
  const [headerState, setHeaderState] = useState<HeaderState>('active');
  const [buttonSpinState, setButtonSpinState] = useState<ButtonSpinState>('default');

  // Wheel spin state machine with winning segment from prize session
  const wheelStateMachine = useWheelStateMachine({
    segmentCount,
    winningSegmentIndex: prizeSession?.winningIndex,
    onSpinComplete: useCallback(() => {
      setButtonSpinState('default');
    }, []),
  });

  // Calculate scale to maintain aspect ratio
  const scale = useMemo(() => {
    const scaleX = wheelWidth / wheelData.frameSize.width;
    const scaleY = wheelHeight / wheelData.frameSize.height;
    return Math.min(scaleX, scaleY);
  }, [wheelWidth, wheelHeight, wheelData.frameSize]);

  // Container style maintaining aspect ratio
  const containerStyle: CSSProperties = {
    width: `${wheelData.frameSize.width * scale}px`,
    height: `${wheelData.frameSize.height * scale}px`,
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
    borderRadius: '8px',
  };

  // Handle header state cycling
  const handleHeaderCycle = useCallback(() => {
    const states: HeaderState[] = ['active', 'success', 'fail'];
    const currentIndex = states.indexOf(headerState);
    const nextIndex = (currentIndex + 1) % states.length;
    setHeaderState(states[nextIndex]);
  }, [headerState]);

  // Handle spin button click
  const handleSpin = useCallback(() => {
    if (wheelStateMachine.isSpinning) return;

    setButtonSpinState('spinning');
    wheelStateMachine.startSpin();
  }, [wheelStateMachine]);

  // Get current header image
  const getCurrentHeaderImage = () => {
    if (!assets.headerImages) return undefined;
    switch (headerState) {
      case 'active':
        return assets.headerImages.active;
      case 'success':
        return assets.headerImages.success;
      case 'fail':
        return assets.headerImages.fail;
      default:
        return undefined;
    }
  };

  // Get current button image
  const getCurrentButtonImage = () => {
    if (!assets.buttonSpinImages) return undefined;
    return buttonSpinState === 'default'
      ? assets.buttonSpinImages.default
      : assets.buttonSpinImages.spinning;
  };

  // Expose reset function to parent
  useEffect(() => {
    if (onResetReady) {
      onResetReady(() => {
        setHeaderState('active');
        setButtonSpinState('default');
        wheelStateMachine.reset();
      });
    }
  }, [onResetReady, wheelStateMachine]);

  // Reset states when wheel data changes
  useEffect(() => {
    setHeaderState('active');
    setButtonSpinState('default');
    wheelStateMachine.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelData.wheelId]); // Only reset when wheelId changes, not when wheelStateMachine updates

  return (
    <div className="wheel-viewer">
      <div style={containerStyle} className="wheel-container">
        {/* Layer 1: Main Background */}
        {componentVisibility.background && (
          <BackgroundRenderer
            backgroundImage={assets.backgroundImage}
            scale={scale}
            frameWidth={wheelData.frameSize.width}
            frameHeight={wheelData.frameSize.height}
          />
        )}

        {/* Layer 2: Wheel Background Overlay */}
        {componentVisibility.wheelBg && (
          <WheelBgRenderer
            wheelBg={wheelData.wheelBg}
            wheelBgImage={assets.wheelBgImage}
            scale={scale}
          />
        )}

        {/* Layer 3: Wheel Segments */}
        {componentVisibility.segments && (
          <SegmentRenderer
            segments={wheelData.segments}
            center={wheelData.center}
            segmentCount={segmentCount}
            scale={scale}
            wheelState={wheelStateMachine.state}
            targetRotation={wheelStateMachine.targetRotation}
            rewardsPrizeImages={assets.rewardsPrizeImages}
            purchaseImageFilename={wheelData.rewards?.prizes?.images?.purchase?.img}
            prizeSession={prizeSession}
            layoutType={layoutType}
          />
        )}

        {/* Layer 4: Header Component */}
        {componentVisibility.header && wheelData.header && (
          <HeaderRenderer
            header={wheelData.header}
            currentState={headerState}
            scale={scale}
            headerImage={getCurrentHeaderImage()}
            onCycleState={handleHeaderCycle}
          />
        )}

        {/* Layer 5: Wheel Top Layer 1 */}
        {componentVisibility.wheelTop1 && (
          <WheelTopRenderer
            wheelTop={wheelData.wheelTop1}
            wheelTopImage={assets.wheelTop1Image}
            scale={scale}
            layerNumber={1}
          />
        )}

        {/* Layer 6: Wheel Top Layer 2 */}
        {componentVisibility.wheelTop2 && (
          <WheelTopRenderer
            wheelTop={wheelData.wheelTop2}
            wheelTopImage={assets.wheelTop2Image}
            scale={scale}
            layerNumber={2}
          />
        )}

        {/* Layer 6.5: Lights */}
        {componentVisibility.lights && (
          <LightsRenderer
            lights={wheelData.lights}
            scale={scale}
          />
        )}

        {/* Layer 7: Spin Button */}
        {componentVisibility.buttonSpin && wheelData.buttonSpin && (
          <ButtonSpinRenderer
            buttonSpin={wheelData.buttonSpin}
            currentState={buttonSpinState}
            buttonImage={getCurrentButtonImage()}
            scale={scale}
            onSpin={handleSpin}
            isSpinning={wheelStateMachine.isSpinning}
          />
        )}

        {/* Layer 8: Center Circle */}
        {componentVisibility.center && (
          <CenterRenderer
            center={wheelData.center}
            scale={scale}
          />
        )}

        {/* Layer 9: Pointer */}
        {componentVisibility.pointer && (
          <PointerRenderer
            pointer={wheelData.pointer}
            pointerImage={assets.pointerImage}
            scale={scale}
          />
        )}

      </div>

      {/* Debug Controls */}
      <div className="debug-controls">
        <label className="switch-label">
          <span>Show Center</span>
          <div className="switch">
            <input
              type="checkbox"
              checked={componentVisibility.center}
              onChange={(e) => onToggleCenter(e.target.checked)}
            />
            <span className="switch-slider"></span>
          </div>
        </label>
      </div>
    </div>
  );
};