import { describe, expect, it } from '@jest/globals';
import { isEmpty, validateEmail } from '../validators';

describe('validateEmail', () => {
  it('acepta correos válidos', () => {
    expect(validateEmail('usuario@example.com')).toBe(true);
    expect(validateEmail('eduard.mora@gmail.com')).toBe(true);
  });

  it('rechaza correos inválidos', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('sin-arroba')).toBe(false);
    expect(validateEmail('a@b')).toBe(false);
    expect(validateEmail('hola@ mundo.com')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('detecta valores vacíos', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('detecta valores con contenido', () => {
    expect(isEmpty('hola')).toBe(false);
  });
});