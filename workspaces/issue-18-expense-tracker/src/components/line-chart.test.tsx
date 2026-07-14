import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LineChart from './line-chart';
import type { DailySpend } from '../chart-data';

const data: DailySpend[] = [
  { date: '2024-01-01', total: 20 },
  { date: '2024-01-02', total: 40 },
];

describe('LineChart', () => {
  it('renders empty state when no data', () => {
    render(<LineChart data={[]} />);
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });

  it('renders an svg when data is present', () => {
    const { container } = render(<LineChart data={data} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders a circle per data point', () => {
    const { container } = render(<LineChart data={data} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(data.length);
  });
});
