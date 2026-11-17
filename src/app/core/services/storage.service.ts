import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = 'studypilot_';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch { /* storage full or not available */ }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch { /* ignore */ }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }

  // Helper: get Date values properly deserialized
  getWithDates<T>(key: string, fallback: T, dateFields: string[] = []): T {
    const value = this.get<T>(key, fallback);
    if (value && typeof value === 'object') {
      this.convertDates(value as Record<string, unknown>, dateFields);
    }
    return value;
  }

  private convertDates(obj: Record<string, unknown>, fields: string[]): void {
    for (const field of fields) {
      if (obj[field] && typeof obj[field] === 'string') {
        obj[field] = new Date(obj[field] as string);
      }
    }
  }
}
