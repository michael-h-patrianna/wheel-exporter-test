/**
 * Prize to Segment Mapper
 * Maps prize data to wheel segment display properties
 */

import type { WheelSegmentKind } from '@lib-types';
import type { Prize } from '@lib-types/prizeTypes';
import { getSlotDisplayText } from '@lib-types/prizeTypes';
import { abbreviateNumber } from './prizeUtils';

export interface PrizeSegment {
  prize: Prize;
  index: number;
  kind: WheelSegmentKind;
  displayText: string;
  color: string;
  iconUrl?: string;
  usePurchaseImage: boolean;
  useRandomRewardImage: boolean;
  useXpImage: boolean;
  isNoWin: boolean;
  isCombo: boolean;
}

/**
 * Maps prizes to wheel segments with display properties
 * @param prizes - Array of prizes to map
 * @returns Array of prize segments with display properties
 */
export function mapPrizesToSegments(prizes: Prize[]): PrizeSegment[] {
  // Find the index of the prize with the lowest probability (excluding no_win)
  // This is the jackpot prize - the rarest/most valuable prize
  let jackpotIndex = -1;
  let lowestProbability = Infinity;

  prizes.forEach((prize, idx) => {
    if (prize.type !== 'no_win' && prize.probability < lowestProbability) {
      lowestProbability = prize.probability;
      jackpotIndex = idx;
    }
  });

  // First pass: assign special kinds (nowin, jackpot)
  const kinds: WheelSegmentKind[] = prizes.map((prize, index) => {
    const isNoWin = prize.type === 'no_win';
    if (isNoWin) return 'nowin';
    if (index === jackpotIndex) return 'jackpot';
    return 'even'; // Placeholder, will be updated in next pass
  });

  // Second pass: assign odd/even in chunks separated by special segments
  // A chunk is a contiguous group of regular segments between special segments
  // We must ensure alternation within chunks AND across chunk boundaries (including wrap-around)

  // Find all special segment indices
  const specialIndices: number[] = [];
  kinds.forEach((kind, index) => {
    if (kind === 'nowin' || kind === 'jackpot') {
      specialIndices.push(index);
    }
  });

  if (specialIndices.length === 0) {
    // No special segments - all segments form one circular chunk
    // Assign alternating starting with 'even' at index 0
    kinds.forEach((kind, index) => {
      kinds[index] = index % 2 === 0 ? 'even' : 'odd';
    });
  } else {
    // Build chunks of regular segments between special segments
    interface Chunk {
      startIndex: number; // Inclusive
      endIndex: number; // Inclusive (can wrap around)
      indices: number[]; // Actual segment indices in this chunk
    }

    const chunks: Chunk[] = [];

    // For each special segment, the chunk starts after it and ends before the next special
    for (let i = 0; i < specialIndices.length; i++) {
      const specialIndex = specialIndices[i];
      const nextSpecialIndex = specialIndices[(i + 1) % specialIndices.length];

      const chunkIndices: number[] = [];
      let currentIndex = (specialIndex + 1) % kinds.length;

      // Collect all regular segments until we hit the next special segment
      while (currentIndex !== nextSpecialIndex) {
        if (kinds[currentIndex] !== 'nowin' && kinds[currentIndex] !== 'jackpot') {
          chunkIndices.push(currentIndex);
        }
        currentIndex = (currentIndex + 1) % kinds.length;
      }

      if (chunkIndices.length > 0) {
        chunks.push({
          startIndex: chunkIndices[0],
          endIndex: chunkIndices[chunkIndices.length - 1],
          indices: chunkIndices,
        });
      }
    }

    // Assign styles to chunks, ensuring alternation across chunk boundaries
    // Start with the first chunk and assign 'even' to its first segment
    if (chunks.length > 0) {
      let currentStyle: 'even' | 'odd' = 'even';

      for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
        const chunk = chunks[chunkIdx];

        // Assign alternating styles within this chunk
        for (let i = 0; i < chunk.indices.length; i++) {
          const segmentIndex = chunk.indices[i];
          kinds[segmentIndex] = currentStyle;
          // Flip for next segment in chunk
          currentStyle = currentStyle === 'even' ? 'odd' : 'even';
        }

        // After assigning the last segment of this chunk, currentStyle is already
        // set to the opposite style, which is perfect for the first segment of the next chunk
        // This ensures alternation across chunk boundaries
      }
    }
  }

  return prizes.map((prize, index) => {
    const kind = kinds[index];
    const isNoWin = prize.type === 'no_win';

    // Check if this is a purchase offer
    const usePurchaseImage = prize.type === 'purchase';

    // Check if this is a combo reward (multiple reward types)
    const freeReward = prize.freeReward;
    const rewardCount = freeReward
      ? [
          freeReward.sc,
          freeReward.gc,
          freeReward.spins,
          freeReward.xp,
          freeReward.randomReward,
        ].filter(Boolean).length
      : 0;
    const isCombo = rewardCount >= 2;

    // Check if this is a random-reward-only prize
    const hasOnlyRandom =
      freeReward?.randomReward &&
      !freeReward.sc &&
      !freeReward.gc &&
      !freeReward.spins &&
      !freeReward.xp;
    const useRandomRewardImage = !!hasOnlyRandom;

    // Check if this is an XP-only prize
    const hasOnlyXp =
      freeReward?.xp &&
      !freeReward.sc &&
      !freeReward.gc &&
      !freeReward.spins &&
      !freeReward.randomReward;
    const useXpImage = !!hasOnlyXp;

    // Get display text for the segment with specific formatting rules
    let displayText: string;

    if (isNoWin) {
      displayText = 'NO\nWIN';
    } else if (usePurchaseImage) {
      // Purchase offers show "200%" text with image
      displayText = '200%';
    } else if (freeReward) {
      // Check for single reward types and format accordingly
      const hasOnlySC =
        freeReward.sc &&
        !freeReward.gc &&
        !freeReward.spins &&
        !freeReward.xp &&
        !freeReward.randomReward;
      const hasOnlyGC =
        freeReward.gc &&
        !freeReward.sc &&
        !freeReward.spins &&
        !freeReward.xp &&
        !freeReward.randomReward;
      const hasOnlySpins =
        freeReward.spins &&
        !freeReward.sc &&
        !freeReward.gc &&
        !freeReward.xp &&
        !freeReward.randomReward;

      if (hasOnlySC) {
        displayText = `SC\n${abbreviateNumber(freeReward.sc!)}`;
      } else if (hasOnlyGC) {
        displayText = `GC\n${abbreviateNumber(freeReward.gc!)}`;
      } else if (hasOnlySpins) {
        displayText = `FREE SPINS\n${abbreviateNumber(freeReward.spins!)}`;
      } else if (hasOnlyXp) {
        // XP only: show number on one line with image below (handled in renderer)
        displayText = abbreviateNumber(freeReward.xp!.amount);
      } else if (hasOnlyRandom) {
        // Random reward will use image instead of text (handled in renderer)
        displayText = '';
      } else {
        // Multiple rewards: build ordered list following Plinko priority
        // Priority: SC > Free Spins > GC > Random Reward > XP
        const rewardParts: string[] = [];

        if (freeReward.sc) rewardParts.push(`SC ${abbreviateNumber(freeReward.sc)}`);
        if (freeReward.spins) rewardParts.push(`${abbreviateNumber(freeReward.spins)} Spins`);
        if (freeReward.gc) rewardParts.push(`GC ${abbreviateNumber(freeReward.gc)}`);
        if (freeReward.randomReward) {
          const rewardName = freeReward.randomReward.config.name;
          rewardParts.push(rewardName);
        }
        if (freeReward.xp) {
          rewardParts.push(
            `${abbreviateNumber(freeReward.xp.amount)} ${freeReward.xp.config.name}`
          );
        }

        // Show top 2 rewards on separate lines for wheel segments
        if (rewardParts.length >= 2) {
          displayText = `${rewardParts[0]}\n${rewardParts[1]}`;
        } else if (rewardParts.length === 1) {
          // Shouldn't happen (would have been caught by single reward checks above)
          // but handle it gracefully by showing the label
          const label = rewardParts[0] || '';
          displayText = label.includes(' ') ? label.replace(' ', '\n') : label;
        } else {
          displayText = '';
        }
      }
    } else {
      displayText = getSlotDisplayText(prize, abbreviateNumber, false, true);
    }

    return {
      prize,
      index,
      kind,
      displayText,
      color: prize.slotColor,
      iconUrl: prize.slotIcon,
      usePurchaseImage,
      useRandomRewardImage,
      useXpImage,
      isNoWin,
      isCombo,
    };
  });
}

/**
 * Gets the winning segment from prize session
 * @param prizeSegments - Array of prize segments
 * @param winningIndex - Index of winning prize
 * @returns The winning prize segment
 */
export function getWinningSegment(
  prizeSegments: PrizeSegment[],
  winningIndex: number
): PrizeSegment | null {
  return prizeSegments[winningIndex] ?? null;
}
