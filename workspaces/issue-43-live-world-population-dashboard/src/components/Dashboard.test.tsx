import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import { BASELINE_MS } from '../data/continents';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASELINE_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the world population label', () => {
    render(<Dashboard />);
    expect(screen.getByText('World Population')).toBeInTheDocument();
  });

  it('renders all six continent names', () => {
    render(<Dashboard />);
    expect(screen.getByText('Asia')).toBeInTheDocument();
    expect(screen.getByText('Africa')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('South America')).toBeInTheDocument();
    expect(screen.getByText('Oceania')).toBeInTheDocument();
  });

  it('renders the growth subtitle', () => {
    render(<Dashboard />);
    expect(screen.getByText(/69 million/i)).toBeInTheDocument();
  });

  it('renders share percentage badges', () => {
    render(<Dashboard />);
    expect(screen.getByText('58.6% of world')).toBeInTheDocument();
    expect(screen.getByText('9.0% of world')).toBeInTheDocument();
  });

  it('renders growth rate badges', () => {
    render(<Dashboard />);
    expect(screen.getByText('+0.58%')).toBeInTheDocument();
    expect(screen.getByText('-0.12%')).toBeInTheDocument();
    expect(screen.getByText('+2.27%')).toBeInTheDocument();
  });

  it('Europe growth-rate badge has danger class', () => {
    render(<Dashboard />);
    const badge = screen.getByText('-0.12%');
    expect(badge).toHaveClass('badge-danger');
  });

  it('Africa growth-rate badge has info class', () => {
    render(<Dashboard />);
    const badge = screen.getByText('+2.27%');
    expect(badge).toHaveClass('badge-info');
  });

  it('other continent growth-rate badges have neutral class', () => {
    render(<Dashboard />);
    const asiaBadge = screen.getByText('+0.58%');
    expect(asiaBadge).toHaveClass('badge-neutral');
  });

  it('shows source footnote with data attribution', () => {
    render(<Dashboard />);
    expect(screen.getByText(/UN World Population Prospects/i)).toBeInTheDocument();
    expect(screen.getByText(/estimates/i)).toBeInTheDocument();
  });

  it('world counter updates after one second', () => {
    render(<Dashboard />);
    const counter = screen.getByTestId('world-counter');
    const before = counter.textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(counter.textContent).not.toBe(before);
  });

  it('Europe counter decreases after 36 seconds', () => {
    render(<Dashboard />);
    const europeCounter = screen.getByTestId('continent-counter-Europe');
    const before = europeCounter.textContent ?? '';

    act(() => {
      vi.advanceTimersByTime(36_000);
    });

    const after = europeCounter.textContent ?? '';
    const numBefore = parseInt(before.replace(/\D/g, ''), 10);
    const numAfter = parseInt(after.replace(/\D/g, ''), 10);
    expect(numAfter).toBeLessThan(numBefore);
  });

  it('world total equals sum of continent counters', () => {
    render(<Dashboard />);

    const continentNames = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'];
    const continentSum = continentNames.reduce((sum, name) => {
      const el = screen.getByTestId(`continent-counter-${name}`);
      return sum + parseInt((el.textContent ?? '').replace(/\D/g, ''), 10);
    }, 0);

    const worldEl = screen.getByTestId('world-counter');
    const worldTotal = parseInt((worldEl.textContent ?? '').replace(/\D/g, ''), 10);

    expect(worldTotal).toBe(continentSum);
  });
});
