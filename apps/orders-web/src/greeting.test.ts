import { greeting } from './greeting';

describe('greeting', () => {
  it('greets a named user', () => {
    expect(greeting('ADLC')).toBe('Hello, ADLC!');
  });

  it('falls back when the name is blank', () => {
    expect(greeting('   ')).toBe('Hello!');
  });
});
