import { CachedItemsClient } from "./cachedItemsClient";
import { MockItemsServer } from "./mockServer";
import { CacheLogEntry, Clock, ItemsListResponse } from "./types";

export type Task2DemoResult = {
  firstGet: ItemsListResponse;
  repeatedGet: ItemsListResponse;
  freshGetAfterMutation: ItemsListResponse;
  logs: CacheLogEntry[];
};

export async function runTask2DemoFlow(
  clock: Clock = () => new Date().toISOString(),
): Promise<Task2DemoResult> {
  const server = new MockItemsServer(undefined, clock);
  const client = new CachedItemsClient(server, clock);

  const firstGet = await client.getItems("1");
  const repeatedGet = await client.getItems("1");
  await client.updateItem({
    userId: "1",
    itemId: "item-1",
    name: "User 1 updated",
  });
  const freshGetAfterMutation = await client.getItems("1");

  return {
    firstGet,
    repeatedGet,
    freshGetAfterMutation,
    logs: client.getLogs(),
  };
}
