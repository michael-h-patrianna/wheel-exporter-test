import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import { WheelExport, ExtractedAssets, HeaderState, ButtonSpinState } from '../types';

// Import all renderer components
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { HeaderRenderer } from './renderers/HeaderRenderer';
import { WheelBgRenderer } from './renderers/WheelBgRenderer';
import { WheelTopRenderer } from './renderers/WheelTopRenderer';
import { ButtonSpinRenderer } from './renderers/ButtonSpinRenderer';
import { CenterRenderer } from './renderers/CenterRenderer';
import { SegmentRenderer } from './renderers/SegmentRenderer';
import { GradientHandleRenderer } from './renderers/GradientHandleRenderer';
import { PointerRenderer } from './renderers/PointerRenderer';

interface ComponentVisibility {
  background: boolean;
  header: boolean;
  wheelBg: boolean;
  wheelTop1: boolean;
  wheelTop2: boolean;
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
}

export const WheelViewer: React.FC<WheelViewerProps> = ({
  wheelData,
  assets,
  wheelWidth,
  wheelHeight,
  segmentCount,
  componentVisibility,
  onToggleCenter,
}) => {
  // Component state management
  const [headerState, setHeaderState] = useState<HeaderState>('active');
  const [buttonSpinState, setButtonSpinState] = useState<ButtonSpinState>('default');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showGradientHandles, setShowGradientHandles] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

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
  const handleHeaderCycle = () => {
    const states: HeaderState[] = ['active', 'success', 'fail'];
    const currentIndex = states.indexOf(headerState);
    const nextIndex = (currentIndex + 1) % states.length;
    setHeaderState(states[nextIndex]);
  };

  // Handle spin button click
  const handleSpin = () => {
    if (isSpinning) return;

    // Pick random segment (0 to segmentCount-1)
    const randomSegment = Math.floor(Math.random() * segmentCount);
    console.log('Landing on segment:', randomSegment);

    // Calculate angle for each segment
    const segmentAngle = 360 / segmentCount;

    // Calculate where the chosen segment should end up
    // First segment starts at top, segments go clockwise
    // To land on segment N, we need to rotate so it's at top
    const targetSegmentAngle = randomSegment * segmentAngle;

    // Add multiple full rotations (5-7 spins) for excitement
    const fullSpins = 5 + Math.floor(Math.random() * 3);

    // Total rotation: spin multiple times and land on target
    const baseRotation = fullSpins * 360 - targetSegmentAngle;

    // Add overshoot (15-25 degrees)
    const overshoot = 15 + Math.random() * 10;
    const totalRotation = baseRotation + overshoot;

    // Set the new target rotation with overshoot
    const rotationWithOvershoot = currentRotation + totalRotation;
    const finalRotation = currentRotation + baseRotation;

    setTargetRotation(rotationWithOvershoot);
    setIsSpinning(true);
    setButtonSpinState('spinning');

    // After main animation (5s), bounce back from overshoot
    setTimeout(() => {
      setTargetRotation(finalRotation);
      setIsSpinning(false); // Mark as not spinning for bounce-back transition
    }, 5000);

    // Complete after bounce back (1.5s for the bounce)
    setTimeout(() => {
      setButtonSpinState('default');
      setCurrentRotation(finalRotation);
    }, 6500);
  };

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

  // Reset states when wheel data changes
  useEffect(() => {
    setHeaderState('active');
    setButtonSpinState('default');
    setIsSpinning(false);
  }, [wheelData.wheelId]);

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
            isSpinning={isSpinning}
            targetRotation={targetRotation}
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

        {/* Layer 7: Spin Button */}
        {componentVisibility.buttonSpin && wheelData.buttonSpin && (
          <ButtonSpinRenderer
            buttonSpin={wheelData.buttonSpin}
            currentState={buttonSpinState}
            buttonImage={getCurrentButtonImage()}
            scale={scale}
            onSpin={handleSpin}
            isSpinning={isSpinning}
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

        {/* Layer 10: Gradient Handle Visualization (Debug) */}
        <GradientHandleRenderer
          segments={wheelData.segments}
          center={wheelData.center}
          segmentCount={segmentCount}
          scale={scale}
          showHandles={showGradientHandles}
        />
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

        <label className="switch-label" style={{ marginLeft: '20px' }}>
          <span>Show Gradient Handles</span>
          <div className="switch">
            <input
              type="checkbox"
              checked={showGradientHandles}
              onChange={(e) => setShowGradientHandles(e.target.checked)}
            />
            <span className="switch-slider"></span>
          </div>
        </label>
      </div>
    </div>
  );
};