import { useApp } from './app-context';
import { filterRoutes } from './filter-routes';
import RouteFilters from './route-filters';
import RouteCard from './route-card';
import styles from './route-feed.module.css';

/** Main feed view — filters + route card list. */
export default function RouteFeed() {
  const { state, setShowSubmitForm } = useApp();
  const { routes, searchQuery, regionFilter, distanceFilter, roadTypeFilter } = state;

  const visible = filterRoutes(routes, searchQuery, regionFilter, distanceFilter, roadTypeFilter);

  return (
    <div className={styles.feed}>
      <RouteFilters />

      <div className={styles.countRow}>
        <span className={styles.count}>
          Routes · {visible.length} of {routes.length}
        </span>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => setShowSubmitForm(true)}
        >
          + Submit a Route
        </button>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No routes match your filters.</p>
      ) : (
        <ul className={styles.list} aria-label="Route list">
          {visible.map((route) => (
            <li key={route.id}>
              <RouteCard route={route} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
