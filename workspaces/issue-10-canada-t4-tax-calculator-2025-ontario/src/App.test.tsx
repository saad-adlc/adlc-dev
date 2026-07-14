import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the page title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders the subtitle mentioning 2025 and Ontario', () => {
    render(<App />);
    expect(screen.getByText(/2025 tax year/i)).toBeTruthy();
  });

  it('shows placeholder text before any input', () => {
    render(<App />);
    expect(screen.getByText(/enter your income/i)).toBeTruthy();
  });

  it('shows the results panel when a valid annual salary is entered', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Annual Salary ($)'), { target: { value: '75000' } });
    expect(screen.getByRole('region', { name: /tax calculation results/i })).toBeTruthy();
  });

  it('hides results panel and shows placeholder when input is cleared', () => {
    render(<App />);
    const input = screen.getByLabelText('Annual Salary ($)');
    fireEvent.change(input, { target: { value: '75000' } });
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByRole('region', { name: /tax calculation results/i })).toBeNull();
    expect(screen.getByText(/enter your income/i)).toBeTruthy();
  });

  it('renders InputPanel within the layout', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: /income input/i })).toBeTruthy();
  });
});
