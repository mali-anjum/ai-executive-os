import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { API_TAGS } from './tags';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
});

export default baseApi;