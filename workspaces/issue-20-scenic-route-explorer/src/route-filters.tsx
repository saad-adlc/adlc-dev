import type { DistanceFilter, RoadType } from './types';
import { useApp } from './app-context';
import { getRegions } from './filter-routes';
import styles from './route-filters.module.css';

const ROAD_TYPES: RoadType[] = ['Paved', 'Gravel', 'Mixed'];
const DISTANCE_OPTIONS: { label: string; value: DistanceFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Short <50 mi', value: 'short' },
  { label: 'Medium 50–150 mi', value: 'medium' },
  { label: 'Long 150+ mi', value: 'long' },
];

/** Search bar, region dropdown, distance chips, and road-type chips. */
export default function RouteFilters() {
  const {
    state,
    setSearchQuery,
    setRegionFilter,
    setDistanceFilter,
    toggleRoadTypeFilter,
  } = useApp();

  const regions = getRegions(state.routes);

  return (
    <div className={styles.filters}>
      <div className={styles.topRow}>
        <input
          type="search"
          placeholder="Search routes by name or region…"
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Search routes"
        />
        <select
          value={state.regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className={styles.regionSelect}
          aria-label="Filter by region"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.chipRow}>
        {DISTANCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDistanceFilter(opt.value)}
            className={
              state.distanceFilter === opt.value
                ? `${styles.chip} ${styles.chipActive}`
                : styles.chip
            }
            aria-pressed={state.distanceFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
        <span className={styles.separator} aria-hidden="true" />
        {ROAD_TYPES.map((rt) => (
          <button
            key={rt}
            type="button"
            onClick={() => toggleRoadTypeFilter(rt)}
            className={
              state.roadTypeFilter.includes(rt)
                ? `${styles.chip} ${styles.chipActive}`
                : styles.chip
            }
            aria-pressed={state.roadTypeFilter.includes(rt)}
          >
            {rt}
          </button>
        ))}
      </div>
    </div>
  );
}
