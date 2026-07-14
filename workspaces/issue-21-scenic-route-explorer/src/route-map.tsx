import { Waypoint } from './types';
import styles from './route-map.module.css';

interface RouteMapProps {
  waypoints: Waypoint[];
  variant: 'thumbnail' | 'detail';
}

const VIEW_W = 400;
const VIEW_H = 250;
const PADDING = 20;

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Projects a lat/lng point into SVG viewBox coordinates. */
function project(point: Waypoint, bounds: Bounds): { x: number; y: number } {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  return {
    x: PADDING + ((point.lng - bounds.minLng) / lngRange) * (VIEW_W - PADDING * 2),
    y: PADDING + ((bounds.maxLat - point.lat) / latRange) * (VIEW_H - PADDING * 2),
  };
}

/**
 * SVG-based route path visualisation. Uses an equirectangular projection
 * of pre-seeded lat/lng waypoints, scaled to fit the viewBox.
 */
export default function RouteMap({ waypoints, variant }: RouteMapProps) {
  const containerClass = `${styles.container} ${variant === 'thumbnail' ? styles.thumbnail : styles.detail}`;

  if (waypoints.length < 2) {
    return <div className={containerClass} aria-label="No route path available" />;
  }

  const lats = waypoints.map(w => w.lat);
  const lngs = waypoints.map(w => w.lng);
  const bounds: Bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };

  const projected = waypoints.map(wp => project(wp, bounds));
  const polylinePoints = projected.map(p => `${p.x},${p.y}`).join(' ');
  const start = projected[0];
  const end = projected[projected.length - 1];

  return (
    <div className={containerClass}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        className={styles.svg}
        role="img"
        aria-label="Route map"
      >
        <rect width={VIEW_W} height={VIEW_H} className={styles.background} />
        <polyline points={polylinePoints} className={styles.path} />
        <circle cx={start.x} cy={start.y} r={8} className={styles.startDot} />
        <circle cx={end.x} cy={end.y} r={8} className={styles.endDot} />
      </svg>
    </div>
  );
}
