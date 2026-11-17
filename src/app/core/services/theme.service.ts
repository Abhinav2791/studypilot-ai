import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeMode } from '../../models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'studypilot_theme';
  private themeSubject = new BehaviorSubject<ThemeMode>(this.getInitialTheme());

  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  setTheme(mode: ThemeMode): void {
    this.themeSubject.next(mode);
    this.applyTheme(mode);
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch { /* ignore */ }
  }

  toggleTheme(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }

  private getInitialTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }
}
