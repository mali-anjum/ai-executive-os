import { baseApi } from '@/common/api/baseApi';
import { API_TAGS } from '@/common/api/tags';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveIntegrationConfig: builder.mutation<void, {
      provider: string;
      config: Record<string, string>;
    }>({
      query: ({ provider, config }) => ({
        url: '/settings/integrations',
        method: 'PUT',
        body: { provider, config },
      }),
      invalidatesTags: [API_TAGS.SETTINGS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSaveIntegrationConfigMutation,
} = settingsApi;