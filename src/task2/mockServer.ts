import {
  Clock,
  Item,
  ItemsListResponse,
  MockRequest,
  MockResponse,
  UpdateItemInput,
} from "./types";
import { getUserIdFromUrl, normalizeUrl } from "./urlCacheKey";

type ErrorResponse = {
  message: string;
};

const defaultItems: Item[] = [
  {
    id: "item-1",
    userId: "1",
    name: "User 1 original",
    updatedAt: "2026-08-26T00:00:00.000Z",
  },
  {
    id: "item-1",
    userId: "2",
    name: "User 2 original",
    updatedAt: "2026-08-26T00:00:00.000Z",
  },
];

export class MockItemsServer {
  private itemsByUser = new Map<string, Item[]>();

  constructor(
    initialItems: Item[] = defaultItems,
    private readonly clock: Clock = () => new Date().toISOString(),
  ) {
    for (const item of initialItems) {
      const userItems = this.itemsByUser.get(item.userId) ?? [];
      userItems.push({ ...item });
      this.itemsByUser.set(item.userId, userItems);
    }
  }

  async handle(
    request: MockRequest,
  ): Promise<MockResponse<ItemsListResponse | Item | ErrorResponse>> {
    const url = new URL(normalizeUrl(request.url));

    if (request.method === "GET" && url.pathname === "/items") {
      return this.getItems(url.toString());
    }

    if (request.method === "POST" && url.pathname === "/items") {
      return this.updateItem(request.body);
    }

    return {
      ok: false,
      status: 404,
      data: { message: "Route not found." },
    };
  }

  private getItems(url: string): MockResponse<ItemsListResponse | ErrorResponse> {
    const userId = getUserIdFromUrl(url);

    if (!userId) {
      return {
        ok: false,
        status: 400,
        data: { message: "GET /items requires a userId query parameter." },
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        items: this.cloneItems(this.itemsByUser.get(userId) ?? []),
        servedAt: this.clock(),
      },
    };
  }

  private updateItem(body: unknown): MockResponse<Item | ErrorResponse> {
    if (!this.isUpdateInput(body)) {
      return {
        ok: false,
        status: 400,
        data: { message: "POST /items requires userId, itemId, and name." },
      };
    }

    if (body.fail) {
      return {
        ok: false,
        status: 500,
        data: { message: "Mock mutation failed." },
      };
    }

    const userItems = this.itemsByUser.get(body.userId) ?? [];
    const existingItemIndex = userItems.findIndex((item) => item.id === body.itemId);
    const updatedItem: Item = {
      id: body.itemId,
      userId: body.userId,
      name: body.name,
      updatedAt: this.clock(),
    };

    if (existingItemIndex >= 0) {
      userItems[existingItemIndex] = updatedItem;
    } else {
      userItems.push(updatedItem);
    }

    this.itemsByUser.set(body.userId, userItems);

    return {
      ok: true,
      status: 200,
      data: { ...updatedItem },
    };
  }

  private isUpdateInput(body: unknown): body is UpdateItemInput {
    if (!body || typeof body !== "object") {
      return false;
    }

    const candidate = body as Partial<UpdateItemInput>;
    return (
      typeof candidate.userId === "string" &&
      typeof candidate.itemId === "string" &&
      typeof candidate.name === "string"
    );
  }

  private cloneItems(items: Item[]): Item[] {
    return items.map((item) => ({ ...item }));
  }
}
