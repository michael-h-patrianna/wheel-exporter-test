import React from 'react';

interface AppBarProps {
  onMenuClick: () => void;
  title?: string;
  githubUrl: string;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick, title, githubUrl }) => {
  return (
    <div className="app-bar" data-app-shell="bar">
      <button
        type="button"
        className="app-bar__hamburger"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-controls="app-sidebar-drawer"
        onClick={onMenuClick}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {title && (
        <span className="app-bar__title">
          {title}
        </span>
      )}
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="app-bar__github-link"
        aria-label="View source on GitHub"
      >
        <img src="/assets/github.svg" alt="GitHub" className="app-bar__github-icon" />
      </a>
    </div>
  );
};
