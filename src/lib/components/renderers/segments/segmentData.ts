import { useMemo } from 'react';
import type { PrizeSegment } from '@utils/prizeSegmentMapper';
import { SEGMENT_KINDS } from '@utils/segmentUtils';
import type { SegmentRenderData } from './types';

/**
 * Compute the angular size of each segment.
 */
export function useSegmentAngle(segmentCount: number): number {
  return useMemo(() => (Math.PI * 2) / segmentCount, [segmentCount]);
}

/**
 * Derive segment render data with optional prize metadata.
 */
export function useSegmentData(
  segmentCount: number,
  segmentAngle: number,
  prizeSegments: PrizeSegment[] | null
): SegmentRenderData[] {
  return useMemo(() => {
    const data: SegmentRenderData[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;
      const prizeSegment = prizeSegments?.[i];
      const fallbackKind = SEGMENT_KINDS[i % SEGMENT_KINDS.length];

      data.push({
        index: i,
        startAngle,
        endAngle,
        kind: prizeSegment?.kind ?? fallbackKind,
        prizeSegment,
      });
    }

    return data;
  }, [segmentCount, segmentAngle, prizeSegments]);
}
