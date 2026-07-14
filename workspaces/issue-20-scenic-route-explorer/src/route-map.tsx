import type { Waypoint } from './types';
import styles from './route-map.module.css';

interface RouteMapProps {
  waypoints: Waypoint[];
  variant: 'thumbnail' | 'detail';
}

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Compute lat/lng bounding box with padding. */
function computeBounds(waypoints: Waypoint[]): Bounds {
  const PADDING = 0.05;
  const lats = waypoints.map((w) => w.lat);
  const lngs = waypoints.map((w) => w.lng);
  return {
    minLat: Math.min(...lats) - PADDING,
    maxLat: Math.max(...lats) + PADDING,
    minLng: Math.min(...lngs) - PADDING,
    maxLng: Math.max(...lngs) + PADDING,
  };
}

/** Project a waypoint to SVG pixel coordinates. */
export function projectPoint(
  w: Waypoint,
  bounds: Bounds,
  width: number,
  height: number,
): [number, number] {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const x = ((w.lng - bounds.minLng) / lngRange) * width;
  const y = ((bounds.maxLat - w.lat) / latRange) * height;
  return [x, y];
}

/** Build an SVG points string from waypoints. */
function buildPolylinePoints(
  waypoints: Waypoint[],
  bounds: Bounds,
  width: number,
  height: number,
): string {
  return waypoints
    .map((w) => projectPoint(w, bounds, width, height).join(','))
    .join(' ');
}

/** SVG map rendering route waypoints as a polyline. Thumbnail (60×70) or detail variant. */
export default function RouteMap({ waypoints, variant }: RouteMapProps) {
  if (waypoints.length < 2) return null;

  const isDetail = variant === 'detail';
  const width = isDetail ? 600 : 60;
  const height = isDetail ? 200 : 70;
  const bounds = computeBounds(waypoints);
  const points = buildPolylinePoints(waypoints, bounds, width, height);
  const [sx, sy] = projectPoint(waypoints[0], bounds, width, height);
  const [ex, ey] = projectPoint(waypoints[waypoints.length - 1], bounds, width, height);
  const dotR = isDetail ? 6 : 4;
  const strokeW = isDetail ? 3 : 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={isDetail ? styles.detail : styles.thumbnail}
      aria-label="Route map"
      role="img"
    >
      {isDetail && (
        <rect width={width} height={height} className={styles.mapBg} />
      )}
      {isDetail && (
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className={styles.gridLine}
          />
        </pattern>
      )}
      {isDetail && <rect width={width} height={height} fill="url(#grid)" />}
      <polyline
        points={points}
        fill="none"
        className={isDetail ? styles.pathDetail : styles.pathThumb}
        strokeWidth={strokeW}
        strokeDasharray={isDetail ? '8 4' : undefined}
      />
      <circle cx={sx} cy={sy} r={dotR} className={styles.startDot} />
      <circle cx={ex} cy={ey} r={dotR} className={styles.endDot} />
    </svg>
  );
}
