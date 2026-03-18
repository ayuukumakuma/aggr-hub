const OGP_FETCH_TIMEOUT_MS = 5000;

export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(OGP_FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "aggr-hub/1.0 (OGP fetcher)",
        Accept: "text/html",
      },
    });

    if (!res.ok) return undefined;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) return undefined;

    const html = await res.text();

    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (!match?.[1]) return undefined;

    // Resolve relative URLs
    try {
      return new URL(match[1], url).toString();
    } catch {
      return match[1];
    }
  } catch {
    return undefined;
  }
}

export async function fetchOgImages(
  items: { url: string | undefined }[],
  concurrency = 5,
): Promise<(string | undefined)[]> {
  const results: (string | undefined)[] = Array.from<string | undefined>({ length: items.length });
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      results[i] = item?.url ? await fetchOgImage(item.url) : undefined;
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.allSettled(workers);

  return results;
}
