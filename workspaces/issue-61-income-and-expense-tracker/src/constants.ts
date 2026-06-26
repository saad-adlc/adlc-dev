/** Pre-loaded category list shared across transactions and budgets. */
export const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Other',
] as const;

/** localStorage key for the transactions array. */
export const STORAGE_KEY_TRANSACTIONS = 'adlc-tracker-transactions';

/** localStorage key for the budgets map. */
export const STORAGE_KEY_BUDGETS = 'adlc-tracker-budgets';

/** Progress bar turns amber when spent/budget ratio reaches this value. */
export const BUDGET_AMBER_THRESHOLD = 0.85;

/** Progress bar turns red when spent/budget ratio reaches this value. */
export const BUDGET_RED_THRESHOLD = 1.0;
