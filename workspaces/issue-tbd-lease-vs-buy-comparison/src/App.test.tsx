import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /lease vs buy comparison/i })).toBeInTheDocument();
  });

  it('renders the Parameters and Results sections', () => {
    render(<App />);
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('shows the empty state initially', () => {
    render(<App />);
    expect(screen.getByText(/enter all values above/i)).toBeInTheDocument();
  });

  it('shows results after valid inputs are entered', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/asset cost/i), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText(/down payment/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/lease term/i), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText(/monthly lease payment/i), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText(/annual loan rate/i), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText(/residual/i), { target: { value: '15000' } });

    expect(screen.getByText('Total Cost (over term)')).toBeInTheDocument();
    expect(screen.getByText(/cheaper/i)).toBeInTheDocument();
  });

  it('returns to empty state when a required field is cleared', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/asset cost/i), { target: { value: '50000' } });
    fireEvent.change(screen.getByLabelText(/down payment/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/lease term/i), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText(/monthly lease payment/i), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText(/annual loan rate/i), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText(/residual/i), { target: { value: '15000' } });

    fireEvent.change(screen.getByLabelText(/asset cost/i), { target: { value: '' } });
    expect(screen.getByText(/enter all values above/i)).toBeInTheDocument();
  });
});
