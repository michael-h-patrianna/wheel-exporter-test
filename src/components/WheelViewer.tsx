import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import { WheelExport, ExtractedAssets, HeaderState, ButtonSpinState } from '../types';

// Import all renderer components
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { HeaderRenderer } from './renderers/HeaderRenderer';
import { WheelBgRenderer } from './renderers/WheelBgRenderer';
import { WheelTopRenderer } from './renderers/WheelTopRenderer';
import { ButtonSpinRenderer } from './renderers/ButtonSpinRenderer';
import { CenterRenderer } from './renderers/CenterRenderer';

interface WheelViewerProps {
  wheelData: WheelExport;
  assets: ExtractedAssets;
  wheelWidth: number;
  wheelHeight: number;
}

export const WheelViewer: React.FC<WheelViewerProps> = ({
  wheelData,
  assets,
  wheelWidth,
  wheelHeight,
}) => {
  // Component state management
  const [headerState, setHeaderState] = useState<HeaderState>('active');
  const [buttonSpinState, setButtonSpinState] = useState<ButtonSpinState>('default');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCenter, setShowCenter] = useState(false); // Toggle for debugging

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

    setIsSpinning(true);
    setButtonSpinState('spinning');

    // Simulate 3-second spin
    setTimeout(() => {
      setIsSpinning(false);
      setButtonSpinState('default');
    }, 3000);
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
        <BackgroundRenderer
          backgroundImage={assets.backgroundImage}
          scale={scale}
          frameWidth={wheelData.frameSize.width}
          frameHeight={wheelData.frameSize.height}
        />

        {/* Layer 2: Wheel Background Overlay */}
        <WheelBgRenderer
          wheelBg={wheelData.wheelBg}
          wheelBgImage={assets.wheelBgImage}
          scale={scale}
        />

        {/* Layer 3: Header Component */}
        {wheelData.header && (
          <HeaderRenderer
            header={wheelData.header}
            currentState={headerState}
            scale={scale}
            headerImage={getCurrentHeaderImage()}
            onCycleState={handleHeaderCycle}
          />
        )}

        {/* Layer 4: Wheel Top Layer 1 */}
        <WheelTopRenderer
          wheelTop={wheelData.wheelTop1}
          wheelTopImage={assets.wheelTop1Image}
          scale={scale}
          layerNumber={1}
        />

        {/* Layer 5: Wheel Top Layer 2 */}
        <WheelTopRenderer
          wheelTop={wheelData.wheelTop2}
          wheelTopImage={assets.wheelTop2Image}
          scale={scale}
          layerNumber={2}
        />

        {/* Layer 6: Spin Button */}
        {wheelData.buttonSpin && (
          <ButtonSpinRenderer
            buttonSpin={wheelData.buttonSpin}
            currentState={buttonSpinState}
            buttonImage={getCurrentButtonImage()}
            scale={scale}
            onSpin={handleSpin}
            isSpinning={isSpinning}
          />
        )}

        {/* Layer 7: Center Indicator (for debugging) */}
        <CenterRenderer
          center={wheelData.center}
          scale={scale}
          showCenter={showCenter}
        />
      </div>

      {/* Debug Controls */}
      <div className="debug-controls">
        <label>
          <input
            type="checkbox"
            checked={showCenter}
            onChange={(e) => setShowCenter(e.target.checked)}
          />
          Show Center Point
        </label>
      </div>
    </div>
  );
};