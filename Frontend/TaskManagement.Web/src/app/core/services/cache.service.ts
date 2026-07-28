import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

interface CacheEntry {
  url: string;
  response: HttpResponse<any>;
  entryTime: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_AGE = 5 * 60 * 1000; // 5 mins

  get(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    const isExpired = Date.now() - entry.entryTime > this.MAX_CACHE_AGE;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return entry.response;
  }

  put(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, {
      url,
      response,
      entryTime: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
