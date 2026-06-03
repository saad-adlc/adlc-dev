import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HelloWorld from './hello-world';

describe('HelloWorld', () => {
  it('renders the hello world heading', () => {
    render(<HelloWorld />);
    expect(screen.getByRole('heading', { name: /hello, world!/i })).toBeDefined();
  });

  it('renders the welcome message', () => {
    render(<HelloWorld />);
    expect(screen.getByText(/welcome to the adlc orders web app/i)).toBeDefined();
  });

  it('renders with the correct test id', () => {
    render(<HelloWorld />);
    expect(screen.getByTestId('hello-world')).toBeDefined();
  });
});
