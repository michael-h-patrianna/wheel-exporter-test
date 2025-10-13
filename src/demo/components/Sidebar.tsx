import React from 'react';
import { ExtractedAssets } from '../../lib';
import { PrizeTable } from '../../lib/components/prize/PrizeTable';
import { type PrizeProviderResult } from '../../lib/services/prizeProvider';
import { SEGMENT_LAYOUTS, type SegmentLayoutType } from '../../lib/types/segmentLayoutTypes';
import {
  getAllAnimations,
  type LightAnimationType,
} from '../../lib/components/renderers/lights/lightAnimations';

type ComponentVisibilityType = {
  background: boolean;
  header: boolean;
  wheelBg: boolean;
  wheelTop1: boolean;
  wheelTop2: boolean;
  lights: boolean;
  buttonSpin: boolean;
  center: boolean;
  pointer: boolean;
  segments: boolean;
};

interface SidebarProps {
  extractedAssets: ExtractedAssets | null;
  prizeSession: PrizeProviderResult | null;
  isLoading: boolean;
  error: string | null;
  wheelWidth: number;
  wheelHeight: number;
  layoutType: SegmentLayoutType;
  lightAnimationType: LightAnimationType;
  componentVisibility: ComponentVisibilityType;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPrizes: () => void;
  onWheelWidthChange: (width: number) => void;
  onWheelHeightChange: (height: number) => void;
  onLayoutTypeChange: (layoutType: SegmentLayoutType) => void;
  onLightAnimationTypeChange: (animationType: LightAnimationType) => void;
  onToggleComponentVisibility: (component: keyof ComponentVisibilityType) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  extractedAssets,
  prizeSession,
  isLoading,
  error,
  wheelWidth,
  wheelHeight,
  layoutType,
  lightAnimationType,
  componentVisibility,
  onFileUpload,
  onNewPrizes,
  onWheelWidthChange,
  onWheelHeightChange,
  onLayoutTypeChange,
  onLightAnimationTypeChange,
  onToggleComponentVisibility,
  className,
}) => {
  return (
    <aside className={`app-sidebar${className ? ` ${className}` : ''}`}>
      {/* File Upload */}
      <div className="upload-section">
        <label className="file-input-label">
          <input
            type="file"
            accept=".zip"
            onChange={onFileUpload}
            className="file-input-hidden"
            disabled={isLoading}
          />
          <span className="file-input-button">{isLoading ? 'Loading...' : 'Choose ZIP File'}</span>
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
              onNewPrizes={onNewPrizes}
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
                  onChange={(e) => onWheelWidthChange(Number(e.target.value))}
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
                  onChange={(e) => onWheelHeightChange(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="control-group">
              <label>
                Segment Layout Style:
                <select
                  value={layoutType}
                  onChange={(e) => onLayoutTypeChange(e.target.value as SegmentLayoutType)}
                >
                  {SEGMENT_LAYOUTS.map((layout) => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name}
                    </option>
                  ))}
                </select>
                <small>{SEGMENT_LAYOUTS.find((l) => l.id === layoutType)?.description}</small>
              </label>
            </div>
            <div className="control-group">
              <label>
                Light Animation:
                <select
                  value={lightAnimationType}
                  onChange={(e) => onLightAnimationTypeChange(e.target.value as LightAnimationType)}
                >
                  {getAllAnimations().map((animation) => (
                    <option key={animation.id} value={animation.id}>
                      {animation.title}
                    </option>
                  ))}
                </select>
                <small>
                  {getAllAnimations().find((a) => a.id === lightAnimationType)?.description}
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
                <strong>Frame Size:</strong> {extractedAssets.wheelData.frameSize.width} ×{' '}
                {extractedAssets.wheelData.frameSize.height}
              </div>
              <div className="info-item">
                <strong>Version:</strong> {extractedAssets.wheelData.metadata.version}
              </div>
            </div>

            <h4>Components Included:</h4>
            <div className="components-list">
              <button
                className={`component-toggle ${extractedAssets.backgroundImage ? 'component-present' : 'component-missing'} ${!componentVisibility.background ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('background')}
                disabled={!extractedAssets.backgroundImage}
              >
                Background{' '}
                {extractedAssets.backgroundImage
                  ? componentVisibility.background
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.header ? 'component-present' : 'component-missing'} ${!componentVisibility.header ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('header')}
                disabled={!extractedAssets.wheelData.header}
              >
                Header{' '}
                {extractedAssets.wheelData.header
                  ? componentVisibility.header
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.wheelBg ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelBg ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('wheelBg')}
                disabled={!extractedAssets.wheelData.wheelBg}
              >
                Wheel Bg{' '}
                {extractedAssets.wheelData.wheelBg
                  ? componentVisibility.wheelBg
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.segments ? 'component-present' : 'component-missing'} ${!componentVisibility.segments ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('segments')}
                disabled={!extractedAssets.wheelData.segments}
              >
                Segments{' '}
                {extractedAssets.wheelData.segments
                  ? componentVisibility.segments
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.wheelTop1 ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelTop1 ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('wheelTop1')}
                disabled={!extractedAssets.wheelData.wheelTop1}
              >
                Wheel Top 1{' '}
                {extractedAssets.wheelData.wheelTop1
                  ? componentVisibility.wheelTop1
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.wheelTop2 ? 'component-present' : 'component-missing'} ${!componentVisibility.wheelTop2 ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('wheelTop2')}
                disabled={!extractedAssets.wheelData.wheelTop2}
              >
                Wheel Top 2{' '}
                {extractedAssets.wheelData.wheelTop2
                  ? componentVisibility.wheelTop2
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.lights ? 'component-present' : 'component-missing'} ${!componentVisibility.lights ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('lights')}
                disabled={!extractedAssets.wheelData.lights}
              >
                Lights{' '}
                {extractedAssets.wheelData.lights
                  ? componentVisibility.lights
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.buttonSpin ? 'component-present' : 'component-missing'} ${!componentVisibility.buttonSpin ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('buttonSpin')}
                disabled={!extractedAssets.wheelData.buttonSpin}
              >
                Button Spin{' '}
                {extractedAssets.wheelData.buttonSpin
                  ? componentVisibility.buttonSpin
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.center ? 'component-present' : 'component-missing'} ${!componentVisibility.center ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('center')}
                disabled={!extractedAssets.wheelData.center}
              >
                Center{' '}
                {extractedAssets.wheelData.center
                  ? componentVisibility.center
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
              <button
                className={`component-toggle ${extractedAssets.wheelData.pointer ? 'component-present' : 'component-missing'} ${!componentVisibility.pointer ? 'component-hidden' : ''}`}
                onClick={() => onToggleComponentVisibility('pointer')}
                disabled={!extractedAssets.wheelData.pointer}
              >
                Pointer{' '}
                {extractedAssets.wheelData.pointer
                  ? componentVisibility.pointer
                    ? '👁'
                    : '👁‍🗨'
                  : '✗'}
              </button>
            </div>

            <p className="interaction-help">
              <strong>Interaction Guide:</strong>
              <br />
              • Click header to cycle: active → success → fail
              <br />
              • Click spin button to simulate wheel spinning
              <br />
              • Toggle &quot;Show Center&quot; to show/hide center overlay
              <br />• Adjust wheel dimensions using the sliders above
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
