import { baseApi } from '@/common/api/basApi';
import { API_TAGS } from '@/common/api/tags';
import type { TicketRecord } from '@/common/types';

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTickets: builder.query<TicketRecord[], void>({
      query: () => '/tickets',
      providesTags: [API_TAGS.TICKETS],
    }),
    
    approveTicket: builder.mutation<TicketRecord, string>({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.TICKETS],
    }),
    
    rejectTicket: builder.mutation<TicketRecord, string>({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.TICKETS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListTicketsQuery,
  useApproveTicketMutation,
  useRejectTicketMutation,
} = ticketsApi;