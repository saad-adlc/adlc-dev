import type { LineItem, SectionId } from './balance-types';
import { computeTotal, isInvalidAmount, formatMoney } from './balance-utils';
import styles from './balance-section.module.css';

interface RowProps {
  item: LineItem;
  onRemove: (id: string) => void;
  onChangeName: (id: string, value: string) => void;
  onChangeAmount: (id: string, value: string) => void;
}

function LineItemRow({ item, onRemove, onChangeName, onChangeAmount }: RowProps) {
  const invalid = isInvalidAmount(item.amount);
  return (
    <li className={styles.item}>
      <input
        className={styles.nameInput}
        type="text"
        value={item.name}
        onChange={(e) => onChangeName(item.id, e.target.value)}
        aria-label="Account name"
      />
      <input
        className={invalid ? `${styles.amountInput} ${styles.invalid}` : styles.amountInput}
        type="text"
        value={item.amount}
        onChange={(e) => onChangeAmount(item.id, e.target.value)}
        aria-label="Amount"
      />
      {invalid && (
        <span className={styles.invalidMsg} role="alert">
          Needs a number
        </span>
      )}
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
      >
        ×
      </button>
    </li>
  );
}

interface BalanceSectionProps {
  sectionId: SectionId;
  title: string;
  items: LineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChangeName: (id: string, value: string) => void;
  onChangeAmount: (id: string, value: string) => void;
}

/** A labelled balance sheet section with editable line items and a running subtotal. */
export default function BalanceSection({
  sectionId,
  title,
  items,
  onAdd,
  onRemove,
  onChangeName,
  onChangeAmount,
}: BalanceSectionProps) {
  const total = computeTotal(items);
  return (
    <div className={styles.section} data-testid={`section-${sectionId}`}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <LineItemRow
            key={item.id}
            item={item}
            onRemove={onRemove}
            onChangeName={onChangeName}
            onChangeAmount={onChangeAmount}
          />
        ))}
      </ul>
      <p className={styles.subtotal}>Subtotal: {formatMoney(total)}</p>
      <button className={styles.addBtn} onClick={onAdd}>
        + Add line
      </button>
    </div>
  );
}
