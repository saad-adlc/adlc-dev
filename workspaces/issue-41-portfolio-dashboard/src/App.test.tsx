import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('Portfolio Dashboard', () => {
  // ── US1: Initial holdings ────────────────────────────────────────────────

  it('renders all 5 initial tickers', () => {
    render(<App />);
    for (const ticker of ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']) {
      expect(screen.getAllByText(ticker).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows correct AAPL market value and gain/loss', () => {
    render(<App />);
    // MV = 10 × 185 = 1850.00; GL$ = +350.00; GL% = +23.3%
    expect(screen.getByText('1850.00')).toBeInTheDocument();
    expect(screen.getByText('+350.00')).toBeInTheDocument();
    expect(screen.getByText('+23.3%')).toBeInTheDocument();
  });

  it('shows TSLA as a loss', () => {
    render(<App />);
    // MV = 12 × 205 = 2460.00; GL$ = −540.00; GL% = −18.0%
    expect(screen.getByText('2460.00')).toBeInTheDocument();
    expect(screen.getByText('-540.00')).toBeInTheDocument();
    expect(screen.getByText('-18.0%')).toBeInTheDocument();
  });

  it('shows correct totals row', () => {
    render(<App />);
    // totalMV=8085, totalCB=7380, totalGL=+705
    const totals = screen.getByTestId('totals-row');
    expect(within(totals).getByText('8085.00')).toBeInTheDocument();
    expect(within(totals).getByText('7380.00')).toBeInTheDocument();
    expect(within(totals).getByText('+705.00')).toBeInTheDocument();
  });

  // ── US2: Allocation chart ────────────────────────────────────────────────

  it('renders the allocation chart', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /allocation chart/i })).toBeInTheDocument();
  });

  // ── US3: Add a holding ───────────────────────────────────────────────────

  it('adds NVDA and updates totals to 10085.00', () => {
    render(<App />);
    const form = screen.getByRole('form', { name: /add holding/i });
    fireEvent.change(within(form).getByRole('textbox', { name: /ticker/i }), {
      target: { value: 'NVDA' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /shares/i }), {
      target: { value: '4' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /avg cost/i }), {
      target: { value: '400' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /current price/i }), {
      target: { value: '500' },
    });
    fireEvent.click(within(form).getByRole('button', { name: /^add$/i }));

    expect(screen.getAllByText('NVDA').length).toBeGreaterThanOrEqual(1);
    // new totalMV = 8085 + 4×500 = 10085
    expect(within(screen.getByTestId('totals-row')).getByText('10085.00')).toBeInTheDocument();
  });

  it('ignores add submission with empty ticker', () => {
    render(<App />);
    const form = screen.getByRole('form', { name: /add holding/i });
    fireEvent.click(within(form).getByRole('button', { name: /^add$/i }));
    // Still exactly 5 data rows (1 header + 5 data + 1 totals = 7 rows)
    expect(screen.getAllByRole('row')).toHaveLength(7);
  });

  // ── US4: Remove a holding ────────────────────────────────────────────────

  it('removes TSLA and updates totals', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /remove tsla/i }));

    expect(screen.queryAllByText('TSLA')).toHaveLength(0);
    // new totalMV = 8085 − 2460 = 5625
    expect(within(screen.getByTestId('totals-row')).getByText('5625.00')).toBeInTheDocument();
  });

  // ── US5: Edit current price ──────────────────────────────────────────────

  it('editing AAPL price to 200 updates row and totals', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('spinbutton', { name: /aapl current price/i }), {
      target: { value: '200' },
    });
    // AAPL new MV = 10 × 200 = 2000.00
    expect(screen.getByText('2000.00')).toBeInTheDocument();
    // new totalMV = 8085 − 1850 + 2000 = 8235
    expect(within(screen.getByTestId('totals-row')).getByText('8235.00')).toBeInTheDocument();
  });

  // ── US6: Sort ────────────────────────────────────────────────────────────

  function getDataRows() {
    const rows = screen.getAllByRole('row');
    // rows[0] = thead, rows[last] = tfoot totals → slice middle
    return rows.slice(1, rows.length - 1);
  }

  it('sorts by Gain/Loss % descending — MSFT first, TSLA last', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /gain\/loss %/i }));
    const dataRows = getDataRows();
    expect(within(dataRows[0]).getByText('MSFT')).toBeInTheDocument();
    expect(within(dataRows[dataRows.length - 1]).getByText('TSLA')).toBeInTheDocument();
  });

  it('sorts by Gain/Loss % ascending — TSLA first, MSFT last', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /gain\/loss %/i }));
    fireEvent.click(screen.getByRole('button', { name: /gain\/loss %/i }));
    const dataRows = getDataRows();
    expect(within(dataRows[0]).getByText('TSLA')).toBeInTheDocument();
    expect(within(dataRows[dataRows.length - 1]).getByText('MSFT')).toBeInTheDocument();
  });

  it('sorts by Market Value descending — TSLA first, AMZN last', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /market value/i }));
    const dataRows = getDataRows();
    // MV order desc: TSLA(2460) > MSFT(2100) > AAPL(1850) > GOOGL(1120) > AMZN(555)
    expect(within(dataRows[0]).getByText('TSLA')).toBeInTheDocument();
    expect(within(dataRows[dataRows.length - 1]).getByText('AMZN')).toBeInTheDocument();
  });

  it('covers zero cost basis branch — gain/loss % shows +0.0%', () => {
    render(<App />);
    const form = screen.getByRole('form', { name: /add holding/i });
    fireEvent.change(within(form).getByRole('textbox', { name: /ticker/i }), {
      target: { value: 'ZERO' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /shares/i }), {
      target: { value: '10' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /avg cost/i }), {
      target: { value: '0' },
    });
    fireEvent.change(within(form).getByRole('spinbutton', { name: /current price/i }), {
      target: { value: '100' },
    });
    fireEvent.click(within(form).getByRole('button', { name: /^add$/i }));
    // calcGainLossPct returns 0 when costBasis === 0
    expect(screen.getAllByText('ZERO').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+0.0%')).toBeInTheDocument();
  });
});
