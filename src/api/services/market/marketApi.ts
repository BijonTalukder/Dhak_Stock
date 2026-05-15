import { baseApi } from "../baseApi";
import { Stock, StockDetailsResponse } from "./types";

export type StockItem = {
    _id?: string;
    name?: string;
    symbol?: string;
    price?: {
        ltp?: number;
        change?: number;
    };
};
export interface StockItemMarket {
    stockCode: string;
    stockName: string;
    sector: string;
    date: string;
    prices: {
        open: number;
        ltp: number;
        high: number;
        low: number;
        close: number;
        ycp: number;
        change: number;
        changePercent: number;
        trade: number;
        value: number;
        volume: number;
        dseIndex: number;
    };
}
const marketApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTopbarData: build.query<StockItem[], void>({
            query: () => ({
                url: "/stock-topbar",
                method: "GET",
            }),
            keepUnusedDataFor: 60,
        }),

        getMarketData: build.query<StockItemMarket[], { filter?: string; sortBy?: string }>({
            query: ({ filter, sortBy }) => ({
                url: `/stocks?filter=${filter || ""}&sortBy=${sortBy || ""}`,
                method: "GET",
            }),
            keepUnusedDataFor: 60,
        }),

        getStockDetails: build.query<StockDetailsResponse, string>({
            query: (symbol) => ({
                url: `/stocks-spark/${symbol}`,
                method: "GET",
            }),
            keepUnusedDataFor: 60,
        }),
    }),
});

export const {
    useGetTopbarDataQuery,
    useGetMarketDataQuery,
    useGetStockDetailsQuery,
} = marketApi;