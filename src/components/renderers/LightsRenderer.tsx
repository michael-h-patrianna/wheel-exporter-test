import React from 'react';
import { LightsComponent } from '../../types';

interface LightsRendererProps {
  lights?: LightsComponent;
  scale: number;
}

export const LightsRenderer: React.FC<LightsRendererProps> = ({
  lights,
  scale
}) => {
  console.log('LightsRenderer called with:', { lights, scale, hasPositions: lights?.positions?.length });
  
  if (!lights) {
    console.log('LightsRenderer: No lights object');
    return null;
  }
  
  if (!lights.positions || lights.positions.length === 0) {
    console.log('LightsRenderer: No positions array or empty positions');
    return null;
  }

  const { color, positions } = lights;
  
  console.log('LightsRenderer: Rendering', positions.length, 'lights with color', color);

  return (
    <div className="lights-component" role="img" aria-label="Wheel lights" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      {positions.map((position, index) => {
        const radius = 4 * scale; // 4px radius in original frame, scaled
        const diameter = radius * 2;
        const lightStyle = {
          position: 'absolute' as const,
          left: `${position.x * scale - radius}px`,
          top: `${position.y * scale - radius}px`,
          width: `${diameter}px`,
          height: `${diameter}px`,
          borderRadius: '50%',
          backgroundColor: color,
          pointerEvents: 'none' as const,
          zIndex: 101,
        };
        console.log(`Light ${index + 1} at:`, { x: position.x, y: position.y, scaled: { x: position.x * scale, y: position.y * scale }, style: lightStyle });
        return (
          <div
            key={index}
            className="light-circle"
            style={lightStyle}
            title={`Light ${index + 1}`}
          />
        );
      })}
    </div>
  );
};