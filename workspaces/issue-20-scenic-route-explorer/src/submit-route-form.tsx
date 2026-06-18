import { useState } from 'react';
import type { Route, RoadType } from './types';
import { useApp } from './app-context';
import styles from './submit-route-form.module.css';

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

const BLANK: FormState = {
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

/** Build synthetic waypoints so submitted routes appear on the map. */
function syntheticWaypoints(count = 4) {
  const base = { lat: 40 + Math.random() * 10, lng: -100 + Math.random() * 50 };
  return Array.from({ length: count }, (_, i) => ({
    lat: base.lat + i * 0.1,
    lng: base.lng + i * 0.15,
  }));
}

/** Expandable route-submission form. */
export default function SubmitRouteForm() {
  const { addRoute, setShowSubmitForm } = useApp();
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.region.trim()) next.region = 'Required';
    const dist = Number(form.distance);
    if (!form.distance || isNaN(dist) || dist <= 0) next.distance = 'Must be a positive number';
    if (!form.driveTime.trim()) next.driveTime = 'Required';
    if (!form.startPoint.trim()) next.startPoint = 'Required';
    if (!form.endPoint.trim()) next.endPoint = 'Required';
    if (!form.highlights.trim()) next.highlights = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const route: Route = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      region: form.region.trim(),
      roadType: form.roadType,
      distance: Number(form.distance),
      driveTime: form.driveTime.trim(),
      curvatureRating: Number(form.curvatureRating),
      startPoint: form.startPoint.trim(),
      endPoint: form.endPoint.trim(),
      highlights: form.highlights.trim(),
      directions: [`Start at ${form.startPoint.trim()}`, `End at ${form.endPoint.trim()}`],
      waypoints: syntheticWaypoints(),
      bestSeason: 'Year-round',
    };
    addRoute(route);
    setForm(BLANK);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowSubmitForm(false);
    }, 1500);
  }

  if (submitted) {
    return <p className={styles.success}>Route submitted! Thank you.</p>;
  }

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
      <h2 className={styles.heading}>Submit a Route</h2>
      <div className={styles.grid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="sr-name">Route Name</label>
          <input id="sr-name" value={form.name} onChange={(e) => set('name', e.target.value)}
            className={styles.input} placeholder="e.g. Pacific Coast Highway" />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sr-region">Region</label>
          <input id="sr-region" value={form.region} onChange={(e) => set('region', e.target.value)}
            className={styles.input} placeholder="e.g. California, USA" />
          {errors.region && <span className={styles.error}>{errors.region}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sr-road-type">Road Type</label>
          <select id="sr-road-type" value={form.roadType}
            onChange={(e) => set('roadType', e.target.value as RoadType)} className={styles.input}>
            <option>Paved</option>
            <option>Gravel</option>
            <option>Mixed</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sr-distance">Distance (miles)</label>
          <input id="sr-distance" type="number" min="1" value={form.distance}
            onChange={(e) => set('distance', e.target.value)} className={styles.input} />
          {errors.distance && <span className={styles.error}>{errors.distance}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sr-drive-time">Drive Time</label>
          <input id="sr-drive-time" value={form.driveTime}
            onChange={(e) => set('driveTime', e.target.value)} className={styles.input}
            placeholder="e.g. 2h 30m" />
          {errors.driveTime && <span className={styles.error}>{errors.driveTime}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sr-curvature">Curvature Rating (1–5)</label>
          <input id="sr-curvature" type="number" min="1" max="5" value={form.curvatureRating}
            onChange={(e) => set('curvatureRating', e.target.value)} className={styles.input} />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="sr-start">Start Point</label>
          <input id="sr-start" value={form.startPoint}
            onChange={(e) => set('startPoint', e.target.value)} className={styles.input} />
          {errors.startPoint && <span className={styles.error}>{errors.startPoint}</span>}
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="sr-end">End Point</label>
          <input id="sr-end" value={form.endPoint}
            onChange={(e) => set('endPoint', e.target.value)} className={styles.input} />
          {errors.endPoint && <span className={styles.error}>{errors.endPoint}</span>}
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="sr-highlights">Highlights</label>
          <textarea id="sr-highlights" value={form.highlights} rows={3}
            onChange={(e) => set('highlights', e.target.value)} className={styles.textarea}
            placeholder="What makes this route special?" />
          {errors.highlights && <span className={styles.error}>{errors.highlights}</span>}
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cancel}
          onClick={() => setShowSubmitForm(false)}>Cancel</button>
        <button type="button" className={styles.submit} onClick={handleSubmit}>
          Submit Route
        </button>
      </div>
    </form>
  );
}
