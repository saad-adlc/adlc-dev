import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ReactionBar from './reaction-bar';

describe('ReactionBar', () => {
  beforeEach(() => localStorage.clear());

  it('renders all four emoji reaction buttons', () => {
    render(<ReactionBar routeId="route-1" />);
    expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🔥')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🌄')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 😍')).toBeInTheDocument();
  });

  it('shows initial count of 0 for all emojis', () => {
    render(<ReactionBar routeId="route-new" />);
    const counts = screen.getAllByText('0');
    expect(counts.length).toBe(4);
  });

  it('increments count when a reaction button is clicked', () => {
    render(<ReactionBar routeId="route-2" />);
    const btn = screen.getByLabelText('React with 👍');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toContain('1');
  });

  it('decrements count when an active reaction is clicked again', () => {
    render(<ReactionBar routeId="route-3" />);
    const btn = screen.getByLabelText('React with 🔥');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('1');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('0');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('marks the button as aria-pressed=true after clicking', () => {
    render(<ReactionBar routeId="route-4" />);
    const btn = screen.getByLabelText('React with 🌄');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('persists reaction state to localStorage', () => {
    render(<ReactionBar routeId="route-5" />);
    fireEvent.click(screen.getByLabelText('React with 😍'));
    const stored = localStorage.getItem('sre_reactions');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed['route-5']['😍']).toBe(1);
  });
});
