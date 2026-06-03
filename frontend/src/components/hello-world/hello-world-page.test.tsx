import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelloWorldPage } from './hello-world-page';

/** Max characters allowed in the name input. */
const MAX_NAME_LENGTH = 50;

describe('HelloWorldPage', () => {
  it('renders the name input and submit button', () => {
    render(<HelloWorldPage />);
    expect(screen.getByRole('textbox', { name: /your name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /say hello/i })).toBeInTheDocument();
  });

  it('displays greeting after submitting a valid name', async () => {
    render(<HelloWorldPage />);
    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Alice');
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
  });

  it('shows error when submitting an empty name', async () => {
    render(<HelloWorldPage />);
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('shows error when name contains special characters', async () => {
    render(<HelloWorldPage />);
    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Ali@ce!');
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Name may only contain letters and spaces',
    );
  });

  it('shows error when name exceeds max length', async () => {
    render(<HelloWorldPage />);
    const longName = 'A'.repeat(MAX_NAME_LENGTH + 1);
    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), longName);
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
    );
  });

  it('prioritises empty-name error over special-character error', async () => {
    render(<HelloWorldPage />);
    // submit with blank — error: empty
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('clears the error when the user types a valid name after a failed submission', async () => {
    render(<HelloWorldPage />);
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: /your name/i }), 'Bob');
    await userEvent.click(screen.getByRole('button', { name: /say hello/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument();
  });
});
