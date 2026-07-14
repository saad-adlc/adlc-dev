import { useState } from 'react';
import { Route, RoadType, DistanceFilter, DISTANCE_LABELS } from './types';
import { filterRoutes, getRegions } from './route-filtering';
import RouteCard from './route-card';
import styles from './route-feed.module.css';

const ROAD_TYPES: RoadType[] = ['Paved', 'Gravel', 'Mixed'];
const DISTANCE_FILTERS: DistanceFilter[] = ['all', 'short', 'medium', 'long'];

interface RouteFeedProps {
  routes: Route[];
  onSelectRoute: (id: string) => void;
}

/** Feed view with search bar, region/distance/road-type filters, and route cards. */
export default function RouteFeed({ routes, onSelectRoute }: RouteFeedProps) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [roadTypeFilters, setRoadTypeFilters] = useState<RoadType[]>([]);

  const regions = getRegions(routes);
  const filtered = filterRoutes(routes, search, region, distanceFilter, roadTypeFilters);

  function toggleRoadType(rt: RoadType) {
    setRoadTypeFilters(prev =>
      prev.includes(rt) ? prev.filter(t => t !== rt) : [...prev, rt],
    );
  }

  return (
    <div className={styles.feed}>
      <div className={styles.searchRow}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search routes by name or region…"
          className={styles.searchInput}
          aria-label="Search routes"
        />
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className={styles.regionSelect}
          aria-label="Filter by region"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className={styles.filterRow}>
        {DISTANCE_FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.chip} ${distanceFilter === f ? styles.chipActive : ''}`}
            onClick={() => setDistanceFilter(f)}
            aria-pressed={distanceFilter === f}
          >
            {DISTANCE_LABELS[f]}
          </button>
        ))}
        {ROAD_TYPES.map(rt => (
          <button
            key={rt}
            className={`${styles.chip} ${roadTypeFilters.includes(rt) ? styles.chipActive : ''}`}
            onClick={() => toggleRoadType(rt)}
            aria-pressed={roadTypeFilters.includes(rt)}
          >
            {rt}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        Routes · {filtered.length} of {routes.length}
      </p>

      <div className={styles.list}>
        {filtered.map(route => (
          <RouteCard
            key={route.id}
            route={route}
            onClick={() => onSelectRoute(route.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className={styles.noResults}>No routes match your filters.</p>
        )}
      </div>
    </div>
  );
}
