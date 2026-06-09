import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputPanel from './input-panel';

describe('InputPanel', () => {
  it('renders in annual mode by default', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    expect(screen.getByLabelText('Annual Salary ($)')).toBeTruthy();
    expect(screen.queryByLabelText('Hourly Rate ($/hr)')).toBeNull();
  });

  it('switches to hourly mode on button click', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    expect(screen.getByLabelText('Hourly Rate ($/hr)')).toBeTruthy();
    expect(screen.getByLabelText('Hours per Week')).toBeTruthy();
    expect(screen.queryByLabelText('Annual Salary ($)')).toBeNull();
  });

  it('switches back to annual mode from hourly', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.click(screen.getByRole('button', { name: /Annual Salary/i }));
    expect(screen.getByLabelText('Annual Salary ($)')).toBeTruthy();
    expect(screen.queryByLabelText('Hourly Rate ($/hr)')).toBeNull();
  });

  it('calls onGrossChange with annual salary value on input', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '80000' } });
    expect(spy).toHaveBeenCalledWith(80_000);
  });

  it('calls onGrossChange with null for zero annual salary', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '0' } });
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('calls onGrossChange with null for negative annual salary', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '-500' } });
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('shows error for negative annual salary', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '-100' } });
    expect(screen.getByText(/positive annual salary/i)).toBeTruthy();
  });

  it('calls onGrossChange with computed gross when both hourly fields are valid', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hourly Rate ($/hr)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Hours per Week'), { target: { value: '40' } });
    // 25 * 40 * 52 = 52000
    expect(spy).toHaveBeenLastCalledWith(52_000);
  });

  it('calls onGrossChange with null when only hourly rate is filled', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hourly Rate ($/hr)'), { target: { value: '25' } });
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  it('calls onGrossChange with null when only hours/week is filled', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hours per Week'), { target: { value: '40' } });
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  it('calls onGrossChange with null for negative hourly rate', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hourly Rate ($/hr)'), { target: { value: '-5' } });
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  it('calls onGrossChange with null for negative hours per week', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hourly Rate ($/hr)'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Hours per Week'), { target: { value: '-10' } });
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  it('shows error for negative hourly rate', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hourly Rate ($/hr)'), { target: { value: '-5' } });
    expect(screen.getByText(/positive hourly rate/i)).toBeTruthy();
  });

  it('shows error for negative hours per week', () => {
    render(<InputPanel onGrossChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    fireEvent.change(screen.getByLabelText('Hours per Week'), { target: { value: '-10' } });
    expect(screen.getByText(/positive number of hours/i)).toBeTruthy();
  });

  it('calls onGrossChange when switching mode with existing values', () => {
    const spy = vi.fn();
    render(<InputPanel onGrossChange={spy} />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '60000' } });
    fireEvent.click(screen.getByRole('button', { name: /Hourly Rate/i }));
    // After switching to hourly with no hourly values, should emit null
    expect(spy).toHaveBeenLastCalledWith(null);
  });
});
