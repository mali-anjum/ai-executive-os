// import { useGetAnalyticsQuery, useGetExecutiveSummaryQuery } from "@/common/api/endpoints/dashboard.api";
// import { useGetUnansweredReportQuery } from "@/common/api/endpoints/evaluation.api";
// import { useListTicketsQuery } from "@/common/api/endpoints/tickets.api";

// export function useDashboard() {
//     const executiveSummary = useGetExecutiveSummaryQuery();
//     const analytics = useGetAnalyticsQuery();
//     const unanswered = useGetUnansweredReportQuery();
//     const tickets = useListTicketsQuery();
  
//     const isLoading =
//       executiveSummary.isLoading ||
//       analytics.isLoading ||
//       unanswered.isLoading ||
//       tickets.isLoading;
  
//     const error =
//       executiveSummary.error ??
//       analytics.error ??
//       unanswered.error ??
//       tickets.error;
  
//     return {
//       executiveSummary,
//       analytics,
//       unanswered,
//       tickets,
//       isLoading,
//       error,
//     };
//   }