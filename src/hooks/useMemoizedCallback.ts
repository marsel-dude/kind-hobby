import { useCallback, useRef, useEffect } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    dependencies
  );
}