import type { Expense } from './types';

const CSV_HEADERS = ['Date', 'Category', 'Amount', 'Notes'];

/** Convert a single expense row to a CSV line. */
function expenseToRow(expense: Expense): string {
  const cells = [
    expense.date,
    `"${expense.category.replace(/"/g, '""')}"`,
    expense.amount.toFixed(2),
    `"${expense.notes.replace(/"/g, '""')}"`,
  ];
  return cells.join(',');
}

/** Build CSV string from a list of expenses. */
export function buildCsv(expenses: Expense[]): string {
  const lines = [CSV_HEADERS.join(','), ...expenses.map(expenseToRow)];
  return lines.join('\n');
}

/** Trigger a browser file download of the filtered expenses. */
export function downloadCsv(expenses: Expense[], filename = 'expenses.csv'): void {
  const content = buildCsv(expenses);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
