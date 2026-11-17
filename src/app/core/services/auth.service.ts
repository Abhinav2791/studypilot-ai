import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  UserProfile, AuthState, StudyGoal, ThemeMode
} from '../../models';
import { StorageService } from './storage.service';

const DEMO_USER: UserProfile = {
  id: 'demo-001',
  name: 'Alex Johnson',
  email: 'alex@demo.studypilot.ai',
  avatarInitials: 'AJ',
  createdAt: new Date(),
  goal: 'semester',
  dailyStudyHours: 4,
  preferredPeriods: ['morning', 'evening'],
  theme: 'light',
  notificationsEnabled: true,
  soundEnabled: false,
  preferredFocusDuration: 25
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    isDemoMode: true
  });

  auth$ = this.authSubject.asObservable();

  /** Observable of the current user profile (null when not logged in) */
  currentUser$: Observable<UserProfile | null> = this.authSubject.pipe(
    map(state => state.user)
  );

  constructor(private storage: StorageService) {
    this.restoreSession();
  }

  get isAuthenticated(): boolean {
    return this.authSubject.value.isAuthenticated;
  }

  get currentUser(): UserProfile | null {
    return this.authSubject.value.user;
  }

  /** Alias used by components */
  get currentUserValue(): UserProfile | null {
    return this.authSubject.value.user;
  }

  get isDemoMode(): boolean {
    return this.authSubject.value.isDemoMode;
  }

  /**
   * Login / Demo sign-in. No real credentials are checked.
   * This is a demo-mode application; auth is local only.
   */
  login(email: string, name: string = 'User'): void {
    this.signInDemo(name, email);
  }

  /** DEMO mode sign-in — no real credentials, clearly labeled */
  signInDemo(name: string, email: string): void {
    const user: UserProfile = {
      ...DEMO_USER,
      name: name || DEMO_USER.name,
      email: email || DEMO_USER.email,
      avatarInitials: this.getInitials(name || DEMO_USER.name)
    };
    const state: AuthState = { isAuthenticated: true, user, isDemoMode: true };
    this.authSubject.next(state);
    this.storage.set('auth_user', user);
  }

  signOut(): void {
    this.authSubject.next({ isAuthenticated: false, user: null, isDemoMode: true });
    this.storage.remove('auth_user');
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const current = this.authSubject.value;
    if (!current.user) return;
    const updated = { ...current.user, ...updates };
    this.authSubject.next({ ...current, user: updated });
    this.storage.set('auth_user', updated);
  }

  private restoreSession(): void {
    const saved = this.storage.get<UserProfile | null>('auth_user', null);
    if (saved && saved.id) {
      this.authSubject.next({ isAuthenticated: true, user: saved, isDemoMode: true });
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  }
}
