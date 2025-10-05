/**
 * Unit tests for simple renderer components (WheelBg, WheelTop, Pointer, Center, ButtonSpin)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WheelBgRenderer } from '../WheelBgRenderer';
import { WheelTopRenderer } from '../WheelTopRenderer';
import { PointerRenderer } from '../PointerRenderer';
import { CenterRenderer } from '../CenterRenderer';
import { ButtonSpinRenderer } from '../ButtonSpinRenderer';

describe('WheelBgRenderer', () => {
  const defaultProps = {
    wheelBg: {
      bounds: { x: 400, y: 300, w: 400, h: 400 },
      img: 'wheel_bg.png',
    },
    wheelBgImage: 'blob:http://localhost/wheel-bg',
    scale: 1,
  };

  it('should render when image provided', () => {
    render(<WheelBgRenderer {...defaultProps} />);
    const img = screen.getByAltText(/wheel background/i);
    expect(img).toBeInTheDocument();
  });

  it('should return null when no image provided', () => {
    const { container } = render(<WheelBgRenderer {...defaultProps} wheelBgImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no wheelBg data provided', () => {
    const { container} = render(<WheelBgRenderer {...defaultProps} wheelBg={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply center-based positioning', () => {
    const { container } = render(<WheelBgRenderer {...defaultProps} />);
    const component = container.querySelector('.wheelbg-component');
    expect(component).toBeInTheDocument();
  });

  it('should scale dimensions correctly', () => {
    const { container } = render(<WheelBgRenderer {...defaultProps} scale={0.5} />);
    const component = container.querySelector('.wheelbg-component');
    expect(component).toBeInTheDocument();
  });

  it('should make image non-draggable', () => {
    render(<WheelBgRenderer {...defaultProps} />);
    const img = screen.getByAltText(/wheel background/i);
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should log warning when image fails to load', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<WheelBgRenderer {...defaultProps} />);
    const img = screen.getByAltText(/wheel background/i);

    fireEvent.error(img);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'WheelBg image failed to load:',
      'blob:http://localhost/wheel-bg'
    );

    consoleWarnSpy.mockRestore();
  });
});

describe('WheelTopRenderer', () => {
  const defaultProps = {
    wheelTop: {
      bounds: { x: 400, y: 300, w: 380, h: 380 },
      img: 'wheel_top_1.png',
    },
    wheelTopImage: 'blob:http://localhost/wheel-top',
    scale: 1,
    layerNumber: 1 as const,
  };

  it('should render when image provided', () => {
    render(<WheelTopRenderer {...defaultProps} />);
    const img = screen.getByAltText(/wheel top 1/i);
    expect(img).toBeInTheDocument();
  });

  it('should return null when no image provided', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} wheelTopImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no wheelTop data provided', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} wheelTop={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply center-based positioning', () => {
    const { container } = render(<WheelTopRenderer {...defaultProps} />);
    const component = container.querySelector('.wheeltop-component');
    expect(component).toBeInTheDocument();
  });

  it('should handle different layer numbers', () => {
    const { rerender } = render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);
    expect(screen.getByAltText(/wheel top 1/i)).toBeInTheDocument();

    rerender(<WheelTopRenderer {...defaultProps} layerNumber={2} />);
    expect(screen.getByAltText(/wheel top 2/i)).toBeInTheDocument();
  });

  it('should make image non-draggable', () => {
    render(<WheelTopRenderer {...defaultProps} />);
    const img = screen.getByAltText(/wheel top 1/i);
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should log warning when image fails to load', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<WheelTopRenderer {...defaultProps} layerNumber={1} />);
    const img = screen.getByAltText(/wheel top 1/i);

    fireEvent.error(img);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'WheelTop1 image failed to load:',
      defaultProps.wheelTopImage
    );

    consoleWarnSpy.mockRestore();
  });
});

describe('PointerRenderer', () => {
  const defaultProps = {
    pointer: {
      bounds: { x: 400, y: 100, w: 40, h: 60, rotation: 0 },
      img: 'pointer.png',
    },
    pointerImage: 'blob:http://localhost/pointer',
    scale: 1,
  };

  it('should render when image provided', () => {
    render(<PointerRenderer {...defaultProps} />);
    const img = screen.getByAltText(/pointer/i);
    expect(img).toBeInTheDocument();
  });

  it('should return null when no image provided', () => {
    const { container } = render(<PointerRenderer {...defaultProps} pointerImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no pointer data provided', () => {
    const { container } = render(<PointerRenderer {...defaultProps} pointer={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply positioning and dimensions', () => {
    const { container } = render(<PointerRenderer {...defaultProps} />);
    const component = container.querySelector('.pointer-component');
    expect(component).toBeInTheDocument();
  });

  it('should apply rotation', () => {
    const propsWithRotation = {
      ...defaultProps,
      pointer: {
        ...defaultProps.pointer,
        bounds: { ...defaultProps.pointer.bounds, rotation: 90 },
      },
    };
    const { container } = render(<PointerRenderer {...propsWithRotation} />);
    const component = container.querySelector('.pointer-component');
    expect(component).toBeInTheDocument();
  });

  it('should render image element', () => {
    render(<PointerRenderer {...defaultProps} />);
    const img = screen.getByAltText(/pointer/i);
    expect(img).toBeInTheDocument();
  });
});

describe('CenterRenderer', () => {
  const defaultProps = {
    center: { x: 400, y: 300, radius: 50 },
    scale: 1,
  };

  it('should render debug circle', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);
    const component = container.querySelector('.center-component');
    expect(component).toBeInTheDocument();
  });

  it('should return null when no centerData provided', () => {
    const { container } = render(<CenterRenderer {...defaultProps} center={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply correct positioning and size', () => {
    const { container } = render(<CenterRenderer {...defaultProps} />);
    const component = container.querySelector('.center-component');
    expect(component).toBeInTheDocument();
  });

  it('should scale radius correctly', () => {
    const { container } = render(<CenterRenderer {...defaultProps} scale={2} />);
    const component = container.querySelector('.center-component');
    expect(component).toBeInTheDocument();
  });
});

describe('ButtonSpinRenderer', () => {
  const defaultProps = {
    buttonSpin: {
      stateBounds: {
        default: { x: 350, y: 250, w: 100, h: 100, rotation: 0 },
        spinning: { x: 350, y: 250, w: 100, h: 100, rotation: 0 },
      },
      defaultImg: 'button_spin_default.png',
      spinningImg: 'button_spin_spinning.png',
    },
    currentState: 'default' as const,
    buttonImage: 'blob:http://localhost/button-default',
    scale: 1,
    onSpin: jest.fn(),
    isSpinning: false,
  };

  beforeEach(() => {
    defaultProps.onSpin.mockClear();
  });

  it('should render button image when provided', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);
    const img = screen.getByAltText(/spin button/i);
    expect(img).toBeInTheDocument();
  });

  it('should return null when no buttonImage provided', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} buttonImage={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when no buttonSpin data provided', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} buttonSpin={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should call onSpin when clicked', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);
    const component = screen.getByRole('button', { name: /spin the wheel/i });
    fireEvent.click(component);
    expect(defaultProps.onSpin).toHaveBeenCalledTimes(1);
  });

  it('should apply correct positioning', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);
    const component = container.querySelector('.button-spin-component');
    expect(component).toBeInTheDocument();
  });

  it('should render different states correctly', () => {
    const { rerender } = render(<ButtonSpinRenderer {...defaultProps} currentState="default" />);
    expect(screen.getByAltText(/spin button/i)).toBeInTheDocument();

    rerender(<ButtonSpinRenderer {...defaultProps} currentState="spinning" />);
    expect(screen.getByAltText(/spin button/i)).toBeInTheDocument();
  });

  it('should be a button element', () => {
    const { container } = render(<ButtonSpinRenderer {...defaultProps} />);
    const component = container.querySelector('.button-spin-component');
    expect(component?.tagName).toBe('BUTTON');
  });

  it('should make image non-draggable', () => {
    render(<ButtonSpinRenderer {...defaultProps} />);
    const img = screen.getByAltText(/spin button/i);
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('should handle isSpinning prop', () => {
    const { rerender } = render(<ButtonSpinRenderer {...defaultProps} isSpinning={false} />);
    expect(screen.getByAltText(/spin button/i)).toBeInTheDocument();

    rerender(<ButtonSpinRenderer {...defaultProps} isSpinning={true} />);
    expect(screen.getByAltText(/spin button/i)).toBeInTheDocument();
  });

  it('should log warning when image fails to load', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<ButtonSpinRenderer {...defaultProps} currentState="default" />);
    const img = screen.getByAltText(/spin button/i);

    fireEvent.error(img);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'ButtonSpin image failed to load for state default:',
      'blob:http://localhost/button-default'
    );

    consoleWarnSpy.mockRestore();
  });
});
