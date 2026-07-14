import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildCsv, downloadCsv } from './csv';
import type { Expense } from './types';

const mkExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: '1',
  amount: 10.5,
  category: 'Food',
  date: '2024-01-01',
  notes: '',
  ...overrides,
});

describe('buildCsv', () => {
  it('includes header row', () => {
    const csv = buildCsv([]);
    expect(csv).toContain('Date,Category,Amount,Notes');
  });

  it('formats amount to 2 decimal places', () => {
    const csv = buildCsv([mkExpense({ amount: 9.5 })]);
    expect(csv).toContain('9.50');
  });

  it('escapes double quotes in category and notes', () => {
    const csv = buildCsv([mkExpense({ category: 'Say "Hi"', notes: 'Some "notes"' })]);
    expect(csv).toContain('"Say ""Hi"""');
    expect(csv).toContain('"Some ""notes"""');
  });

  it('produces one row per expense', () => {
    const expenses = [mkExpense({ id: '1' }), mkExpense({ id: '2' })];
    const lines = buildCsv(expenses).split('\n');
    expect(lines).toHaveLength(3);
  });

  it('returns only header for empty expense list', () => {
    const lines = buildCsv([]).split('\n');
    expect(lines).toHaveLength(1);
  });

  it('includes all fields in order', () => {
    const csv = buildCsv([mkExpense({ date: '2024-06-01', category: 'Transport', amount: 25, notes: 'Bus' })]);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toBe('2024-06-01,"Transport",25.00,"Bus"');
  });
});

describe('downloadCsv', () => {
  let revokeUrl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    revokeUrl = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: revokeUrl,
    });
    const link = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('creates and clicks a download link', () => {
    downloadCsv([mkExpense()]);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(revokeUrl).toHaveBeenCalled();
  });

  it('uses provided filename', () => {
    const link = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement);
    downloadCsv([mkExpense()], 'my-export.csv');
    expect(link.download).toBe('my-export.csv');
  });
});
