/**
 * Prize Table Component
 * Displays available prizes with probabilities and winner indicator
 * Adapted from Plinko StartScreen component
 */

import React, { useState } from 'react';
import type { Prize } from '@lib-types/prizeTypes';
import { getSlotDisplayText } from '@lib-types/prizeTypes';
import { abbreviateNumber } from '@utils/prizeUtils';
import './PrizeTable.css';

interface PrizeTableProps {
  prizes: Prize[];
  winningIndex?: number;
  showWinner?: boolean;
  onNewPrizes?: () => void;
}

export function PrizeTable({
  prizes,
  winningIndex,
  showWinner = false,
  onNewPrizes,
}: PrizeTableProps) {
  const [expandedPrize, setExpandedPrize] = useState<string | null>(null);

  return (
    <div className="prize-table">
      <div className="prize-table-header">
        <h3 className="prize-table-title">Available Prizes</h3>
        {onNewPrizes && (
          <button className="prize-table-new-button" onClick={onNewPrizes}>
            New
          </button>
        )}
      </div>
      <div className="prize-list">
        {prizes.map((prize, index) => {
          const prizeType = prize.type;
          const isPurchaseOffer = prizeType === 'purchase';
          const prizeReward = prize.freeReward;
          const rewardCount = prizeReward
            ? [
                prizeReward.sc,
                prizeReward.gc,
                prizeReward.spins,
                prizeReward.xp,
                prizeReward.randomReward,
              ].filter(Boolean).length
            : 0;
          const isCombo = rewardCount >= 2 && !isPurchaseOffer;
          const isExpanded = expandedPrize === prize.id;
          const isWinner = showWinner && winningIndex === index;

          // Display text logic
          let displayText: string;
          if (isPurchaseOffer) {
            displayText = '200% Special Offer';
          } else if (isCombo) {
            displayText = prize.title || '';
          } else {
            displayText = getSlotDisplayText(prize, abbreviateNumber, true) || prize.title || '';
          }

          return (
            <div key={prize.id} className="prize-item-wrapper">
              <div
                className={`prize-item ${isWinner ? 'prize-item-winner' : ''}`}
                style={{
                  background: `linear-gradient(90deg, ${prize.slotColor}26 0%, transparent 100%)`,
                  borderLeft: `3px solid ${prize.slotColor}`,
                  cursor: isCombo ? 'pointer' : 'default',
                }}
                onClick={() => isCombo && setExpandedPrize(isExpanded ? null : prize.id)}
              >
                {isWinner && <div className="winner-indicator" />}
                <span className="prize-text">
                  {displayText}
                  {isCombo && <span className="expand-icon">{isExpanded ? ' ▼' : ' ▶'}</span>}
                </span>
                <span className="prize-probability" style={{ color: prize.slotColor }}>
                  {(prize.probability * 100).toFixed(0)}%
                </span>
              </div>
              {isCombo && isExpanded && (
                <div
                  className="prize-details"
                  style={{
                    background: `${prize.slotColor}14`,
                  }}
                >
                  {prizeReward?.sc && <div>• Free SC: {abbreviateNumber(prizeReward.sc)}</div>}
                  {prizeReward?.gc && <div>• GC: {abbreviateNumber(prizeReward.gc)}</div>}
                  {prizeReward?.spins && <div>• Free Spins: {prizeReward.spins}</div>}
                  {prizeReward?.xp && (
                    <div>
                      • {prizeReward.xp.config.name}: {abbreviateNumber(prizeReward.xp.amount)}
                    </div>
                  )}
                  {prizeReward?.randomReward && <div>• {prizeReward.randomReward.config.name}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
