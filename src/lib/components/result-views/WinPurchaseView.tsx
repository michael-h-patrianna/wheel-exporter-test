import React from 'react';

/**
 * WinPurchaseView Component - Displays the "Win Purchase" result view
 * Placeholder for future purchase offer UI
 */
export const WinPurchaseView: React.FC = () => {
  return (
    <div
      className="win-purchase-view"
      data-testid="win-purchase-view"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        fontFamily: 'Lato, sans-serif',
        fontSize: '24px',
        fontWeight: 700,
        color: '#ffffff',
      }}
    >
      <span data-testid="view-text">win purchase</span>
    </div>
  );
};
