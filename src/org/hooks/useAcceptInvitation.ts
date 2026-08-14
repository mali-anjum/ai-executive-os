"use client";

import { useState } from "react";

import { useAcceptInvitationMutation } from "@/common/api/endpoints/org.api";
import type { AcceptInvitationResponse } from "@/common/types";
import { authService } from "@/auth/services/auth.service";
import { useOrg } from "@/common/hooks/useOrg";
import { useUser } from "@/common/hooks/useUser";

export type AcceptInviteState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "accepted"; result: AcceptInvitationResponse }
  | { status: "none" }
  | { status: "error"; message: string };

/**
 * Accepts a pending invitation for the authenticated user's email and syncs
 * their Supabase `user_metadata` so RLS scopes subsequent requests to the new
 * organization. Invited users never create a new organization.
 */
export function useAcceptInvitation() {
  const [acceptInvitation] = useAcceptInvitationMutation();
  const { setOrg } = useOrg();
  const { setUser } = useUser();
  const [state, setState] = useState<AcceptInviteState>({ status: "idle" });

  const accept = async () => {
    setState({ status: "checking" });
    try {
      const result = await acceptInvitation().unwrap();
      if (!result) {
        setState({ status: "none" });
        return;
      }

      const { error } = await authService.updateUserMetadata({
        org_id: result.org_id,
        org_name: result.org_name,
        org_slug: result.org_slug ?? undefined,
        role: result.role,
      });
      if (error) throw error;

      setOrg({ orgId: result.org_id, orgName: result.org_name });
      setUser({ role: result.role, email: null });

      setState({ status: "accepted", result });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Could not accept invitation",
      });
    }
  };

  return { state, accept };
}
