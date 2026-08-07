import { EVENTS, events } from './events';
import { getAuthToken } from './token';

/**
 * Error thrown by the mock layer with the same shape a real backend would
 * return: HTTP status + message + machine-readable code.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Flags to simulate server-side scenarios while the backend does not exist.
 * Flip `sessionExpired` to true to test the expired-session flow.
 */
export const MOCK_FLAGS = {
  sessionExpired: false,
};

const MIN_DELAY_MS = 350;
const MAX_DELAY_MS = 850;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Wraps a mock handler with:
 *  - token presence check (401 -> session:expired event if missing/expired),
 *  - artificial latency,
 *  - normalisation of thrown errors to ApiError.
 *
 * When the real backend is ready, replace the `mockRequest(...)` call inside
 * each service function with the real `api` call (kept as a comment above).
 */
export async function mockRequest<T>(handler: () => T | Promise<T>): Promise<T> {
  if (MOCK_FLAGS.sessionExpired || !(await getAuthToken())) {
    events.emit(EVENTS.sessionExpired);
    throw new ApiError(401, 'Tu sesión expiró. Inicia sesión nuevamente.', 'SESSION_EXPIRED');
  }

  await sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));

  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error inesperado. Inténtalo de nuevo.', 'INTERNAL');
  }
}
