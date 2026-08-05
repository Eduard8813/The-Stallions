export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isEmpty(value: string): boolean {
  return value == null || value.trim().length === 0;
}
