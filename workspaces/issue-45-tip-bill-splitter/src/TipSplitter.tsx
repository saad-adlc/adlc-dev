import { useState } from 'react';
import { calculateTip } from './calculationUtils';

const PRESET_TIPS = [15, 18, 20] as const;
type PresetTip = (typeof PRESET_TIPS)[number];

export default function TipSplitter() {
  const [bill, setBill] = useState('84.50');
  const [tipPreset, setTipPreset] = useState<PresetTip>(18);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState('3');

  const billNum = Math.max(0, parseFloat(bill) || 0);
  const tipPercent = customTip !== '' ? parseFloat(customTip) || 0 : tipPreset;
  const peopleNum = parseInt(people, 10);
  const validPeople = Number.isInteger(peopleNum) && peopleNum > 0 ? peopleNum : 0;

  const { tipAmount, grandTotal, perPerson } = calculateTip(billNum, tipPercent, validPeople);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  function handlePreset(p: PresetTip) {
    setTipPreset(p);
    setCustomTip('');
  }

  return (
    <div className="splitter">
      <h1>Tip &amp; Bill Splitter</h1>

      <div className="field">
        <label htmlFor="bill">Bill Amount ($)</label>
        <input
          id="bill"
          type="number"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      <div className="field">
        <span>Tip %</span>
        <div className="presets">
          {PRESET_TIPS.map((p) => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              aria-pressed={tipPreset === p && customTip === ''}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          aria-label="Custom tip %"
          type="number"
          value={customTip}
          onChange={(e) => setCustomTip(e.target.value)}
          placeholder="Custom %"
          min="0"
        />
      </div>

      <div className="field">
        <label htmlFor="people">Number of People</label>
        <input
          id="people"
          type="number"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          min="1"
          step="1"
        />
      </div>

      <div className="results">
        <div className="result-row">
          <span>Tip Amount</span>
          <span data-testid="tip-amount">{fmt(tipAmount)}</span>
        </div>
        <div className="result-row">
          <span>Grand Total</span>
          <span data-testid="grand-total">{fmt(grandTotal)}</span>
        </div>
        <div className="result-row">
          <span>Per Person</span>
          {perPerson !== null ? (
            <span data-testid="per-person">{fmt(perPerson)}</span>
          ) : (
            <>
              <span data-testid="per-person">—</span>
              <span data-testid="per-person-hint">Enter number of people</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
