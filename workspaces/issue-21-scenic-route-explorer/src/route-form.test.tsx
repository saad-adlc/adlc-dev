import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RouteForm from './route-form';

describe('RouteForm', () => {
  beforeEach(() => localStorage.clear());

  it('renders the form title', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Submit a Route')).toBeInTheDocument();
  });

  it('renders all key input fields', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText('Route Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Region')).toBeInTheDocument();
    expect(screen.getByLabelText('Distance (mi)')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<RouteForm onSubmit={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close form'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<RouteForm onSubmit={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows an error when name is missing', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Route name is required');
  });

  it('shows an error when region is missing', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'My Route' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Region is required');
  });

  it('shows an error for invalid distance', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'R' } });
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Region' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByRole('alert')).toHaveTextContent('valid positive distance');
  });

  it('calls onSubmit with the new route on valid submission', () => {
    const onSubmit = vi.fn();
    render(<RouteForm onSubmit={onSubmit} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'Awesome Road' } });
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Test Region' } });
    fireEvent.change(screen.getByLabelText('Distance (mi)'), { target: { value: '75' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.name).toBe('Awesome Road');
    expect(submitted.distance).toBe(75);
  });

  it('accepts all optional fields and submits successfully', () => {
    const onSubmit = vi.fn();
    render(<RouteForm onSubmit={onSubmit} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'Full Route' } });
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Test Valley' } });
    fireEvent.change(screen.getByLabelText('Road Type'), { target: { value: 'Gravel' } });
    fireEvent.change(screen.getByLabelText('Distance (mi)'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('Drive Time'), { target: { value: '2h 30m' } });
    fireEvent.change(screen.getByLabelText('Curvature (1–5)'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Start Point'), { target: { value: 'Start Town' } });
    fireEvent.change(screen.getByLabelText('End Point'), { target: { value: 'End Town' } });
    fireEvent.change(screen.getByLabelText('Highlights'), { target: { value: 'Beautiful!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.roadType).toBe('Gravel');
    expect(submitted.driveTime).toBe('2h 30m');
  });

  it('persists the new route to localStorage after submission', () => {
    render(<RouteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'Storage Test' } });
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Anywhere' } });
    fireEvent.change(screen.getByLabelText('Distance (mi)'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    const stored = localStorage.getItem('sre_routes');
    expect(stored).not.toBeNull();
    const routes = JSON.parse(stored!);
    expect(routes.some((r: { name: string }) => r.name === 'Storage Test')).toBe(true);
  });
});
