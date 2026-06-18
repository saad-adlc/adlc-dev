import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DonutChart from './donut-chart';
import type { CategorySlice } from '../chart-data';

const slices: CategorySlice[] = [
  { category: 'Food', total: 60, percentage: 60 },
  { category: 'Travel', total: 40, percentage: 40 },
];

describe('DonutChart', () => {
  it('renders empty state when no slices', () => {
    render(<DonutChart slices={[]} />);
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });

  it('renders a legend item per slice', () => {
    render(<DonutChart slices={slices} />);
    expect(screen.getByText(/Food/)).toBeInTheDocument();
    expect(screen.getByText(/Travel/)).toBeInTheDocument();
  });

  it('shows percentages', () => {
    render(<DonutChart slices={slices} />);
    expect(screen.getByText(/60\.0%/)).toBeInTheDocument();
  });
});
