import { render, screen } from '@testing-library/react';
import { HelloWorld } from './hello-world';

describe('HelloWorld', () => {
  it('displays default heading when no name is provided', () => {
    render(<HelloWorld />);
    expect(screen.getByRole('heading', { name: 'Hello, Orix ADLC' })).toBeInTheDocument();
  });

  it('displays provided name in heading', () => {
    render(<HelloWorld name="World" />);
    expect(screen.getByRole('heading', { name: 'Hello, World' })).toBeInTheDocument();
  });
});
