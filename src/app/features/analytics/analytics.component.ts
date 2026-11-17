import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { ThemeService } from '../../core/services/theme.service';
import { Subject, StudyTask, SubjectProgress } from '../../models';

interface DayActivity {
  date: Date;
  hours: number;
  intensity: number; // 0 to 4
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [];
  tasks: StudyTask[] = [];
  isDark = false;

  // Key KPI metrics
  currentStreakDays = 12;
  longestStreakDays = 21;
  totalHoursStudied = 48.5;
  studyVelocityScore = 92; // 0-100

  // Weekly Comparison
  weeklyPlannedHours = 24;
  weeklyCompletedHours = 19.5;

  weeklyDays = [
    { day: 'Mon', planned: 3.5, completed: 3.5 },
    { day: 'Tue', planned: 4.0, completed: 4.0 },
    { day: 'Wed', planned: 3.5, completed: 3.0 },
    { day: 'Thu', planned: 4.0, completed: 4.0 },
    { day: 'Fri', planned: 3.0, completed: 2.5 },
    { day: 'Sat', planned: 3.0, completed: 2.5 },
    { day: 'Sun', planned: 3.0, completed: 0 }
  ];

  // 30-Day Heatmap
  activitySquares: DayActivity[] = [];

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
    private plannerService: StudyPlannerService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDark = theme === 'dark');

    this.plannerService.subjects$
      .pipe(takeUntil(this.destroy$))
      .subscribe(subs => this.subjects = subs);

    this.plannerService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => this.tasks = tasks);

    this.generateHeatmapData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateHeatmapData(): void {
    const today = new Date();
    const squares: DayActivity[] = [];

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      // Generate synthetic realistic past study load
      const pseudoRandom = (d.getDate() * 7 + d.getMonth() * 3) % 5;
      const hours = pseudoRandom === 0 ? 0 : Math.round((pseudoRandom * 0.9 + 1) * 10) / 10;
      squares.push({
        date: d,
        hours,
        intensity: pseudoRandom
      });
    }
    this.activitySquares = squares;
  }

  getMaxWeeklyHours(): number {
    return Math.max(...this.weeklyDays.map(d => Math.max(d.planned, d.completed)), 5);
  }

  getBarHeight(value: number): number {
    const max = this.getMaxWeeklyHours();
    return Math.round((value / max) * 100);
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  getPendingTasksCount(): number {
    return this.tasks.filter(t => t.status !== 'completed').length;
  }
}
