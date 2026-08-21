"use client";

import { useCallback } from "react";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useOrg } from "@/common/hooks/useOrg";
import {
  useCreateInvitationMutation,
  useListInvitationsQuery,
  useListMembersQuery,
  useRevokeInvitationMutation,
} from "@/common/api/endpoints/org.api";
import type { InvitationCreateRequest } from "@/common/types";

/** Team management: members + invitations. Owned by the `org` module. */
export function useTeam() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");
  const { orgId } = useOrg();

  const {
    data: members = [],
    isLoading: membersLoading,
    isFetching: membersFetching,
    refetch: refetchMembers,
  } = useListMembersQuery(orgId ?? "", { skip: !enabled || !orgId });

  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    isFetching: invitationsFetching,
    refetch: refetchInvitations,
  } = useListInvitationsQuery(orgId ?? "", { skip: !enabled || !orgId });

  const [createInvitation, { isLoading: isInviting }] =
    useCreateInvitationMutation();
  const [revokeInvitation, { isLoading: isRevoking }] =
    useRevokeInvitationMutation();

  const invite = useCallback(
    async (body: InvitationCreateRequest) => {
      if (!orgId) throw new Error("No organization found");
      return createInvitation({ orgId, body }).unwrap();
    },
    [orgId, createInvitation],
  );

  const revoke = useCallback(
    async (invitationId: string) => {
      if (!orgId) throw new Error("No organization found");
      await revokeInvitation({ orgId, invitationId }).unwrap();
    },
    [orgId, revokeInvitation],
  );

  const refresh = useCallback(() => {
    void refetchMembers();
    void refetchInvitations();
  }, [refetchMembers, refetchInvitations]);

  return {
    members,
    invitations,
    isLoading: membersLoading || invitationsLoading,
    isFetching:
      membersFetching || invitationsFetching || isInviting || isRevoking,
    refresh,
    invite,
    revoke,
  };
}

