import { describe, it, expect } from 'vitest';
import { calculateTip } from './calculationUtils';

describe('calculateTip', () => {
  it('SC-001: $100 @ 20% / 4 → tip=20, total=120, perPerson=30', () => {
    const r = calculateTip(100, 20, 4);
    expect(r.tipAmount).toBeCloseTo(20, 2);
    expect(r.grandTotal).toBeCloseTo(120, 2);
    expect(r.perPerson).toBeCloseTo(30, 2);
  });

  it('SC-002: $84.50 @ 18% / 3 → tip=15.21, total=99.71, perPerson=33.24', () => {
    const r = calculateTip(84.5, 18, 3);
    expect(r.tipAmount).toBeCloseTo(15.21, 2);
    expect(r.grandTotal).toBeCloseTo(99.71, 2);
    expect(r.perPerson).toBeCloseTo(33.24, 2);
  });

  it('returns null for perPerson when people is 0', () => {
    const r = calculateTip(100, 20, 0);
    expect(r.perPerson).toBeNull();
    expect(r.tipAmount).toBeCloseTo(20, 2);
    expect(r.grandTotal).toBeCloseTo(120, 2);
  });

  it('treats negative bill as $0', () => {
    const r = calculateTip(-50, 20, 2);
    expect(r.tipAmount).toBe(0);
    expect(r.grandTotal).toBe(0);
    expect(r.perPerson).toBe(0);
  });

  it('treats zero bill correctly', () => {
    const r = calculateTip(0, 18, 3);
    expect(r.tipAmount).toBe(0);
    expect(r.grandTotal).toBe(0);
    expect(r.perPerson).toBe(0);
  });

  it('handles 0% tip', () => {
    const r = calculateTip(100, 0, 4);
    expect(r.tipAmount).toBe(0);
    expect(r.grandTotal).toBeCloseTo(100, 2);
    expect(r.perPerson).toBeCloseTo(25, 2);
  });

  it('handles 15% tip', () => {
    const r = calculateTip(100, 15, 2);
    expect(r.tipAmount).toBeCloseTo(15, 2);
    expect(r.grandTotal).toBeCloseTo(115, 2);
    expect(r.perPerson).toBeCloseTo(57.5, 2);
  });
});
