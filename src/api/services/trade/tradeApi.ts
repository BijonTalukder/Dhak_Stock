import { baseApi } from "../baseApi";

export interface TradeRequest {
  stockCode: string;
  quantity: number;
  price: number;
}

export interface TradeResponse {
  id: string;
  stockCode: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  grossAmount: number;
  fee: number;
  netAmount: number;
  avgBuyPrice: number | null;
  realizedPnL: number | null;
  realizedPnLPercent: number | null;
  status: string;
  executedAt: string;
}

export interface HoldingResponse {
  stockCode: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number | null;
  change: number | null;
  changePercent: number | null;
  investedValue: number;
  currentValue: number | null;
  pnl: number | null;
  pnlPercent: string | null;
  realizedPnL: number;
}

export interface TradeHistoryResponse {
  success: boolean;
  message: string;
  data: TradeResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const tradeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    buyStock: build.mutation<ApiResponse<TradeResponse>, TradeRequest>({
      query: (body) => ({
        url: "/trades/buy",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Holdings"],
    }),

    sellStock: build.mutation<ApiResponse<TradeResponse>, TradeRequest>({
      query: (body) => ({
        url: "/trades/sell",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Holdings"],
    }),

    getHoldings: build.query<ApiResponse<HoldingResponse[]>, void>({
      query: () => ({
        url: "/trades/holdings",
        method: "GET",
      }),
      providesTags: ["Holdings"],
    }),

    getTrades: build.query<TradeHistoryResponse, { limit?: number; skip?: number }>({
      query: ({ limit = 50, skip = 0 }) => ({
        url: `/trades?limit=${limit}&skip=${skip}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useBuyStockMutation,
  useSellStockMutation,
  useGetHoldingsQuery,
  useGetTradesQuery,
} = tradeApi;
