"use client";

import {
  useCompleteOnboardingMutation,
  useGetOrgContextQuery,
  useUpdateOrgMutation,
} from "@/common/api/endpoints/org.api";
import type {
  OrgUpdateRequest,
  OrganizationRecord,
} from "@/common/types";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";

/**
 * Organization context + settings + onboarding.
 * Owned by the `org` module; other modules import from here.
 */
export function useOrgData() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");

  const context = useGetOrgContextQuery(undefined, { skip: !enabled });
  const [updateOrg] = useUpdateOrgMutation();
  const [completeOnboarding] = useCompleteOnboardingMutation();

  const org = context.data?.org ?? null;
  const onboardingCompleted = context.data?.onboarding_completed ?? false;
  const role = context.data?.role ?? "employee";

  const saveOrg = async (body: OrgUpdateRequest) => {
    const result = await updateOrg(body).unwrap();
    return result as OrganizationRecord;
  };

  const finishOnboarding = async (step?: string) => {
    await completeOnboarding({ completed: true, step }).unwrap();
  };

  return {
    org,
    role,
    onboardingCompleted,
    isLoading: context.isLoading,
    isFetching: context.isFetching,
    refresh: context.refetch,
    saveOrg,
    finishOnboarding,
  };
}
