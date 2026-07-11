import { baseApi } from '@/common/api/baseApi';
import { API_TAGS } from '@/common/api/tags';
import type {
  AnalyticsDashboard,
  ExecutiveSummary,
} from '@/common/types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query<AnalyticsDashboard, void>({
      query: () => '/analytics/dashboard',
      providesTags: [API_TAGS.ANALYTICS],
    }),
    
    getExecutiveSummary: builder.query<ExecutiveSummary, void>({
      query: () => '/analytics/executive-summary',
      providesTags: [API_TAGS.ANALYTICS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsQuery,
  useGetExecutiveSummaryQuery,
} = dashboardApi;