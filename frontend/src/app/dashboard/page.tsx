// app/dashboard/page.tsx
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";

export default async function DashboardPage() {
  return (
      <DashboardTemplate title="Command center">
          <DashboardScreen />
      </DashboardTemplate>
  );
}
