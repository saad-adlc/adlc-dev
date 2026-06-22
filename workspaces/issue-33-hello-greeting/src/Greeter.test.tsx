import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Greeter from './Greeter';

describe('Greeter', () => {
  it('renders a name input and a Greet button', () => {
    render(<Greeter />);
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /greet/i })).toBeInTheDocument();
  });

  it('shows no greeting on initial render', () => {
    render(<Greeter />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('greets by name when a name is typed and Greet is clicked', () => {
    render(<Greeter />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Hello, Ada!');
  });

  it('shows the default greeting when input is empty', () => {
    render(<Greeter />);
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Hello, World!');
  });

  it('trims leading and trailing spaces from the name', () => {
    render(<Greeter />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: '  Ada  ' } });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Hello, Ada!');
  });

  it('treats whitespace-only input as empty and shows the default greeting', () => {
    render(<Greeter />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Hello, World!');
  });

  it('greets when Enter is pressed inside the input', () => {
    render(<Greeter />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Ada' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: /name/i }), { key: 'Enter' });
    expect(screen.getByRole('status')).toHaveTextContent('Hello, Ada!');
  });
});
