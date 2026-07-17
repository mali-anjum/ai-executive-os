import { useFetchAnalyticsQuery, useFetchExecutiveSummaryQuery } from "@/common/api/endpoints/dashboard.api";
import { useFetchUnansweredReportQuery } from "@/common/api/endpoints/evaluation.api";
import { useListTicketsQuery } from "@/common/api/endpoints/tickets.api";

export function useDashboard() {
    const executiveSummary = useFetchExecutiveSummaryQuery();
    const analytics = useFetchAnalyticsQuery();
    const unanswered = useFetchUnansweredReportQuery();
    const tickets = useListTicketsQuery();
  
    const isLoading =
      executiveSummary.isLoading ||
      analytics.isLoading ||
      unanswered.isLoading ||
      tickets.isLoading;
  
    const error =
      executiveSummary.error ??
      analytics.error ??
      unanswered.error ??
      tickets.error;
  
    return {
      executiveSummary,
      analytics,
      unanswered,
      tickets,
      isLoading,
      error,
    };
  }