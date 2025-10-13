import React from 'react';
import { PointerComponent } from '../../types';

interface PointerRendererProps {
  pointer?: PointerComponent;
  pointerImage?: string;
  scale: number;
}

export const PointerRenderer: React.FC<PointerRendererProps> = ({
  pointer,
  pointerImage,
  scale,
}) => {
  if (!pointer || !pointerImage) {
    return null;
  }

  const { bounds } = pointer;

  // x and y are the CENTER of the image, not top-left
  const scaledWidth = bounds.w * scale;
  const scaledHeight = bounds.h * scale;
  const scaledX = bounds.x * scale;
  const scaledY = bounds.y * scale;

  // Convert center position to top-left for CSS positioning
  const left = scaledX - scaledWidth / 2;
  const top = scaledY - scaledHeight / 2;

  return (
    <div
      className="pointer-component"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        transform: bounds.rotation ? `rotate(${bounds.rotation}deg)` : undefined,
        transformOrigin: 'center center',
        zIndex: 20, // Above all other components
        pointerEvents: 'none',
      }}
    >
      <img
        src={pointerImage}
        alt="Wheel pointer"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
