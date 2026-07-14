import SalaryCalculator from './components/salary-calculator';
import styles from './App.module.css';

/** App root — mounts the Canadian take-home salary calculator. */
export default function App() {
  return (
    <div className={styles.app}>
      <SalaryCalculator />
    </div>
  );
}
