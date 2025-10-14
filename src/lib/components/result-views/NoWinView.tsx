import React from 'react';

/**
 * NoWinView Component - Displays the "No Win" result view
 * Placeholder for future no-win state UI
 */
export const NoWinView: React.FC = () => {
  return (
    <div
      className="no-win-view"
      data-testid="no-win-view"
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
      <span data-testid="view-text">no win</span>
    </div>
  );
};
