import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const WALLET_KEY = 'portfolio_wallet';
const PORTFOLIO_KEY = 'portfolio_holdings';
const WATCHLIST_KEY = 'portfolio_watchlist';

let cachedToken: string | null = null;
let cachedUser: string | null = null;
let secureAvailable = false;

const webGet = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const webSet = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { }
};
const webRemove = (key: string) => {
  try { localStorage.removeItem(key); } catch { }
};

const ssGet = async (key: string) => {
  if (!secureAvailable) return webGet(key);
  try { return await SecureStore.getItemAsync(key); }
  catch { return webGet(key); }
};
const ssSet = async (key: string, value: string) => {
  if (!secureAvailable) { webSet(key, value); return; }
  try { await SecureStore.setItemAsync(key, value); }
  catch { webSet(key, value); }
};
const ssRemove = async (key: string) => {
  if (!secureAvailable) { webRemove(key); return; }
  try { await SecureStore.deleteItemAsync(key); }
  catch { webRemove(key); }
};

export const init = async () => {
  try { secureAvailable = await SecureStore.isAvailableAsync(); } catch { secureAvailable = false; }
  cachedToken = await ssGet(TOKEN_KEY);
  cachedUser = await ssGet(USER_KEY);
};

export const getToken = async () => {
  if (cachedToken !== null) return cachedToken;
  cachedToken = await ssGet(TOKEN_KEY);
  return cachedToken;
};

export const getTokenSync = () => cachedToken;

export const setToken = async (token: string) => {
  cachedToken = token;
  await ssSet(TOKEN_KEY, token);
};

export const removeToken = async () => {
  cachedToken = null;
  await ssRemove(TOKEN_KEY);
};

export const getUser = async () => {
  if (cachedUser !== null) return cachedUser;
  cachedUser = await ssGet(USER_KEY);
  return cachedUser;
};

export const setUser = async (user: string) => {
  cachedUser = user;
  await ssSet(USER_KEY, user);
};

export const removeUser = async () => {
  cachedUser = null;
  await ssRemove(USER_KEY);
};

export const getWallet = async () => {
  const v = await ssGet(WALLET_KEY);
  return v ? parseFloat(v) : null;
};
export const setWallet = async (value: number) => {
  await ssSet(WALLET_KEY, String(value));
};
export const removeWallet = async () => {
  await ssRemove(WALLET_KEY);
};

export const getPortfolio = async () => {
  const v = await ssGet(PORTFOLIO_KEY);
  return v ? JSON.parse(v) : null;
};
export const setPortfolio = async (value: any) => {
  await ssSet(PORTFOLIO_KEY, JSON.stringify(value));
};
export const removePortfolio = async () => {
  await ssRemove(PORTFOLIO_KEY);
};

export const getWatchlist = async () => {
  const v = await ssGet(WATCHLIST_KEY);
  return v ? JSON.parse(v) : null;
};
export const setWatchlist = async (value: string[]) => {
  await ssSet(WATCHLIST_KEY, JSON.stringify(value));
};
export const removeWatchlist = async () => {
  await ssRemove(WATCHLIST_KEY);
};

export const clear = async () => {
  await Promise.all([removeToken(), removeUser(), removeWallet(), removePortfolio(), removeWatchlist()]);
};
