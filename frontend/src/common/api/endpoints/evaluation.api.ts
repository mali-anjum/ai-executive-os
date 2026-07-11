import { baseApi } from '@/common/api/baseApi';
import { API_TAGS } from '@/common/api/tags';
import type {
  EvaluationMetrics,
  HarnessRunResponse,
  UnansweredQuestionsReport,
} from '@/common/types';

export const evaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvaluationMetrics: builder.query<EvaluationMetrics, void>({
      query: () => '/evaluation/metrics',
      providesTags: [API_TAGS.EVALUATION],
    }),
    
    getUnansweredReport: builder.query<UnansweredQuestionsReport, void>({
      query: () => '/evaluation/unanswered',
      providesTags: [API_TAGS.EVALUATION],
    }),
    
    runEvaluationHarness: builder.mutation<HarnessRunResponse, void>({
      query: () => ({
        url: '/evaluation/harness/run',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.EVALUATION],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEvaluationMetricsQuery,
  useGetUnansweredReportQuery,
  useRunEvaluationHarnessMutation,
} = evaluationApi;