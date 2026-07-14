import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MortgageAffordabilityChecker from './mortgage-affordability-checker';
import App from './App';

function fillForm(values: {
  houseValue?: string;
  downPayment?: string;
  annualIncome?: string;
  creditScore?: string;
}) {
  if (values.houseValue !== undefined) {
    fireEvent.change(screen.getByLabelText(/house value/i), {
      target: { value: values.houseValue },
    });
  }
  if (values.downPayment !== undefined) {
    fireEvent.change(screen.getByLabelText(/down payment/i), {
      target: { value: values.downPayment },
    });
  }
  if (values.annualIncome !== undefined) {
    fireEvent.change(screen.getByLabelText(/annual gross income/i), {
      target: { value: values.annualIncome },
    });
  }
  if (values.creditScore !== undefined) {
    fireEvent.change(screen.getByLabelText(/credit score/i), {
      target: { value: values.creditScore },
    });
  }
}

function submitForm() {
  fireEvent.click(screen.getByRole('button', { name: /check affordability/i }));
}

describe('MortgageAffordabilityChecker', () => {
  it('renders the page heading', () => {
    render(<MortgageAffordabilityChecker />);
    expect(screen.getByText(/mortgage affordability checker/i)).toBeInTheDocument();
  });

  it('renders all four input fields', () => {
    render(<MortgageAffordabilityChecker />);
    expect(screen.getByLabelText(/house value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/down payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual gross income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/credit score/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<MortgageAffordabilityChecker />);
    expect(screen.getByRole('button', { name: /check affordability/i })).toBeInTheDocument();
  });

  it('shows helper text for the credit score field', () => {
    render(<MortgageAffordabilityChecker />);
    expect(screen.getByText(/below 600 is automatically not eligible/i)).toBeInTheDocument();
  });

  it('hides results before the form is submitted', () => {
    render(<MortgageAffordabilityChecker />);
    expect(screen.queryByText(/approval likelihood/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/estimated monthly payment/i)).not.toBeInTheDocument();
  });

  it('shows a validation error when house value is empty', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '', downPayment: '100000', annualIncome: '120000', creditScore: '720' });
    submitForm();
    expect(screen.getByText(/house value must be greater than 0/i)).toBeInTheDocument();
    expect(screen.queryByText(/approval likelihood/i)).not.toBeInTheDocument();
  });

  it('shows a validation error when down payment equals house value', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '300000', downPayment: '300000', annualIncome: '120000', creditScore: '720' });
    submitForm();
    expect(screen.getByText(/down payment must be less than the house value/i)).toBeInTheDocument();
  });

  it('shows a validation error for credit score outside 300–900', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '950' });
    submitForm();
    expect(screen.getByText(/credit score must be between 300 and 900/i)).toBeInTheDocument();
  });

  it('shows a validation error for zero annual income', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '0', creditScore: '720' });
    submitForm();
    expect(screen.getByText(/annual gross income must be greater than 0/i)).toBeInTheDocument();
  });

  it('shows results after a valid submission', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '750' });
    submitForm();
    expect(screen.getByText(/approval likelihood/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated monthly payment/i)).toBeInTheDocument();
    expect(screen.getByText(/5% rate/i)).toBeInTheDocument();
  });

  it('shows Not eligible and 0% for credit score below 600', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '550' });
    submitForm();
    expect(screen.getByText('Not eligible')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows the explanation strip after a valid submission', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '750' });
    submitForm();
    expect(screen.getByText(/gross monthly income/i)).toBeInTheDocument();
    expect(screen.getByText(/30% target/i)).toBeInTheDocument();
  });

  it('clears errors and shows results when valid inputs follow invalid ones', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '', downPayment: '100000', annualIncome: '120000', creditScore: '720' });
    submitForm();
    expect(screen.getByText(/house value must be greater than 0/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/house value/i), { target: { value: '500000' } });
    submitForm();
    expect(screen.queryByText(/house value must be greater than 0/i)).not.toBeInTheDocument();
    expect(screen.getByText(/approval likelihood/i)).toBeInTheDocument();
  });

  it('shows Likely approved for strong inputs', () => {
    render(<MortgageAffordabilityChecker />);
    // Score 900, $200k income, $300k house, $100k down → GDS well below 30%
    fillForm({ houseValue: '300000', downPayment: '100000', annualIncome: '200000', creditScore: '900' });
    submitForm();
    expect(screen.getByText('Likely approved')).toBeInTheDocument();
  });

  it('updates results when the form is resubmitted with different inputs', () => {
    render(<MortgageAffordabilityChecker />);
    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '750' });
    submitForm();
    expect(screen.getByText(/approval likelihood/i)).toBeInTheDocument();

    fillForm({ houseValue: '500000', downPayment: '100000', annualIncome: '120000', creditScore: '550' });
    submitForm();
    expect(screen.getByText('Not eligible')).toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders the MortgageAffordabilityChecker component', () => {
    render(<App />);
    expect(screen.getByText(/mortgage affordability checker/i)).toBeInTheDocument();
  });
});
