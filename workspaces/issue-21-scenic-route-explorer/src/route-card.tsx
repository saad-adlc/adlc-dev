import { Route } from './types';
import RouteMap from './route-map';
import CurvatureRating from './curvature-rating';
import ReactionBar from './reaction-bar';
import styles from './route-card.module.css';

interface RouteCardProps {
  route: Route;
  onClick: () => void;
}

/** Feed card showing route summary, thumbnail map, and emoji reactions. */
export default function RouteCard({ route, onClick }: RouteCardProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') onClick();
  }

  return (
    <article
      className={styles.card}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${route.name}`}
    >
      <div className={styles.thumbnail}>
        <RouteMap waypoints={route.waypoints} variant="thumbnail" />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{route.name}</h3>
        <p className={styles.meta}>{route.region} · {route.roadType}</p>
        <p className={styles.stats}>{route.distance} mi · {route.driveTime}</p>
        <CurvatureRating rating={route.curvatureRating} />
        <div className={styles.reactions} onClick={e => e.stopPropagation()}>
          <ReactionBar routeId={route.id} />
        </div>
      </div>
    </article>
  );
}
