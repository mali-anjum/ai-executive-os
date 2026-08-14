import { baseApi } from "@/common/api/baseApi";
import { API_TAGS } from "@/common/api/tags";
import type {
  AcceptInvitationResponse,
  InvitationCreateRequest,
  InvitationRecord,
  MemberRecord,
  OrgContext,
  OrgUpdateRequest,
  OrganizationRecord,
} from "@/common/types";

export const orgApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrgContext: builder.query<OrgContext, void>({
      query: () => "/orgs/me",
      providesTags: [API_TAGS.ORG],
    }),
    updateOrg: builder.mutation<OrganizationRecord, OrgUpdateRequest>({
      query: (body) => ({
        url: "/orgs/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [API_TAGS.ORG],
    }),
    completeOnboarding: builder.mutation<{ completed: boolean }, { completed: boolean; step?: string }>({
      query: (body) => ({
        url: "/orgs/me/onboarding",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [API_TAGS.ORG],
    }),
    listMembers: builder.query<MemberRecord[], void>({
      query: () => "/orgs/me/members",
      providesTags: [API_TAGS.MEMBERS],
    }),
    createInvitation: builder.mutation<InvitationRecord, InvitationCreateRequest>({
      query: (body) => ({
        url: "/orgs/me/invitations",
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAGS.INVITATIONS, API_TAGS.MEMBERS],
    }),
    listInvitations: builder.query<InvitationRecord[], void>({
      query: () => "/orgs/me/invitations",
      providesTags: [API_TAGS.INVITATIONS],
    }),
    revokeInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/orgs/me/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.INVITATIONS],
    }),
    acceptInvitation: builder.mutation<AcceptInvitationResponse | null, void>({
      query: () => ({
        url: "/invitations/accept",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrgContextQuery,
  useUpdateOrgMutation,
  useCompleteOnboardingMutation,
  useListMembersQuery,
  useCreateInvitationMutation,
  useListInvitationsQuery,
  useRevokeInvitationMutation,
  useAcceptInvitationMutation,
} = orgApi;
