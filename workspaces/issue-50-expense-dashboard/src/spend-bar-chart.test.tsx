import { render, screen } from '@testing-library/react';
import SpendBarChart from './spend-bar-chart';
import { EXPENSES } from './expenses';

describe('SpendBarChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(<SpendBarChart expenses={EXPENSES} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders a label for each category', () => {
    render(<SpendBarChart expenses={EXPENSES} />);
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('renders the correct amount for each category', () => {
    render(<SpendBarChart expenses={EXPENSES} />);
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$140.50')).toBeInTheDocument();
    expect(screen.getByText('$192.09')).toBeInTheDocument();
    expect(screen.getByText('$72.25')).toBeInTheDocument();
  });

  it('Bills bar is the tallest (height === max bar height)', () => {
    const { container } = render(<SpendBarChart expenses={EXPENSES} />);
    const billsBar = container.querySelector('[data-testid="bar-bills"]');
    const foodBar = container.querySelector('[data-testid="bar-food"]');
    const billsH = parseFloat(billsBar?.getAttribute('height') ?? '0');
    const foodH = parseFloat(foodBar?.getAttribute('height') ?? '0');
    expect(billsH).toBeGreaterThan(foodH);
  });

  it('renders with no expenses without crashing', () => {
    const { container } = render(<SpendBarChart expenses={[]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
