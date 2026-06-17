import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurvatureRating from './curvature-rating';

describe('CurvatureRating', () => {
  it('renders the correct aria-label', () => {
    render(<CurvatureRating rating={3} />);
    expect(screen.getByLabelText('Curvature: 3 of 5')).toBeInTheDocument();
  });

  it('renders 5 stars for a max-5 rating', () => {
    const { container } = render(<CurvatureRating rating={5} />);
    const stars = container.querySelectorAll('span > span');
    expect(stars).toHaveLength(5);
  });

  it('renders the correct number of filled stars', () => {
    const { container } = render(<CurvatureRating rating={3} />);
    const allStars = container.querySelectorAll('span > span');
    const filledCount = Array.from(allStars).filter(s =>
      s.className.includes('filled'),
    ).length;
    expect(filledCount).toBe(3);
  });

  it('renders the correct number of empty stars', () => {
    const { container } = render(<CurvatureRating rating={3} />);
    const allStars = container.querySelectorAll('span > span');
    const emptyCount = Array.from(allStars).filter(s =>
      s.className.includes('empty'),
    ).length;
    expect(emptyCount).toBe(2);
  });

  it('renders 1 filled star for rating=1', () => {
    const { container } = render(<CurvatureRating rating={1} />);
    const allStars = container.querySelectorAll('span > span');
    const filledCount = Array.from(allStars).filter(s =>
      s.className.includes('filled'),
    ).length;
    expect(filledCount).toBe(1);
  });

  it('uses a custom max value', () => {
    render(<CurvatureRating rating={2} max={3} />);
    expect(screen.getByLabelText('Curvature: 2 of 3')).toBeInTheDocument();
  });
});
