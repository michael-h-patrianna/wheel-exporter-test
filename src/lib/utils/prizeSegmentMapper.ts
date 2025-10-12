/**
 * Prize to Segment Mapper
 * Maps prize data to wheel segment display properties
 */

import type { Prize } from '../types/prizeTypes';
import type { WheelSegmentKind } from '../types';
import { getSlotDisplayText } from '../types/prizeTypes';
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
  return prizes.map((prize, index) => {
    // Determine segment kind based on prize type and position
    let kind: WheelSegmentKind;
    const isNoWin = prize.type === 'no_win';

    if (isNoWin) {
      kind = 'nowin';
    } else if (index === 0 && prize.type === 'free' && prize.freeReward?.sc && prize.freeReward.sc >= 500) {
      // First high-value SC prize is jackpot
      kind = 'jackpot';
    } else {
      // Alternate between odd and even for remaining prizes
      kind = index % 2 === 0 ? 'even' : 'odd';
    }

    // Check if this is a purchase offer
    const usePurchaseImage = prize.type === 'purchase';

    // Check if this is a combo reward (multiple reward types)
    const freeReward = prize.freeReward;
    const rewardCount = freeReward
      ? [freeReward.sc, freeReward.gc, freeReward.spins, freeReward.xp, freeReward.randomReward].filter(Boolean).length
      : 0;
    const isCombo = rewardCount >= 2;

    // Check if this is a random-reward-only prize
    const hasOnlyRandom = freeReward?.randomReward && !freeReward.sc && !freeReward.gc && !freeReward.spins && !freeReward.xp;
    const useRandomRewardImage = !!hasOnlyRandom;

    // Check if this is an XP-only prize
    const hasOnlyXp = freeReward?.xp && !freeReward.sc && !freeReward.gc && !freeReward.spins && !freeReward.randomReward;
    const useXpImage = !!hasOnlyXp;

    // Get display text for the segment with specific formatting rules
    let displayText: string;

    if (isNoWin) {
      displayText = 'NO\nWIN';
    } else if (freeReward) {
      // Check for single reward types and format accordingly
      const hasOnlySC = freeReward.sc && !freeReward.gc && !freeReward.spins && !freeReward.xp && !freeReward.randomReward;
      const hasOnlyGC = freeReward.gc && !freeReward.sc && !freeReward.spins && !freeReward.xp && !freeReward.randomReward;
      const hasOnlySpins = freeReward.spins && !freeReward.sc && !freeReward.gc && !freeReward.xp && !freeReward.randomReward;

      if (hasOnlySC) {
        displayText = `FREE SC\n${abbreviateNumber(freeReward.sc!)}`;
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
          rewardParts.push(`${abbreviateNumber(freeReward.xp.amount)} ${freeReward.xp.config.name}`);
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
