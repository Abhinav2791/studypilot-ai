import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { StudyGoal, StudyPeriod, ThemeMode, UserProfile } from '../../models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  isDark = false;

  profile: UserProfile = {
    id: 'user-001',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    avatarInitials: 'AR',
    createdAt: new Date(),
    goal: 'semester',
    dailyStudyHours: 4,
    preferredPeriods: ['morning', 'evening'],
    theme: 'light',
    notificationsEnabled: true,
    soundEnabled: true,
    preferredFocusDuration: 25
  };

  studyGoals: { id: StudyGoal; label: string; desc: string }[] = [
    { id: 'semester', label: 'Semester Finals', desc: 'Optimize GPA and balanced revision across 4+ subjects' },
    { id: 'placement', label: 'Tech Placements & Coding', desc: 'DSA, System Design, and core CS fundamentals focus' },
    { id: 'competitive', label: 'Competitive Entrance Exams', desc: 'High-intensity problem speed, accuracy & mock test pacing' },
    { id: 'general', label: 'Lifelong Skill Mastery', desc: 'Self-directed continuous learning without strict exam pressure' }
  ];

  periods: { id: StudyPeriod; label: string; time: string }[] = [
    { id: 'morning', label: 'Morning Sprint', time: '07:00 - 11:30' },
    { id: 'afternoon', label: 'Afternoon Block', time: '13:00 - 17:00' },
    { id: 'evening', label: 'Evening Deep Work', time: '18:00 - 21:30' },
    { id: 'night', label: 'Late Night Review', time: '22:00 - 01:00' }
  ];

  private destroy$ = new RxSubject<void>();

  isSidebarCollapsed = false;
  isMobileNavOpen = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private plannerService: StudyPlannerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDark = theme === 'dark';
        this.profile.theme = theme;
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.profile = { ...this.profile, ...user };
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.profile.theme = mode;
    this.notificationService.info('Theme Updated', `Switched to ${mode} mode`);
  }

  togglePeriod(period: StudyPeriod): void {
    const idx = this.profile.preferredPeriods.indexOf(period);
    if (idx >= 0) {
      if (this.profile.preferredPeriods.length > 1) {
        this.profile.preferredPeriods.splice(idx, 1);
      } else {
        this.notificationService.warning('Preference', 'Select at least one preferred study window');
      }
    } else {
      this.profile.preferredPeriods.push(period);
    }
  }

  isPeriodSelected(period: StudyPeriod): boolean {
    return this.profile.preferredPeriods.includes(period);
  }

  savePreferences(): void {
    this.authService.updateProfile(this.profile);
    this.notificationService.success('Settings Saved', 'Your study pacing preferences have been updated.');
  }

  resetToDefaultData(): void {
    if (confirm('Reset schedule and progress back to factory demonstration data?')) {
      this.plannerService.resetToDemoData();
      this.notificationService.info('Data Reset', 'Demo syllabus and tasks restored.');
    }
  }

  exportStudyPlan(): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(this.plannerService.getCurrentPlanSnapshot(), null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'studypilot_plan.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.notificationService.success('Export Successful', 'Study plan JSON downloaded.');
  }
}
