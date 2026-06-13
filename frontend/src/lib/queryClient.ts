import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiClient';

/**
 * Shared React Query client instance.
 *
 * Configured with sensible production defaults:
 * - staleTime: 30 seconds (cached data is fresh for 30s)
 * - gcTime: 5 minutes (unused data is garbage-collected after 5 mins)
 * - retry: only retries network errors, not 4xx responses
 * - refetchOnWindowFocus: true (re-validates data when tab is focused)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,           // 30 seconds
      gcTime: 5 * 60 * 1000,          // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry client errors (400-499)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      }
    },
    mutations: {
      onError: (error) => {
        // Log mutation errors globally (can be wired to a toast system)
        if (import.meta.env.DEV) {
          console.error('[Mutation Error]', error);
        }
      }
    }
  }
});

export default queryClient;
