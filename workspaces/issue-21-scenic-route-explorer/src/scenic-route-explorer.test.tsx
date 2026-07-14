import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import ScenicRouteExplorer from './scenic-route-explorer';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Scenic Route Explorer')).toBeInTheDocument();
  });
});

describe('ScenicRouteExplorer', () => {
  beforeEach(() => localStorage.clear());

  it('renders the app header with title', () => {
    render(<ScenicRouteExplorer />);
    expect(screen.getByText('Scenic Route Explorer')).toBeInTheDocument();
  });

  it('renders a Submit Route button in the header', () => {
    render(<ScenicRouteExplorer />);
    expect(screen.getByLabelText('Submit a new route')).toBeInTheDocument();
  });

  it('shows seed routes in the feed by default', () => {
    render(<ScenicRouteExplorer />);
    expect(screen.getByText('Pacific Coast Highway')).toBeInTheDocument();
  });

  it('shows a route count label', () => {
    render(<ScenicRouteExplorer />);
    expect(screen.getByText(/Routes · \d+ of \d+/)).toBeInTheDocument();
  });

  it('filters routes when text is typed in the search bar', () => {
    render(<ScenicRouteExplorer />);
    const search = screen.getByLabelText('Search routes');
    fireEvent.change(search, { target: { value: 'dragon' } });
    expect(screen.getByText('Tail of the Dragon')).toBeInTheDocument();
    expect(screen.queryByText('Pacific Coast Highway')).not.toBeInTheDocument();
  });

  it('navigates to route detail when a card is clicked', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText(/View details for Pacific Coast Highway/));
    expect(screen.getByRole('button', { name: /back to routes/i })).toBeInTheDocument();
  });

  it('returns to feed when Back button is clicked', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText(/View details for Pacific Coast Highway/));
    fireEvent.click(screen.getByRole('button', { name: /back to routes/i }));
    expect(screen.getByLabelText('Search routes')).toBeInTheDocument();
  });

  it('opens the submit form modal when header button is clicked', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText('Submit a new route'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Submit a Route')).toBeInTheDocument();
  });

  it('closes the submit form when Cancel is clicked', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText('Submit a new route'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the submit form from the detail view Submit Your Route button', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText(/View details for Pacific Coast Highway/));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Your Route' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('toggles route type filter chips in the feed', () => {
    render(<ScenicRouteExplorer />);
    const pavedChip = screen.getByRole('button', { name: 'Paved' });
    fireEvent.click(pavedChip);
    expect(pavedChip.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(pavedChip);
    expect(pavedChip.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows no-results message when search matches nothing', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.change(screen.getByLabelText('Search routes'), {
      target: { value: 'zzz-no-match-xyzabc' },
    });
    expect(screen.getByText(/No routes match your filters/i)).toBeInTheDocument();
  });

  it('collapses and expands directions in the detail view', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText(/View details for Pacific Coast Highway/));
    const toggle = screen.getByRole('button', { name: /Directions/i });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('adds a new route to the feed after submission', () => {
    render(<ScenicRouteExplorer />);
    fireEvent.click(screen.getByLabelText('Submit a new route'));
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'New Epic Road' } });
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Test Valley' } });
    fireEvent.change(screen.getByLabelText('Distance (mi)'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByText('New Epic Road')).toBeInTheDocument();
  });
});
