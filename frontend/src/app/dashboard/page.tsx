"use client";

import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { EXECUTIVE_SUMMARY_QUERY_KEY } from "@/dashboard/hooks/useExecutiveSummary";
import { fetchExecutiveSummary } from "@/common/api/client";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Prefetch data when page loads
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: [EXECUTIVE_SUMMARY_QUERY_KEY],
      queryFn: fetchExecutiveSummary,
    });
  }, [queryClient]);

  return (
    <DashboardTemplate title="Command center">
      <DashboardScreen />
    </DashboardTemplate>
  );
}