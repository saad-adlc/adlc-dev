import { render, screen, fireEvent } from '@testing-library/react';
import MortgageCalculator from './mortgage-calculator';
import App from './App';

describe('MortgageCalculator', () => {
  it('renders the page heading', () => {
    render(<MortgageCalculator />);
    expect(screen.getByRole('heading', { name: /canadian mortgage calculator/i })).toBeInTheDocument();
  });

  it('shows default rate and amortization values', () => {
    render(<MortgageCalculator />);
    expect(screen.getByDisplayValue('5.00')).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: /amortization/i }) as HTMLSelectElement;
    expect(select.value).toBe('25');
  });

  it('shows no results when price field is empty', () => {
    render(<MortgageCalculator />);
    expect(screen.queryByRole('region', { name: /mortgage results/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows results after entering a valid home price', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    expect(screen.getByRole('region', { name: /mortgage results/i })).toBeInTheDocument();
  });

  it('syncs down payment amount when price changes', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    const amtInput = screen.getByRole('spinbutton', {
      name: /down payment amount/i,
    }) as HTMLInputElement;
    expect(parseFloat(amtInput.value)).toBeCloseTo(100000, 0);
  });

  it('syncs down payment amount when percent changes', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /down payment percent/i }), {
      target: { value: '10' },
    });
    const amtInput = screen.getByRole('spinbutton', {
      name: /down payment amount/i,
    }) as HTMLInputElement;
    expect(parseFloat(amtInput.value)).toBeCloseTo(50000, 0);
  });

  it('syncs down payment percent when amount changes', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /down payment amount/i }), {
      target: { value: '75000' },
    });
    const pctInput = screen.getByRole('spinbutton', {
      name: /down payment percent/i,
    }) as HTMLInputElement;
    expect(parseFloat(pctInput.value)).toBeCloseTo(15, 1);
  });

  it('shows CMHC notice when down payment is below 20%', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /down payment percent/i }), {
      target: { value: '15' },
    });
    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/cmhc/i);
  });

  it('does not show CMHC notice at exactly 20%', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('shows an error when home price is zero', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '0' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /mortgage results/i })).not.toBeInTheDocument();
  });

  it('shows an error when down payment equals home price', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /down payment amount/i }), {
      target: { value: '500000' },
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an error when rate exceeds 25%', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText(/interest rate/i), { target: { value: '26' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/25%/);
  });

  it('displays mortgage amount as price minus down payment', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    const results = screen.getByRole('region', { name: /mortgage results/i });
    expect(results).toHaveTextContent(/mortgage amount/i);
  });

  it('shows the amortization table toggle button', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    expect(
      screen.getByRole('button', { name: /show amortization schedule/i }),
    ).toBeInTheDocument();
  });

  it('expands the amortization schedule when toggle is clicked', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    const toggle = screen.getByRole('button', { name: /show amortization schedule/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide amortization schedule/i })).toBeInTheDocument();
  });

  it('collapses the amortization schedule on second click', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    const toggle = screen.getByRole('button', { name: /show amortization schedule/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: /hide amortization schedule/i }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('amortization table contains year total rows', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '300000' } });
    fireEvent.change(screen.getByRole('combobox', { name: /amortization/i }), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /show amortization schedule/i }));
    expect(screen.getByText(/year 1 total/i)).toBeInTheDocument();
    expect(screen.getByText(/year 5 total/i)).toBeInTheDocument();
  });

  it('updates results when amortization period changes', () => {
    render(<MortgageCalculator />);
    fireEvent.change(screen.getByLabelText(/home price/i), { target: { value: '500000' } });
    fireEvent.change(screen.getByRole('combobox', { name: /amortization/i }), {
      target: { value: '15' },
    });
    expect(screen.getByRole('region', { name: /mortgage results/i })).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders the mortgage calculator', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /canadian mortgage calculator/i }),
    ).toBeInTheDocument();
  });
});
