import {
    useFetchExecutiveSummaryQuery,
    useFetchAnalyticsQuery,
  } from "@/common/api/endpoints/dashboard.api";
  
  export function useDashboard() {
    const executiveSummary = useFetchExecutiveSummaryQuery();
    const analytics = useFetchAnalyticsQuery();
  
    return {
      executiveSummary,
      analytics,
    };
  }