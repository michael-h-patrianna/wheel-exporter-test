import React from 'react';
import type { ResultViewMode } from '../lib';
import styles from './ResultModeSelector.module.css';

interface ResultModeSelectorProps {
  value: ResultViewMode;
  onChange: (mode: ResultViewMode) => void;
  className?: string;
}

/**
 * Demo component for selecting the result view mode.
 * This is not part of the library - it's a demo/testing utility.
 */
export function ResultModeSelector({ value, onChange, className }: ResultModeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as ResultViewMode);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`${styles.select} ${className ?? ''}`}
      aria-label="Result View Mode"
    >
      <option value="Win Free">Win Free</option>
      <option value="Win Purchase">Win Purchase</option>
      <option value="No Win">No Win</option>
    </select>
  );
}
