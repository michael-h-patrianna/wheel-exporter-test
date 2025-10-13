/**
 * Prize Provider Service
 * Generates prize tables and selects winners deterministically
 */

import {
  createValidatedProductionPrizeSet,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  type ProductionPrizeSetOptions,
} from '@config/prizeTable';
import type { Prize } from '@lib-types/prizeTypes';
import { validatePrizeSet } from '@utils/prizeUtils';
import { selectPrize } from '@utils/rng';

export type PrizeProviderSource = 'default' | 'fixture' | 'remote';

export interface PrizeProviderResult {
  prizes: Prize[];
  winningIndex: number;
  seed: number;
  source: PrizeProviderSource;
}

export interface PrizeProviderContext {
  seedOverride?: number;
  requestId?: string;
}

export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
}

export interface DefaultPrizeProviderOptions extends ProductionPrizeSetOptions {
  source?: PrizeProviderSource;
}

function resolveSeedValue(value: number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }
  return Math.floor(Date.now());
}

function buildDefaultSession(
  options: DefaultPrizeProviderOptions,
  context?: PrizeProviderContext
): PrizeProviderResult {
  const resolvedSeed = resolveSeedValue(context?.seedOverride ?? options.seed);
  const prizeSet = createValidatedProductionPrizeSet({
    count: options.count,
    seed: resolvedSeed,
  });

  const { selectedIndex, seedUsed } = selectPrize(prizeSet, resolvedSeed);

  // Validate the result
  validatePrizeSet(prizeSet);
  if (selectedIndex < 0 || selectedIndex >= prizeSet.length) {
    throw new Error(`Invalid winning index: ${selectedIndex} (prize count: ${prizeSet.length})`);
  }

  return {
    prizes: prizeSet,
    winningIndex: selectedIndex,
    seed: seedUsed,
    source: options.source ?? 'default',
  };
}

export function createDefaultPrizeProvider(
  options: DefaultPrizeProviderOptions = { count: DEFAULT_PRODUCTION_PRIZE_COUNT }
): PrizeProvider {
  return {
    load(context): Promise<PrizeProviderResult> {
      try {
        const session = buildDefaultSession(options, context);
        return Promise.resolve(session);
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('Failed to load prize session');
        return Promise.reject(normalizedError);
      }
    },
  };
}

/**
 * Simplified fixture provider for testing
 */
export interface PrizeFixture {
  prizes: Prize[];
  winningIndex: number;
}

export function createFixturePrizeProvider(fixture: PrizeFixture): PrizeProvider {
  return {
    load(context): Promise<PrizeProviderResult> {
      try {
        const resolvedSeed = resolveSeedValue(context?.seedOverride ?? fixture.winningIndex);

        // Validate the fixture
        validatePrizeSet(fixture.prizes);
        if (fixture.winningIndex < 0 || fixture.winningIndex >= fixture.prizes.length) {
          throw new Error(
            `Invalid winning index: ${fixture.winningIndex} (prize count: ${fixture.prizes.length})`
          );
        }

        return Promise.resolve({
          prizes: fixture.prizes,
          winningIndex: fixture.winningIndex,
          seed: resolvedSeed,
          source: 'fixture',
        });
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('Failed to load prize session');
        return Promise.reject(normalizedError);
      }
    },
  };
}
