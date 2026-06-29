import { useState } from 'react';
import { composeGreeting } from './greeting';
import styles from './hello-world.module.css';

const GREETING_STYLES = ['Hello', 'Hi there', 'Welcome', 'Good day'] as const;
type GreetingStyle = (typeof GREETING_STYLES)[number];

/** HelloWorld — interactive greeting component. */
export default function HelloWorld() {
  const [name, setName] = useState('World');
  const [style, setStyle] = useState<GreetingStyle>('Hello');
  const [shout, setShout] = useState(false);
  const [count, setCount] = useState(0);

  const greeting = composeGreeting(name, style, shout);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label htmlFor="name-input">Name</label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <label htmlFor="style-select">Style</label>
        <select
          id="style-select"
          value={style}
          onChange={(e) => setStyle(e.target.value as GreetingStyle)}
          className={styles.select}
        >
          {GREETING_STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label htmlFor="shout-toggle">Shout</label>
        <input
          id="shout-toggle"
          type="checkbox"
          checked={shout}
          onChange={(e) => setShout(e.target.checked)}
        />
      </div>
      <p className={styles.greeting}>{greeting}</p>
      <div className={styles.counter}>
        <button
          className={styles.greetButton}
          onClick={() => setCount((c) => c + 1)}
        >
          Greet
        </button>
        <span>Greeted {count} times</span>
      </div>
    </div>
  );
}
