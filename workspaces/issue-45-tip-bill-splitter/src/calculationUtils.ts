export interface TipResult {
  tipAmount: number;
  grandTotal: number;
  perPerson: number | null;
}

export function calculateTip(bill: number, tipPercent: number, people: number): TipResult {
  const safeBill = Math.max(0, bill);
  const tipAmount = safeBill * (tipPercent / 100);
  const grandTotal = safeBill + tipAmount;
  const perPerson = people > 0 ? grandTotal / people : null;
  return { tipAmount, grandTotal, perPerson };
}
