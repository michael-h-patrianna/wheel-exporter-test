import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { WheelViewer } from '../lib/components/WheelViewer';
import { ResultViewer, ExtractedAssets, ErrorBoundary } from '../lib';
import { loadWheelFromZip, WheelLoadError } from '../lib/services/wheelLoader';
import { PrizeTable } from '../lib/components/prize/PrizeTable';
import { createDefaultPrizeProvider, type PrizeProviderResult } from '../lib/services/prizeProvider';
import { SEGMENT_LAYOUTS, type SegmentLayoutType } from '../lib/types/segmentLayoutTypes';

function App() {
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [wheelWidth, setWheelWidth] = useState(800);
  const [wheelHeight, setWheelHeight] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(null);
  const [prizeRefreshTrigger, setPrizeRefreshTrigger] = useState(0);
  const wheelResetRef = useRef<(() => void) | null>(null);
  const [layoutType, setLayoutType] = useState<SegmentLayoutType>('original');

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
    setComponentVisibility(prev => ({
      ...prev,
      [component]: !prev[component]
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
        // eslint-disable-next-line no-console
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
    setPrizeRefreshTrigger(prev => prev + 1);
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
        // eslint-disable-next-line no-console
        console.debug('Theme auto-load failed (this is normal if no theme.zip exists):', err);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Wheel Demo</h1>
        <p>Upload a ZIP file exported from the Figma Wheel Plugin</p>
      </header>

      <main className="App-main">
        <div className="layout-container">
          {/* Left Sidebar */}
          <div className="sidebar">
            {/* File Upload */}
            <div className="upload-section">
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="file-input-hidden"
                  disabled={isLoading}
                />
                <span className="file-input-button">
                  {isLoading ? 'Loading...' : 'Choose ZIP File'}
                </span>
              </label>
              {isLoading && <div className="loading-message">Loading wheel theme...</div>}
              {error && <div className="error-message">{error}</div>}
            </div>

            {extractedAssets && (
              <>
                {/* Prize Table */}
                {prizeSession && (
                  <PrizeTable
                    prizes={prizeSession.prizes}
                    winningIndex={prizeSession.winningIndex}
                    showWinner={true}
                    onNewPrizes={handleNewPrizes}
                  />
                )}

                {/* Controls */}
                <div className="controls-section">
                  <h3>Wheel Settings</h3>
                  <div className="control-group">
                    <label>
                      Wheel Width: {wheelWidth}px
                      <input
                        type="range"
                        min="200"
                        max="414"
                        value={wheelWidth}
                        onChange={(e) => setWheelWidth(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Wheel Height: {wheelHeight}px
                      <input
                        type="range"
                        min="200"
                        max="720"
                        value={wheelHeight}
                        onChange={(e) => setWheelHeight(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Segment Layout Style:
                      <select
                        value={layoutType}
                        onChange={(e) => setLayoutType(e.target.value as SegmentLayoutType)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      >
                        {SEGMENT_LAYOUTS.map(layout => (
                          <option key={layout.id} value={layout.id}>
                            {layout.name}
                          </option>
                        ))}
                      </select>
                      <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                        {SEGMENT_LAYOUTS.find(l => l.id === layoutType)?.description}
                      </small>
                    </label>
                  </div>
                </div>

                {/* Information panel */}
                <div className="info-section">
                  <h3>Wheel Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>ID:</strong> {extractedAssets.wheelData.wheelId}
                    </div>
                    <div className="info-item">
                      <strong>Frame Size:</strong> {extractedAssets.wheelData.frameSize.width} × {extractedAssets.wheelData.frameSize.height}
                    </div>
                    <div className="info-item">
                      <strong>Version:</strong> {extractedAssets.wheelData.metadata.version}
                    </div>
                  </div>

                  <h4>Components Included:</h4>
                  <div className="components-list">
                    <button
                      className={`component-toggle ${extractedAssets.backgroundImage ? 'component-present' : 'component-missing'} ${!componentVisibility.background ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('background')}
                      disabled={!extractedAssets.backgroundImage}
                    >
                      Background {extractedAssets.backgroundImage ? (componentVisibility.background ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.header ? 'component-present' : 'component-missing'} ${!componentVisibility.header ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('header')}
                      disabled={!extractedAssets.wheelData.header}
                    >
                      Header {extractedAssets.wheelData.header ? (componentVisibility.header ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.wheelBg ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelBg ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('wheelBg')}
                      disabled={!extractedAssets.wheelData.wheelBg}
                    >
                      Wheel Bg {extractedAssets.wheelData.wheelBg ? (componentVisibility.wheelBg ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.segments ? 'component-present' : 'component-missing'} ${!componentVisibility.segments ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('segments')}
                      disabled={!extractedAssets.wheelData.segments}
                    >
                      Segments {extractedAssets.wheelData.segments ? (componentVisibility.segments ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.wheelTop1 ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelTop1 ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('wheelTop1')}
                      disabled={!extractedAssets.wheelData.wheelTop1}
                    >
                      Wheel Top 1 {extractedAssets.wheelData.wheelTop1 ? (componentVisibility.wheelTop1 ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.wheelTop2 ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelTop2 ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('wheelTop2')}
                      disabled={!extractedAssets.wheelData.wheelTop2}
                    >
                      Wheel Top 2 {extractedAssets.wheelData.wheelTop2 ? (componentVisibility.wheelTop2 ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.lights ? 'component-present' : 'component-missing'} ${!componentVisibility.lights ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('lights')}
                      disabled={!extractedAssets.wheelData.lights}
                    >
                      Lights {extractedAssets.wheelData.lights ? (componentVisibility.lights ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.buttonSpin ? 'component-present' : 'component-missing'} ${!componentVisibility.buttonSpin ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('buttonSpin')}
                      disabled={!extractedAssets.wheelData.buttonSpin}
                    >
                      Button Spin {extractedAssets.wheelData.buttonSpin ? (componentVisibility.buttonSpin ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.center ? 'component-present' : 'component-missing'} ${!componentVisibility.center ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('center')}
                      disabled={!extractedAssets.wheelData.center}
                    >
                      Center {extractedAssets.wheelData.center ? (componentVisibility.center ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                    <button
                      className={`component-toggle ${extractedAssets.wheelData.pointer ? 'component-present' : 'component-missing'} ${!componentVisibility.pointer ? 'component-hidden' : ''}`}
                      onClick={() => toggleComponentVisibility('pointer')}
                      disabled={!extractedAssets.wheelData.pointer}
                    >
                      Pointer {extractedAssets.wheelData.pointer ? (componentVisibility.pointer ? '👁' : '👁‍🗨') : '✗'}
                    </button>
                  </div>

                  <p className="interaction-help">
                    <strong>Interaction Guide:</strong><br />
                    • Click header to cycle: active → success → fail<br />
                    • Click spin button to simulate wheel spinning<br />
                    • Toggle "Show Center" to show/hide center overlay<br />
                    • Adjust wheel dimensions using the sliders above
                  </p>
                </div>
              </>
            )}
          </div>

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
                      onToggleCenter={(show) => setComponentVisibility(prev => ({ ...prev, center: show }))}
                      prizeSession={prizeSession}
                      onResetReady={(resetFn) => { wheelResetRef.current = resetFn; }}
                      layoutType={layoutType}
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
    </div>
  );
}

export default App;
