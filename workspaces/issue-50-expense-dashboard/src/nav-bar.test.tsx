import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './nav-bar';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar />
    </MemoryRouter>
  );
}

describe('NavBar', () => {
  it('renders Overview and Transactions links', () => {
    renderWithRouter('/overview');
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
  });

  it('marks Overview link as current page on /overview', () => {
    renderWithRouter('/overview');
    const link = screen.getByRole('link', { name: /overview/i });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('marks Transactions link as current page on /transactions', () => {
    renderWithRouter('/transactions');
    const link = screen.getByRole('link', { name: /transactions/i });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('Overview link is not current page on /transactions', () => {
    renderWithRouter('/transactions');
    const link = screen.getByRole('link', { name: /overview/i });
    expect(link).not.toHaveAttribute('aria-current', 'page');
  });
});
