import { monthLabel } from '../utils';
import styles from './header-bar.module.css';

interface HeaderBarProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Compact wallet SVG icon for the app title. */
function WalletIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={styles.walletIcon}
    >
      <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 11h20" stroke="currentColor" strokeWidth="2" />
      <rect x="15" y="14" width="5" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

/** App header with title and month navigation controls. */
export default function HeaderBar({ year, month, onPrev, onNext }: HeaderBarProps) {
  const label = monthLabel(year, month);

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <WalletIcon />
        <span>Income &amp; Expense Tracker</span>
      </div>
      <nav className={styles.nav} aria-label="Month navigation">
        <button className={styles.navBtn} onClick={onPrev} aria-label="Previous month">
          &#8249;
        </button>
        <span className={styles.monthLabel}>{label}</span>
        <button className={styles.navBtn} onClick={onNext} aria-label="Next month">
          &#8250;
        </button>
      </nav>
    </header>
  );
}
