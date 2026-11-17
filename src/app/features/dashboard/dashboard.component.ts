import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { ThemeService } from '../../core/services/theme.service';
import { StudyTask, Subject as SubjectModel, ExamDate, UserProfile } from '../../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  todayTasks: StudyTask[] = [];
  subjects: SubjectModel[] = [];
  nextExam: ExamDate | null = null;
  daysUntilExam = 0;
  isSidebarCollapsed = false;
  isMobileNavOpen = false;
  isDark = false;
  isDemoMode = false;
  todayProgress = { completed: 0, total: 0, percentage: 0 };
  weeklyMinutes = { planned: 0, completed: 0 };
  today = new Date();
  greeting = '';
  private destroy$ = new Subject<void>();

  sidebarLinks = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Subjects', route: '/subjects', icon: 'book' },
    { label: 'Study Planner', route: '/planner', icon: 'calendar' },
    { label: 'Flashcards', route: '/flashcards', icon: 'cards' },
    { label: 'Quizzes', route: '/quizzes', icon: 'help' },
    { label: 'AI Coach', route: '/coach', icon: 'message' },
    { label: 'Focus Timer', route: '/focus', icon: 'clock' },
    { label: 'Analytics', route: '/analytics', icon: 'chart' },
    { label: 'Settings & Pacing', route: '/settings', icon: 'layers' }
  ];

  constructor(
    private authService: AuthService,
    private plannerService: StudyPlannerService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.auth$.pipe(takeUntil(this.destroy$)).subscribe(auth => {
      this.user = auth.user;
      this.isDemoMode = auth.isDemoMode;
    });

    this.plannerService.tasks$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refreshData();
    });

    this.plannerService.subjects$.pipe(takeUntil(this.destroy$)).subscribe(subjects => {
      this.subjects = subjects;
    });

    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });

    this.greeting = this.getGreeting();
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshData(): void {
    this.todayTasks = this.plannerService.getTasksForDate(new Date());
    this.nextExam = this.plannerService.getNextExam();
    this.daysUntilExam = this.nextExam ? this.plannerService.getDaysUntilExam(this.nextExam) : 0;
    this.todayProgress = this.plannerService.getTodayProgress();
    this.weeklyMinutes = this.plannerService.getWeeklyStudyMinutes();
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  completeTask(taskId: string): void {
    this.plannerService.completeTask(taskId);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.isMobileNavOpen = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  getProgressStroke(pct: number, r = 32): number {
    const circ = 2 * Math.PI * r;
    return circ - (pct / 100) * circ;
  }

  getWeeklyPct(): number {
    const { planned, completed } = this.weeklyMinutes;
    return planned > 0 ? Math.round((completed / planned) * 100) : 0;
  }

  formatMinutes(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getDifficultyColor(d: string): string {
    return d === 'easy' ? '#38B98A' : d === 'medium' ? '#E9AC55' : '#F06565';
  }
}
