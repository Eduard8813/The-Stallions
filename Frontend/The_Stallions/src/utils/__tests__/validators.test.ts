import { describe, expect, it } from '@jest/globals';
import { isEmpty, validateBirthDate, validateEmail, validatePhone, validateTotpCode, validateUsername } from '../validators';

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

describe('validateUsername', () => {
  it('acepta nombres de usuario válidos', () => {
    expect(validateUsername('eduard')).toBe(true);
    expect(validateUsername('eduard_88')).toBe(true);
    expect(validateUsername('a.b_c')).toBe(true);
  });

  it('rechaza nombres de usuario inválidos', () => {
    expect(validateUsername('ab')).toBe(false);
    expect(validateUsername('nombre-con-guiones')).toBe(false);
    expect(validateUsername('nombre demasiado largo para el limite')).toBe(false);
    expect(validateUsername('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('acepta teléfonos válidos', () => {
    expect(validatePhone('88889999')).toBe(true);
    expect(validatePhone('+505 8888-9999')).toBe(true);
    expect(validatePhone('(505) 8888 9999')).toBe(true);
  });

  it('rechaza teléfonos inválidos', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('ab')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('validateBirthDate', () => {
  it('acepta fechas con formato DD/MM/AAAA', () => {
    expect(validateBirthDate('01/01/1990')).toBe(true);
    expect(validateBirthDate('31/12/2000')).toBe(true);
  });

  it('rechaza fechas mal formadas', () => {
    expect(validateBirthDate('1/1/1990')).toBe(false);
    expect(validateBirthDate('13/13/1990')).toBe(false);
    expect(validateBirthDate('1990-01-01')).toBe(false);
    expect(validateBirthDate('')).toBe(false);
  });
});

describe('validateTotpCode', () => {
  it('acepta códigos de 6 dígitos', () => {
    expect(validateTotpCode('123456')).toBe(true);
    expect(validateTotpCode('000000')).toBe(true);
  });

  it('rechaza códigos inválidos', () => {
    expect(validateTotpCode('12345')).toBe(false);
    expect(validateTotpCode('1234567')).toBe(false);
    expect(validateTotpCode('1234ab')).toBe(false);
    expect(validateTotpCode('')).toBe(false);
  });
});