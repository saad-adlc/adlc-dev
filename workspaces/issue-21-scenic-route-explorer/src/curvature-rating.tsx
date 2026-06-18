import styles from './curvature-rating.module.css';

interface CurvatureRatingProps {
  /** Rating value from 1 to 5. */
  rating: number;
  /** Maximum stars to render (default 5). */
  max?: number;
}

/** Renders a star row representing the curvature (twisties) rating of a route. */
export default function CurvatureRating({ rating, max = 5 }: CurvatureRatingProps) {
  return (
    <span className={styles.rating} aria-label={`Curvature: ${rating} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? styles.filled : styles.empty}>
          ★
        </span>
      ))}
    </span>
  );
}
