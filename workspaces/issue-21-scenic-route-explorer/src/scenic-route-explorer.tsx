import { useState } from 'react';
import { Route } from './types';
import { getRoutes } from './storage';
import RouteFeed from './route-feed';
import RouteDetail from './route-detail';
import RouteForm from './route-form';
import styles from './scenic-route-explorer.module.css';

/** Root component for the Scenic Route Explorer SPA. */
export default function ScenicRouteExplorer() {
  const [routes, setRoutes] = useState<Route[]>(() => getRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) ?? null;

  function handleRouteSubmit(newRoute: Route) {
    setRoutes(prev => [...prev, newRoute]);
    setShowForm(false);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.appTitle}>Scenic Route Explorer</h1>
        <button
          onClick={() => setShowForm(true)}
          className={styles.submitRouteBtn}
          aria-label="Submit a new route"
        >
          + Submit Route
        </button>
      </header>

      <main className={styles.main}>
        {selectedRoute ? (
          <RouteDetail
            route={selectedRoute}
            onBack={() => setSelectedRouteId(null)}
            onShowSubmitForm={() => setShowForm(true)}
          />
        ) : (
          <RouteFeed
            routes={routes}
            onSelectRoute={id => setSelectedRouteId(id)}
          />
        )}
      </main>

      {showForm && (
        <RouteForm
          onSubmit={handleRouteSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
