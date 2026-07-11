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

export default async function DashboardPage() {
  return (
      <DashboardTemplate title="Command center">
          <DashboardScreen />
      </DashboardTemplate>
  );
}
