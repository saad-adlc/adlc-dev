/** A single named line item in a balance sheet section. */
export interface LineItem {
  id: string;
  name: string;
  /** Raw user input — may be blank, numeric, or invalid. */
  amount: string;
}

/** The three sections of a standard balance sheet. */
export type SectionId = 'assets' | 'liabilities' | 'equity';
