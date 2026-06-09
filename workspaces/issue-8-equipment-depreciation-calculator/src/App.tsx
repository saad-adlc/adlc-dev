import { useState, useMemo } from 'react';
import DepreciationForm from './components/DepreciationForm';
import DepreciationTable from './components/DepreciationTable';
import DepreciationChart from './components/DepreciationChart';
import {
  DepreciationInputs,
  validateInputs,
  calcStraightLine,
  calcDecliningBalance,
} from './utils/depreciation';
import './App.css';

const INITIAL_INPUTS: DepreciationInputs = {
  cost: 10000,
  salvage: 1000,
  life: 5,
  method: 'straight-line',
};

/** Root component — holds calculator state and orchestrates layout. */
export default function App() {
  const [inputs, setInputs] = useState<DepreciationInputs>(INITIAL_INPUTS);

  const error = useMemo(
    () => validateInputs(inputs.cost, inputs.salvage, inputs.life),
    [inputs.cost, inputs.salvage, inputs.life],
  );

  const schedule = useMemo(() => {
    if (error !== null) return [];
    return inputs.method === 'straight-line'
      ? calcStraightLine(inputs.cost, inputs.salvage, inputs.life)
      : calcDecliningBalance(inputs.cost, inputs.salvage, inputs.life);
  }, [inputs.cost, inputs.salvage, inputs.life, inputs.method, error]);

  return (
    <div className="app">
      <h1 className="app-title">Equipment Depreciation Calculator</h1>
      <DepreciationForm inputs={inputs} onChange={setInputs} error={error} />
      {!error && schedule.length > 0 && (
        <>
          <DepreciationTable schedule={schedule} />
          <DepreciationChart schedule={schedule} cost={inputs.cost} />
        </>
      )}
    </div>
  );
}
