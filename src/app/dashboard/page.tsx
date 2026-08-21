import { getServerAuth } from "@/auth/services/serverAuth";
import { toDashboardInitialUser } from "@/auth/hooks/DashboardInitialUser";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { DashboardScreen } from "@/dashboard/screens/DashboardScreen";
import { AcceptInvitationCard } from "@/org/organisms/AcceptInvitationCard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const auth = await getServerAuth();
  const { org: targetOrgId } = await searchParams;

  return (
    <DashboardTemplate title="Command center">
      {auth.user && auth.user.role !== "owner" && auth.user.role !== "admin" ? (
        <div className="mx-auto mb-6 max-w-2xl">
          <AcceptInvitationCard targetOrgId={targetOrgId} />
        </div>
      ) : null}
      <DashboardScreen initialUser={toDashboardInitialUser(auth)} />
    </DashboardTemplate>
  );
}
