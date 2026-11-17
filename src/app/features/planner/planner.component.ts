import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import {
  StudyTask, Subject, DifficultyLevel, TaskStatus, ExamDate
} from '../../models';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit, OnDestroy {
  tasks: StudyTask[] = [];
  filteredTasks: StudyTask[] = [];
  subjects: Subject[] = [];
  examDates: ExamDate[] = [];

  // Filter & View State
  selectedDate: Date = new Date();
  activeView: 'day' | 'week' | 'list' = 'week';
  selectedSubjectFilter = 'all';
  selectedStatusFilter = 'all';
  isDark = false;

  // Modals
  isAddTaskModalOpen = false;
  isAiRebalanceModalOpen = false;
  isAiRebalancing = false;

  // New Task Form Model
  newTask = {
    subjectId: '',
    topicName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    durationMinutes: 60,
    difficulty: 'medium' as DifficultyLevel,
    isRevision: false,
    notes: ''
  };

  // Week Days
  weekDays: { date: Date; label: string; dayNumber: number; isToday: boolean; isSelected: boolean }[] = [];

  private destroy$ = new RxSubject<void>();

  constructor(
    private plannerService: StudyPlannerService,
    private notificationService: NotificationService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDark = theme === 'dark');

    this.plannerService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
      });

    this.plannerService.subjects$
      .pipe(takeUntil(this.destroy$))
      .subscribe(subjects => {
        this.subjects = subjects;
        if (subjects.length > 0 && !this.newTask.subjectId) {
          this.newTask.subjectId = subjects[0].id;
        }
      });

    this.plannerService.examDates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(exams => this.examDates = exams);

    this.generateWeekDays();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateWeekDays(): void {
    const start = new Date(this.selectedDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(start.setDate(diff));

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = new Date().toDateString();

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        label: dayLabels[i],
        dayNumber: d.getDate(),
        isToday: d.toDateString() === todayStr,
        isSelected: d.toDateString() === this.selectedDate.toDateString()
      };
    });
  }

  selectDate(d: Date): void {
    this.selectedDate = new Date(d);
    this.generateWeekDays();
    this.applyFilters();
  }

  previousPeriod(): void {
    const daysToShift = this.activeView === 'day' ? 1 : 7;
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - daysToShift);
    this.selectDate(newDate);
  }

  nextPeriod(): void {
    const daysToShift = this.activeView === 'day' ? 1 : 7;
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + daysToShift);
    this.selectDate(newDate);
  }

  goToToday(): void {
    this.selectDate(new Date());
  }

  applyFilters(): void {
    let result = [...this.tasks];

    if (this.activeView === 'day') {
      const selectedStr = this.selectedDate.toDateString();
      result = result.filter(t => new Date(t.scheduledDate).toDateString() === selectedStr);
    } else if (this.activeView === 'week') {
      // Current week tasks
      const monday = this.weekDays[0]?.date || new Date();
      const sunday = this.weekDays[6]?.date || new Date();
      sunday.setHours(23, 59, 59, 999);
      result = result.filter(t => {
        const d = new Date(t.scheduledDate);
        return d >= monday && d <= sunday;
      });
    }

    if (this.selectedSubjectFilter !== 'all') {
      result = result.filter(t => t.subjectId === this.selectedSubjectFilter);
    }

    if (this.selectedStatusFilter !== 'all') {
      result = result.filter(t => t.status === this.selectedStatusFilter);
    }

    // Sort by scheduled time
    result.sort((a, b) => {
      const timeDiff = a.scheduledTime.localeCompare(b.scheduledTime);
      if (timeDiff !== 0) return timeDiff;
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    this.filteredTasks = result;
  }

  getTasksForDay(date: Date): StudyTask[] {
    const targetStr = date.toDateString();
    return this.tasks.filter(t => new Date(t.scheduledDate).toDateString() === targetStr);
  }

  toggleTaskStatus(task: StudyTask, event?: Event): void {
    if (event) event.stopPropagation();
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    this.plannerService.updateTaskStatus(task.id, newStatus);
    this.notificationService.info(
      newStatus === 'completed' ? 'Task Completed!' : 'Task Reopened',
      `"${task.topicName}" marked as ${newStatus}`
    );
  }

  postponeTask(task: StudyTask, event?: Event): void {
    if (event) event.stopPropagation();
    const current = new Date(task.scheduledDate);
    current.setDate(current.getDate() + 1);
    this.plannerService.rescheduleTask(task.id, current, task.scheduledTime);
    this.notificationService.warning('Task Rescheduled', `Moved to tomorrow (${task.scheduledTime})`);
  }

  deleteTask(task: StudyTask, event?: Event): void {
    if (event) event.stopPropagation();
    this.plannerService.deleteTask(task.id);
    this.notificationService.info('Task Removed', `"${task.topicName}" removed from schedule`);
  }

  openAddTaskModal(): void {
    this.newTask.scheduledDate = this.selectedDate.toISOString().split('T')[0];
    this.isAddTaskModalOpen = true;
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalOpen = false;
  }

  saveNewTask(): void {
    if (!this.newTask.topicName.trim() || !this.newTask.subjectId) {
      this.notificationService.error('Missing details', 'Please enter a topic name and subject');
      return;
    }

    const sub = this.subjects.find(s => s.id === this.newTask.subjectId);
    if (!sub) return;

    const newTaskItem: StudyTask = {
      id: `task-${Date.now()}`,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectColor: sub.color,
      topicName: this.newTask.topicName,
      scheduledDate: new Date(this.newTask.scheduledDate),
      scheduledTime: this.newTask.scheduledTime,
      durationMinutes: Number(this.newTask.durationMinutes),
      difficulty: this.newTask.difficulty,
      status: 'pending',
      isRevision: this.newTask.isRevision,
      type: this.newTask.isRevision ? 'revision' : 'study',
      notes: this.newTask.notes
    };

    this.plannerService.addTask(newTaskItem);
    this.notificationService.success('Task Added', `"${newTaskItem.topicName}" scheduled for ${this.newTask.scheduledTime}`);
    this.closeAddTaskModal();

    // Reset topic name
    this.newTask.topicName = '';
    this.newTask.notes = '';
  }

  runAiRebalance(): void {
    this.isAiRebalancing = true;
    setTimeout(() => {
      this.plannerService.rebalancePlan();
      this.isAiRebalancing = false;
      this.isAiRebalanceModalOpen = false;
      this.notificationService.success(
        'AI Schedule Rebalanced',
        'Prioritized hard topics and subjects with upcoming exams in 14 days.'
      );
    }, 1200);
  }

  getTotalPlannedHours(): number {
    const mins = this.filteredTasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
    return Math.round((mins / 60) * 10) / 10;
  }

  getCompletedCount(): number {
    return this.filteredTasks.filter(t => t.status === 'completed').length;
  }

  getCompletionPercent(): number {
    if (this.filteredTasks.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.filteredTasks.length) * 100);
  }

  startFocusSession(task: StudyTask): void {
    this.router.navigate(['/focus'], { queryParams: { taskId: task.id, subject: task.subjectName, topic: task.topicName, duration: task.durationMinutes } });
  }

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
}
