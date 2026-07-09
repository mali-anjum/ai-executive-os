import { baseApi } from '@/common/api/basApi';
import { API_TAGS } from '@/common/api/tags';
import type { IngestResponse } from '@/common/types';

export const connectorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    syncNotionPage: builder.mutation<IngestResponse, {
      pageId: string;
      allowedDepartments?: string[];
      allowedRoles?: string[];
    }>({
      query: ({ pageId, allowedDepartments, allowedRoles }) => ({
        url: '/connectors/notion/sync',
        method: 'POST',
        body: {
          page_id: pageId,
          allowed_departments: allowedDepartments ?? null,
          allowed_roles: allowedRoles ?? null,
        },
      }),
      invalidatesTags: [API_TAGS.CONNECTORS, API_TAGS.DOCUMENTS],
    }),
    
    syncGoogleDriveFile: builder.mutation<IngestResponse, {
      fileId: string;
      allowedDepartments?: string[];
      allowedRoles?: string[];
    }>({
      query: ({ fileId, allowedDepartments, allowedRoles }) => ({
        url: '/connectors/google-drive/sync',
        method: 'POST',
        body: {
          file_id: fileId,
          allowed_departments: allowedDepartments ?? null,
          allowed_roles: allowedRoles ?? null,
        },
      }),
      invalidatesTags: [API_TAGS.CONNECTORS, API_TAGS.DOCUMENTS],
    }),
    
    resyncAllConnectors: builder.mutation<void, void>({
      query: () => ({
        url: '/connectors/resync-all',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.CONNECTORS, API_TAGS.DOCUMENTS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSyncNotionPageMutation,
  useSyncGoogleDriveFileMutation,
  useResyncAllConnectorsMutation,
} = connectorsApi;