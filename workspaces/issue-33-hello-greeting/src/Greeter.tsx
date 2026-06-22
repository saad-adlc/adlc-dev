import { useState } from 'react';

export default function Greeter() {
  const [value, setValue] = useState('');
  const [greeting, setGreeting] = useState<string | null>(null);

  function greet() {
    const name = value.trim();
    setGreeting(`Hello, ${name || 'World'}!`);
  }

  return (
    <div>
      <label htmlFor="name-input">Your name</label>
      <input
        id="name-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') greet(); }}
      />
      <button type="button" onClick={greet}>Greet</button>
      {greeting !== null && <p role="status">{greeting}</p>}
    </div>
  );
}
