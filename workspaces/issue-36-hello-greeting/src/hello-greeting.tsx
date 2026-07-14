import { useState, KeyboardEvent } from 'react';

/** Greeting component: accepts a name and displays a personalised greeting. */
export default function HelloGreeting() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState<string | null>(null);

  /** Compute and display the greeting based on current input. */
  function greet() {
    const trimmed = name.trim();
    setGreeting(`Hello, ${trimmed || 'World'}!`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      greet();
    }
  }

  return (
    <div>
      <label htmlFor="name-input">Name</label>
      <input
        id="name-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="button" onClick={greet}>
        Greet
      </button>
      {greeting !== null && <p>{greeting}</p>}
    </div>
  );
}
