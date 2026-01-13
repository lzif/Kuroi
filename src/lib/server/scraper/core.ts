import * as cheerio from 'cheerio';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

interface FetchOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: any;
}

export abstract class BaseScraper {
  protected abstract name: string;
  protected abstract baseUrl: string;
  private cache = new Map<string, CacheEntry<any>>();
  private cacheTTL = 1000 * 60 * 5; // 5 minutes default
  private lastRequestTime = 0;
  private minDelay = 1000; // 1 second between requests per instance

  protected async fetch(url: string, options: FetchOptions = {}, useCache = true): Promise<string> {
    if (useCache) {
      const cached = this.getFromCache<string>(url);
      if (cached) return cached;
    }

    await this.rateLimit();

    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...options.headers
      };

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      this.lastRequestTime = Date.now();

      if (useCache) {
        this.setCache(url, html);
      }

      return html;
    } catch (error) {
      console.error(`[${this.name}] Fetch error for ${url}:`, error);
      throw error;
    }
  }

  protected async fetchDOM(url: string, options: FetchOptions = {}): Promise<cheerio.CheerioAPI> {
    const html = await this.fetch(url, options);
    return cheerio.load(html);
  }

  private async rateLimit() {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.minDelay - timeSinceLast));
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.cacheTTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  protected resolveUrl(path: string): string {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${this.baseUrl}${path}`;
    return `${this.baseUrl}/${path}`;
  }
}

