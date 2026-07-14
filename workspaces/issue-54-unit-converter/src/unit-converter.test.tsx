import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitConverter, { convert } from './unit-converter';

describe('convert', () => {
  it('converts 1 meter to feet', () => {
    expect(convert(1, 'meters', 'feet')).toBeCloseTo(3.2808, 4);
  });

  it('converts 1 foot to meters', () => {
    expect(convert(1, 'feet', 'meters')).toBeCloseTo(0.3048, 4);
  });

  it('converts 1 meter to inches', () => {
    expect(convert(1, 'meters', 'inches')).toBeCloseTo(39.3701, 4);
  });

  it('converts 1 inch to meters', () => {
    expect(convert(1, 'inches', 'meters')).toBeCloseTo(0.0254, 4);
  });

  it('converts 1 foot to inches', () => {
    expect(convert(1, 'feet', 'inches')).toBeCloseTo(12, 4);
  });

  it('converts 1 inch to feet', () => {
    expect(convert(1, 'inches', 'feet')).toBeCloseTo(0.0833, 3);
  });

  it('returns the same value when from and to units are equal', () => {
    expect(convert(5, 'meters', 'meters')).toBe(5);
    expect(convert(3, 'feet', 'feet')).toBe(3);
    expect(convert(10, 'inches', 'inches')).toBe(10);
  });
});

describe('UnitConverter', () => {
  it('shows 3.2808 on initial load (1 meter → feet)', () => {
    render(<UnitConverter />);
    expect(screen.getByText('3.2808')).toBeInTheDocument();
  });

  it('shows the empty-input hint when the input is cleared', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('Value to convert'), { target: { value: '' } });
    expect(screen.getByText('Enter a value')).toBeInTheDocument();
  });

  it('does not show NaN for non-numeric input', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('Value to convert'), { target: { value: 'abc' } });
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('does not show NaN for negative input', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('Value to convert'), { target: { value: '-5' } });
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('updates result when the input value changes', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('Value to convert'), { target: { value: '2' } });
    expect(screen.getByText('6.5617')).toBeInTheDocument();
  });

  it('updates result when the from-unit changes', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'feet' } });
    // 1 foot → feet = 1.0000
    expect(screen.getByText('1.0000')).toBeInTheDocument();
  });

  it('updates result when the to-unit changes', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'inches' } });
    // 1 meter → inches = 39.3701
    expect(screen.getByText('39.3701')).toBeInTheDocument();
  });

  it('shows the same value when from and to units are equal', () => {
    render(<UnitConverter />);
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'feet' } });
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'feet' } });
    expect(screen.getByText('1.0000')).toBeInTheDocument();
  });
});
