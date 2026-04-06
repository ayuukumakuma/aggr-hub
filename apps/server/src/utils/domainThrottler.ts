const DEFAULT_INTERVAL_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class DomainThrottler {
  private queues = new Map<string, Promise<unknown>>();
  private intervalMs: number;

  constructor(intervalMs = DEFAULT_INTERVAL_MS) {
    this.intervalMs = intervalMs;
  }

  async throttle<T>(url: string, fn: () => Promise<T>): Promise<T> {
    const domain = new URL(url).hostname;
    const prev = this.queues.get(domain) ?? Promise.resolve();

    const next = prev
      .catch(() => {})
      .then(() => delay(this.intervalMs))
      .then(() => fn());

    this.queues.set(domain, next);

    try {
      return await next;
    } finally {
      if (this.queues.get(domain) === next) {
        this.queues.delete(domain);
      }
    }
  }
}

export { delay };
export const domainThrottler = new DomainThrottler();
