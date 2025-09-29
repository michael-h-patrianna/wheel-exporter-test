// Core types for the wheel format (excludes quests, rewards, button, timer)

// Component state types
export type HeaderState = 'active' | 'success' | 'fail';

// Base interface for image-based component positioning
export interface ImageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

// Header component
export interface HeaderComponent {
  stateBounds: {
    active: ImageBounds;
    success: ImageBounds;
    fail: ImageBounds;
  };
  activeImg: string;
  successImg: string;
  failImg: string;
}

// Main wheel export format
export interface WheelExport {
  wheelId: string;
  frameSize: {
    width: number;
    height: number;
  };
  background: {
    exportUrl: string;
  };
  header?: HeaderComponent;
  exportedAt: string;
  metadata: {
    exportFormat?: string;
    version: string;
  };
}

// Application state management
export interface AppState {
  headerState: HeaderState;
  isAnimating: boolean;
}

// Extracted assets from ZIP
export interface ExtractedAssets {
  wheelData: WheelExport;
  backgroundImage?: string;
  headerImages?: {
    active?: string;
    success?: string;
    fail?: string;
  };
}