import { getServerAuth } from "@/auth/services/serverAuth";
import { toDashboardInitialUser } from "@/auth/hooks/DashboardInitialUser";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";
export default async function DashboardPage() {
  const auth = await getServerAuth();
  return (
    <DashboardTemplate title="Command center">
      <DashboardScreen initialUser={toDashboardInitialUser(auth)} />
    </DashboardTemplate>
  );
}