import { createClient } from "@/common/services/supabase/client";
import type { OrganizationRecord } from "@/common/types";

export type OrganizationContext = {
  org: OrganizationRecord | null;
  role: string;
  onboardingCompleted: boolean;
};

const ONBOARDING_KEY = "onboarding";

const DEFAULT_ROLE = "employee";

const supabase = createClient();

/**
 * Safely determines whether organization onboarding is complete.
 *
 * Onboarding state is stored inside organizations.settings_json:
 *
 * {
 *   "onboarding": {
 *     "completed": true,
 *     "last_step": "..."
 *   }
 * }
 */
function isOnboardingCompleted(settings: unknown): boolean {
  if (!settings || typeof settings !== "object") {
    return false;
  }

  const onboarding = (
    settings as Record<string, unknown>
  )[ONBOARDING_KEY];

  if (!onboarding || typeof onboarding !== "object") {
    return false;
  }

  return Boolean(
    (onboarding as Record<string, unknown>).completed,
  );
}

/**
 * Returns the currently authenticated user's organization context.
 *
 * The database/RLS remains the source of truth for authorization.
 * user_metadata.org_id is used only to resolve the organization
 * associated with the current session.
 */
async function getOrganizationContext(): Promise<OrganizationContext> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return {
      org: null,
      role: DEFAULT_ROLE,
      onboardingCompleted: false,
    };
  }

  const orgId = user.user_metadata?.org_id as string | undefined;

  if (!orgId) {
    return {
      org: null,
      role: DEFAULT_ROLE,
      onboardingCompleted: false,
    };
  }

  const [organizationResult, membershipResult] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single(),

      supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .eq("org_id", orgId)
        .single(),
    ]);

  if (organizationResult.error) {
    throw organizationResult.error;
  }

  if (membershipResult.error) {
    throw membershipResult.error;
  }

  const org = organizationResult.data as OrganizationRecord;

  return {
    org,
    role: membershipResult.data?.role ?? DEFAULT_ROLE,
    onboardingCompleted: isOnboardingCompleted(
      org.settings_json,
    ),
  };
}

/**
 * Updates an organization and returns the updated record.
 *
 * Uses UPDATE ... RETURNING rather than performing a second SELECT.
 */
async function updateOrganization(
  organizationId: string,
  body: Partial<OrganizationRecord>,
): Promise<OrganizationRecord> {
  const { data, error } = await supabase
    .from("organizations")
    .update(body)
    .eq("id", organizationId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as OrganizationRecord;
}

/**
 * Marks organization onboarding as completed.
 *
 * Onboarding progress is stored in organizations.settings_json.
 */
async function completeOnboarding(
  organizationId: string,
  step?: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("organizations")
    .select("settings_json")
    .eq("id", organizationId)
    .single();

  if (error) {
    throw error;
  }

  const settings =
    (data?.settings_json as Record<string, unknown> | null) ?? {};

  const onboarding =
    (settings[ONBOARDING_KEY] as Record<string, unknown> | null) ?? {};

  const nextOnboarding: Record<string, unknown> = {
    ...onboarding,
    completed: true,
    ...(step ? { last_step: step } : {}),
    updated_at: new Date().toISOString(),
  };

  const nextSettings = {
    ...settings,
    [ONBOARDING_KEY]: nextOnboarding,
  };

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      settings_json: nextSettings,
    })
    .eq("id", organizationId);

  if (updateError) {
    throw updateError;
  }
}

export const organizationService = {
  getOrganizationContext,
  updateOrganization,
  completeOnboarding,
};