import styles from './hello-world.module.css';

interface HelloWorldProps {
  /** Optional name to greet; defaults to "Orix ADLC". */
  name?: string;
}

/**
 * Displays a greeting heading.
 * @param props.name - Optional name to greet; defaults to "Orix ADLC".
 */
export function HelloWorld({ name = 'Orix ADLC' }: HelloWorldProps) {
  return (
    <div className={styles.container}>
      <h1>Hello, {name}</h1>
    </div>
  );
}

export default HelloWorld;
