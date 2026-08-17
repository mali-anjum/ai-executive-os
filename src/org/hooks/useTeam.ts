"use client";

import { useState, useEffect } from "react";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { createClient } from "@/common/services/supabase/client";
import type {
  InvitationCreateRequest,
  InvitationRecord,
  MemberRecord,
} from "@/common/types";

/** Team management: members + invitations. Owned by the `org` module. */
export function useTeam() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");
  const supa = createClient();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchMembers = async (id: string) => {
    const { data, error } = await supa
      .from("users")
      .select("*")
      .eq("org_id", id)
      .neq("role", "owner"); // Exclude owner (handled separately).
    if (!error && data) setMembers(data as MemberRecord[]);
  };

  const fetchInvitations = async (id: string) => {
    const { data, error } = await supa
      .from("organization_invitations")
      .select("*")
      .eq("org_id", id);
    if (!error && data) setInvitations(data as InvitationRecord[]);
  };

  // Resolve the caller's org_id from the authenticated Supabase session, then
  // load members + invitations. The org boundary is enforced by RLS server-side.
useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    supa.auth.getUser().then(({ data }) => {
      const id = (data.user?.user_metadata?.org_id as string | undefined) ?? null;
      if (cancelled) return;
      setOrgId(id);
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsFetching(true);
      Promise.all([fetchMembers(id), fetchInvitations(id)]).finally(() => {
        if (!cancelled) {
          setIsFetching(false);
          setIsLoading(false);
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchInvitations, fetchMembers, supa]);

  const invite = async (body: InvitationCreateRequest) => {
    if (!orgId) throw new Error("No organization found");
    const expiresInDays = body.expires_in_days ?? 7;

    const { data, error } = await supa
      .from("organization_invitations")
      .insert({
        id: crypto.randomUUID(),
        org_id: orgId,
        email: body.email,
        role: body.role ?? "employee",
        department: body.department,
        token: crypto.randomUUID(),
        expires_at: new Date(
          Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as InvitationRecord;
  };

  const revoke = async (invitationId: string) => {
    if (!orgId) throw new Error("No organization found");

    const { error } = await supa
      .from("organization_invitations")
      .delete()
      .eq("id", invitationId)
      .eq("org_id", orgId);
    if (error) throw error;
  };

  const refresh = () => {
    if (!orgId) return;
    void Promise.all([fetchMembers(orgId), fetchInvitations(orgId)]);
  };

  return {
    members,
    invitations,
    isLoading,
    isFetching,
    refresh,
    invite,
    revoke,
  };
}
