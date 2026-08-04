import { baseApi } from '@/common/api/baseApi';
import { API_TAGS } from '@/common/api/tags';
import type {
  DocumentRecord,
  IngestResponse,
  QueryResponse,
} from '@/common/types';
import type { UploadDocumentRequest } from '@/common/types/knowledge';

export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Document endpoints
    listDocuments: builder.query<DocumentRecord[], void>({
      query: () => '/documents',
      providesTags: [API_TAGS.DOCUMENTS],
    }),
    
    uploadDocument: builder.mutation<IngestResponse, UploadDocumentRequest>({
      query: ({ file, allowedDepartments, allowedRoles }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (allowedDepartments) {
          formData.append('allowed_departments', allowedDepartments);
        }
        if (allowedRoles) {
          formData.append('allowed_roles', allowedRoles);
        }
        return {
          url: '/ingest',
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, let browser set it with boundary
        };
      },
      invalidatesTags: [API_TAGS.DOCUMENTS],
    }),
    
    deleteDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.DOCUMENTS],
    }),
    
    updateDocumentAccess: builder.mutation<DocumentRecord, {
      documentId: string;
      allowedDepartments?: string[] | null;
      allowedRoles?: string[] | null;
    }>({
      query: ({ documentId, allowedDepartments, allowedRoles }) => ({
        url: `/documents/${documentId}/access`,
        method: 'PATCH',
        body: {
          allowed_departments: allowedDepartments ?? null,
          allowed_roles: allowedRoles ?? null,
        },
      }),
      invalidatesTags: [API_TAGS.DOCUMENTS],
    }),
    
    // Query endpoints
    queryKnowledge: builder.mutation<QueryResponse, { 
      query: string; 
      sessionId?: string | null 
    }>({
      query: ({ query, sessionId }) => ({
        url: '/query',
        method: 'POST',
        body: { query, session_id: sessionId ?? null },
      }),
    }),
    
    escalateQuery: builder.mutation<{
      escalated: boolean;
      escalation_ticket_id: string;
      message: string;
    }, {
      query: string;
      queryLogId?: string | null;
      confidenceScore?: number | null;
      answerPreview?: string | null;
    }>({
      query: (payload) => ({
        url: '/query/escalate',
        method: 'POST',
        body: {
          query: payload.query,
          query_log_id: payload.queryLogId ?? null,
          confidence_score: payload.confidenceScore ?? null,
          answer_preview: payload.answerPreview ?? null,
        },
      }),
    }),
    
    submitQueryFeedback: builder.mutation<void, {
      queryLogId: string;
      feedback: 'positive' | 'negative';
    }>({
      query: ({ queryLogId, feedback }) => ({
        url: `/queries/${queryLogId}/feedback`,
        method: 'POST',
        body: { feedback },
      }),
      invalidatesTags: [API_TAGS.FEEDBACK],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentAccessMutation,
  useQueryKnowledgeMutation,
  useEscalateQueryMutation,
  useSubmitQueryFeedbackMutation,
} = knowledgeApi;