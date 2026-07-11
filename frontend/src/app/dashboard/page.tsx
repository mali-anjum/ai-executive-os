// app/dashboard/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
// import { fetchExecutiveSummary } from "@/common/api/client";
// import { EXECUTIVE_SUMMARY_QUERY_KEY } from "@/dashboard/hooks/useExecutiveSummary";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";
// import { useFetchExecutiveSummaryQuery } from "@/common/api/endpoints/dashboard.api";

export default async function DashboardPage() {
//   const {
//     data: summary,
//     isLoading,
// } = useFetchExecutiveSummaryQuery();
  // const queryClient = new QueryClient();

  // await queryClient.prefetchQuery({
  //   queryKey: [EXECUTIVE_SUMMARY_QUERY_KEY],
  //   queryFn: fetchExecutiveSummary,
  // });

  return (
      <DashboardTemplate title="Command center">
          <DashboardScreen />
      </DashboardTemplate>
  );
}
