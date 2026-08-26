import { MockItemsServer } from "./mockServer";
import {
  CacheLogEntry,
  Clock,
  Item,
  ItemsListResponse,
  UpdateItemInput,
} from "./types";
import { getUserIdFromUrl, normalizeUrl } from "./urlCacheKey";

export class DataLayerError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DataLayerError";
  }
}

export class CachedItemsClient {
  private cache = new Map<string, ItemsListResponse>();
  private logs: CacheLogEntry[] = [];

  constructor(
    private readonly server: MockItemsServer,
    private readonly clock: Clock = () => new Date().toISOString(),
  ) {}

  async getItems(userId: string): Promise<ItemsListResponse> {
    return this.getList(`/items?userId=${encodeURIComponent(userId)}`);
  }

  async getList(url: string): Promise<ItemsListResponse> {
    const cacheKey = normalizeUrl(url);
    const cachedResponse = this.cache.get(cacheKey);

    if (cachedResponse) {
      this.log({
        type: "CACHE HIT",
        url,
        cacheKey,
        userId: getUserIdFromUrl(cacheKey),
      });
      return this.cloneList(cachedResponse);
    }

    this.log({
      type: "CACHE MISS",
      url,
      cacheKey,
      userId: getUserIdFromUrl(cacheKey),
    });

    const response = await this.server.handle({
      method: "GET",
      url: cacheKey,
    });

    if (!response.ok) {
      throw new DataLayerError(this.getErrorMessage(response.data), response.status);
    }

    const data = response.data as ItemsListResponse;
    this.cache.set(cacheKey, this.cloneList(data));
    return this.cloneList(data);
  }

  async updateItem(input: UpdateItemInput): Promise<Item> {
    const mutationUrl = normalizeUrl("/items");
    const response = await this.server.handle({
      method: "POST",
      url: mutationUrl,
      body: input,
    });

    this.log({
      type: "MUTATION",
      url: mutationUrl,
      userId: input.userId,
      itemId: input.itemId,
      success: response.ok,
      status: response.status,
    });

    if (!response.ok) {
      throw new DataLayerError(this.getErrorMessage(response.data), response.status);
    }

    this.invalidateItemsForUser(input.userId);
    return { ...(response.data as Item) };
  }

  getLogs(): CacheLogEntry[] {
    return this.logs.map((log) => ({ ...log }));
  }

  getCacheKeys(): string[] {
    return [...this.cache.keys()];
  }

  private invalidateItemsForUser(userId: string) {
    for (const cacheKey of [...this.cache.keys()]) {
      const url = new URL(cacheKey);

      if (url.pathname === "/items" && url.searchParams.get("userId") === userId) {
        this.cache.delete(cacheKey);
        this.log({
          type: "CACHE INVALIDATION",
          url: url.toString(),
          cacheKey,
          userId,
        });
      }
    }
  }

  private log(entry: Omit<CacheLogEntry, "timestamp">) {
    this.logs.push({
      ...entry,
      timestamp: this.clock(),
    });
  }

  private cloneList(response: ItemsListResponse): ItemsListResponse {
    return {
      servedAt: response.servedAt,
      items: response.items.map((item) => ({ ...item })),
    };
  }

  private getErrorMessage(data: unknown): string {
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    return "The data request failed.";
  }
}
