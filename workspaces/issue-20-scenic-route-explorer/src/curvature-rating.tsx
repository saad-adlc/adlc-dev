import styles from './curvature-rating.module.css';

interface CurvatureRatingProps {
  rating: number;
  max?: number;
}

/** Displays a curvature rating as filled and empty twisty stars. */
export default function CurvatureRating({ rating, max = 5 }: CurvatureRatingProps) {
  return (
    <span className={styles.rating} aria-label={`Curvature rating: ${rating} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? styles.filled : styles.empty} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}
