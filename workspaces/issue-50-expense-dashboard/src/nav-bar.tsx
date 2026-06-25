import { NavLink } from 'react-router-dom';
import styles from './nav-bar.module.css';

/** Top navigation bar linking to Overview and Transactions routes. */
export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <NavLink
        to="/overview"
        className={({ isActive }) => isActive ? styles.active : styles.link}
      >
        Overview
      </NavLink>
      <NavLink
        to="/transactions"
        className={({ isActive }) => isActive ? styles.active : styles.link}
      >
        Transactions
      </NavLink>
    </nav>
  );
}
