import { baseApi } from "../baseApi";

export interface WatchlistItem {
  id: string;
  stockCode: string;
  addedAt: string;
  note: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const watchlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWatchlist: build.query<ApiResponse<WatchlistItem[]>, void>({
      query: () => ({
        url: "/watchlist",
        method: "GET",
      }),
      providesTags: ["Watchlist"],
    }),

    addToWatchlist: build.mutation<ApiResponse<WatchlistItem>, { stockCode: string }>({
      query: (body) => ({
        url: "/watchlist",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Watchlist"],
    }),

    removeFromWatchlist: build.mutation<ApiResponse<null>, string>({
      query: (stockCode) => ({
        url: `/watchlist/${stockCode}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Watchlist"],
    }),
  }),
});

export const {
  useGetWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} = watchlistApi;
