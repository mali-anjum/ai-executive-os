"use client";

import { useState } from "react";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { LoadingBlock } from "@/common/molecules/LoadingBlock";
import { useTeam } from "@/org/hooks/useTeam";
import { useRole } from "@/common/hooks/useRole";
import { InviteMembersForm } from "@/org/molecules/InviteMembersForm";
import { InvitationList } from "@/org/molecules/InvitationList";
import { MemberList } from "@/org/molecules/MemberList";
import { invitableRolesFor } from "@/org/services/invitation-validation";

export function TeamScreen() {
  const role = useRole();
  const team = useTeam();
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  if (!role.isAdmin) {
    return (
      <DashboardTemplate title="Team">
        <p className="text-sm text-muted-foreground">
          Only owners and admins can manage the team.
        </p>
      </DashboardTemplate>
    );
  }

  const invite = async (body: Parameters<typeof team.invite>[0]) => {
    setError(null);
    try {
      await team.invite(body);
      team.refresh();
    } catch {
      setError("Could not send the invitation.");
    }
  };

  const revoke = async (id: string) => {
    setRevokingId(id);
    setError(null);
    try {
      await team.revoke(id);
      team.refresh();
    } catch {
      setError("Could not revoke the invitation.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <DashboardTemplate title="Team">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Invite members</h2>
          <InviteMembersForm onInvite={invite} invitableRoles={invitableRolesFor(role.role)} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Invitations</h2>
          {team.isLoading ? (
            <LoadingBlock />
          ) : (
            <InvitationList
              invitations={team.invitations}
              onRevoke={revoke}
              revokingId={revokingId}
            />
          )}
        </section>
      </div>

      <section className="mx-auto mt-8 max-w-5xl space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Members</h2>
        {team.isLoading ? <LoadingBlock /> : <MemberList members={team.members} />}
      </section>
    </DashboardTemplate>
  );
}
