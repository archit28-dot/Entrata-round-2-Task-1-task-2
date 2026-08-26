export type HttpMethod = "GET" | "POST";

export type Item = {
  id: string;
  userId: string;
  name: string;
  updatedAt: string;
};

export type ItemsListResponse = {
  items: Item[];
  servedAt: string;
};

export type UpdateItemInput = {
  userId: string;
  itemId: string;
  name: string;
  fail?: boolean;
};

export type MockRequest = {
  method: HttpMethod;
  url: string;
  body?: unknown;
};

export type MockResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export type CacheLogType =
  | "CACHE MISS"
  | "CACHE HIT"
  | "MUTATION"
  | "CACHE INVALIDATION";

export type CacheLogEntry = {
  type: CacheLogType;
  timestamp: string;
  url?: string;
  cacheKey?: string;
  userId?: string;
  itemId?: string;
  success?: boolean;
  status?: number;
};

export type Clock = () => string;
