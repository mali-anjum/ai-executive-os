"use client";

import {
  useCreateInvitationMutation,
  useListInvitationsQuery,
  useListMembersQuery,
  useRevokeInvitationMutation,
} from "@/common/api/endpoints/org.api";
import type {
  InvitationCreateRequest,
  InvitationRecord,
  MemberRecord,
} from "@/common/types";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";

/** Team management: members + invitations. Owned by the `org` module. */
export function useTeam() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");

  const members = useListMembersQuery(undefined, {
    skip: !enabled,
    refetchOnFocus: true,
  });
  const invitations = useListInvitationsQuery(undefined, {
    skip: !enabled,
    refetchOnFocus: true,
  });

  const [createInvitation] = useCreateInvitationMutation();
  const [revokeInvitation] = useRevokeInvitationMutation();

  const invite = async (body: InvitationCreateRequest) => {
    const result = await createInvitation(body).unwrap();
    return result as InvitationRecord;
  };

  const revoke = async (invitationId: string) => {
    await revokeInvitation(invitationId).unwrap();
  };

  const memberList: MemberRecord[] = members.data ?? [];
  const invitationList: InvitationRecord[] = invitations.data ?? [];

  return {
    members: memberList,
    invitations: invitationList,
    isLoading: members.isLoading || invitations.isLoading,
    isFetching: members.isFetching || invitations.isFetching,
    refresh: () => {
      members.refetch();
      invitations.refetch();
    },
    invite,
    revoke,
  };
}
