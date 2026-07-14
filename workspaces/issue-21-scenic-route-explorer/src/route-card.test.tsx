import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RouteCard from './route-card';
import { Route } from './types';

const MOCK_ROUTE: Route = {
  id: 'test-1',
  name: 'Mountain Pass',
  region: 'Rocky Mountains',
  distance: 60,
  driveTime: '2h',
  curvatureRating: 4,
  roadType: 'Paved',
  highlights: 'Great views',
  waypoints: [
    { lat: 45.0, lng: -109.0 },
    { lat: 45.1, lng: -109.1 },
    { lat: 45.2, lng: -109.2 },
  ],
  startPoint: 'Town A',
  endPoint: 'Town B',
  directions: ['Go north', 'Turn left'],
  bestSeason: 'Summer',
};

describe('RouteCard', () => {
  beforeEach(() => localStorage.clear());

  it('renders route name, region, and road type', () => {
    render(<RouteCard route={MOCK_ROUTE} onClick={vi.fn()} />);
    expect(screen.getByText('Mountain Pass')).toBeInTheDocument();
    expect(screen.getByText(/Rocky Mountains/)).toBeInTheDocument();
  });

  it('renders distance and drive time', () => {
    render(<RouteCard route={MOCK_ROUTE} onClick={vi.fn()} />);
    expect(screen.getByText(/60 mi/)).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', () => {
    const onClick = vi.fn();
    render(<RouteCard route={MOCK_ROUTE} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /View details for Mountain Pass/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick when Enter is pressed on the card', () => {
    const onClick = vi.fn();
    render(<RouteCard route={MOCK_ROUTE} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /View details for Mountain Pass/i });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick when Space is pressed on the card', () => {
    const onClick = vi.fn();
    render(<RouteCard route={MOCK_ROUTE} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /View details for Mountain Pass/i });
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when a different key is pressed', () => {
    const onClick = vi.fn();
    render(<RouteCard route={MOCK_ROUTE} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /View details for/i }), { key: 'Tab' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the thumbnail map', () => {
    render(<RouteCard route={MOCK_ROUTE} onClick={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'Route map' })).toBeInTheDocument();
  });

  it('renders a curvature rating', () => {
    render(<RouteCard route={MOCK_ROUTE} onClick={vi.fn()} />);
    expect(screen.getByLabelText(/Curvature: 4 of 5/)).toBeInTheDocument();
  });

  it('renders reaction buttons', () => {
    render(<RouteCard route={MOCK_ROUTE} onClick={vi.fn()} />);
    expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
  });
});
