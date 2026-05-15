import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';
export const TAG_TYPES = {
  Holdings: "Holdings",
  Watchlist: "Watchlist",
} as const;
const tagTypesArray = Object.values(TAG_TYPES);
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({
        baseUrl: 'http://localhost:5000/api'
    }),
    keepUnusedDataFor: 300,
    tagTypes: tagTypesArray,
    refetchOnFocus: false,
    refetchOnReconnect: true,

    endpoints: (builder) => ({

    }),
});

export const {

} = baseApi;