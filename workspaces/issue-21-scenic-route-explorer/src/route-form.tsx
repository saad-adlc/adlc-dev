import { useState } from 'react';
import { Route, RoadType } from './types';
import { addRoute } from './storage';
import styles from './route-form.module.css';

interface RouteFormProps {
  onSubmit: (route: Route) => void;
  onClose: () => void;
}

interface FormState {
  name: string;
  region: string;
  roadType: RoadType;
  distance: string;
  driveTime: string;
  curvatureRating: string;
  startPoint: string;
  endPoint: string;
  highlights: string;
}

const INITIAL: FormState = {
  name: '',
  region: '',
  roadType: 'Paved',
  distance: '',
  driveTime: '',
  curvatureRating: '3',
  startPoint: '',
  endPoint: '',
  highlights: '',
};

/** Modal form for submitting a new scenic route to the community. */
export default function RouteForm({ onSubmit, onClose }: RouteFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dist = parseFloat(form.distance);
    const rating = parseInt(form.curvatureRating, 10);
    if (!form.name.trim()) { setError('Route name is required.'); return; }
    if (!form.region.trim()) { setError('Region is required.'); return; }
    if (isNaN(dist) || dist <= 0) { setError('Enter a valid positive distance.'); return; }
    if (isNaN(rating) || rating < 1 || rating > 5) { setError('Curvature rating must be 1–5.'); return; }

    const newRoute = addRoute({
      name: form.name.trim(),
      region: form.region.trim(),
      roadType: form.roadType,
      distance: dist,
      driveTime: form.driveTime.trim() || `${Math.ceil(dist / 45)}h`,
      curvatureRating: rating,
      startPoint: form.startPoint.trim(),
      endPoint: form.endPoint.trim(),
      highlights: form.highlights.trim(),
      waypoints: [],
      directions: [],
      bestSeason: 'Year-round',
    });
    onSubmit(newRoute);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="form-title" className={styles.title}>Submit a Route</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close form">✕</button>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="rf-name">Route Name</label>
              <input id="rf-name" type="text" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="rf-region">Region</label>
              <input id="rf-region" type="text" value={form.region} onChange={e => set('region', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="rf-roadType">Road Type</label>
              <select id="rf-roadType" value={form.roadType} onChange={e => set('roadType', e.target.value as RoadType)}>
                <option value="Paved">Paved</option>
                <option value="Gravel">Gravel</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="rf-distance">Distance (mi)</label>
              <input id="rf-distance" type="number" min="0.1" step="0.1" value={form.distance} onChange={e => set('distance', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="rf-driveTime">Drive Time</label>
              <input id="rf-driveTime" type="text" placeholder="e.g. 2h 30m" value={form.driveTime} onChange={e => set('driveTime', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="rf-curvature">Curvature (1–5)</label>
              <select id="rf-curvature" value={form.curvatureRating} onChange={e => set('curvatureRating', e.target.value)}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="rf-start">Start Point</label>
              <input id="rf-start" type="text" value={form.startPoint} onChange={e => set('startPoint', e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="rf-end">End Point</label>
              <input id="rf-end" type="text" value={form.endPoint} onChange={e => set('endPoint', e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="rf-highlights">Highlights</label>
              <textarea id="rf-highlights" rows={3} value={form.highlights} onChange={e => set('highlights', e.target.value)} />
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Submit Route</button>
          </div>
        </form>
      </div>
    </div>
  );
}
