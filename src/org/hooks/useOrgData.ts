"use client";

import { useCallback } from "react";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import {
  useGetOrganizationContextQuery,
  useUpdateOrganizationMutation,
  useCompleteOnboardingMutation,
} from "@/common/api/endpoints/org.api";
import type { OrganizationRecord } from "@/common/types";

/**
 * Organization context + settings for the authenticated user.
 *
 * Server-owned org data flows through RTK Query (see `endpoints/org.api.ts`),
 * which reads Supabase directly — no FastAPI org CRUD. RLS remains the
 * authoritative authorization boundary.
 */
export function useOrgData() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");

  const {
    data: context,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrganizationContextQuery(undefined, { skip: !enabled });

  const [updateOrganization, { isLoading: isSaving }] =
    useUpdateOrganizationMutation();
  const [completeOnboarding, { isLoading: isCompleting }] =
    useCompleteOnboardingMutation();

  const org = context?.org ?? null;
  const role = context?.role ?? "employee";
  const onboardingCompleted = context?.onboardingCompleted ?? false;

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const saveOrg = useCallback(
    async (body: Partial<OrganizationRecord>) => {
      if (!org?.id) {
        throw new Error("Organization not found");
      }
      await updateOrganization({ orgId: org.id, body }).unwrap();
    },
    [org, updateOrganization],
  );

  const finishOnboarding = useCallback(
    async (step?: string) => {
      if (!org?.id) {
        throw new Error("Organization not found");
      }
      await completeOnboarding({ orgId: org.id, step }).unwrap();
    },
    [org, completeOnboarding],
  );

  return {
    org,
    role,
    onboardingCompleted,
    isLoading,
    isFetching: isFetching || isSaving || isCompleting,
    refresh,
    saveOrg,
    finishOnboarding,
  };
}
