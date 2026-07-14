import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
  });

  it('shows overview page at root (redirects / → /overview)', () => {
    render(<App />);
    expect(screen.getByText(/total spent/i)).toBeInTheDocument();
    expect(screen.getByText('$604.84')).toBeInTheDocument();
  });
});
