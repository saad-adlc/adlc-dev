import { useState } from 'react';
import type { LineItem, SectionId } from './balance-types';
import { computeTotal, isBalanced, formatMoney } from './balance-utils';
import BalanceSection from './balance-section';
import BalanceVisual from './balance-visual';
import styles from './balance-sheet.module.css';

type SectionsState = Record<SectionId, LineItem[]>;

const SECTION_CONFIGS: Array<{ id: SectionId; title: string }> = [
  { id: 'assets', title: 'Assets' },
  { id: 'liabilities', title: 'Liabilities' },
  { id: 'equity', title: 'Equity' },
];

const INITIAL_STATE: SectionsState = {
  assets: [
    { id: 'a1', name: 'Cash', amount: '12000' },
    { id: 'a2', name: 'Accounts receivable', amount: '8000' },
    { id: 'a3', name: 'Equipment', amount: '30000' },
  ],
  liabilities: [
    { id: 'l1', name: 'Accounts payable', amount: '6000' },
    { id: 'l2', name: 'Bank loan', amount: '20000' },
  ],
  equity: [
    { id: 'e1', name: 'Common stock', amount: '15000' },
    { id: 'e2', name: 'Retained earnings', amount: '9000' },
  ],
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function addItem(s: SectionsState, sid: SectionId): SectionsState {
  const newItem: LineItem = { id: makeId(), name: '', amount: '' };
  return { ...s, [sid]: [...s[sid], newItem] };
}

function removeItem(s: SectionsState, sid: SectionId, id: string): SectionsState {
  return { ...s, [sid]: s[sid].filter((item) => item.id !== id) };
}

function updateItem(
  s: SectionsState,
  sid: SectionId,
  id: string,
  field: 'name' | 'amount',
  value: string,
): SectionsState {
  const updated = s[sid].map((item) =>
    item.id === id ? { ...item, [field]: value } : item,
  );
  return { ...s, [sid]: updated };
}

function renderBalanceStatus(assetTotal: number, claimsTotal: number) {
  if (isBalanced(assetTotal, claimsTotal)) {
    return <p className={styles.balanced}>In balance ✓</p>;
  }
  const diff = Math.abs(assetTotal - claimsTotal);
  const side = assetTotal > claimsTotal ? 'assets exceed claims' : 'claims exceed assets';
  return (
    <p className={styles.outOfBalance}>
      Out of balance by {formatMoney(diff)} — {side}.
    </p>
  );
}

/** Root balance sheet component with three editable sections and a live balance indicator. */
export default function BalanceSheet() {
  const [sections, setSections] = useState<SectionsState>(INITIAL_STATE);
  const assetTotal = computeTotal(sections.assets);
  const liabTotal = computeTotal(sections.liabilities);
  const equityTotal = computeTotal(sections.equity);
  const claimsTotal = liabTotal + equityTotal;

  return (
    <div className={styles.sheet}>
      <h1 className={styles.heading}>Balance Sheet</h1>
      <div className={styles.sections}>
        {SECTION_CONFIGS.map(({ id, title }) => (
          <BalanceSection
            key={id}
            sectionId={id}
            title={title}
            items={sections[id]}
            onAdd={() => setSections((s) => addItem(s, id))}
            onRemove={(itemId) => setSections((s) => removeItem(s, id, itemId))}
            onChangeName={(itemId, v) => setSections((s) => updateItem(s, id, itemId, 'name', v))}
            onChangeAmount={(itemId, v) =>
              setSections((s) => updateItem(s, id, itemId, 'amount', v))
            }
          />
        ))}
      </div>
      <div className={styles.summary}>
        <p>Total Assets: {formatMoney(assetTotal)}</p>
        <p>Total Liabilities + Equity: {formatMoney(claimsTotal)}</p>
        {renderBalanceStatus(assetTotal, claimsTotal)}
      </div>
      <BalanceVisual assetTotal={assetTotal} claimsTotal={claimsTotal} />
    </div>
  );
}
