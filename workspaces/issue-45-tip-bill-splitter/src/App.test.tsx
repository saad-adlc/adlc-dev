import { render, screen } from '@testing-library/react';
import App from './App';

it('renders the Tip & Bill Splitter heading via App', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Tip.*Bill Splitter/i })).toBeInTheDocument();
});
