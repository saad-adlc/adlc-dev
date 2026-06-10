/** Depreciation method options. */
export type DepreciationMethod = 'straight-line' | 'declining-balance';

/** User-supplied inputs for the depreciation calculator. */
export interface DepreciationInputs {
  cost: number;
  salvage: number;
  life: number;
  method: DepreciationMethod;
}

/** One row in the year-by-year depreciation schedule. */
export interface DepreciationRow {
  year: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

const DOUBLE_DECLINING_MULTIPLIER = 2;

/**
 * Validates depreciation inputs.
 * @returns An error message string, or null when all inputs are valid.
 */
export function validateInputs(
  cost: number,
  salvage: number,
  life: number,
): string | null {
  if (!isFinite(cost) || cost <= 0) return 'Asset cost must be a positive number.';
  if (!isFinite(salvage) || salvage < 0) return 'Salvage value must be a non-negative number.';
  if (salvage >= cost) return 'Salvage value must be less than asset cost.';
  if (!isFinite(life) || !Number.isInteger(life) || life <= 0) {
    return 'Useful life must be a positive whole number.';
  }
  return null;
}

/**
 * Calculates a straight-line depreciation schedule.
 * Annual depreciation = (cost − salvage) / life — equal for every year.
 */
export function calcStraightLine(
  cost: number,
  salvage: number,
  life: number,
): DepreciationRow[] {
  const annualDepreciation = (cost - salvage) / life;
  const rows: DepreciationRow[] = [];
  let accumulated = 0;

  for (let year = 1; year <= life; year++) {
    accumulated += annualDepreciation;
    rows.push({
      year,
      annualDepreciation,
      accumulatedDepreciation: accumulated,
      bookValue: cost - accumulated,
    });
  }

  return rows;
}

/**
 * Calculates a 200% declining-balance depreciation schedule.
 * Annual depreciation = bookValue × (2 / life), floored at salvage value.
 * The final year always depreciates exactly to salvage value.
 */
export function calcDecliningBalance(
  cost: number,
  salvage: number,
  life: number,
): DepreciationRow[] {
  const rate = DOUBLE_DECLINING_MULTIPLIER / life;
  const rows: DepreciationRow[] = [];
  let bookValue = cost;
  let accumulated = 0;

  for (let year = 1; year <= life; year++) {
    let annual: number;

    if (year === life) {
      annual = bookValue - salvage;
    } else {
      annual = bookValue * rate;
      if (bookValue - annual < salvage) {
        annual = bookValue - salvage;
      }
    }

    accumulated += annual;
    bookValue -= annual;

    rows.push({ year, annualDepreciation: annual, accumulatedDepreciation: accumulated, bookValue });
  }

  return rows;
}
