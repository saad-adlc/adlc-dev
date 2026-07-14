import { useState } from 'react';
import styles from './unit-converter.module.css';

/** Supported length units. */
export type Unit = 'meters' | 'feet' | 'inches';

/** Metres-equivalent factor for each unit. */
const METRES_PER: Record<Unit, number> = {
  meters: 1,
  feet: 0.3048,
  inches: 0.0254,
};

/** Human-readable labels for each unit. */
export const UNIT_LABELS: Record<Unit, string> = {
  meters: 'Meters',
  feet: 'Feet',
  inches: 'Inches',
};

const ALL_UNITS: Unit[] = ['meters', 'feet', 'inches'];

const EMPTY_HINT = 'Enter a value';
const INVALID_HINT = 'Enter a valid number';

/**
 * Converts a length value from one unit to another.
 * @param value - Numeric value to convert.
 * @param from - Source unit.
 * @param to - Target unit.
 * @returns Converted value in the target unit.
 */
export function convert(value: number, from: Unit, to: Unit): number {
  return (value * METRES_PER[from]) / METRES_PER[to];
}

interface UnitSelectProps {
  value: Unit;
  onChange: (unit: Unit) => void;
  label: string;
}

/** Drop-down for selecting a length unit. */
function UnitSelect({ value, onChange, label }: UnitSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Unit)}
      className={styles.select}
      aria-label={label}
    >
      {ALL_UNITS.map((unit) => (
        <option key={unit} value={unit}>{UNIT_LABELS[unit]}</option>
      ))}
    </select>
  );
}

/** Computes the display string for the current converter state. */
function getResult(inputValue: string, fromUnit: Unit, toUnit: Unit): string {
  if (inputValue.trim() === '') return EMPTY_HINT;
  const num = parseFloat(inputValue);
  if (isNaN(num) || num < 0) return INVALID_HINT;
  return convert(num, fromUnit, toUnit).toFixed(4);
}

/** Live length unit converter. Pre-filled: 1 Meter → Feet = 3.2808. */
export default function UnitConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState<Unit>('meters');
  const [toUnit, setToUnit] = useState<Unit>('feet');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Length Converter</h1>
      <div className={styles.controls}>
        <input
          type="number"
          value={inputValue}
          min="0"
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
          aria-label="Value to convert"
        />
        <UnitSelect value={fromUnit} onChange={setFromUnit} label="From unit" />
        <span className={styles.arrow} aria-hidden="true">→</span>
        <UnitSelect value={toUnit} onChange={setToUnit} label="To unit" />
      </div>
      <p className={styles.result} aria-live="polite">
        {getResult(inputValue, fromUnit, toUnit)}
      </p>
    </div>
  );
}
