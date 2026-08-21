"use client";

import { useCallback, useState } from "react";
import { authService } from "@/auth/services/auth.service";
import { useAcceptInvitationMutation } from "@/common/api/endpoints/org.api";
import { useOrg } from "@/common/hooks/useOrg";
import { useUser } from "@/common/hooks/useUser";

export type AcceptInviteState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "accepted"; result: { org_id: string; org_name: string; role: string } }
  | { status: "none" }
  | { status: "error"; message: string };

/**
 * Accepts a pending invitation for the authenticated user's email and syncs
 * their Supabase `user_metadata` so RLS scopes subsequent requests to the new
 * organization. Invited users never create a new organization.
 *
 * The `targetOrgId` is the id of the organization that sent the invite (from
 * the invite link) — NOT the user's current org. It is passed to the
 * `accept_org_invitation()` SECURITY DEFINER RPC, which atomically validates
 * the invitation and moves the user into that org.
 */
export function useAcceptInvitation() {
  const [state, setState] = useState<AcceptInviteState>({ status: "idle" });
  const { setOrg } = useOrg();
  const { setUser } = useUser();
  const [acceptInvitation] = useAcceptInvitationMutation();

  const accept = useCallback(
    async (targetOrgId: string) => {
      setState({ status: "checking" });
      try {
        const data = await acceptInvitation({ targetOrgId }).unwrap();

        // Sync user_metadata so RLS picks up the new tenant.
        const { error: metaError } = await authService.updateUserMetadata({
          org_id: data.org_id,
          org_name: data.org_name,
          org_slug: undefined,
          role: data.role,
        });
        if (metaError) throw metaError;

        setOrg({ orgId: data.org_id, orgName: data.org_name });
        setUser({ role: data.role, email: null });

        setState({ status: "accepted", result: data });
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not accept invitation",
        });
      }
    },
    [acceptInvitation, setOrg, setUser],
  );

  return { state, accept };
}

