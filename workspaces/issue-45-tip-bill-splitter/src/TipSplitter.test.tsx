import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TipSplitter from './TipSplitter';

describe('TipSplitter — defaults', () => {
  it('SC-002: opens with $84.50 / 18% / 3 people pre-filled', () => {
    render(<TipSplitter />);
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$15.21');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$99.71');
    expect(screen.getByTestId('per-person')).toHaveTextContent('$33.24');
  });

  it('renders all three preset buttons', () => {
    render(<TipSplitter />);
    expect(screen.getByRole('button', { name: '15%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '18%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20%' })).toBeInTheDocument();
  });
});

describe('TipSplitter — live calculation (US1)', () => {
  it('SC-001: $100 @ 20% / 4 → tip=$20.00, total=$120.00, per-person=$30.00', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: '20%' }));
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '4' } });
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$20.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$120.00');
    expect(screen.getByTestId('per-person')).toHaveTextContent('$30.00');
  });

  it('updates live when bill changes', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: '20%' }));
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '2' } });
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$40.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$240.00');
    expect(screen.getByTestId('per-person')).toHaveTextContent('$120.00');
  });

  it('clicking 15% preset recomputes outputs', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: '15%' }));
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$15.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$115.00');
    expect(screen.getByTestId('per-person')).toHaveTextContent('$57.50');
  });

  it('custom tip overrides preset', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Custom tip %'), { target: { value: '25' } });
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$25.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$125.00');
    expect(screen.getByTestId('per-person')).toHaveTextContent('$31.25');
  });

  it('clicking preset after custom clears custom and recomputes', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Custom tip %'), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: '15%' }));
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$15.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$115.00');
    const customInput = screen.getByLabelText('Custom tip %') as HTMLInputElement;
    expect(customInput.value).toBe('');
  });
});

describe('TipSplitter — edge cases (US2)', () => {
  it('SC-003: people=0 → per-person shows "—" and hint, no NaN/Infinity', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '0' } });
    expect(screen.getByTestId('per-person')).toHaveTextContent('—');
    expect(screen.getByTestId('per-person-hint')).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('NaN');
    expect(document.body.innerHTML).not.toContain('Infinity');
  });

  it('SC-003: people empty → per-person shows "—" and hint', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Number of People'), { target: { value: '' } });
    expect(screen.getByTestId('per-person')).toHaveTextContent('—');
    expect(screen.getByTestId('per-person-hint')).toBeInTheDocument();
  });

  it('SC-004: empty bill → tip=$0.00, total=$0.00', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '' } });
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$0.00');
  });

  it('SC-004: negative bill → tip=$0.00, total=$0.00', () => {
    render(<TipSplitter />);
    fireEvent.change(screen.getByLabelText('Bill Amount ($)'), { target: { value: '-50' } });
    expect(screen.getByTestId('tip-amount')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('$0.00');
  });
});
