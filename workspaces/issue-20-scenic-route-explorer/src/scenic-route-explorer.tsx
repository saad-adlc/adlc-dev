import { AppProvider, useApp } from './app-context';
import RouteFeed from './route-feed';
import RouteDetail from './route-detail';
import SubmitRouteForm from './submit-route-form';
import styles from './scenic-route-explorer.module.css';

/** Inner shell — reads selected route and renders feed or detail. */
function Shell() {
  const { state } = useApp();
  const selectedRoute = state.routes.find((r) => r.id === state.selectedRouteId) ?? null;

  return (
    <div className={styles.shell}>
      <header className={styles.appHeader}>
        <h1 className={styles.appTitle}>🗺️ Scenic Route Explorer</h1>
      </header>

      <main className={styles.main}>
        {selectedRoute ? (
          <RouteDetail route={selectedRoute} />
        ) : state.showSubmitForm ? (
          <div className={styles.formWrapper}>
            <SubmitRouteForm />
          </div>
        ) : (
          <RouteFeed />
        )}
      </main>
    </div>
  );
}

/** Root component — wraps app with global provider. */
export default function ScenicRouteExplorer() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
