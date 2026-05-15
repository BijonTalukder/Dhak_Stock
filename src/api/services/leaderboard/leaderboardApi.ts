import { baseApi } from "../baseApi";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  tier: string;
  totalValue: number;
  walletBalance: number;
  holdingsValue: number;
  netPnL: number;
  pnlPercent: number;
  totalTrades: number;
  winRate: number;
  holdings: {
    stockCode: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const leaderboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLeaderboard: build.query<ApiResponse<LeaderboardEntry[]>, { limit?: number; skip?: number }>({
      query: ({ limit = 50, skip = 0 } = {}) => ({
        url: `/leaderboard?limit=${limit}&skip=${skip}`,
        method: "GET",
      }),
    }),

    getUserRank: build.query<ApiResponse<LeaderboardEntry>, void>({
      query: () => ({
        url: "/leaderboard/me",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useGetUserRankQuery,
} = leaderboardApi;
