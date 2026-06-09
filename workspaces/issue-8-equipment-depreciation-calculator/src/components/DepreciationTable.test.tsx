import { render, screen } from '@testing-library/react';
import DepreciationTable from './DepreciationTable';
import { DepreciationRow } from '../utils/depreciation';

const MOCK_SCHEDULE: DepreciationRow[] = [
  { year: 1, annualDepreciation: 1800, accumulatedDepreciation: 1800, bookValue: 8200 },
  { year: 2, annualDepreciation: 1800, accumulatedDepreciation: 3600, bookValue: 6400 },
  { year: 3, annualDepreciation: 1800, accumulatedDepreciation: 5400, bookValue: 4600 },
];

describe('DepreciationTable', () => {
  it('renders all four column headers', () => {
    render(<DepreciationTable schedule={MOCK_SCHEDULE} />);
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Annual Depreciation')).toBeInTheDocument();
    expect(screen.getByText('Accumulated Depreciation')).toBeInTheDocument();
    expect(screen.getByText('Book Value')).toBeInTheDocument();
  });

  it('renders one header row plus one data row per schedule entry', () => {
    render(<DepreciationTable schedule={MOCK_SCHEDULE} />);
    expect(screen.getAllByRole('row')).toHaveLength(MOCK_SCHEDULE.length + 1);
  });

  it('renders year numbers in sequence', () => {
    render(<DepreciationTable schedule={MOCK_SCHEDULE} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders book values with dollar prefix and two decimals', () => {
    render(<DepreciationTable schedule={MOCK_SCHEDULE} />);
    expect(screen.getByText('$8200.00')).toBeInTheDocument();
    expect(screen.getByText('$6400.00')).toBeInTheDocument();
    expect(screen.getByText('$4600.00')).toBeInTheDocument();
  });

  it('renders accumulated depreciation values', () => {
    render(<DepreciationTable schedule={MOCK_SCHEDULE} />);
    expect(screen.getByText('$3600.00')).toBeInTheDocument();
    expect(screen.getByText('$5400.00')).toBeInTheDocument();
  });

  it('renders only the header row when schedule is empty', () => {
    render(<DepreciationTable schedule={[]} />);
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('renders a single row schedule correctly', () => {
    const single: DepreciationRow[] = [
      { year: 1, annualDepreciation: 4500, accumulatedDepreciation: 4500, bookValue: 500 },
    ];
    render(<DepreciationTable schedule={single} />);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getAllByText('$4500.00')).toHaveLength(2);
  });
});
