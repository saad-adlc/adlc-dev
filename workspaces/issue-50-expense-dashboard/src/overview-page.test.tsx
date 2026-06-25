import { render, screen } from '@testing-library/react';
import OverviewPage from './overview-page';
import { EXPENSES } from './expenses';

describe('OverviewPage', () => {
  it('shows the grand total $604.84', () => {
    render(<OverviewPage expenses={EXPENSES} />);
    expect(screen.getByText('$604.84')).toBeInTheDocument();
  });

  it('shows the transaction count 8', () => {
    render(<OverviewPage expenses={EXPENSES} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders the Total Spent label', () => {
    render(<OverviewPage expenses={EXPENSES} />);
    expect(screen.getByText(/total spent/i)).toBeInTheDocument();
  });

  it('renders the Transactions label', () => {
    render(<OverviewPage expenses={EXPENSES} />);
    expect(screen.getByText(/transactions/i)).toBeInTheDocument();
  });

  it('renders the bar chart', () => {
    const { container } = render(<OverviewPage expenses={EXPENSES} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows $0.00 in the total when there are no expenses', () => {
    render(<OverviewPage expenses={[]} />);
    const elements = screen.getAllByText('$0.00');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});
