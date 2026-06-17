import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SubmitRouteForm from './submit-route-form';
import { AppProvider } from './app-context';
import type { ReactNode } from 'react';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
  vi.useFakeTimers();
});

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'Test Route' } });
  fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'Test Region' } });
  fireEvent.change(screen.getByLabelText('Distance (miles)'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Drive Time'), { target: { value: '2h' } });
  fireEvent.change(screen.getByLabelText('Start Point'), { target: { value: 'Town A' } });
  fireEvent.change(screen.getByLabelText('End Point'), { target: { value: 'Town B' } });
  fireEvent.change(screen.getByLabelText('Highlights'), { target: { value: 'Great views' } });
}

describe('SubmitRouteForm', () => {
  it('renders all form fields', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Route Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Region')).toBeInTheDocument();
    expect(screen.getByLabelText('Road Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Distance (miles)')).toBeInTheDocument();
    expect(screen.getByLabelText('Drive Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Curvature Rating (1–5)')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Point')).toBeInTheDocument();
    expect(screen.getByLabelText('End Point')).toBeInTheDocument();
    expect(screen.getByLabelText('Highlights')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
  });

  it('shows error for invalid distance', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText('Distance (miles)'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
  });

  it('clears field error when user types in it', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    const nameErrors = screen.getAllByText('Required');
    expect(nameErrors.length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'X' } });
    expect(screen.getAllByText('Required').length).toBeLessThan(nameErrors.length);
  });

  it('shows success message after valid submission', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Route' }));
    expect(screen.getByText('Route submitted! Thank you.')).toBeInTheDocument();
  });

  it('allows changing road type', () => {
    render(<SubmitRouteForm />, { wrapper: Wrapper });
    const select = screen.getByLabelText('Road Type') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Gravel' } });
    expect(select.value).toBe('Gravel');
  });
});
