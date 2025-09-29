import React from 'react';
import { WheelSegmentStyles, CenterComponent, Gradient, GradientHandle } from '../../types';

interface GradientHandleRendererProps {
  segments?: WheelSegmentStyles;
  center?: CenterComponent;
  segmentCount: number;
  scale: number;
  showHandles: boolean;
}

interface HandleVisualization {
  segmentIndex: number;
  type: 'outer' | 'inner';
  fillOrStroke: 'fill' | 'stroke';
  gradient: Gradient;
  handles: readonly GradientHandle[];
  segmentAngle: number;
  startAngle: number;
  endAngle: number;
}

export const GradientHandleRenderer: React.FC<GradientHandleRendererProps> = ({
  segments,
  center,
  segmentCount,
  scale,
  showHandles
}) => {
  if (!showHandles || !segments || !center) {
    return null;
  }

  const segmentAngle = (Math.PI * 2) / segmentCount;
  const cx = center.x * scale;
  const cy = center.y * scale;
  const outerRadius = center.radius * scale;
  const innerRadius = outerRadius * 0.6; // Match SEGMENT_PREVIEW_INNER_RADIUS_RATIO

  // Collect all gradients with handles (only outer vector)
  const handleVisualizations: HandleVisualization[] = [];

  for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;
    const segmentRotation = (startAngle + endAngle) / 2;

    const segmentKind = ['odd', 'even', 'nowin', 'jackpot'][i % 4] as keyof WheelSegmentStyles;
    const styles = segments[segmentKind];

    if (!styles?.outer) continue;

    // Only show handles for outer gradient fills (not solid fills, not strokes)
    if (styles.outer?.fill?.type === 'gradient' && styles.outer.fill.gradient) {
      handleVisualizations.push({
        segmentIndex: i,
        type: 'outer',
        fillOrStroke: 'fill',
        gradient: styles.outer.fill.gradient,
        handles: styles.outer.fill.gradient.handles || [],
        segmentAngle: segmentRotation,
        startAngle,
        endAngle
      });
    }
  }

  const transformHandlePosition = (
    handle: GradientHandle,
    segmentIndex: number,
    type: 'outer' | 'inner',
    startAngle: number,
    endAngle: number
  ): { x: number; y: number } => {
    // The handles are in normalized space (0-1) relative to the segment's bounding box
    // We need to transform them to the actual segment position

    // Calculate the middle angle of the segment
    const midAngle = (startAngle + endAngle) / 2;

    // For a wedge segment, map the normalized coordinates
    if (type === 'outer') {
      // Transform normalized handle to segment space
      // x maps to angle position within segment
      // y maps to radius from center
      const angle = startAngle + (endAngle - startAngle) * handle.x;
      const r = handle.y * outerRadius;

      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    } else {
      // For ring segments (inner)
      const angle = startAngle + (endAngle - startAngle) * handle.x;
      const r = innerRadius + (outerRadius - innerRadius) * handle.y;

      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    }
  };

  const getHandleColor = (gradient: Gradient, handleIndex: number): string => {
    if (!gradient.stops || gradient.stops.length === 0) return '#ffffff';

    // For angular gradients, handles describe a circle
    if (gradient.type === 'angular') {
      // Use colors from stops for visualization
      if (handleIndex === 0) return gradient.stops[0]?.color || '#ffffff';
      if (handleIndex === 1) return gradient.stops[Math.floor(gradient.stops.length / 2)]?.color || '#ffffff';
      if (handleIndex === 2) return gradient.stops[gradient.stops.length - 1]?.color || '#ffffff';
    }

    // For linear/radial, use end/start colors (swapped because handles are swapped)
    if (handleIndex === 0) return gradient.stops[gradient.stops.length - 1]?.color || '#ffffff';
    if (handleIndex === 1) return gradient.stops[0]?.color || '#ffffff';

    // Third handle (width control) - use middle color
    return gradient.stops[Math.floor(gradient.stops.length / 2)]?.color || '#888888';
  };

  return (
    <div
      className="gradient-handles-component"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 200, // Above all other elements
        pointerEvents: 'none'
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        {/* Draw handle visualizations */}
        {handleVisualizations.map((viz, vizIndex) => {
          const handles = viz.handles;
          if (!handles || handles.length < 2) return null;

          // Transform handle positions to segment coordinates
          const transformedHandles = Array.from(handles).map(h =>
            transformHandlePosition(h, viz.segmentIndex, viz.type, viz.startAngle, viz.endAngle)
          );

          return (
            <g key={`viz-${vizIndex}`} opacity={0.8}>
              {/* Draw lines between handles for linear gradients */}
              {viz.gradient.type === 'linear' && (
                <>
                  <line
                    x1={transformedHandles[0].x}
                    y1={transformedHandles[0].y}
                    x2={transformedHandles[1].x}
                    y2={transformedHandles[1].y}
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="4,2"
                  />
                  {/* Width control line if third handle exists */}
                  {transformedHandles[2] && (
                    <line
                      x1={transformedHandles[1].x}
                      y1={transformedHandles[1].y}
                      x2={transformedHandles[2].x}
                      y2={transformedHandles[2].y}
                      stroke="#ffffff"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                  )}
                </>
              )}

              {/* Draw circle for radial gradients */}
              {viz.gradient.type === 'radial' && transformedHandles[1] && (
                <circle
                  cx={transformedHandles[0].x}
                  cy={transformedHandles[0].y}
                  r={Math.sqrt(
                    Math.pow(transformedHandles[1].x - transformedHandles[0].x, 2) +
                    Math.pow(transformedHandles[1].y - transformedHandles[0].y, 2)
                  )}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="4,2"
                />
              )}

              {/* Draw circle for angular gradients described by handles */}
              {viz.gradient.type === 'angular' && transformedHandles.length >= 3 && (
                <>
                  {/* Angular gradients use 3 handles to describe a circle */}
                  {/* Handle 0: center, Handle 1: radius point, Handle 2: rotation point */}
                  <circle
                    cx={transformedHandles[0].x}
                    cy={transformedHandles[0].y}
                    r={Math.sqrt(
                      Math.pow(transformedHandles[1].x - transformedHandles[0].x, 2) +
                      Math.pow(transformedHandles[1].y - transformedHandles[0].y, 2)
                    )}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="4,2"
                  />
                  {/* Show rotation angle line from center through third handle */}
                  <line
                    x1={transformedHandles[0].x}
                    y1={transformedHandles[0].y}
                    x2={transformedHandles[2].x}
                    y2={transformedHandles[2].y}
                    stroke="#ffff00"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.7}
                  />
                </>
              )}

              {/* Draw diamond shape for diamond gradients */}
              {viz.gradient.type === 'diamond' && transformedHandles[1] && (
                <rect
                  x={transformedHandles[0].x - Math.abs(transformedHandles[1].x - transformedHandles[0].x)}
                  y={transformedHandles[0].y - Math.abs(transformedHandles[1].y - transformedHandles[0].y)}
                  width={Math.abs(transformedHandles[1].x - transformedHandles[0].x) * 2}
                  height={Math.abs(transformedHandles[1].y - transformedHandles[0].y) * 2}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="4,2"
                  transform={`rotate(45 ${transformedHandles[0].x} ${transformedHandles[0].y})`}
                />
              )}


              {/* Draw handle points */}
              {transformedHandles.map((handle, handleIndex) => {
                const color = getHandleColor(viz.gradient, handleIndex);
                const isMainHandle = handleIndex < 2;

                return (
                  <g key={`handle-point-${handleIndex}`}>
                    {/* Outer ring */}
                    <circle
                      cx={handle.x}
                      cy={handle.y}
                      r={isMainHandle ? 8 : 6}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    {/* Inner fill */}
                    <circle
                      cx={handle.x}
                      cy={handle.y}
                      r={isMainHandle ? 6 : 4}
                      fill={color}
                      stroke="#000000"
                      strokeWidth={1}
                    />
                    {/* Handle label */}
                    <text
                      x={handle.x}
                      y={handle.y - 12}
                      fill="#ffffff"
                      fontSize="10"
                      textAnchor="middle"
                      stroke="#000000"
                      strokeWidth={0.5}
                    >
                      {handleIndex === 0 ? 'E' : handleIndex === 1 ? 'S' : 'W'}
                    </text>
                  </g>
                );
              })}

              {/* Label for the visualization */}
              <text
                x={transformedHandles[0].x}
                y={transformedHandles[0].y - 25}
                fill="#ffffff"
                fontSize="11"
                textAnchor="middle"
                stroke="#000000"
                strokeWidth={0.5}
              >
                {`Seg ${viz.segmentIndex} ${viz.type} ${viz.fillOrStroke}`}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(20, 20)`}>
          <rect
            x={0}
            y={0}
            width={120}
            height={80}
            fill="rgba(0, 0, 0, 0.7)"
            rx={4}
          />
          <text x={10} y={20} fill="#ffffff" fontSize="12" fontWeight="bold">
            Handle Legend:
          </text>
          <text x={10} y={35} fill="#ffffff" fontSize="10">
            S = Start (0%)
          </text>
          <text x={10} y={50} fill="#ffffff" fontSize="10">
            E = End (100%)
          </text>
          <text x={10} y={65} fill="#ffffff" fontSize="10">
            W = Width control
          </text>
        </g>
      </svg>
    </div>
  );
};