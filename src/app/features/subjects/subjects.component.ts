import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { Subject, Topic, DifficultyLevel, ConfidenceLevel } from '../../models';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [];
  isDark = false;
  isSidebarCollapsed = false;
  isMobileNavOpen = false;
  searchQuery = '';
  sortBy: 'name' | 'progress' | 'exam' = 'name';

  // Modal states
  showAddSubjectModal = false;
  showEditSubjectModal = false;
  showAddTopicModal = false;
  showDeleteConfirm = false;
  selectedSubject: Subject | null = null;
  expandedSubjectId: string | null = null;

  subjectForm!: FormGroup;
  topicForm!: FormGroup;

  subjectColors = [
    '#8175F5', '#38B98A', '#E9AC55', '#5BA4F5', '#F06565',
    '#A78BFA', '#34D399', '#FBBF24', '#60A5FA', '#F87171'
  ];
  selectedColor = '#8175F5';
  subjectToDelete: Subject | null = null;

  private destroy$ = new RxSubject<void>();

  sidebarLinks = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Study Planner', route: '/planner', icon: 'calendar' },
    { label: 'AI Coach', route: '/coach', icon: 'message' },
    { label: 'Focus Timer', route: '/focus', icon: 'clock' },
    { label: 'Analytics', route: '/analytics', icon: 'chart' },
    { label: 'Settings & Pacing', route: '/settings', icon: 'layers' }
  ];

  difficultyOptions: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  constructor(
    private plannerService: StudyPlannerService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.plannerService.subjects$.pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.subjects = s;
    });
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });
    this.initForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.subjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['book'],
      examDate: ['']
    });

    this.topicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      difficulty: ['medium'],
      estimatedHours: [2, [Validators.required, Validators.min(0.5)]]
    });
  }

  get filteredSubjects(): Subject[] {
    let list = this.subjects;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (this.sortBy === 'progress') return b.progress - a.progress;
      if (this.sortBy === 'exam') {
        const aDate = a.examDate ? new Date(a.examDate).getTime() : Infinity;
        const bDate = b.examDate ? new Date(b.examDate).getTime() : Infinity;
        return aDate - bDate;
      }
      return a.name.localeCompare(b.name);
    });
  }

  get totalTopicsCount(): number {
    return this.subjects.reduce((s, sub) => s + sub.totalTopics, 0);
  }
  get completedTopicsCount(): number {
    return this.subjects.reduce((s, sub) => s + sub.completedTopics, 0);
  }
  get averageProgress(): number {
    if (!this.subjects.length) return 0;
    return Math.round(this.subjects.reduce((s, sub) => s + sub.progress, 0) / this.subjects.length);
  }

  openAddSubjectModal(): void {
    this.subjectForm.reset({ name: '', icon: 'book', examDate: '' });
    this.selectedColor = this.subjectColors[0];
    this.showAddSubjectModal = true;
  }

  openEditSubjectModal(subject: Subject): void {
    this.selectedSubject = subject;
    this.selectedColor = subject.color;
    const examDateStr = subject.examDate
      ? new Date(subject.examDate).toISOString().split('T')[0]
      : '';
    this.subjectForm.patchValue({
      name: subject.name,
      icon: subject.icon,
      examDate: examDateStr
    });
    this.showEditSubjectModal = true;
  }

  openAddTopicModal(subject: Subject): void {
    this.selectedSubject = subject;
    this.topicForm.reset({ name: '', difficulty: 'medium', estimatedHours: 2 });
    this.showAddTopicModal = true;
  }

  openDeleteConfirm(subject: Subject): void {
    this.subjectToDelete = subject;
    this.showDeleteConfirm = true;
  }

  closeAllModals(): void {
    this.showAddSubjectModal = false;
    this.showEditSubjectModal = false;
    this.showAddTopicModal = false;
    this.showDeleteConfirm = false;
    this.selectedSubject = null;
    this.subjectToDelete = null;
  }

  submitAddSubject(): void {
    if (this.subjectForm.invalid) return;
    const { name, icon, examDate } = this.subjectForm.value;
    const newSubject: Subject = {
      id: 'sub-' + Date.now(),
      name: name.trim(),
      color: this.selectedColor,
      icon: icon || 'book',
      topics: [],
      examDate: examDate ? new Date(examDate) : undefined,
      progress: 0,
      totalTopics: 0,
      completedTopics: 0,
      totalHours: 0,
      completedHours: 0,
      revisionStatus: 'not-started',
      createdAt: new Date()
    };
    this.plannerService.addSubject(newSubject);
    this.notificationService.success('Subject Added', `"${name}" has been added to your subjects.`);
    this.closeAllModals();
  }

  submitEditSubject(): void {
    if (this.subjectForm.invalid || !this.selectedSubject) return;
    const { name, icon, examDate } = this.subjectForm.value;
    const updated: Subject = {
      ...this.selectedSubject,
      name: name.trim(),
      color: this.selectedColor,
      icon: icon || this.selectedSubject.icon,
      examDate: examDate ? new Date(examDate) : undefined
    };
    this.plannerService.updateSubject(this.selectedSubject.id, updated);
    this.notificationService.success('Subject Updated', `"${name}" has been updated.`);
    this.closeAllModals();
  }

  submitAddTopic(): void {
    if (this.topicForm.invalid || !this.selectedSubject) return;
    const { name, difficulty, estimatedHours } = this.topicForm.value;
    const topic: Topic = {
      id: 'topic-' + Date.now(),
      name: name.trim(),
      difficulty,
      confidence: 1 as ConfidenceLevel,
      isCompleted: false,
      isRevised: false,
      estimatedHours: +estimatedHours,
      completedHours: 0
    };
    this.plannerService.addTopic(this.selectedSubject.id, topic);
    this.notificationService.success('Topic Added', `"${name}" has been added.`);
    this.closeAllModals();
  }

  confirmDelete(): void {
    if (!this.subjectToDelete) return;
    this.plannerService.deleteSubject(this.subjectToDelete.id);
    this.notificationService.info('Subject Removed', `"${this.subjectToDelete.name}" has been deleted.`);
    this.closeAllModals();
  }

  toggleTopicCompletion(subjectId: string, topic: Topic): void {
    this.plannerService.updateTopic(subjectId, topic.id, { isCompleted: !topic.isCompleted });
  }

  toggleExpand(subjectId: string): void {
    this.expandedSubjectId = this.expandedSubjectId === subjectId ? null : subjectId;
  }

  getDaysUntilExam(subject: Subject): number | null {
    if (!subject.examDate) return null;
    const diff = new Date(subject.examDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getConfidenceLabel(level: ConfidenceLevel): string {
    const labels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'Good', 5: 'Excellent' };
    return labels[level] || 'Unknown';
  }

  getDifficultyClass(d: DifficultyLevel): string {
    return { easy: 'success', medium: 'warning', hard: 'error' }[d] || '';
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }
}
