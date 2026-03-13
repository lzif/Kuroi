import * as cheerio from 'cheerio';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

interface FetchOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: any;
  retries?: number;
}

interface ScraperConfig {
  minDelay?: number;        // Minimum delay between requests (ms)
  maxRetries?: number;      // Max retry attempts
  baseDelay?: number;       // Base delay for exponential backoff (ms)
  timeout?: number;         // Request timeout (ms)
  useSession?: boolean;     // Maintain session cookies
}

// Rotating user agents to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

// Common headers for Cloudflare bypass
const CLOUDFLARE_HEADERS: Record<string, string> = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

export abstract class BaseScraper {
  protected abstract name: string;
  protected abstract baseUrl: string;
  
  protected config: ScraperConfig;
  private cache = new Map<string, CacheEntry<any>>();
  private cacheTTL = 1000 * 60 * 5; // 5 minutes default
  private lastRequestTime = 0;
  private sessionCookies: Map<string, string> = new Map();
  private userAgentIndex = 0;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      minDelay: config.minDelay ?? 1500,
      maxRetries: config.maxRetries ?? 3,
      baseDelay: config.baseDelay ?? 1000,
      timeout: config.timeout ?? 30000,
      useSession: config.useSession ?? true,
    };
  }

  protected async fetch(url: string, options: FetchOptions = {}, useCache = true): Promise<string> {
    if (useCache) {
      const cached = this.getFromCache<string>(url);
      if (cached) {
        console.log(`[${this.name}] Cache hit for ${url}`);
        return cached;
      }
    }

    const maxRetries = options.retries ?? this.config.maxRetries!;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimit();
        
        const html = await this.doFetch(url, options);
        
        if (useCache) {
          this.setCache(url, html);
        }
        
        return html;
      } catch (error: any) {
        lastError = error;
        const status = error.status || 0;
        
        // Don't retry on 404
        if (status === 404) {
          throw error;
        }
        
        // Handle rate limiting (429) and server errors (5xx)
        if (status === 429 || status >= 500) {
          const delay = this.calculateBackoff(attempt);
          console.warn(`[${this.name}] Attempt ${attempt + 1} failed (${status}), retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
        
        // Handle Cloudflare challenges
        if (status === 403 && attempt < maxRetries) {
          const delay = this.calculateBackoff(attempt) * 2; // Longer delay for CF
          console.warn(`[${this.name}] Cloudflare challenge detected, retrying in ${delay}ms...`);
          this.rotateUserAgent();
          await this.sleep(delay);
          continue;
        }
        
        // Network errors - retry with backoff
        if (attempt < maxRetries) {
          const delay = this.calculateBackoff(attempt);
          console.warn(`[${this.name}] Network error, retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
        
        throw error;
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
  }

  private async doFetch(url: string, options: FetchOptions): Promise<string> {
    const headers = this.buildHeaders(url, options.headers);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.lastRequestTime = Date.now();

      // Extract and store cookies from response
      if (this.config.useSession) {
        this.extractCookies(response);
      }

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      const html = await response.text();

      // Detect Cloudflare challenge page
      if (html.includes('challenge-platform') || html.includes('cf-browser-verification')) {
        const error: any = new Error('Cloudflare challenge detected');
        error.status = 403;
        throw error;
      }

      return html;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError: any = new Error(`Request timeout after ${this.config.timeout}ms`);
        timeoutError.status = 408;
        throw timeoutError;
      }
      
      throw error;
    }
  }

  private buildHeaders(url: string, customHeaders?: Record<string, string>): Record<string, string> {
    const parsedUrl = new URL(url);
    const userAgent = USER_AGENTS[this.userAgentIndex];
    
    const headers: Record<string, string> = {
      ...CLOUDFLARE_HEADERS,
      'User-Agent': userAgent,
      'Referer': parsedUrl.origin,
      'Origin': parsedUrl.origin,
    };

    // Add session cookies if available
    if (this.config.useSession && this.sessionCookies.size > 0) {
      const cookieStr = Array.from(this.sessionCookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
      headers['Cookie'] = cookieStr;
    }

    return { ...headers, ...customHeaders };
  }

  private extractCookies(response: Response): void {
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      // Parse Set-Cookie header
      const cookies = setCookie.split(',').flatMap(c => c.split(';'));
      for (const cookie of cookies) {
        const [nameValue] = cookie.trim().split(';');
        if (nameValue && nameValue.includes('=')) {
          const [name, value] = nameValue.split('=');
          if (name && value) {
            this.sessionCookies.set(name.trim(), value.trim());
          }
        }
      }
    }
  }

  private rotateUserAgent(): void {
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
    console.log(`[${this.name}] Rotated to user agent ${this.userAgentIndex + 1}`);
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.baseDelay!;
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 500;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    const minDelay = this.config.minDelay!;
    
    if (timeSinceLast < minDelay) {
      const delay = minDelay - timeSinceLast + Math.random() * 500; // Add jitter
      await this.sleep(delay);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async fetchDOM(url: string, options: FetchOptions = {}): Promise<cheerio.CheerioAPI> {
    const html = await this.fetch(url, options);
    return cheerio.load(html);
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

  private setCache<T>(key: string, data: T, ttl: number = this.cacheTTL): void {
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

  // Utility methods for subclasses
  protected cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  protected extractNumber(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }
}

