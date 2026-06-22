import { render, screen, fireEvent } from '@testing-library/react';
import HelloGreeting from './hello-greeting';

describe('HelloGreeting', () => {
  it('renders the name input and Greet button', () => {
    render(<HelloGreeting />);
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /greet/i })).toBeInTheDocument();
  });

  it('shows no greeting before first interaction', () => {
    render(<HelloGreeting />);
    expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();
  });

  it('greets by name when a name is entered and button clicked', () => {
    render(<HelloGreeting />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
      target: { value: 'Ada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });

  it('greets World when the input is empty', () => {
    render(<HelloGreeting />);
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('trims whitespace before greeting', () => {
    render(<HelloGreeting />);
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
      target: { value: '  Ada  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });

  it('greets when Enter is pressed in the input', () => {
    render(<HelloGreeting />);
    const input = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(input, { target: { value: 'Ada' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
  });

  it('replaces a previous greeting with the new one', () => {
    render(<HelloGreeting />);
    const input = screen.getByRole('textbox', { name: /name/i });

    fireEvent.change(input, { target: { value: 'Ada' } });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.click(screen.getByRole('button', { name: /greet/i }));
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument();
    expect(screen.queryByText('Hello, Ada!')).not.toBeInTheDocument();
  });
});
