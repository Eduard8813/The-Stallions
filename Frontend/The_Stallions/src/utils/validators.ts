export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isEmpty(value: string): boolean {
  return value == null || value.trim().length === 0;
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_.]{3,20}$/.test(username);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[0-9()\-\s]{7,20}$/.test(phone);
}

export function validateBirthDate(date: string): boolean {
  return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(date);
}

export function validateTotpCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
