import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  isSignUp = false;
  isDark = false;
  isLoading = false;

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

    // If already logged in, redirect to dashboard
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
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
      this.authService.login(this.formData.email, this.formData.name || 'Alex Rivera');
      this.isLoading = false;
      this.notificationService.success('Welcome back!', 'Accessing your AI study dashboard...');
      this.router.navigate(['/dashboard']);
    }, 700);
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
}
