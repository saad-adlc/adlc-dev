import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the page title', () => {
    render(<App />);
    expect(screen.getByText('Equipment Depreciation Calculator')).toBeInTheDocument();
  });

  it('renders the depreciation table with default inputs', () => {
    render(<App />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders the book-value chart with default inputs', () => {
    render(<App />);
    expect(
      screen.getByRole('img', { name: /book value over time/i }),
    ).toBeInTheDocument();
  });

  it('hides table and chart when cost is invalid', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Asset Cost/i), { target: { value: '-1' } });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: /book value over time/i }),
    ).not.toBeInTheDocument();
  });

  it('shows an inline error alert for invalid inputs', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Asset Cost/i), { target: { value: '0' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('updates the schedule when method switches to declining-balance', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Depreciation Method/i), {
      target: { value: 'declining-balance' },
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /book value over time/i }),
    ).toBeInTheDocument();
  });

  it('recovers table and chart after fixing an invalid input', () => {
    render(<App />);
    const costInput = screen.getByLabelText(/Asset Cost/i);
    fireEvent.change(costInput, { target: { value: '-100' } });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.change(costInput, { target: { value: '8000' } });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
