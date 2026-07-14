import { render, screen, fireEvent } from '@testing-library/react';
import TipCalculator, { formatCurrency, calculateTotal } from './tip-calculator';
import App from './App';

describe('formatCurrency', () => {
  it('formats zero as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a whole number with two decimal places', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats a partial decimal value', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-50)).toBe('$-50.00');
  });

  it('truncates beyond two decimal places', () => {
    // 12.555 is represented as 12.5549... in IEEE 754, so toFixed(2) gives '12.55'
    expect(formatCurrency(12.555)).toBe('$12.55');
  });
});

describe('calculateTotal', () => {
  it('applies 10% tip correctly', () => {
    expect(calculateTotal(100, 10)).toBeCloseTo(110, 5);
  });

  it('applies 15% tip correctly', () => {
    expect(calculateTotal(100, 15)).toBeCloseTo(115, 5);
  });

  it('applies 20% tip correctly', () => {
    expect(calculateTotal(100, 20)).toBeCloseTo(120, 5);
  });

  it('applies 25% tip correctly', () => {
    expect(calculateTotal(100, 25)).toBeCloseTo(125, 5);
  });

  it('returns zero for a zero bill amount', () => {
    expect(calculateTotal(0, 20)).toBe(0);
  });

  it('handles negative bill amounts', () => {
    expect(calculateTotal(-50, 20)).toBeCloseTo(-60, 5);
  });
});

describe('TipCalculator component', () => {
  it('renders the page title', () => {
    render(<TipCalculator />);
    expect(screen.getByText('Tip Calculator')).toBeInTheDocument();
  });

  it('renders all four tip percentage buttons', () => {
    render(<TipCalculator />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shows $0.00 as the initial total', () => {
    render(<TipCalculator />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('shows $0.00 when bill is entered but no tip selected', () => {
    render(<TipCalculator />);
    const input = screen.getByLabelText('Bill amount');
    fireEvent.change(input, { target: { value: '100' } });
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('calculates the total when bill and tip are both set', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('20%'));
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('updates total in real-time as the bill changes', () => {
    render(<TipCalculator />);
    fireEvent.click(screen.getByText('15%'));
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '200' } });
    expect(screen.getByText('$230.00')).toBeInTheDocument();
  });

  it('updates total immediately when the tip percentage changes', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('10%'));
    expect(screen.getByText('$110.00')).toBeInTheDocument();
    fireEvent.click(screen.getByText('25%'));
    expect(screen.getByText('$125.00')).toBeInTheDocument();
  });

  it('resets bill input and total when Clear is clicked', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('20%'));
    fireEvent.click(screen.getByText('Clear'));
    expect((screen.getByLabelText('Bill amount') as HTMLInputElement).value).toBe('');
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('shows $0.00 for zero bill with a tip selected', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('20%'));
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles negative bill amounts', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '-50' } });
    fireEvent.click(screen.getByText('20%'));
    expect(screen.getByText('$-60.00')).toBeInTheDocument();
  });

  it('shows $0.00 when bill input is cleared after a calculation', () => {
    render(<TipCalculator />);
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('10%'));
    fireEvent.change(screen.getByLabelText('Bill amount'), { target: { value: '' } });
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Tip Calculator')).toBeInTheDocument();
  });
});
