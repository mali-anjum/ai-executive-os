import baseApi from '@/common/api/basApi';
import { API_TAGS } from '@/common/api/tags';
import type {
  EvaluationMetrics,
  HarnessRunResponse,
  UnansweredQuestionsReport,
} from '@/common/types';

export const evaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchEvaluationMetrics: builder.query<EvaluationMetrics, void>({
      query: () => '/evaluation/metrics',
      providesTags: [API_TAGS.EVALUATION],
    }),
    
    fetchUnansweredReport: builder.query<UnansweredQuestionsReport, void>({
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
  useFetchEvaluationMetricsQuery,
  useFetchUnansweredReportQuery,
  useRunEvaluationHarnessMutation,
} = evaluationApi;