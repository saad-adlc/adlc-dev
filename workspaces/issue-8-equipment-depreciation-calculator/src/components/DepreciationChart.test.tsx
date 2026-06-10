import { render, screen } from '@testing-library/react';
import DepreciationChart from './DepreciationChart';
import { DepreciationRow } from '../utils/depreciation';

const MOCK_SCHEDULE: DepreciationRow[] = [
  { year: 1, annualDepreciation: 2000, accumulatedDepreciation: 2000, bookValue: 8000 },
  { year: 2, annualDepreciation: 2000, accumulatedDepreciation: 4000, bookValue: 6000 },
  { year: 3, annualDepreciation: 2000, accumulatedDepreciation: 6000, bookValue: 4000 },
];

const COST = 10000;

describe('DepreciationChart', () => {
  it('renders an SVG with accessible img role and label', () => {
    render(<DepreciationChart schedule={MOCK_SCHEDULE} cost={COST} />);
    expect(
      screen.getByRole('img', { name: /bar chart of book value over time/i }),
    ).toBeInTheDocument();
  });

  it('renders the section title', () => {
    render(<DepreciationChart schedule={MOCK_SCHEDULE} cost={COST} />);
    expect(screen.getByText('Book Value Over Time')).toBeInTheDocument();
  });

  it('renders one labeled group per schedule row', () => {
    render(<DepreciationChart schedule={MOCK_SCHEDULE} cost={COST} />);
    expect(screen.getAllByRole('group')).toHaveLength(MOCK_SCHEDULE.length);
  });

  it('renders year labels for every bar', () => {
    render(<DepreciationChart schedule={MOCK_SCHEDULE} cost={COST} />);
    MOCK_SCHEDULE.forEach(row => {
      expect(screen.getByText(String(row.year))).toBeInTheDocument();
    });
  });

  it('renders one rect per schedule row', () => {
    const { container } = render(
      <DepreciationChart schedule={MOCK_SCHEDULE} cost={COST} />,
    );
    expect(container.querySelectorAll('rect')).toHaveLength(MOCK_SCHEDULE.length);
  });

  it('renders without error when schedule has a single entry', () => {
    const single: DepreciationRow[] = [
      { year: 1, annualDepreciation: 4500, accumulatedDepreciation: 4500, bookValue: 500 },
    ];
    render(<DepreciationChart schedule={single} cost={5000} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders bars with zero height when book value is 0', () => {
    const zeroSchedule: DepreciationRow[] = [
      { year: 1, annualDepreciation: 10000, accumulatedDepreciation: 10000, bookValue: 0 },
    ];
    const { container } = render(
      <DepreciationChart schedule={zeroSchedule} cost={10000} />,
    );
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(rect?.getAttribute('height')).toBe('0');
  });
});
