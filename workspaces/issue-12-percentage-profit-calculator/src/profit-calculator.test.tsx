import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import ProfitCalculator from './profit-calculator';
import {
  calculateProfit,
  formatCurrency,
  formatPercentage,
  parseNumericInput,
} from './profit-calculator-utils';

describe('calculateProfit', () => {
  it('returns 25% profit for cost 100 and selling 125', () => {
    const result = calculateProfit(100, 125);
    expect(result).not.toBeNull();
    expect(result?.profitPercentage).toBe(25);
    expect(result?.profitAmount).toBe(25);
  });

  it('returns negative percentage for selling below cost', () => {
    const result = calculateProfit(100, 90);
    expect(result).not.toBeNull();
    expect(result?.profitPercentage).toBe(-10);
    expect(result?.profitAmount).toBe(-10);
  });

  it('returns null for zero cost', () => {
    expect(calculateProfit(0, 100)).toBeNull();
  });

  it('returns null for negative cost', () => {
    expect(calculateProfit(-5, 100)).toBeNull();
  });

  it('returns zero profit for equal prices', () => {
    const result = calculateProfit(100, 100);
    expect(result).not.toBeNull();
    expect(result?.profitPercentage).toBe(0);
    expect(result?.profitAmount).toBe(0);
  });

  it('handles decimal inputs', () => {
    const result = calculateProfit(99.99, 149.99);
    expect(result).not.toBeNull();
    expect(result?.profitAmount).toBeCloseTo(50, 2);
  });
});

describe('formatCurrency', () => {
  it('formats positive value with $ symbol and 2 decimals', () => {
    expect(formatCurrency(25)).toBe('$25.00');
  });

  it('formats negative value with minus prefix', () => {
    expect(formatCurrency(-10)).toBe('-$10.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats decimal values', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });
});

describe('formatPercentage', () => {
  it('formats positive percentage', () => {
    expect(formatPercentage(25)).toBe('25.00%');
  });

  it('returns absolute value for negative input', () => {
    expect(formatPercentage(-10)).toBe('10.00%');
  });

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });
});

describe('parseNumericInput', () => {
  it('parses valid integer string', () => {
    expect(parseNumericInput('100')).toBe(100);
  });

  it('parses decimal string', () => {
    expect(parseNumericInput('99.99')).toBe(99.99);
  });

  it('returns null for empty string', () => {
    expect(parseNumericInput('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(parseNumericInput('  ')).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(parseNumericInput('abc')).toBeNull();
  });
});

describe('ProfitCalculator', () => {
  it('renders the title', () => {
    render(<ProfitCalculator />);
    expect(screen.getByText('Profit Calculator')).toBeInTheDocument();
  });

  it('shows prompt when inputs are empty', () => {
    render(<ProfitCalculator />);
    expect(
      screen.getByText('Enter a cost price to calculate'),
    ).toBeInTheDocument();
  });

  it('shows prompt when cost is zero', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '100' },
    });
    expect(
      screen.getByText('Enter a cost price to calculate'),
    ).toBeInTheDocument();
  });

  it('shows prompt when selling price is empty', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    expect(
      screen.getByText('Enter a cost price to calculate'),
    ).toBeInTheDocument();
  });

  it('shows profit percentage and amount for valid inputs', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '125' },
    });
    expect(screen.getByText(/25\.00%/)).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('shows loss label and negative display for selling below cost', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '90' },
    });
    expect(screen.getByText('loss')).toBeInTheDocument();
    expect(screen.getByText(/10\.00%/)).toBeInTheDocument();
    expect(screen.getByText('-$10.00')).toBeInTheDocument();
  });

  it('shows zero result for equal prices', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '100' },
    });
    expect(screen.getByText(/0\.00%/)).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('resets inputs and result when clear is clicked', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '125' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Cost price')).toHaveValue('');
    expect(screen.getByLabelText('Selling price')).toHaveValue('');
    expect(
      screen.getByText('Enter a cost price to calculate'),
    ).toBeInTheDocument();
  });

  it('filters non-numeric input in cost field', () => {
    render(<ProfitCalculator />);
    const costInput = screen.getByLabelText('Cost price');
    fireEvent.change(costInput, { target: { value: 'abc' } });
    expect(costInput).toHaveValue('');
  });

  it('filters non-numeric input in selling field', () => {
    render(<ProfitCalculator />);
    const sellingInput = screen.getByLabelText('Selling price');
    fireEvent.change(sellingInput, { target: { value: 'xyz' } });
    expect(sellingInput).toHaveValue('');
  });

  it('accepts valid decimal input', () => {
    render(<ProfitCalculator />);
    const costInput = screen.getByLabelText('Cost price');
    fireEvent.change(costInput, { target: { value: '99.99' } });
    expect(costInput).toHaveValue('99.99');
  });

  it('updates results live on every input change', () => {
    render(<ProfitCalculator />);
    fireEvent.change(screen.getByLabelText('Cost price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '110' },
    });
    expect(screen.getByText(/10\.00%/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Selling price'), {
      target: { value: '120' },
    });
    expect(screen.getByText(/20\.00%/)).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders the profit calculator', () => {
    render(<App />);
    expect(screen.getByText('Profit Calculator')).toBeInTheDocument();
  });
});
