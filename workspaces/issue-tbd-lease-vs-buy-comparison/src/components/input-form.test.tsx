import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputForm, { type LeaseBuyInputs } from './input-form';

const DEFAULT_VALUES: LeaseBuyInputs = {
  assetCost: 0,
  downPayment: 0,
  termMonths: 0,
  monthlyLeasePayment: 0,
  annualLoanRate: 0,
  residualValue: 0,
};

describe('InputForm', () => {
  it('renders all six input fields', () => {
    render(<InputForm values={DEFAULT_VALUES} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/asset cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/down payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lease term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly lease payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual loan rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/residual/i)).toBeInTheDocument();
  });

  it('calls onChange with the correct field and parsed value', () => {
    const handleChange = vi.fn();
    render(<InputForm values={DEFAULT_VALUES} onChange={handleChange} />);
    const assetInput = screen.getByLabelText(/asset cost/i);
    fireEvent.change(assetInput, { target: { value: '50000' } });
    expect(handleChange).toHaveBeenCalledWith('assetCost', 50000);
  });

  it('calls onChange with 0 when a non-empty input is cleared', () => {
    const handleChange = vi.fn();
    const values = { ...DEFAULT_VALUES, assetCost: 50000 };
    render(<InputForm values={values} onChange={handleChange} />);
    const assetInput = screen.getByLabelText(/asset cost/i);
    fireEvent.change(assetInput, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith('assetCost', 0);
  });

  it('renders empty string for zero values (blank placeholder visible)', () => {
    render(<InputForm values={DEFAULT_VALUES} onChange={vi.fn()} />);
    const assetInput = screen.getByLabelText(/asset cost/i) as HTMLInputElement;
    expect(assetInput.value).toBe('');
  });

  it('renders non-zero values in the input', () => {
    const values = { ...DEFAULT_VALUES, assetCost: 50000 };
    render(<InputForm values={values} onChange={vi.fn()} />);
    const assetInput = screen.getByLabelText(/asset cost/i) as HTMLInputElement;
    expect(assetInput.value).toBe('50000');
  });
});
