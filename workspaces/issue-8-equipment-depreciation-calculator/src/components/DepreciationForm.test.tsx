import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DepreciationForm from './DepreciationForm';
import { DepreciationInputs } from '../utils/depreciation';

const DEFAULT_INPUTS: DepreciationInputs = {
  cost: 10000,
  salvage: 1000,
  life: 5,
  method: 'straight-line',
};

describe('DepreciationForm', () => {
  it('renders all input fields', () => {
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={vi.fn()} error={null} />);
    expect(screen.getByLabelText(/Asset Cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Salvage Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Useful Life/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Depreciation Method/i)).toBeInTheDocument();
  });

  it('shows error alert when error prop is provided', () => {
    render(
      <DepreciationForm
        inputs={DEFAULT_INPUTS}
        onChange={vi.fn()}
        error="Asset cost must be a positive number."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Asset cost must be a positive number.',
    );
  });

  it('does not render alert when error is null', () => {
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={vi.fn()} error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onChange with updated cost on cost input change', () => {
    const onChange = vi.fn();
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByLabelText(/Asset Cost/i), { target: { value: '20000' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cost: 20000 }));
  });

  it('calls onChange with updated salvage on salvage input change', () => {
    const onChange = vi.fn();
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByLabelText(/Salvage Value/i), { target: { value: '500' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ salvage: 500 }));
  });

  it('sets salvage to 0 when salvage input is cleared', () => {
    const onChange = vi.fn();
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByLabelText(/Salvage Value/i), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ salvage: 0 }));
  });

  it('calls onChange with updated life on life input change', () => {
    const onChange = vi.fn();
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByLabelText(/Useful Life/i), { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ life: 10 }));
  });

  it('calls onChange with declining-balance when method is changed', () => {
    const onChange = vi.fn();
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={onChange} error={null} />);
    fireEvent.change(screen.getByLabelText(/Depreciation Method/i), {
      target: { value: 'declining-balance' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'declining-balance' }),
    );
  });

  it('displays current input values', () => {
    render(<DepreciationForm inputs={DEFAULT_INPUTS} onChange={vi.fn()} error={null} />);
    expect(screen.getByLabelText(/Asset Cost/i)).toHaveValue(10000);
    expect(screen.getByLabelText(/Salvage Value/i)).toHaveValue(1000);
    expect(screen.getByLabelText(/Useful Life/i)).toHaveValue(5);
  });
});
