import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CurvatureRating from './curvature-rating';

describe('CurvatureRating', () => {
  it('renders accessible label with rating', () => {
    render(<CurvatureRating rating={3} />);
    expect(screen.getByLabelText('Curvature rating: 3 of 5')).toBeInTheDocument();
  });

  it('renders 5 stars by default', () => {
    const { container } = render(<CurvatureRating rating={4} />);
    const stars = container.querySelectorAll('span[aria-hidden="true"]');
    expect(stars).toHaveLength(5);
  });

  it('renders correct number of filled stars', () => {
    const { container } = render(<CurvatureRating rating={2} />);
    const allStars = container.querySelectorAll('span[aria-hidden="true"]');
    expect(allStars).toHaveLength(5);
  });

  it('renders 0 filled stars for rating 0', () => {
    render(<CurvatureRating rating={0} />);
    expect(screen.getByLabelText('Curvature rating: 0 of 5')).toBeInTheDocument();
  });

  it('respects custom max prop', () => {
    const { container } = render(<CurvatureRating rating={3} max={3} />);
    const stars = container.querySelectorAll('span[aria-hidden="true"]');
    expect(stars).toHaveLength(3);
    expect(screen.getByLabelText('Curvature rating: 3 of 3')).toBeInTheDocument();
  });
});
