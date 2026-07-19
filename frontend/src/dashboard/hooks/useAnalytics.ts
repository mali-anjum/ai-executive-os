"use client";

import { useMemo } from "react";
import { analyticsPolling } from "@/common/config/polling.config";
import { useVisibilityPolling } from "@/common/hooks/useVisibilityPolling";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useGetAnalyticsQuery } from "@/common/api/endpoints/dashboard.api";
import { getApiErrorMessage } from "@/common/api/errorMessage";

export function useAnalytics() {
  const enabled = useFeatureFlag("ANALYTICS_DASHBOARD_ENABLED");

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetAnalyticsQuery(undefined, {
    skip: !enabled,
  });

  useVisibilityPolling({
    enabled,
    onPoll: () => {
      void refetch();
    },
    ...analyticsPolling,
  });

  return useMemo(
    () => ({
      enabled,
      metrics: data ?? null,
      isLoading,
      isFetching,
      error: error ? getApiErrorMessage(error) : null,
      refresh: refetch,
    }),
    [
      enabled,
      data,
      isLoading,
      isFetching,
      error,
      refetch,
    ],
  );
}