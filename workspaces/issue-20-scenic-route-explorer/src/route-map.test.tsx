import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RouteMap, { projectPoint } from './route-map';
import type { Waypoint } from './types';

const waypoints: Waypoint[] = [
  { lat: 40, lng: -120 },
  { lat: 41, lng: -119 },
  { lat: 42, lng: -118 },
];

describe('projectPoint', () => {
  it('maps first waypoint to origin in a tight bounding box', () => {
    const bounds = { minLat: 40, maxLat: 42, minLng: -120, maxLng: -118 };
    const [x, y] = projectPoint({ lat: 40, lng: -120 }, bounds, 200, 100);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(100);
  });

  it('maps last waypoint to top-right corner', () => {
    const bounds = { minLat: 40, maxLat: 42, minLng: -120, maxLng: -118 };
    const [x, y] = projectPoint({ lat: 42, lng: -118 }, bounds, 200, 100);
    expect(x).toBeCloseTo(200);
    expect(y).toBeCloseTo(0);
  });

  it('handles zero lat range without dividing by zero', () => {
    const bounds = { minLat: 40, maxLat: 40, minLng: -120, maxLng: -118 };
    const [x, y] = projectPoint({ lat: 40, lng: -119 }, bounds, 200, 100);
    expect(isNaN(x)).toBe(false);
    expect(isNaN(y)).toBe(false);
  });
});

describe('RouteMap', () => {
  it('renders thumbnail SVG with aria label', () => {
    const { getByRole } = render(<RouteMap waypoints={waypoints} variant="thumbnail" />);
    expect(getByRole('img', { name: 'Route map' })).toBeInTheDocument();
  });

  it('renders detail SVG', () => {
    const { getByRole } = render(<RouteMap waypoints={waypoints} variant="detail" />);
    expect(getByRole('img', { name: 'Route map' })).toBeInTheDocument();
  });

  it('renders nothing when fewer than 2 waypoints', () => {
    const { container } = render(<RouteMap waypoints={[waypoints[0]]} variant="thumbnail" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a polyline element', () => {
    const { container } = render(<RouteMap waypoints={waypoints} variant="thumbnail" />);
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('renders start and end dots', () => {
    const { container } = render(<RouteMap waypoints={waypoints} variant="thumbnail" />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });
});
