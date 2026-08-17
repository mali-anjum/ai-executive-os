"use client";

import { useState } from "react";
import { createClient } from "@/common/services/supabase/client";
import { authService } from "@/auth/services/auth.service";
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
 * Calls the `accept_org_invitation()` SECURITY DEFINER RPC which atomically
 * validates the invitation, updates membership, and returns the resulting org/role.
 */
export function useAcceptInvitation() {
  const [state, setState] = useState<AcceptInviteState>({ status: "idle" });
  const { setOrg } = useOrg();
  const { setUser } = useUser();
  const supa = createClient();

  const accept = async () => {
    // The RPC identifies the caller from the JWT (auth.uid()); the org to join is
    // resolved from the pending invitation for the caller's email server-side.
    const { data: userData } = await supa.auth.getUser();
    const prevOrgId = userData.user?.user_metadata?.org_id ?? undefined;

    setState({ status: "checking" });
    try {
      // Call the Supabase SECURITY DEFINER RPC that validates invitation,
      // updates user's org_id/role, and returns resulting context.
      const { data, error } = await supa.rpc("accept_org_invitation", {
        p_org_id: prevOrgId,
      });

      if (error) throw error;
      if (!data) {
        setState({ status: "none" });
        return;
      }

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
        message: err instanceof Error ? err.message : "Could not accept invitation",
      });
    }
  };

  return { state, accept };
}
