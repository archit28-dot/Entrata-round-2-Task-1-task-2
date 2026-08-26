const API_BASE_URL = "https://mock.api.local";

export function normalizeUrl(input: string): string {
  const url = new URL(input, API_BASE_URL);
  const sortedParams = [...url.searchParams.entries()].sort(([keyA, valueA], [
    keyB,
    valueB,
  ]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB));

  url.search = "";
  for (const [key, value] of sortedParams) {
    url.searchParams.append(key, value);
  }

  return url.toString();
}

export function getUserIdFromUrl(input: string): string | undefined {
  const url = new URL(input, API_BASE_URL);
  return url.searchParams.get("userId") ?? undefined;
}
