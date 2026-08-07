import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic data-fetching hook: wraps any async function with
 * loading / success / error states plus a refetch helper.
 *
 *   const { data, loading, error, refetch } = useAsync(getProfile);
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fn()
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message ?? 'Error inesperado');
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((e: any) => {
        setError(e?.message ?? 'Error inesperado');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch, setData } as AsyncState<T> & {
    refetch: () => void;
    setData: Dispatch<SetStateAction<T | null>>;
  };
}
