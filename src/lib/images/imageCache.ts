import { IMAGE_CACHE_MAX_ENTRIES, IMAGE_CACHE_MAX_BYTES } from '../constants';
import { loadImageFromBlobKey } from './imageLoader';

interface CacheEntry {
  img: HTMLImageElement;
  bytes: number;
  lastAccess: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private totalBytes = 0;
  private maxEntries: number;
  private maxBytes: number;
  private pending = new Map<string, Promise<HTMLImageElement>>();

  constructor(
    maxEntries = IMAGE_CACHE_MAX_ENTRIES,
    maxBytes = IMAGE_CACHE_MAX_BYTES
  ) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
  }

  async get(blobKey: string): Promise<HTMLImageElement> {
    const existing = this.cache.get(blobKey);
    if (existing) {
      existing.lastAccess = performance.now();
      return existing.img;
    }

    // Deduplicate concurrent requests for the same key
    const pendingLoad = this.pending.get(blobKey);
    if (pendingLoad) return pendingLoad;

    const promise = this.load(blobKey);
    this.pending.set(blobKey, promise);
    try {
      return await promise;
    } finally {
      this.pending.delete(blobKey);
    }
  }

  private async load(blobKey: string): Promise<HTMLImageElement> {
    const img = await loadImageFromBlobKey(blobKey);
    const bytes = img.naturalWidth * img.naturalHeight * 4;

    // Evict until we have room
    while (
      this.cache.size >= this.maxEntries ||
      this.totalBytes + bytes > this.maxBytes
    ) {
      if (this.cache.size === 0) break;
      this.evictLRU();
    }

    this.cache.set(blobKey, {
      img,
      bytes,
      lastAccess: performance.now(),
    });
    this.totalBytes += bytes;

    return img;
  }

  async preload(blobKeys: string[]): Promise<void> {
    await Promise.all(blobKeys.map((k) => this.get(k)));
  }

  private evictLRU(): void {
    let oldest: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldest = key;
      }
    }
    if (oldest) {
      const entry = this.cache.get(oldest)!;
      this.totalBytes -= entry.bytes;
      this.cache.delete(oldest);
    }
  }

  evict(blobKey: string): void {
    const entry = this.cache.get(blobKey);
    if (entry) {
      this.totalBytes -= entry.bytes;
      this.cache.delete(blobKey);
    }
  }

  release(): void {
    this.cache.clear();
    this.totalBytes = 0;
  }
}

export const imageCache = new ImageCache();
