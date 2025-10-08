import React, { useState } from 'react';
import './App.css';
import { WheelViewer, ResultViewer, ExtractedAssets } from '../lib';
import { extractWheelZip } from './utils/zipExtractor';

function App() {
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [wheelWidth, setWheelWidth] = useState(800);
  const [wheelHeight, setWheelHeight] = useState(600);
  const [segmentCount, setSegmentCount] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);
      console.log('Starting ZIP extraction for:', file.name);

      const assets = await extractWheelZip(file);
      setExtractedAssets(assets);

      // Auto-set wheel dimensions to match the original frame size
      const frameWidth = assets.wheelData.frameSize?.width || 800;
      const frameHeight = assets.wheelData.frameSize?.height || 600;
      setWheelWidth(frameWidth);
      setWheelHeight(frameHeight);

      console.log('Successfully loaded wheel:', assets.wheelData.wheelId);
      console.log('Auto-set dimensions to:', frameWidth, 'x', frameHeight);
    } catch (err) {
      console.error('Error extracting ZIP:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract ZIP file');
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
                      Segments: {segmentCount}
                      <input
                        type="range"
                        min="3"
                        max="8"
                        value={segmentCount}
                        onChange={(e) => setSegmentCount(Number(e.target.value))}
                      />
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
              <>
                {/* Wheel Preview */}
                <div className="wheel-container">
                  <h3>Wheel Preview</h3>
                  <WheelViewer
                    wheelData={extractedAssets.wheelData}
                    assets={extractedAssets}
                    wheelWidth={wheelWidth}
                    wheelHeight={wheelHeight}
                    segmentCount={segmentCount}
                    componentVisibility={componentVisibility}
                    onToggleCenter={(show) => setComponentVisibility(prev => ({ ...prev, center: show }))}
                  />
                </div>

                {/* Result View Preview */}
                {extractedAssets.wheelData.rewards && (
                  <div className="result-container">
                    <h3 className="result-title">Result View Preview</h3>
                    <ResultViewer
                      wheelData={extractedAssets.wheelData}
                      assets={extractedAssets}
                      wheelWidth={wheelWidth}
                      wheelHeight={wheelHeight}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
