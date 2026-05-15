import { baseApi } from "../baseApi";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  tier: string;
  stats: {
    totalTrades: number;
    totalBuys: number;
    totalSells: number;
    totalProfit: number;
    totalLoss: number;
    netPnL: number;
    bestTrade: number;
    winRate: number;
  };
  createdAt: string;
}

export interface AuthResponseData {
  token: string;
  user: AuthUser;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface WalletInfo {
  balance: number;
  lockedBalance: number;
  available: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBought: number;
  totalSold: number;
  totalFeesPaid: number;
  currency: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    wallet: WalletInfo;
  };
}

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        data: body,
      }),
    }),

    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        data: body,
      }),
    }),

    getProfile: build.query<ProfileResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
} = authApi;
