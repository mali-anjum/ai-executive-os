// app/dashboard/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchExecutiveSummary } from "@/common/api/client";
import { EXECUTIVE_SUMMARY_QUERY_KEY } from "@/dashboard/hooks/useExecutiveSummary";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";

export default async function DashboardPage() {
  const queryClient = new QueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: [EXECUTIVE_SUMMARY_QUERY_KEY],
    queryFn: fetchExecutiveSummary,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardTemplate title="Command center">
        <DashboardScreen />
      </DashboardTemplate>
    </HydrationBoundary>
  );
}