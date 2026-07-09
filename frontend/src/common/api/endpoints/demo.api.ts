import { baseApi } from '@/common/api/baseApi';
import { API_TAGS } from '@/common/api/tags';
import type { DemoSeedResponse } from '@/common/types';

export const demoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    seedDemoTenant: builder.mutation<DemoSeedResponse, void>({
      query: () => ({
        url: '/demo/seed',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.DEMO, API_TAGS.DOCUMENTS, API_TAGS.TICKETS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSeedDemoTenantMutation,
} = demoApi;