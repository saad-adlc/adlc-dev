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
    // Each name appears in both a card and the summary table
    expect(screen.getAllByText('Asia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Africa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Europe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('North America').length).toBeGreaterThan(0);
    expect(screen.getAllByText('South America').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Oceania').length).toBeGreaterThan(0);
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
    // Each rate appears in both a card badge and the summary table
    expect(screen.getAllByText('+0.58%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-0.12%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+2.27%').length).toBeGreaterThan(0);
  });

  it('Europe growth-rate badge has danger class', () => {
    render(<Dashboard />);
    const matches = screen.getAllByText('-0.12%');
    const badge = matches.find(el => el.classList.contains('badge'));
    expect(badge).toBeDefined();
    expect(badge).toHaveClass('badge-danger');
  });

  it('Africa growth-rate badge has info class', () => {
    render(<Dashboard />);
    const matches = screen.getAllByText('+2.27%');
    const badge = matches.find(el => el.classList.contains('badge'));
    expect(badge).toBeDefined();
    expect(badge).toHaveClass('badge-info');
  });

  it('other continent growth-rate badges have neutral class', () => {
    render(<Dashboard />);
    const matches = screen.getAllByText('+0.58%');
    const asiaBadge = matches.find(el => el.classList.contains('badge'));
    expect(asiaBadge).toBeDefined();
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

  it('renders summary table with all six continent rows', () => {
    render(<Dashboard />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    const continentNames = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'];
    continentNames.forEach(name => {
      expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('summary table shows live population counter for each continent', () => {
    render(<Dashboard />);
    const continentNames = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'];
    continentNames.forEach(name => {
      expect(screen.getByTestId(`table-counter-${name}`)).toBeInTheDocument();
    });
  });

  it('summary table Europe rate cell has danger colour class', () => {
    render(<Dashboard />);
    const matches = screen.getAllByText('-0.12%');
    const tableCell = matches.find(el => el.classList.contains('rate-danger'));
    expect(tableCell).toBeDefined();
  });

  it('summary table Africa rate cell has info colour class', () => {
    render(<Dashboard />);
    const matches = screen.getAllByText('+2.27%');
    const tableCell = matches.find(el => el.classList.contains('rate-info'));
    expect(tableCell).toBeDefined();
  });

  it('summary table counter updates after one second', () => {
    render(<Dashboard />);
    const asiaCell = screen.getByTestId('table-counter-Asia');
    const before = asiaCell.textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(asiaCell.textContent).not.toBe(before);
  });
});
