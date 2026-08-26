## Task 2 — Repository Inspection

We are now starting Task 2: Cache Stale Reads from the coding challenge.

Important: do NOT modify the existing Task 1 implementation yet, and do NOT create a new project or folder yet.

First inspect the current repository and determine whether there is already any data-fetching, API, caching, or mutation layer that can be extended for Task 2.

Task 2 requirements:

- Debug a data-fetch layer that returns stale results after mutations.
- A user performs a POST update and then a GET list, but old values may still appear intermittently.
- Improve cache keys, cache invalidation, or ETag handling as appropriate.
- Use mocked fetch behavior so logs demonstrate cache hits/misses and mutation timestamps.
- After a successful mutation, the next list GET must return fresh data.
- Cache keys must correctly account for query parameters.
- Specifically consider the example where GET responses are memoized by URL while ignoring a `userId` query parameter, which can cause stale results or cross-user leakage.

Do NOT implement anything yet.

Report:
1. Whether the current repository contains a suitable data-fetch/cache layer.
2. Which existing files, if any, are relevant to Task 2.
3. The likely root cause of the stale-read bug.
4. Whether Task 2 should be implemented as an extension of the current project or as a separate minimal module within the same repository.
5. A minimal implementation plan.
6. A test plan covering:
   - cache hit
   - cache miss
   - different `userId` query parameters producing independent cache entries
   - successful POST mutation followed by a fresh GET
   - failed mutation not incorrectly invalidating or corrupting cache
   - logged mutation/cache timestamps

Keep the existing Task 1 code untouched for now.

## Task 2 — Implementation

Implement Task 2 as a self-contained module under `src/task2/`.

Do not modify any Task 1 source files, tests, or behavior.

Build a small mocked data-fetch/cache layer that demonstrates and fixes the stale-read bug described in the challenge.

Requirements:

1. Create a mock server/data source with in-memory data.
   - Support GET list requests.
   - Support POST item updates.
   - Make the server state actually change after a successful POST so stale reads can be demonstrated.

2. Create a cached fetch/data layer.
   - Cache GET responses.
   - Build cache keys from the full normalized URL, including query parameters.
   - `/items?userId=1` and `/items?userId=2` MUST have independent cache entries.
   - Do not cache POST mutations.

3. Mutation invalidation:
   - After a successful POST update, invalidate the relevant cached list(s).
   - The next GET after a successful mutation must fetch fresh server data.
   - A failed POST must not invalidate or corrupt an existing cache entry.

4. Logging:
   Log clear structured messages for:
   - `CACHE MISS`
   - `CACHE HIT`
   - `MUTATION`
   - `CACHE INVALIDATION`
   
   Include relevant URL/`userId` information and timestamps so cache behavior is easy to inspect.

5. Tests:
   Add comprehensive Vitest tests covering:
   - first GET cache miss
   - repeated identical GET cache hit
   - different `userId` query parameters use different cache entries
   - successful POST changes server data
   - successful POST invalidates the relevant cached GET
   - GET after successful POST returns fresh updated data
   - failed POST leaves existing cached data unchanged
   - logs contain cache hit/miss, mutation, invalidation, and timestamps
   - no cross-user data leakage through the cache

6. Keep the implementation small and production-minded:
   - clear separation between mock server, cache, and API/fetch layer
   - TypeScript types
   - no unnecessary dependencies
   - meaningful error handling
   - avoid global state that makes tests interfere with each other
   - reset/isolate state between tests

7. Add a small demonstration/testable function or example flow that makes the intended behavior obvious:

   `GET → MISS → GET → HIT → POST → INVALIDATION → GET → MISS with fresh data`

Do not add a UI for Task 2 unless it is necessary. This task is about the data-fetch/cache layer.

After implementation:
- run `npm.cmd test`
- run `npm.cmd run build`
- fix all failures
- summarize the files created, the root-cause fix, and the tests/results.