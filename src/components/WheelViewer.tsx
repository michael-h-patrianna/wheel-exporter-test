import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import { WheelExport, ExtractedAssets, HeaderState } from '../types';

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

  // Scale transform for all child elements
  const scaleStyle: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
    width: `${wheelData.frameSize.width}px`,
    height: `${wheelData.frameSize.height}px`,
  };

  // Render background
  const renderBackground = () => {
    if (!assets.backgroundImage) return null;

    return (
      <img
        src={assets.backgroundImage}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  };

  // Render header component with state cycling
  const renderHeader = () => {
    if (!wheelData.header || !assets.headerImages) return null;

    const { header } = wheelData;
    const bounds = header.stateBounds[headerState];
    let imageSrc: string | undefined;

    switch (headerState) {
      case 'active':
        imageSrc = assets.headerImages.active;
        break;
      case 'success':
        imageSrc = assets.headerImages.success;
        break;
      case 'fail':
        imageSrc = assets.headerImages.fail;
        break;
    }

    if (!imageSrc || !bounds) return null;

    const handleHeaderClick = () => {
      // Cycle through states: active -> success -> fail -> active
      const states: HeaderState[] = ['active', 'success', 'fail'];
      const currentIndex = states.indexOf(headerState);
      const nextIndex = (currentIndex + 1) % states.length;
      setHeaderState(states[nextIndex]);
    };

    // Calculate position treating x,y as center (like questline-exporter-test)
    const left = bounds.x - (bounds.width / 2);
    const top = bounds.y - (bounds.height / 2);

    return (
      <img
        src={imageSrc}
        alt={`Header ${headerState}`}
        onClick={handleHeaderClick}
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
          transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined,
          cursor: 'pointer',
        }}
      />
    );
  };

  // Reset states when wheel data changes
  useEffect(() => {
    setHeaderState('active');
  }, [wheelData.wheelId]);

  return (
    <div style={containerStyle}>
      <div style={scaleStyle}>
        {renderBackground()}
        {renderHeader()}
      </div>
    </div>
  );
};