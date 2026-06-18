import type { Route } from './types';
import { useApp } from './app-context';
import RouteMap from './route-map';
import CurvatureRating from './curvature-rating';
import ReactionBar from './reaction-bar';
import styles from './route-card.module.css';

interface RouteCardProps {
  route: Route;
}

/** Feed card displaying route summary with thumbnail map and reactions. */
export default function RouteCard({ route }: RouteCardProps) {
  const { selectRoute } = useApp();

  return (
    <article
      className={styles.card}
      onClick={() => selectRoute(route.id)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${route.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') selectRoute(route.id);
      }}
    >
      <div className={styles.mapCol}>
        <RouteMap waypoints={route.waypoints} variant="thumbnail" />
      </div>
      <div className={styles.infoCol}>
        <h3 className={styles.name}>{route.name}</h3>
        <p className={styles.meta}>
          {route.region} · {route.roadType}
        </p>
        <p className={styles.stats}>
          {route.distance} mi · {route.driveTime}
        </p>
        <CurvatureRating rating={route.curvatureRating} />
        <div className={styles.reactions} onClick={(e) => e.stopPropagation()}>
          <ReactionBar routeId={route.id} />
        </div>
      </div>
    </article>
  );
}
