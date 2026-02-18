"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Options for the useMCPQuery hook
 */
export interface UseMCPQueryOptions<TParams = Record<string, unknown>> {
  /** API endpoint to call (e.g., '/api/mcp/analyze') */
  endpoint: string;
  /** Parameters to send with the request */
  params: TParams;
  /** Whether the query should execute (default: true) */
  enabled?: boolean;
  /** Whether to refetch when params change (default: true) */
  refetchOnParamsChange?: boolean;
}

/**
 * Result returned by the useMCPQuery hook
 */
export interface UseMCPQueryResult<TData> {
  /** The data returned from the API */
  data: TData | null;
  /** Whether the request is in progress */
  loading: boolean;
  /** Error message if the request failed */
  error: string | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
  /** Whether the query has been executed at least once */
  hasQueried: boolean;
}

/**
 * Generic hook for fetching data from MCP API endpoints.
 * Eliminates duplicated fetch/loading/error logic across pages.
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useMCPQuery<FibonacciAnalysisResult>({
 *   endpoint: '/api/mcp/fibonacci',
 *   params: { symbol: 'AAPL', period: '1d', window: 50, use_ai: true },
 *   enabled: !!symbol,
 * });
 * ```
 */
export function useMCPQuery<TData, TParams = Record<string, unknown>>({
  endpoint,
  params,
  enabled = true,
  refetchOnParamsChange = true,
}: UseMCPQueryOptions<TParams>): UseMCPQueryResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasQueried, setHasQueried] = useState(false);

  // Track previous params to detect changes
  const prevParamsRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Request failed with status ${response.status}`;

        // Handle specific error codes
        if (response.status === 401) {
          throw new Error("Authentication required. Please sign in.");
        }
        if (response.status === 403) {
          throw new Error(
            errorData.error || "Upgrade required to access this feature.",
          );
        }
        if (response.status === 429) {
          throw new Error(
            errorData.error || "Rate limit exceeded. Please try again later.",
          );
        }
        if (response.status === 503) {
          throw new Error(
            "MCP service unavailable. Please check backend server.",
          );
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      setData(responseData);
      setHasQueried(true);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error(`[useMCPQuery] ${endpoint} error:`, err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setHasQueried(true);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, enabled]);

  // Refetch when params change
  useEffect(() => {
    const paramsString = JSON.stringify(params);

    if (refetchOnParamsChange && paramsString !== prevParamsRef.current) {
      prevParamsRef.current = paramsString;

      if (enabled) {
        fetchData();
      }
    }
  }, [params, enabled, refetchOnParamsChange, fetchData]);

  // Initial fetch on mount if enabled
  useEffect(() => {
    if (enabled && !hasQueried && prevParamsRef.current === "") {
      prevParamsRef.current = JSON.stringify(params);
      fetchData();
    }
  }, [enabled, hasQueried, params, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    hasQueried,
  };
}

/**
 * Hook for lazy MCP queries that don't execute automatically.
 * Useful when you want to trigger the query on user action (e.g., button click).
 * Supports request cancellation via AbortController.
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute, cancel } = useLazyMCPQuery<ScanResult>();
 *
 * const handleScan = () => {
 *   execute('/api/mcp/scan', { universe: 'sp500', maxResults: 10 });
 * };
 *
 * const handleCancel = () => {
 *   cancel();
 * };
 * ```
 */
export function useLazyMCPQuery<TData>(): {
  data: TData | null;
  loading: boolean;
  error: string | null;
  execute: (
    endpoint: string,
    params: Record<string, unknown>,
  ) => Promise<TData | null>;
  cancel: () => void;
  reset: () => void;
} {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (
      endpoint: string,
      params: Record<string, unknown>,
    ): Promise<TData | null> => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error codes
          if (response.status === 401) {
            throw new Error("Authentication required. Please sign in.");
          }
          if (response.status === 403) {
            throw new Error(
              errorData.error || "Upgrade required to access this feature.",
            );
          }
          if (response.status === 429) {
            throw new Error(
              errorData.error || "Rate limit exceeded. Please try again later.",
            );
          }
          if (response.status === 503) {
            throw new Error(
              "MCP service unavailable. Please check backend server.",
            );
          }

          throw new Error(
            errorData.error || `Request failed with status ${response.status}`,
          );
        }

        const responseData = await response.json();
        setData(responseData);
        return responseData;
      } catch (err) {
        // Ignore abort errors (expected when user cancels)
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }

        console.error(`[useLazyMCPQuery] ${endpoint} error:`, err);
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    reset,
  };
}
