"use client";

import React, { useState, useEffect } from "react";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import type { OrganizationRecord } from "@/common/types";
import { organizationService } from "../services/OrganizationService"; 
export function useOrgData() {
  const enabled = useFeatureFlag("ORG_MANAGEMENT_ENABLED");

  const [org, setOrg] = useState<OrganizationRecord | null>(null);
  const [role, setRole] = useState("employee");
  const [onboardingCompleted, setOnboardingCompleted] =
    useState(false);

  const [isLoading, setIsLoading] = useState(enabled);
  const [isFetching, setIsFetching] = useState(false);

  // Load org context on mount (and when the feature flag flips). State updates
  // happen inside the promise callbacks — never synchronously in the effect body
  // (same pattern as useTeam) to avoid cascading renders.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    organizationService.getOrganizationContext()
      .then((context) => {
        if (cancelled) return;
        setOrg(context.org);
        setRole(context.role);
        setOnboardingCompleted(context.onboardingCompleted);
      })
      .catch(() => {
        // Initial load failed — org stays null; the screen renders its
        // loading/empty state instead of an unhandled rejection.
      })
      .finally(() => {
        if (!cancelled) {
          setIsFetching(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const refresh = React.useCallback(async () => {
    setIsFetching(true);
    try {
      const context = await organizationService.getOrganizationContext();
      setOrg(context.org);
      setRole(context.role);
      setOnboardingCompleted(context.onboardingCompleted);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, []);

  const saveOrg = React.useCallback(
    async (body: Partial<OrganizationRecord>) => {
      if (!org?.id) {
        throw new Error("Organization not found");
      }

      setIsFetching(true);

      try {
        const updatedOrg = await organizationService.updateOrganization(org.id, body);
        setOrg(updatedOrg);
      } finally {
        setIsFetching(false);
      }
    },
    [org?.id],
  );

  const finishOnboarding = React.useCallback(
    async (step?: string) => {
      if (!org?.id) {
        throw new Error("Organization not found");
      }

      setIsFetching(true);

      try {
        await organizationService.completeOnboarding(org.id, step);
        setOnboardingCompleted(true);
      } finally {
        setIsFetching(false);
      }
    },
    [org?.id],
  );

  return {
    org,
    role,
    onboardingCompleted,
    isLoading,
    isFetching,
    refresh,
    saveOrg,
    finishOnboarding,
  };
}