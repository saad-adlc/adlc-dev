import type { Route } from './types';
import { useApp } from './app-context';
import RouteMap from './route-map';
import CurvatureRating from './curvature-rating';
import ReactionBar from './reaction-bar';
import CommentSection from './comment-section';
import SubmitRouteForm from './submit-route-form';
import styles from './route-detail.module.css';

interface RouteDetailProps {
  route: Route;
}

/** Back button and detail view header. */
function DetailHeader({ route, onBack }: { route: Route; onBack: () => void }) {
  return (
    <div className={styles.header}>
      <button type="button" onClick={onBack} className={styles.backBtn} aria-label="Back to feed">
        ← Back
      </button>
      <h2 className={styles.title}>{route.name}</h2>
    </div>
  );
}

/** Directions block: start, steps, end. */
function DirectionsBlock({ route }: { route: Route }) {
  return (
    <div className={styles.directions}>
      <h3 className={styles.sectionHeading}>Directions</h3>
      <p className={styles.startEnd}>
        <strong>Start:</strong> {route.startPoint}
      </p>
      <ol className={styles.stepList}>
        {route.directions.map((step, i) => (
          <li key={i} className={styles.step}>{step}</li>
        ))}
      </ol>
      <p className={styles.startEnd}>
        <strong>End:</strong> {route.endPoint}
      </p>
    </div>
  );
}

/** Attribute chips row. */
function AttributeChips({ route }: { route: Route }) {
  return (
    <div className={styles.chips}>
      <span className={styles.chip}>
        <CurvatureRating rating={route.curvatureRating} /> Curvature
      </span>
      <span className={styles.chip}>{route.roadType}</span>
      <span className={styles.chip}>Best: {route.bestSeason}</span>
    </div>
  );
}

/** Full route detail view with map, directions, reactions, comments, and submit form. */
export default function RouteDetail({ route }: RouteDetailProps) {
  const { selectRoute, state, setShowSubmitForm } = useApp();

  return (
    <div className={styles.detail}>
      <DetailHeader route={route} onBack={() => selectRoute(null)} />

      <div className={styles.mapWrapper}>
        <RouteMap waypoints={route.waypoints} variant="detail" />
      </div>

      <div className={styles.body}>
        <p className={styles.highlights}>{route.highlights}</p>
        <p className={styles.stats}>
          {route.distance} mi · {route.driveTime} · {route.region}
        </p>

        <AttributeChips route={route} />

        <DirectionsBlock route={route} />

        <div className={styles.reactions}>
          <ReactionBar routeId={route.id} />
        </div>

        <hr className={styles.divider} />

        <CommentSection routeId={route.id} />

        <hr className={styles.divider} />

        {state.showSubmitForm ? (
          <SubmitRouteForm />
        ) : (
          <button type="button" className={styles.openForm} onClick={() => setShowSubmitForm(true)}>
            + Submit a Route
          </button>
        )}
      </div>
    </div>
  );
}
