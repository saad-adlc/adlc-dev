import { greeting } from './greeting';
import HelloWorld from './hello-world';

/** App — root component. */
export default function App() {
  return (
    <>
      <h1>{greeting('ADLC')}</h1>
      <HelloWorld />
    </>
  );
}
