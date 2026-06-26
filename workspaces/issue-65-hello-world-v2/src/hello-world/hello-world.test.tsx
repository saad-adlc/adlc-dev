import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelloWorld from './hello-world';

describe('HelloWorld', () => {
  it('shows default greeting on load', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('shows counter at 0 on load', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Greeted 0 times')).toBeInTheDocument();
  });

  it('updates greeting live as name is typed', () => {
    render(<HelloWorld />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });

  it('falls back to World when name is cleared', () => {
    render(<HelloWorld />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('trims spaces from name for the greeting', () => {
    render(<HelloWorld />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Ada  ' } });
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });

  it('updates greeting when style changes', () => {
    render(<HelloWorld />);
    fireEvent.change(screen.getByLabelText('Style'), { target: { value: 'Welcome' } });
    expect(screen.getByText('Welcome, World!')).toBeInTheDocument();
  });

  it('uppercases greeting when Shout is toggled on', () => {
    render(<HelloWorld />);
    fireEvent.click(screen.getByLabelText('Shout'));
    expect(screen.getByText('HELLO, WORLD!')).toBeInTheDocument();
  });

  it('restores normal case when Shout is toggled off', () => {
    render(<HelloWorld />);
    const shoutToggle = screen.getByLabelText('Shout');
    fireEvent.click(shoutToggle);
    fireEvent.click(shoutToggle);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('increments counter on each Greet click', () => {
    render(<HelloWorld />);
    const btn = screen.getByRole('button', { name: 'Greet' });
    fireEvent.click(btn);
    expect(screen.getByText('Greeted 1 times')).toBeInTheDocument();
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.getByText('Greeted 3 times')).toBeInTheDocument();
  });

  it('dropdown contains all four style options', () => {
    render(<HelloWorld />);
    const select = screen.getByLabelText('Style') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toEqual(['Hello', 'Hi there', 'Welcome', 'Good day']);
  });
});
