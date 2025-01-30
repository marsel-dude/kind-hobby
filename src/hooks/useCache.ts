import { useState, useEffect, useCallback } from 'react';
import { logger } from '../services/logger';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  backgroundSync?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version?: string;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    ttl = DEFAULT_TTL,
    staleWhileRevalidate = true,
    backgroundSync = true,
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
    retryDelay = DEFAULT_RETRY_DELAY,
    onError
  } = options;

  const getCacheKey = useCallback((key: string) => `cache_${key}`, []);

  const getCache = useCallback((key: string): CacheEntry<T> | null => {
    try {
      const cached = localStorage.getItem(getCacheKey(key));
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      logger.error('Cache read error:', err as Error);
      return null;
    }
  }, [getCacheKey]);

  const setCache = useCallback((key: string, data: T) => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: import.meta.env.VITE_APP_VERSION
      };
      localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
    } catch (err) {
      logger.error('Cache write error:', err as Error);
    }
  }, [getCacheKey]);

  const fetchWithRetry = useCallback(async (
    attempt: number = 1
  ): Promise<T> => {
    try {
      return await fetcher();
    } catch (err) {
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return fetchWithRetry(attempt + 1);
      }
      throw err;
    }
  }, [fetcher, retryAttempts, retryDelay]);

  const syncCache = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      const freshData = await fetchWithRetry();
      setCache(key, freshData);
      setData(freshData);
      setError(null);
    } catch (err) {
      const error = err as Error;
      logger.error('Cache sync error:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsSyncing(false);
    }
  }, [key, fetchWithRetry, setCache, isSyncing, onError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cached = getCache(key);

        if (cached) {
          const isStale = Date.now() - cached.timestamp > ttl;
          const isVersionMismatch = cached.version !== import.meta.env.VITE_APP_VERSION;

          if (!isStale && !isVersionMismatch) {
            setData(cached.data);
            setLoading(false);
            return;
          }

          if (staleWhileRevalidate) {
            setData(cached.data);
          }
        }

        const freshData = await fetchWithRetry();
        setCache(key, freshData);
        setData(freshData);
        setError(null);
      } catch (err) {
        const error = err as Error;
        logger.error('Cache fetch error:', error);
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up background sync if enabled
    if (backgroundSync) {
      const syncInterval = setInterval(syncCache, ttl);
      return () => clearInterval(syncInterval);
    }
  }, [key, ttl, staleWhileRevalidate, backgroundSync, getCache, setCache, syncCache, fetchWithRetry, onError]);

  return { 
    data, 
    loading, 
    error,
    isSyncing,
    refresh: syncCache
  };
}