# Important (code for task2 exists in src/task2 while rest of the project code is related to task2)
# Task 1 Profile Settings Form

A minimal Vite + React + TypeScript profile settings form.

## Run Locally

```bash
npm install
npm run dev
```

Test:

```bash
npm test
```

Build:

```bash
npm run build
```

## Validation Rules

- Display name is required after trimming whitespace.
- Phone is optional. When provided, it must start with `+`, use only digits, spaces, parentheses, hyphens, periods, and the leading plus sign, and contain 8 to 15 digits total including the country code. The first digit of the country code must be 1 to 9.
- Website is optional. When provided, it must begin with `http://` or `https://`, parse as a URL, and include a hostname with a dot, such as `https://example.com`. A value like `example.com` fails with a message explaining that the protocol is required.
- Bio is optional and limited to 160 characters.

Each field shows its own inline error, clears that error when the value becomes valid on change or blur, and valid values remain in place when another field is invalid.

## Assumptions

- Phone validation is a lightweight international pattern check, not full carrier or region-specific validation.
- Website validation intentionally requires a dotted hostname, so local or intranet URLs such as `http://localhost` are not accepted.

# Task 2

## Task Title
Cache Stale Reads

## Task Description
Debug a small data-fetch layer that returns stale results after mutations.

Users POST an update, then GET the list, but they still see old values intermittently.

Improve:
- Cache keys
- Cache invalidation
- ETag handling

## Summary — Usability

Run with mocked fetch so logs show:
- Cache hits/misses
- Mutation timestamps

Users should see predictable refresh after updates.

## Input and Output

**Input:**
- List URL
- Item update URL
- Payloads

**Output:**
- Fresh list after successful mutation

## Example Bug Scenario

GET responses are memoized by URL only, ignoring the user ID query parameter.

This can cause:
- Cross-user data leakage
- Stale lists after POST