import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import HelloGreeter from './hello-greeter';
import { useGreetings } from './use-greetings';

const STORAGE_KEY = 'hello-greeter-greetings';

// ── useGreetings hook ────────────────────────────────────────────────────────

describe('useGreetings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty when localStorage has no data', () => {
    const { result } = renderHook(() => useGreetings());
    expect(result.current.greetings).toHaveLength(0);
  });

  it('adds a valid greeting and trims whitespace', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => result.current.addGreeting('  Alice  '));
    expect(result.current.greetings).toHaveLength(1);
    expect(result.current.greetings[0].name).toBe('Alice');
  });

  it('ignores an empty string', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => result.current.addGreeting(''));
    expect(result.current.greetings).toHaveLength(0);
  });

  it('ignores whitespace-only input', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => result.current.addGreeting('   '));
    expect(result.current.greetings).toHaveLength(0);
  });

  it('removes a single greeting by id', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => result.current.addGreeting('Alice'));
    const id = result.current.greetings[0].id;
    act(() => result.current.removeGreeting(id));
    expect(result.current.greetings).toHaveLength(0);
  });

  it('clears all greetings', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => { result.current.addGreeting('Alice'); });
    act(() => { result.current.addGreeting('Bob'); });
    act(() => result.current.clearAll());
    expect(result.current.greetings).toHaveLength(0);
  });

  it('persists greetings to localStorage', () => {
    const { result } = renderHook(() => useGreetings());
    act(() => result.current.addGreeting('Alice'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as { name: string }[];
    expect(stored[0].name).toBe('Alice');
  });

  it('loads greetings from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'pre-id', name: 'Preloaded' }]));
    const { result } = renderHook(() => useGreetings());
    expect(result.current.greetings[0].name).toBe('Preloaded');
  });
});

// ── HelloGreeter component ───────────────────────────────────────────────────

describe('HelloGreeter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the empty-state message on first load', () => {
    render(<HelloGreeter />);
    expect(screen.getByText(/No greetings yet/)).toBeInTheDocument();
  });

  it('disables Add when the input is empty', () => {
    render(<HelloGreeter />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('enables Add when the input has text', () => {
    render(<HelloGreeter />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('appends a greeting on button click', () => {
    render(<HelloGreeter />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
  });

  it('clears the input after adding', () => {
    render(<HelloGreeter />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(input).toHaveValue('');
  });

  it('appends a greeting on Enter key', () => {
    render(<HelloGreeter />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument();
  });

  it('does not add a row for whitespace-only input', () => {
    render(<HelloGreeter />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText(/No greetings yet/)).toBeInTheDocument();
  });

  it('trims surrounding whitespace from the name', () => {
    render(<HelloGreeter />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Alice  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
  });

  it('removes a single row with the remove button', () => {
    render(<HelloGreeter />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alice' }));
    expect(screen.getByText(/No greetings yet/)).toBeInTheDocument();
  });

  it('clears all rows', () => {
    render(<HelloGreeter />);
    const input = screen.getByRole('textbox');
    ['Alice', 'Bob'].forEach(name => {
      fireEvent.change(input, { target: { value: name } });
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText(/No greetings yet/)).toBeInTheDocument();
  });

  it('shows the greeting count in the list header', () => {
    render(<HelloGreeter />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Greetings · 1')).toBeInTheDocument();
  });

  it('allows duplicate names', () => {
    render(<HelloGreeter />);
    const input = screen.getByRole('textbox');
    for (let i = 0; i < 2; i++) {
      fireEvent.change(input, { target: { value: 'Alice' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    }
    expect(screen.getAllByText('Hello, Alice!')).toHaveLength(2);
  });

  it('loads persisted greetings from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'pid', name: 'Persisted' }]));
    render(<HelloGreeter />);
    expect(screen.getByText('Hello, Persisted!')).toBeInTheDocument();
  });
});
