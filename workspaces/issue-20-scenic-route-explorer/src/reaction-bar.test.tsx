import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ReactionBar from './reaction-bar';
import { AppProvider } from './app-context';
import type { ReactNode } from 'react';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
});

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('ReactionBar', () => {
  it('renders all four reaction buttons', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🔥')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🌄')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 😍')).toBeInTheDocument();
  });

  it('shows 0 count initially', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    const btn = screen.getByLabelText('React with 👍');
    expect(btn).toHaveTextContent('0');
  });

  it('increments count on click', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    const btn = screen.getByLabelText('React with 👍');
    fireEvent.click(btn);
    expect(btn).toHaveTextContent('1');
  });

  it('decrements count on second click (un-toggle)', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    const btn = screen.getByLabelText('React with 👍');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveTextContent('0');
  });

  it('sets aria-pressed true when active', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    const btn = screen.getByLabelText('React with 🔥');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggling one emoji does not affect another', () => {
    render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('React with 👍'));
    expect(screen.getByLabelText('React with 🔥')).toHaveTextContent('0');
  });

  it('reactions are independent per routeId', () => {
    const { rerender } = render(<ReactionBar routeId="seed-1" />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('React with 👍'));
    rerender(
      <AppProvider>
        <ReactionBar routeId="seed-2" />
      </AppProvider>
    );
    expect(screen.getByLabelText('React with 👍')).toHaveTextContent('0');
  });
});
