/**
 * Type definitions for reward row components
 */

/**
 * Reward row types supported by the Figma plugin:
 * - gcsc: Gold Coins + Sweeps Coins combo (uses backgrounds.highlight)
 * - freeSpins: Free spins reward (uses backgrounds.default)
 * - xp: Experience points reward (uses backgrounds.default)
 * - rr: Random reward (uses backgrounds.default)
 * - fail: Fail/loss state (uses backgrounds.default)
 */
export type RewardRowType = 'gcsc' | 'freeSpins' | 'xp' | 'rr' | 'fail';

export interface RewardRowData {
  type: RewardRowType;
  gcValue?: string;      // For 'gcsc' type
  scValue?: string;      // For 'gcsc' type
  value?: string;        // For 'freeSpins', 'xp', 'rr' types
  label?: string;        // Optional custom label
  message?: string;      // For 'fail' type
}
