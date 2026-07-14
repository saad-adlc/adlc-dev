import { useState, useEffect } from 'react';
import { isValidName, STORAGE_KEY } from './greeting-utils';

export interface Greeting {
  id: string;
  name: string;
}

function loadGreetings(): Greeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Greeting[]) : [];
  } catch {
    return [];
  }
}

/** Manages a persisted list of greetings backed by localStorage. */
export function useGreetings() {
  const [greetings, setGreetings] = useState<Greeting[]>(loadGreetings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(greetings));
  }, [greetings]);

  /** Appends a greeting for the given name; trims whitespace; ignores blank names. */
  function addGreeting(name: string): void {
    const trimmed = name.trim();
    if (!isValidName(trimmed)) return;
    setGreetings(prev => [...prev, { id: crypto.randomUUID(), name: trimmed }]);
  }

  /** Removes the greeting with the given id. */
  function removeGreeting(id: string): void {
    setGreetings(prev => prev.filter(g => g.id !== id));
  }

  /** Clears all greetings. */
  function clearAll(): void {
    setGreetings([]);
  }

  return { greetings, addGreeting, removeGreeting, clearAll };
}
