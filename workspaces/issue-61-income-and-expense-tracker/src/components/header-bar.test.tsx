import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeaderBar from './header-bar';

describe('HeaderBar', () => {
  it('renders the app title', () => {
    render(<HeaderBar year={2026} month={6} onPrev={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText(/Income.*Expense Tracker/i)).toBeInTheDocument();
  });

  it('displays the current month label', () => {
    render(<HeaderBar year={2026} month={6} onPrev={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('calls onPrev when the previous month button is clicked', () => {
    const onPrev = vi.fn();
    render(<HeaderBar year={2026} month={6} onPrev={onPrev} onNext={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when the next month button is clicked', () => {
    const onNext = vi.fn();
    render(<HeaderBar year={2026} month={6} onPrev={vi.fn()} onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('updates the label when year and month change', () => {
    const { rerender } = render(
      <HeaderBar year={2026} month={1} onPrev={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText('January 2026')).toBeInTheDocument();
    rerender(<HeaderBar year={2025} month={12} onPrev={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText('December 2025')).toBeInTheDocument();
  });
});
