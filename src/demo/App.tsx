import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { WheelViewer } from '../lib/components/WheelViewer';
import { ResultViewer, ExtractedAssets, ErrorBoundary } from '../lib';
import { loadWheelFromZip, WheelLoadError } from '../lib/services/wheelLoader';
import {
  createDefaultPrizeProvider,
  type PrizeProviderResult,
} from '../lib/services/prizeProvider';
import { type SegmentLayoutType } from '../lib/types/segmentLayoutTypes';
import { type LightAnimationType } from '../lib/components/renderers/lights/lightAnimations';
import { AppBar } from './components/AppBar';
import { Sidebar } from './components/Sidebar';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [wheelWidth, setWheelWidth] = useState(800);
  const [wheelHeight, setWheelHeight] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(null);
  const [prizeRefreshTrigger, setPrizeRefreshTrigger] = useState(0);
  const wheelResetRef = useRef<(() => void) | null>(null);
  const [layoutType, setLayoutType] = useState<SegmentLayoutType>('original');
  const [lightAnimationType, setLightAnimationType] = useState<LightAnimationType>('none');

  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState({
    background: true,
    header: true,
    wheelBg: true,
    wheelTop1: true,
    wheelTop2: true,
    lights: true,
    buttonSpin: true,
    center: true,
    pointer: true,
    segments: true,
  });

  const toggleComponentVisibility = (component: keyof typeof componentVisibility) => {
    setComponentVisibility((prev) => ({
      ...prev,
      [component]: !prev[component],
    }));
  };

  // Generate prize session when refresh is triggered
  // Segment count is always determined by the prize table
  useEffect(() => {
    const generatePrizes = async () => {
      try {
        // Generate a random count between 3 and 8
        const randomCount = Math.floor(Math.random() * 6) + 3; // 3-8 inclusive

        const provider = createDefaultPrizeProvider({ count: randomCount });
        const session = await provider.load();
        setPrizeSession(session);
      } catch (err) {
        console.error('Failed to generate prizes:', err);
      }
    };

    generatePrizes();
  }, [prizeRefreshTrigger]);

  // Handler for generating new prizes
  const handleNewPrizes = () => {
    // Reset wheel if it's spinning
    if (wheelResetRef.current) {
      wheelResetRef.current();
    }
    // Trigger new prize generation
    setPrizeRefreshTrigger((prev) => prev + 1);
  };

  // Auto-load theme.zip if it exists in public/assets
  useEffect(() => {
    const autoLoadTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Attempt to fetch the theme.zip file
        const response = await fetch('/assets/theme.zip');

        if (!response.ok) {
          // Theme file doesn't exist, silently continue
          return;
        }

        // Convert response to blob and then to File
        const blob = await response.blob();
        const file = new File([blob], 'theme.zip', { type: 'application/zip' });

        // Load the theme using the same logic as handleFileUpload
        const assets = await loadWheelFromZip(file);
        setExtractedAssets(assets);

        // Auto-set wheel dimensions to match the original frame size
        const frameWidth = assets.wheelData.frameSize?.width || 800;
        const frameHeight = assets.wheelData.frameSize?.height || 600;
        setWheelWidth(frameWidth);
        setWheelHeight(frameHeight);
      } catch (err) {
        // Silently fail if theme doesn't exist or can't be loaded
        // No action needed - user can still upload their own theme
        console.warn('Theme auto-load failed (this is normal if no theme.zip exists):', err);
      } finally {
        setIsLoading(false);
      }
    };

    autoLoadTheme();
  }, []); // Only run once on mount

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);

      const assets = await loadWheelFromZip(file);
      setExtractedAssets(assets);

      // Auto-set wheel dimensions to match the original frame size
      const frameWidth = assets.wheelData.frameSize?.width || 800;
      const frameHeight = assets.wheelData.frameSize?.height || 600;
      setWheelWidth(frameWidth);
      setWheelHeight(frameHeight);
    } catch (err) {
      if (err instanceof WheelLoadError) {
        // Provide actionable error messages
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Close drawer on ESC
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isDrawerOpen]);

  return (
    <div className="App">
      {/* App Bar (Mobile Header) */}
      <AppBar
        onMenuClick={() => setIsDrawerOpen(true)}
        title="Wheel Demo"
        githubUrl="https://github.com/michael-h-patrianna/wheel-exporter-test"
      />

      <main className="App-main">
        <div className="layout-container">
          {/* Desktop Sidebar */}
          <Sidebar
            extractedAssets={extractedAssets}
            prizeSession={prizeSession}
            isLoading={isLoading}
            error={error}
            wheelWidth={wheelWidth}
            wheelHeight={wheelHeight}
            layoutType={layoutType}
            lightAnimationType={lightAnimationType}
            componentVisibility={componentVisibility}
            onFileUpload={handleFileUpload}
            onNewPrizes={handleNewPrizes}
            onWheelWidthChange={setWheelWidth}
            onWheelHeightChange={setWheelHeight}
            onLayoutTypeChange={setLayoutType}
            onLightAnimationTypeChange={setLightAnimationType}
            onToggleComponentVisibility={toggleComponentVisibility}
            className="desktop-sidebar"
          />

          {/* Main Content Area */}
          <div className="main-content">
            {extractedAssets && (
              <ErrorBoundary onReset={() => setExtractedAssets(null)}>
                <>
                  {/* Wheel Preview */}
                  <div className="wheel-container">
                    <WheelViewer
                      wheelData={extractedAssets.wheelData}
                      assets={extractedAssets}
                      wheelWidth={wheelWidth}
                      wheelHeight={wheelHeight}
                      segmentCount={prizeSession?.prizes.length || 6}
                      componentVisibility={componentVisibility}
                      onToggleCenter={(show) =>
                        setComponentVisibility((prev) => ({ ...prev, center: show }))
                      }
                      prizeSession={prizeSession}
                      onResetReady={(resetFn) => {
                        wheelResetRef.current = resetFn;
                      }}
                      layoutType={layoutType}
                      lightAnimationType={lightAnimationType}
                    />
                  </div>

                  {/* Result View Preview */}
                  {extractedAssets.wheelData.rewards && (
                    <div className="result-container">
                      <ResultViewer
                        wheelData={extractedAssets.wheelData}
                        assets={extractedAssets}
                        wheelWidth={wheelWidth}
                        wheelHeight={wheelHeight}
                      />
                    </div>
                  )}
                </>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>

      {/* Drawer for mobile sidebar */}
      <div
        id="app-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isDrawerOpen}
        hidden={!isDrawerOpen}
        className={`app-drawer ${isDrawerOpen ? 'is-open' : ''}`}
      >
        <div className="app-drawer__overlay" onClick={() => setIsDrawerOpen(false)} />
        <div className="app-drawer__panel">
          <div className="app-drawer__panel-header">
            <button
              type="button"
              className="app-drawer__close"
              aria-label="Close menu"
              onClick={() => setIsDrawerOpen(false)}
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <Sidebar
            extractedAssets={extractedAssets}
            prizeSession={prizeSession}
            isLoading={isLoading}
            error={error}
            wheelWidth={wheelWidth}
            wheelHeight={wheelHeight}
            layoutType={layoutType}
            lightAnimationType={lightAnimationType}
            componentVisibility={componentVisibility}
            onFileUpload={handleFileUpload}
            onNewPrizes={handleNewPrizes}
            onWheelWidthChange={setWheelWidth}
            onWheelHeightChange={setWheelHeight}
            onLayoutTypeChange={setLayoutType}
            onLightAnimationTypeChange={setLightAnimationType}
            onToggleComponentVisibility={toggleComponentVisibility}
            className="drawer-sidebar"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
