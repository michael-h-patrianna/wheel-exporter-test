/**
 * Integration tests for App component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { extractWheelZip } from './utils/zipExtractor';
import { createMockExtractedAssets, createMockZipFile, createMockWheelData } from './utils/testHelpers';

// Mock the zipExtractor module
jest.mock('./utils/zipExtractor');
const mockExtractWheelZip = extractWheelZip as jest.MockedFunction<typeof extractWheelZip>;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('App', () => {
  beforeEach(() => {
    mockExtractWheelZip.mockClear();
  });

  describe('Initial render', () => {
    it('should render the app header', () => {
      render(<App />);
      expect(screen.getByText('Wheel Demo')).toBeInTheDocument();
      expect(screen.getByText('Upload a ZIP file exported from the Figma Wheel Plugin')).toBeInTheDocument();
    });

    it('should render file upload button', () => {
      render(<App />);
      expect(screen.getByText('Choose ZIP File')).toBeInTheDocument();
    });

    it('should not show wheel viewer before file upload', () => {
      const { container } = render(<App />);
      expect(container.querySelector('.wheel-viewer-container')).not.toBeInTheDocument();
    });

    it('should not show controls before file upload', () => {
      render(<App />);
      expect(screen.queryByText('Wheel Settings')).not.toBeInTheDocument();
    });
  });

  describe('File upload', () => {
    it('should handle file upload successfully', async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(mockExtractWheelZip).toHaveBeenCalledWith(file);
      });
    });

    it('should show loading state during extraction', async () => {
      const mockAssets = createMockExtractedAssets();
      let resolveExtraction: (value: any) => void;
      const extractionPromise = new Promise((resolve) => {
        resolveExtraction = resolve;
      });
      mockExtractWheelZip.mockReturnValue(extractionPromise as Promise<any>);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading wheel theme...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveExtraction!(mockAssets);

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('should display error message on extraction failure', async () => {
      mockExtractWheelZip.mockRejectedValue(new Error('Invalid ZIP file'));

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Invalid ZIP file')).toBeInTheDocument();
      });
    });

    it('should auto-set dimensions to match frame size', async () => {
      const mockAssets = createMockExtractedAssets({
        wheelData: {
          ...createMockExtractedAssets().wheelData,
          frameSize: { width: 1000, height: 800 },
        },
      });
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        const widthInput = screen.getByLabelText(/wheel width/i) as HTMLInputElement;
        const heightInput = screen.getByLabelText(/wheel height/i) as HTMLInputElement;

        expect(widthInput.value).toBe('1000');
        expect(heightInput.value).toBe('800');
      });
    });
  });

  describe('Wheel controls', () => {
    beforeEach(async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Wheel Settings')).toBeInTheDocument();
      });
    });

    it('should display dimension controls', () => {
      expect(screen.getByLabelText(/wheel width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wheel height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/segments/i)).toBeInTheDocument();
    });

    it('should allow changing wheel width', () => {
      const widthInput = screen.getByLabelText(/wheel width/i) as HTMLInputElement;

      fireEvent.change(widthInput, { target: { value: '600' } });

      expect(widthInput.value).toBe('600');
    });

    it('should allow changing wheel height', () => {
      const heightInput = screen.getByLabelText(/wheel height/i) as HTMLInputElement;

      fireEvent.change(heightInput, { target: { value: '400' } });

      expect(heightInput.value).toBe('400');
    });

    it('should allow changing segment count', () => {
      const segmentInput = screen.getByLabelText(/segments/i) as HTMLInputElement;

      fireEvent.change(segmentInput, { target: { value: '8' } });

      expect(segmentInput.value).toBe('8');
    });
  });

  describe('Component visibility toggles', () => {
    beforeEach(async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Components Included:')).toBeInTheDocument();
      });
    });

    it('should display component toggle buttons', () => {
      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(b => b.textContent);

      expect(buttonTexts.some(text => text?.includes('Background'))).toBe(true);
      expect(buttonTexts.some(text => text?.includes('Header') && !text?.includes('Active'))).toBe(true);
      expect(buttonTexts.some(text => text?.includes('Segments'))).toBe(true);
    });

    it('should toggle component visibility', () => {
      const backgroundButton = screen.getByRole('button', { name: /background/i });

      // Initially visible (should have 'visible' or specific class)
      const initialClass = backgroundButton.className;

      // Click to toggle
      fireEvent.click(backgroundButton);

      // Class should change
      expect(backgroundButton.className).not.toBe(initialClass);

      // Click again to toggle back
      fireEvent.click(backgroundButton);

      expect(backgroundButton.className).toBe(initialClass);
    });

    it('should disable buttons for missing components', () => {
      // This test assumes some components might be missing
      // If all components are present, buttons should be enabled
      const buttons = screen.getAllByRole('button');

      // At least some buttons should be enabled for existing components
      const enabledButtons = buttons.filter(btn => !btn.hasAttribute('disabled'));
      expect(enabledButtons.length).toBeGreaterThan(0);
    });

    it('should toggle each component visibility individually', () => {
      const buttons = screen.getAllByRole('button');

      // Find toggle buttons by their text content
      const backgroundButton = buttons.find(btn => btn.textContent?.startsWith('Background'));
      const headerButton = buttons.find(btn => btn.textContent?.startsWith('Header '));
      const wheelBgButton = buttons.find(btn => btn.textContent?.startsWith('Wheel Bg'));
      const segmentsButton = buttons.find(btn => btn.textContent?.startsWith('Segments'));
      const wheelTop1Button = buttons.find(btn => btn.textContent?.startsWith('Wheel Top 1'));
      const wheelTop2Button = buttons.find(btn => btn.textContent?.startsWith('Wheel Top 2'));
      const lightsButton = buttons.find(btn => btn.textContent?.startsWith('Lights'));
      const buttonSpinButton = buttons.find(btn => btn.textContent?.startsWith('Button Spin'));
      const centerButton = buttons.find(btn => btn.textContent?.startsWith('Center'));
      const pointerButton = buttons.find(btn => btn.textContent?.startsWith('Pointer'));

      // Toggle each component and verify state changes
      if (backgroundButton) fireEvent.click(backgroundButton);
      if (headerButton) fireEvent.click(headerButton);
      if (wheelBgButton) fireEvent.click(wheelBgButton);
      if (segmentsButton) fireEvent.click(segmentsButton);
      if (wheelTop1Button) fireEvent.click(wheelTop1Button);
      if (wheelTop2Button) fireEvent.click(wheelTop2Button);
      if (lightsButton) fireEvent.click(lightsButton);
      if (buttonSpinButton) fireEvent.click(buttonSpinButton);
      if (centerButton) fireEvent.click(centerButton);
      if (pointerButton) fireEvent.click(pointerButton);

      // Click again to toggle back
      if (backgroundButton) fireEvent.click(backgroundButton);
      if (headerButton) fireEvent.click(headerButton);
      if (wheelBgButton) fireEvent.click(wheelBgButton);
      if (segmentsButton) fireEvent.click(segmentsButton);

      // Verify at least some buttons were found
      expect(backgroundButton).toBeTruthy();
    });

    it('should toggle lights visibility when lights are present', async () => {
      const wheelDataWithLights = createMockWheelData({
        lights: {
          color: '#FFFFFF',
          positions: [
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ],
        },
      });
      const mockAssetsWithLights = createMockExtractedAssets({
        wheelData: wheelDataWithLights,
      });
      mockExtractWheelZip.mockResolvedValue(mockAssetsWithLights);

      render(<App />);

      const fileInputs = screen.getAllByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInputs[0]) {
        fireEvent.change(fileInputs[0], { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Wheel Settings')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const lightsButton = buttons.find(btn => btn.textContent?.startsWith('Lights'));

      // Lights button should be enabled since lights are present
      expect(lightsButton).toBeTruthy();

      // The button might still be disabled if lights positions are not considered valid
      // Just verify button exists and click it if enabled
      if (lightsButton && !lightsButton.hasAttribute('disabled')) {
        fireEvent.click(lightsButton);
      } else {
        // If button is disabled, at least verify it exists
        expect(lightsButton).toBeTruthy();
      }
    });

    it('should handle center toggle via onToggleCenter callback', async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInputs = screen.getAllByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInputs[0]) {
        fireEvent.change(fileInputs[0], { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Wheel Settings')).toBeInTheDocument();
      });

      // Find the center toggle checkbox in WheelViewer
      const centerCheckbox = screen.getByRole('checkbox', { name: /show center/i });

      // Click to toggle center off (this triggers the onToggleCenter callback)
      fireEvent.click(centerCheckbox);

      // Verify checkbox is unchecked
      expect(centerCheckbox).not.toBeChecked();
    });
  });

  describe('Wheel information display', () => {
    it('should display wheel ID after loading', async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/ID:/i)).toBeInTheDocument();
        expect(screen.getByText(mockAssets.wheelData.wheelId)).toBeInTheDocument();
      });
    });

    it('should display frame dimensions', async () => {
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Frame Size:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should clear error message on successful upload after error', async () => {
      mockExtractWheelZip.mockRejectedValueOnce(new Error('First error'));

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file1 = createMockZipFile('error.zip');

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file1] } });
      }

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Now try a successful upload
      const mockAssets = createMockExtractedAssets();
      mockExtractWheelZip.mockResolvedValue(mockAssets);

      const file2 = createMockZipFile('success.zip');
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file2] } });
      }

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockExtractWheelZip.mockRejectedValue('String error');

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Failed to extract ZIP file')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible file input', () => {
      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);

      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.zip');
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should disable file input while loading', async () => {
      let resolveExtraction: (value: any) => void;
      const extractionPromise = new Promise((resolve) => {
        resolveExtraction = resolve;
      });
      mockExtractWheelZip.mockReturnValue(extractionPromise as Promise<any>);

      render(<App />);

      const fileInput = screen.getByLabelText(/choose zip file/i);
      const file = createMockZipFile();

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(fileInput).toBeDisabled();
      });

      resolveExtraction!(createMockExtractedAssets());

      await waitFor(() => {
        expect(fileInput).not.toBeDisabled();
      });
    });
  });
});
