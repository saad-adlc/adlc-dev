import { useState } from 'react';
import { Route } from './types';
import RouteMap from './route-map';
import CurvatureRating from './curvature-rating';
import ReactionBar from './reaction-bar';
import CommentSection from './comment-section';
import styles from './route-detail.module.css';

interface RouteDetailProps {
  route: Route;
  onBack: () => void;
  onShowSubmitForm: () => void;
}

/** Full detail view for a route: map, directions, reactions, comments, and a submit-route prompt. */
export default function RouteDetail({ route, onBack, onShowSubmitForm }: RouteDetailProps) {
  const [directionsExpanded, setDirectionsExpanded] = useState(true);

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.back} aria-label="Back to routes">
        ← Back to Routes
      </button>

      <h2 className={styles.title}>{route.name}</h2>

      <div className={styles.mapContainer}>
        <RouteMap waypoints={route.waypoints} variant="detail" />
      </div>

      <div className={styles.chips}>
        <span className={styles.chip}>
          <CurvatureRating rating={route.curvatureRating} />
          <span className={styles.chipLabel}>Curvature</span>
        </span>
        <span className={styles.chip}>{route.roadType}</span>
        <span className={styles.chip}>{route.bestSeason}</span>
      </div>

      {route.highlights && (
        <p className={styles.highlights}>{route.highlights}</p>
      )}

      {route.directions.length > 0 && (
        <div className={styles.directions}>
          <button
            className={styles.directionsToggle}
            onClick={() => setDirectionsExpanded(e => !e)}
            aria-expanded={directionsExpanded}
          >
            {directionsExpanded ? '▲' : '▼'} Directions
          </button>
          {directionsExpanded && (
            <div className={styles.directionsBody}>
              {route.startPoint && <p className={styles.endpoint}>Start: {route.startPoint}</p>}
              <ol className={styles.steps}>
                {route.directions.map((step, i) => (
                  <li key={i} className={styles.step}>{step}</li>
                ))}
              </ol>
              {route.endPoint && <p className={styles.endpoint}>End: {route.endPoint}</p>}
            </div>
          )}
        </div>
      )}

      <hr className={styles.divider} />

      <ReactionBar routeId={route.id} />

      <hr className={styles.divider} />

      <CommentSection routeId={route.id} />

      <hr className={styles.divider} />

      <div className={styles.submitSection}>
        <p className={styles.submitPrompt}>Know a great scenic route?</p>
        <button onClick={onShowSubmitForm} className={styles.submitBtn}>
          Submit Your Route
        </button>
      </div>
    </div>
  );
}
