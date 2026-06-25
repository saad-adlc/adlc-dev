import { render, screen, fireEvent } from '@testing-library/react';
import SalaryCalculator from './salary-calculator';

describe('SalaryCalculator', () => {
  it('renders the page heading', () => {
    render(<SalaryCalculator />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the salary input field with a label', () => {
    render(<SalaryCalculator />);
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
  });

  it('renders Hourly and Yearly toggle buttons', () => {
    render(<SalaryCalculator />);
    expect(screen.getByRole('button', { name: 'Hourly' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yearly' })).toBeInTheDocument();
  });

  it('defaults to yearly mode with Yearly button pressed', () => {
    render(<SalaryCalculator />);
    expect(screen.getByRole('button', { name: 'Yearly' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hourly' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to hourly mode when the Hourly button is clicked', () => {
    render(<SalaryCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Hourly' }));
    expect(screen.getByRole('button', { name: 'Hourly' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Yearly' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows no result cards when input is empty', () => {
    render(<SalaryCalculator />);
    expect(screen.queryByText(/take-home yearly/i)).not.toBeInTheDocument();
  });

  it('shows three result cards when a valid salary is entered', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
    expect(screen.getByText(/take-home hourly/i)).toBeInTheDocument();
    expect(screen.getByText(/take-home monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/take-home yearly/i)).toBeInTheDocument();
  });

  it('shows the breakdown table columns when a salary is entered', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Bracket')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('shows effective tax rate in the breakdown table footer', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
    expect(screen.getByText(/effective tax rate/i)).toBeInTheDocument();
  });

  it('shows Federal and Ontario rows in the breakdown table', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
    expect(screen.getAllByText('Federal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ontario').length).toBeGreaterThan(0);
  });

  it('shows CPP and EI rows in the breakdown table', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '60000' } });
    expect(screen.getByText('CPP')).toBeInTheDocument();
    expect(screen.getByText('EI')).toBeInTheDocument();
  });

  it('shows an alert for a negative input value', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '-100' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show result cards for a negative input value', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '-100' } });
    expect(screen.queryByText(/take-home yearly/i)).not.toBeInTheDocument();
  });

  it('shows a warning for an unreasonably large value', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '20000000' } });
    expect(screen.getByText(/unusually large/i)).toBeInTheDocument();
  });

  it('still shows results for an unreasonably large value', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '20000000' } });
    expect(screen.getByText(/take-home yearly/i)).toBeInTheDocument();
  });

  it('shows results for zero income', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '0' } });
    expect(screen.getByText(/take-home yearly/i)).toBeInTheDocument();
  });

  it('shows hourly equivalent when in yearly mode with a value entered', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '2080' } });
    expect(screen.getByText(/hourly equivalent/i)).toBeInTheDocument();
  });

  it('shows yearly equivalent when in hourly mode with a value entered', () => {
    render(<SalaryCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Hourly' }));
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '25' } });
    expect(screen.getByText(/yearly equivalent/i)).toBeInTheDocument();
  });

  it('converts the input value when switching from yearly to hourly mode', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '2080' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hourly' }));
    const input = screen.getByLabelText(/salary/i) as HTMLInputElement;
    expect(parseFloat(input.value)).toBeCloseTo(1, 1);
  });
});
