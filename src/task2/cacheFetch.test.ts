import { beforeEach, describe, expect, it } from "vitest";
import { CachedItemsClient, DataLayerError } from "./cachedItemsClient";
import { runTask2DemoFlow } from "./demoFlow";
import { MockItemsServer } from "./mockServer";
import { Clock } from "./types";
import { normalizeUrl } from "./urlCacheKey";

function createDeterministicClock(): Clock {
  let tick = 0;

  return () => {
    tick += 1;
    return `2026-08-26T00:00:${String(tick).padStart(2, "0")}.000Z`;
  };
}

describe("Task 2 cached data layer", () => {
  let client: CachedItemsClient;

  beforeEach(() => {
    const clock = createDeterministicClock();
    const server = new MockItemsServer(undefined, clock);
    client = new CachedItemsClient(server, clock);
  });

  it("logs the first GET as a cache miss", async () => {
    const response = await client.getItems("1");

    expect(response.items).toHaveLength(1);
    expect(client.getLogs()).toMatchObject([
      {
        type: "CACHE MISS",
        userId: "1",
        cacheKey: "https://mock.api.local/items?userId=1",
      },
    ]);
  });

  it("logs a repeated identical GET as a cache hit", async () => {
    const first = await client.getItems("1");
    const repeated = await client.getItems("1");

    expect(repeated).toEqual(first);
    expect(client.getLogs().map((log) => log.type)).toEqual([
      "CACHE MISS",
      "CACHE HIT",
    ]);
  });

  it("uses independent cache entries for different userId query parameters", async () => {
    const userOne = await client.getItems("1");
    const userTwo = await client.getItems("2");

    expect(userOne.items[0]).toMatchObject({
      userId: "1",
      name: "User 1 original",
    });
    expect(userTwo.items[0]).toMatchObject({
      userId: "2",
      name: "User 2 original",
    });
    expect(client.getCacheKeys()).toEqual([
      "https://mock.api.local/items?userId=1",
      "https://mock.api.local/items?userId=2",
    ]);
    expect(client.getLogs().map((log) => log.type)).toEqual([
      "CACHE MISS",
      "CACHE MISS",
    ]);
  });

  it("normalizes full URLs and query parameter order in cache keys", async () => {
    await client.getList("/items?sort=name&userId=1");
    await client.getList("/items?userId=1&sort=name");

    expect(client.getCacheKeys()).toEqual([
      "https://mock.api.local/items?sort=name&userId=1",
    ]);
    expect(client.getLogs().map((log) => log.type)).toEqual([
      "CACHE MISS",
      "CACHE HIT",
    ]);
    expect(normalizeUrl("/items?userId=1&sort=name")).toBe(
      "https://mock.api.local/items?sort=name&userId=1",
    );
  });

  it("changes server data after a successful POST", async () => {
    const updatedItem = await client.updateItem({
      userId: "1",
      itemId: "item-1",
      name: "User 1 updated",
    });
    const list = await client.getItems("1");

    expect(updatedItem).toMatchObject({
      userId: "1",
      id: "item-1",
      name: "User 1 updated",
    });
    expect(list.items[0]).toMatchObject({
      userId: "1",
      id: "item-1",
      name: "User 1 updated",
    });
  });

  it("invalidates the appropriate cached GET after a successful POST", async () => {
    await client.getItems("1");
    await client.getItems("2");

    await client.updateItem({
      userId: "1",
      itemId: "item-1",
      name: "User 1 updated",
    });

    expect(client.getCacheKeys()).toEqual([
      "https://mock.api.local/items?userId=2",
    ]);
    expect(client.getLogs()).toMatchObject([
      { type: "CACHE MISS", userId: "1" },
      { type: "CACHE MISS", userId: "2" },
      { type: "MUTATION", userId: "1", itemId: "item-1", success: true },
      { type: "CACHE INVALIDATION", userId: "1" },
    ]);
  });

  it("returns fresh updated data on the GET after a successful POST", async () => {
    const staleCandidate = await client.getItems("1");

    await client.updateItem({
      userId: "1",
      itemId: "item-1",
      name: "User 1 updated",
    });
    const fresh = await client.getItems("1");

    expect(staleCandidate.items[0].name).toBe("User 1 original");
    expect(fresh.items[0].name).toBe("User 1 updated");
    expect(client.getLogs().map((log) => log.type)).toEqual([
      "CACHE MISS",
      "MUTATION",
      "CACHE INVALIDATION",
      "CACHE MISS",
    ]);
  });

  it("leaves existing cached data unchanged after a failed POST", async () => {
    const cachedBeforeFailure = await client.getItems("1");

    await expect(
      client.updateItem({
        userId: "1",
        itemId: "item-1",
        name: "Should not persist",
        fail: true,
      }),
    ).rejects.toBeInstanceOf(DataLayerError);

    const cachedAfterFailure = await client.getItems("1");

    expect(cachedAfterFailure).toEqual(cachedBeforeFailure);
    expect(cachedAfterFailure.items[0].name).toBe("User 1 original");
    expect(client.getLogs().map((log) => log.type)).toEqual([
      "CACHE MISS",
      "MUTATION",
      "CACHE HIT",
    ]);
    expect(
      client.getLogs().some((log) => log.type === "CACHE INVALIDATION"),
    ).toBe(false);
  });

  it("logs cache hit/miss, mutation, invalidation, and timestamps", async () => {
    await client.getItems("1");
    await client.getItems("1");
    await client.updateItem({
      userId: "1",
      itemId: "item-1",
      name: "User 1 updated",
    });

    const logs = client.getLogs();

    expect(logs.map((log) => log.type)).toEqual([
      "CACHE MISS",
      "CACHE HIT",
      "MUTATION",
      "CACHE INVALIDATION",
    ]);
    for (const log of logs) {
      expect(log.timestamp).toMatch(
        /^2026-08-26T00:00:\d{2}\.000Z$/,
      );
    }
    expect(logs[0]).toMatchObject({
      url: "/items?userId=1",
      userId: "1",
    });
    expect(logs[2]).toMatchObject({
      itemId: "item-1",
      success: true,
      status: 200,
      userId: "1",
    });
  });

  it("prevents cross-user data leakage through the cache", async () => {
    await client.getItems("1");
    await client.updateItem({
      userId: "1",
      itemId: "item-1",
      name: "User 1 private update",
    });

    const userTwo = await client.getItems("2");
    const userOne = await client.getItems("1");

    expect(userTwo.items).toEqual([
      expect.objectContaining({
        userId: "2",
        name: "User 2 original",
      }),
    ]);
    expect(userOne.items).toEqual([
      expect.objectContaining({
        userId: "1",
        name: "User 1 private update",
      }),
    ]);
  });

  it("provides a demo flow showing MISS, HIT, mutation, invalidation, and fresh MISS", async () => {
    const result = await runTask2DemoFlow(createDeterministicClock());

    expect(result.firstGet.items[0].name).toBe("User 1 original");
    expect(result.repeatedGet.items[0].name).toBe("User 1 original");
    expect(result.freshGetAfterMutation.items[0].name).toBe("User 1 updated");
    expect(result.logs.map((log) => log.type)).toEqual([
      "CACHE MISS",
      "CACHE HIT",
      "MUTATION",
      "CACHE INVALIDATION",
      "CACHE MISS",
    ]);
  });
});
