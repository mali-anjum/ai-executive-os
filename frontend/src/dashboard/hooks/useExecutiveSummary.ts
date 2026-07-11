// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { fetchExecutiveSummary } from "@/common/api/client";
// import type { ExecutiveSummary } from "@/common/types";

// export const EXECUTIVE_SUMMARY_QUERY_KEY = "executiveSummary";

// export function useExecutiveSummary() {
//   const {
//     data: summary,
//     error,
//     isLoading,
//     refetch,
//   } = useQuery<ExecutiveSummary>({
//     queryKey: [EXECUTIVE_SUMMARY_QUERY_KEY],
//     queryFn: fetchExecutiveSummary,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//   });

//   return {
//     summary: summary ?? null,
//     error: error instanceof Error ? error.message : null,
//     loading: isLoading,
//     load: refetch,
//   };
// }