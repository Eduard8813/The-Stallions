/**
 * Minimal pub/sub used to signal cross-cutting auth events
 * (session expired, logged out) without coupling services to the router.
 */

export const EVENTS = {
  sessionExpired: 'session:expired',
  loggedOut: 'auth:logged-out',
  fotoSubida: 'foto:subida',
} as const;

type Listener = (payload?: unknown) => void;

const listeners = new Map<string, Set<Listener>>();

export const events = {
  on(event: string, listener: Listener): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(listener);
    return () => events.off(event, listener);
  },
  off(event: string, listener: Listener): void {
    listeners.get(event)?.delete(listener);
  },
  emit(event: string, payload?: unknown): void {
    listeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // A listener must never break the rest of the app.
      }
    });
  },
};
