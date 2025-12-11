// Simple in-memory cache for API responses
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.cache = new Map();
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Clean every minute
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl: number = 300000) { // Default 5 minutes
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();