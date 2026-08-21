import { baseApi } from "@/common/api/baseApi";
import { API_TAGS } from "@/common/api/tags";
import { createClient } from "@/common/services/supabase/client";
import type {
  InvitationCreateRequest,
  InvitationRecord,
  MemberRecord,
  OrganizationRecord,
} from "@/common/types";

/**
 * Organization + team data access over Supabase (PostgREST + RLS).
 *
 * The database is owned by the backend repo and RLS is the authoritative
 * authorization layer. These endpoints wrap supabase-js in RTK Query so the
 * org layer follows the same server-state rules as every other feature
 * (`server-owned data → RTK Query`), while keeping Supabase as the transport —
 * no FastAPI org CRUD exists by design.
 */

export type OrganizationContext = {
  org: OrganizationRecord | null;
  role: string;
  onboardingCompleted: boolean;
};

export type AcceptedInvitation = {
  org_id: string;
  org_name: string;
  role: string;
};

const ONBOARDING_KEY = "onboarding";
const DEFAULT_ROLE = "employee";

function isOnboardingCompleted(settings: unknown): boolean {
  if (!settings || typeof settings !== "object") return false;
  const onboarding = (settings as Record<string, unknown>)[ONBOARDING_KEY];
  if (!onboarding || typeof onboarding !== "object") return false;
  return Boolean((onboarding as Record<string, unknown>).completed);
}

export const orgApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Organization context for the authenticated user (org + role + onboarding).
    getOrganizationContext: builder.query<OrganizationContext, void>({
      queryFn: async () => {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          return {
            error: { status: "CUSTOM_ERROR", error: authError.message },
          };
        }

        const empty: OrganizationContext = {
          org: null,
          role: DEFAULT_ROLE,
          onboardingCompleted: false,
        };

        if (!user) return { data: empty };

        const orgId = user.user_metadata?.org_id as string | undefined;
        if (!orgId) return { data: empty };

        const [orgResult, memberResult] = await Promise.all([
          supabase.from("organizations").select("*").eq("id", orgId).single(),
          supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .eq("org_id", orgId)
            .single(),
        ]);

        if (orgResult.error) {
          return {
            error: { status: "CUSTOM_ERROR", error: orgResult.error.message },
          };
        }
        if (memberResult.error) {
          return {
            error: { status: "CUSTOM_ERROR", error: memberResult.error.message },
          };
        }

        const org = orgResult.data as OrganizationRecord;
        return {
          data: {
            org,
            role: memberResult.data?.role ?? DEFAULT_ROLE,
            onboardingCompleted: isOnboardingCompleted(org.settings_json),
          },
        };
      },
      providesTags: [API_TAGS.ORG],
    }),

    updateOrganization: builder.mutation<
      OrganizationRecord,
      { orgId: string; body: Partial<OrganizationRecord> }
    >({
      queryFn: async ({ orgId, body }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("organizations")
          .update(body)
          .eq("id", orgId)
          .select("*")
          .single();

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: data as OrganizationRecord };
      },
      invalidatesTags: [API_TAGS.ORG],
    }),

    completeOnboarding: builder.mutation<void, { orgId: string; step?: string }>({
      queryFn: async ({ orgId, step }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("organizations")
          .select("settings_json")
          .eq("id", orgId)
          .single();

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
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

        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            settings_json: { ...settings, [ONBOARDING_KEY]: nextOnboarding },
          })
          .eq("id", orgId);

        if (updateError) {
          return { error: { status: "CUSTOM_ERROR", error: updateError.message } };
        }
        return { data: undefined };
      },
      invalidatesTags: [API_TAGS.ORG],
    }),

    // Team members (everyone except the owner, managed by the org context).
    listMembers: builder.query<MemberRecord[], string>({
      queryFn: async (orgId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("org_id", orgId)
          .neq("role", "owner");

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: (data ?? []) as MemberRecord[] };
      },
      providesTags: [API_TAGS.TEAM],
    }),

    listInvitations: builder.query<InvitationRecord[], string>({
      queryFn: async (orgId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("organization_invitations")
          .select("*")
          .eq("org_id", orgId);

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: (data ?? []) as InvitationRecord[] };
      },
      providesTags: [API_TAGS.TEAM],
    }),

    createInvitation: builder.mutation<
      InvitationRecord,
      { orgId: string; body: InvitationCreateRequest }
    >({
      queryFn: async ({ orgId, body }) => {
        const supabase = createClient();
        const expiresInDays = body.expires_in_days ?? 7;

        const { data, error } = await supabase
          .from("organization_invitations")
          .insert({
            id: crypto.randomUUID(),
            org_id: orgId,
            email: body.email,
            role: body.role ?? DEFAULT_ROLE,
            department: body.department,
            token: crypto.randomUUID(),
            expires_at: new Date(
              Date.now() + expiresInDays * 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: data as InvitationRecord };
      },
      invalidatesTags: [API_TAGS.TEAM],
    }),

    revokeInvitation: builder.mutation<
      void,
      { orgId: string; invitationId: string }
    >({
      queryFn: async ({ orgId, invitationId }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("organization_invitations")
          .delete()
          .eq("id", invitationId)
          .eq("org_id", orgId);

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: undefined };
      },
      invalidatesTags: [API_TAGS.TEAM],
    }),

    // Move the authenticated user into the invited org via the SECURITY DEFINER RPC.
    acceptInvitation: builder.mutation<AcceptedInvitation, { targetOrgId: string }>({
      queryFn: async ({ targetOrgId }) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("accept_org_invitation", {
          p_org_id: targetOrgId,
        });

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }

        const row = Array.isArray(data) ? data[0] : data;
        if (!row?.org_id) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "No pending invitation found for this workspace.",
            },
          };
        }
        return {
          data: {
            org_id: row.org_id,
            org_name: row.org_name,
            role: row.role,
          },
        };
      },
      invalidatesTags: [API_TAGS.ORG, API_TAGS.TEAM],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrganizationContextQuery,
  useUpdateOrganizationMutation,
  useCompleteOnboardingMutation,
  useListMembersQuery,
  useListInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
  useAcceptInvitationMutation,
} = orgApi;
