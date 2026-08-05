const SERVER_ERRORS = [500, 502, 503, 504];

export function getAuthErrorMessage(
  error: any,
  t: any,
  fallback: string,
  credentials?: boolean
): string {
  if (!error || !error.response) return t.errorNetwork;
  const { status, data } = error.response;
  const serverMessage = data?.message;
  if (SERVER_ERRORS.includes(status)) return t.errorServer;
  if (status === 401 || status === 404) {
    return credentials ? t.errorCredentials : serverMessage || fallback;
  }
  if (status === 409) return t.errorEmailTaken;
  if (status === 400 || status === 422) return serverMessage || t.errorInvalidData;
  return serverMessage || fallback;
}
