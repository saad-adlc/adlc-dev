import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BudgetSection from './budget-section';

const CATEGORIES = ['Food', 'Transport'] as const;

describe('BudgetSection', () => {
  it('renders a heading with the month name', () => {
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={CATEGORIES}
        budgets={{}}
        spent={{}}
        onSetBudget={vi.fn()}
      />,
    );
    expect(screen.getByText(/Budget.*June 2026/i)).toBeInTheDocument();
  });

  it('renders a row for each category', () => {
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={CATEGORIES}
        budgets={{}}
        spent={{}}
        onSetBudget={vi.fn()}
      />,
    );
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('shows "no limit" when no budget is set', () => {
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={['Food'] as const}
        budgets={{}}
        spent={{}}
        onSetBudget={vi.fn()}
      />,
    );
    expect(screen.getByText(/no limit/i)).toBeInTheDocument();
  });

  it('shows spent and budget amounts when budget is set', () => {
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={['Food'] as const}
        budgets={{ Food: 100 }}
        spent={{ Food: 60 }}
        onSetBudget={vi.fn()}
      />,
    );
    expect(screen.getByText(/\$60\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
  });

  it('calls onSetBudget with parsed value on budget input blur', () => {
    const onSetBudget = vi.fn();
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={['Food'] as const}
        budgets={{}}
        spent={{}}
        onSetBudget={onSetBudget}
      />,
    );
    const input = screen.getByLabelText('Budget for Food');
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);
    expect(onSetBudget).toHaveBeenCalledWith('Food', 150);
  });

  it('renders a progress bar for each category', () => {
    render(
      <BudgetSection
        year={2026}
        month={6}
        categories={CATEGORIES}
        budgets={{ Food: 100 }}
        spent={{ Food: 50 }}
        onSetBudget={vi.fn()}
      />,
    );
    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(2);
  });
});
