import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserProfile } from '../../models';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  isSignUp = false;
  isDark = false;
  isLoading = false;
  currentUser: UserProfile | null = null;

  formData = {
    name: '',
    email: '',
    password: '',
    goal: 'semester'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDark = theme === 'dark');

    this.currentUser = this.authService.currentUserValue;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (!this.formData.email || !this.formData.password) {
      this.notificationService.error('Missing Credentials', 'Please enter email and password');
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      const displayName = this.formData.name || this.formData.email.split('@')[0];
      this.authService.login(this.formData.email, displayName);
      this.isLoading = false;

      if (this.isSignUp) {
        this.notificationService.success('Account Created! 🚀', 'Starting your personalized syllabus onboarding...');
        this.router.navigate(['/welcome']);
      } else {
        this.notificationService.success('Welcome back!', 'Accessing your AI study dashboard...');
        this.router.navigate(['/dashboard']);
      }
    }, 600);
  }

  quickDemoLogin(role: 'eng' | 'med' | 'law'): void {
    this.isLoading = true;
    setTimeout(() => {
      if (role === 'eng') {
        this.authService.login('alex.rivera@mit.edu', 'Alex Rivera');
      } else if (role === 'med') {
        this.authService.login('sarah.chen@johnshopkins.edu', 'Sarah Chen');
      } else {
        this.authService.login('marcus.vance@stanford.edu', 'Marcus Vance');
      }
      this.isLoading = false;
      this.notificationService.success('Demo Session Started', 'Logged in with prepared syllabus data.');
      this.router.navigate(['/dashboard']);
    }, 500);
  }

  openWelcomeWizard(): void {
    this.router.navigate(['/welcome']);
  }

  openDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logoutSession(): void {
    this.authService.signOut();
    this.currentUser = null;
    this.notificationService.info('Signed Out', 'You have been signed out.');
  }
}
