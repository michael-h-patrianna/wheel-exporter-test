import React, { useState } from 'react';
import './App.css';
import { WheelViewer } from './components/WheelViewer';
import { ExtractedAssets } from './types';
import { extractWheelZip } from './utils/zipExtractor';

function App() {
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [wheelWidth, setWheelWidth] = useState(800);
  const [wheelHeight, setWheelHeight] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        <div className="upload-section">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isLoading}
            title="Choose a ZIP file exported from the Figma Wheel Plugin"
          />
          {isLoading && <div className="loading-message">Loading wheel theme...</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        {extractedAssets && (
          <>
            <div className="controls-section">
              <div className="control-row">
                <div className="control-group">
                  <label>
                    Wheel Width: {wheelWidth}px
                    <input
                      type="range"
                      min="200"
                      max="1200"
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
                      max="800"
                      value={wheelHeight}
                      onChange={(e) => setWheelHeight(Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Main wheel viewer */}
            <div className="wheel-container">
              <WheelViewer
                wheelData={extractedAssets.wheelData}
                assets={extractedAssets}
                wheelWidth={wheelWidth}
                wheelHeight={wheelHeight}
              />
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
                <span className={extractedAssets.wheelData.header ? 'component-present' : 'component-missing'}>
                  Header {extractedAssets.wheelData.header ? '✓' : '✗'}
                </span>
              </div>

              <p className="interaction-help">
                <strong>Interaction Guide:</strong><br />
                • Click header to cycle: active → success → fail<br />
                • Adjust wheel dimensions using the sliders above
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
