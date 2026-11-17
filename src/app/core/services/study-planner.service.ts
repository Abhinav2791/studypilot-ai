import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Subject, Topic, StudyPlan, StudyTask, ExamDate,
  DifficultyLevel, StudyGoal, StudyPeriod, TaskStatus
} from '../../models';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

const SUBJECT_COLORS = [
  '#8175F5', '#38B98A', '#E9AC55', '#5BA4F5', '#F06565',
  '#A78BFA', '#34D399', '#FBBF24', '#60A5FA', '#F87171'
];

const DEMO_SUBJECTS: Subject[] = [
  {
    id: 'sub-001', name: 'Java Programming', color: '#8175F5', icon: 'code',
    topics: [
      { id: 't-001', name: 'OOP Concepts', difficulty: 'medium', confidence: 3, isCompleted: true, isRevised: false, estimatedHours: 4, completedHours: 4 },
      { id: 't-002', name: 'Collections Framework', difficulty: 'hard', confidence: 2, isCompleted: false, isRevised: false, estimatedHours: 6, completedHours: 2 },
      { id: 't-003', name: 'Exception Handling', difficulty: 'easy', confidence: 4, isCompleted: true, isRevised: true, estimatedHours: 3, completedHours: 3 },
      { id: 't-004', name: 'Streams & Lambda', difficulty: 'hard', confidence: 1, isCompleted: false, isRevised: false, estimatedHours: 8, completedHours: 1 }
    ],
    examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    progress: 50, totalTopics: 4, completedTopics: 2,
    totalHours: 21, completedHours: 10, revisionStatus: 'in-progress', createdAt: new Date()
  },
  {
    id: 'sub-002', name: 'Database Management', color: '#38B98A', icon: 'database',
    topics: [
      { id: 't-005', name: 'ER Diagrams', difficulty: 'easy', confidence: 5, isCompleted: true, isRevised: true, estimatedHours: 2, completedHours: 2 },
      { id: 't-006', name: 'SQL Queries', difficulty: 'medium', confidence: 3, isCompleted: true, isRevised: false, estimatedHours: 5, completedHours: 5 },
      { id: 't-007', name: 'Normalization', difficulty: 'hard', confidence: 2, isCompleted: false, isRevised: false, estimatedHours: 4, completedHours: 1 }
    ],
    examDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    progress: 67, totalTopics: 3, completedTopics: 2,
    totalHours: 11, completedHours: 8, revisionStatus: 'in-progress', createdAt: new Date()
  },
  {
    id: 'sub-003', name: 'Operating Systems', color: '#E9AC55', icon: 'cpu',
    topics: [
      { id: 't-008', name: 'Process Management', difficulty: 'medium', confidence: 3, isCompleted: true, isRevised: false, estimatedHours: 5, completedHours: 5 },
      { id: 't-009', name: 'Memory Management', difficulty: 'hard', confidence: 2, isCompleted: false, isRevised: false, estimatedHours: 6, completedHours: 2 },
      { id: 't-010', name: 'File Systems', difficulty: 'medium', confidence: 3, isCompleted: false, isRevised: false, estimatedHours: 4, completedHours: 0 }
    ],
    examDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    progress: 33, totalTopics: 3, completedTopics: 1,
    totalHours: 15, completedHours: 7, revisionStatus: 'not-started', createdAt: new Date()
  },
  {
    id: 'sub-004', name: 'Computer Networks', color: '#5BA4F5', icon: 'network',
    topics: [
      { id: 't-011', name: 'OSI Model', difficulty: 'easy', confidence: 4, isCompleted: true, isRevised: true, estimatedHours: 2, completedHours: 2 },
      { id: 't-012', name: 'TCP/IP Protocol', difficulty: 'medium', confidence: 3, isCompleted: true, isRevised: false, estimatedHours: 4, completedHours: 4 },
      { id: 't-013', name: 'Network Security', difficulty: 'hard', confidence: 1, isCompleted: false, isRevised: false, estimatedHours: 6, completedHours: 0 }
    ],
    examDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    progress: 67, totalTopics: 3, completedTopics: 2,
    totalHours: 12, completedHours: 6, revisionStatus: 'in-progress', createdAt: new Date()
  }
];

function generateDemoTasks(): StudyTask[] {
  const today = new Date();
  const tasks: StudyTask[] = [];

  const taskConfigs = [
    { subjectId: 'sub-001', subjectName: 'Java Programming', subjectColor: '#8175F5', topicName: 'Streams & Lambda', time: '09:00', duration: 90, difficulty: 'hard' as DifficultyLevel, status: 'completed' as TaskStatus, type: 'study' as const },
    { subjectId: 'sub-002', subjectName: 'Database Management', subjectColor: '#38B98A', topicName: 'Normalization', time: '11:00', duration: 60, difficulty: 'hard' as DifficultyLevel, status: 'in-progress' as TaskStatus, type: 'study' as const },
    { subjectId: 'sub-003', subjectName: 'Operating Systems', subjectColor: '#E9AC55', topicName: 'Memory Management', time: '14:00', duration: 75, difficulty: 'medium' as DifficultyLevel, status: 'pending' as TaskStatus, type: 'study' as const },
    { subjectId: 'sub-001', subjectName: 'Java Programming', subjectColor: '#8175F5', topicName: 'OOP Revision', time: '16:00', duration: 45, difficulty: 'easy' as DifficultyLevel, status: 'pending' as TaskStatus, type: 'revision' as const },
    { subjectId: 'sub-004', subjectName: 'Computer Networks', subjectColor: '#5BA4F5', topicName: 'Network Security', time: '18:00', duration: 60, difficulty: 'hard' as DifficultyLevel, status: 'pending' as TaskStatus, type: 'study' as const }
  ];

  taskConfigs.forEach((cfg, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (i > 2 ? 0 : 0));
    tasks.push({
      id: `task-${i + 1}`,
      subjectId: cfg.subjectId,
      subjectName: cfg.subjectName,
      subjectColor: cfg.subjectColor,
      topicName: cfg.topicName,
      scheduledDate: date,
      scheduledTime: cfg.time,
      durationMinutes: cfg.duration,
      difficulty: cfg.difficulty,
      status: cfg.status,
      isRevision: cfg.type === 'revision',
      type: cfg.type
    });
  });

  // Add tasks for next few days
  for (let day = 1; day <= 6; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const subject = DEMO_SUBJECTS[day % DEMO_SUBJECTS.length];
    const topic = subject.topics[0];
    tasks.push({
      id: `task-future-${day}`,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      topicName: topic?.name || 'Study Session',
      scheduledDate: date,
      scheduledTime: '10:00',
      durationMinutes: 60,
      difficulty: topic?.difficulty || 'medium',
      status: 'pending',
      isRevision: false,
      type: 'study'
    });
  }

  return tasks;
}

@Injectable({ providedIn: 'root' })
export class StudyPlannerService {
  private subjectsSubject = new BehaviorSubject<Subject[]>([]);
  private tasksSubject = new BehaviorSubject<StudyTask[]>([]);
  private examDatesSubject = new BehaviorSubject<ExamDate[]>([]);

  subjects$ = this.subjectsSubject.asObservable();
  tasks$ = this.tasksSubject.asObservable();
  examDates$ = this.examDatesSubject.asObservable();

  constructor(
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadData();
  }

  // ——— Subjects ———
  get subjects(): Subject[] { return this.subjectsSubject.value; }
  get tasks(): StudyTask[] { return this.tasksSubject.value; }
  get examDates(): ExamDate[] { return this.examDatesSubject.value; }

  addSubject(partial: Partial<Subject>): Subject {
    const idx = this.subjects.length;
    const subject: Subject = {
      id: this.generateId(),
      name: partial.name || 'New Subject',
      color: partial.color || SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
      icon: partial.icon || 'book',
      topics: partial.topics || [],
      examDate: partial.examDate,
      progress: 0,
      totalTopics: 0,
      completedTopics: 0,
      totalHours: 0,
      completedHours: 0,
      revisionStatus: 'not-started',
      createdAt: new Date(),
      ...partial
    };
    const updated = [...this.subjects, subject];
    this.subjectsSubject.next(updated);
    this.saveSubjects();
    this.notification.success('Subject added', `"${subject.name}" has been added.`);
    return subject;
  }

  updateSubject(id: string, updates: Partial<Subject>): void {
    const updated = this.subjects.map(s => s.id === id ? { ...s, ...updates } : s);
    this.subjectsSubject.next(updated);
    this.saveSubjects();
  }

  deleteSubject(id: string): void {
    this.subjectsSubject.next(this.subjects.filter(s => s.id !== id));
    this.tasksSubject.next(this.tasks.filter(t => t.subjectId !== id));
    this.saveSubjects();
    this.saveTasks();
    this.notification.success('Subject removed');
  }

  addTopic(subjectId: string, topicPartial: Partial<Topic>): void {
    const topic: Topic = {
      id: this.generateId(),
      name: topicPartial.name || 'New Topic',
      difficulty: topicPartial.difficulty || 'medium',
      confidence: topicPartial.confidence || 3,
      isCompleted: false,
      isRevised: false,
      estimatedHours: topicPartial.estimatedHours || 2,
      completedHours: 0
    };
    const subjects = this.subjects.map(s => {
      if (s.id !== subjectId) return s;
      const topics = [...s.topics, topic];
      return this.recalcSubject({ ...s, topics });
    });
    this.subjectsSubject.next(subjects);
    this.saveSubjects();
  }

  updateTopic(subjectId: string, topicId: string, updates: Partial<Topic>): void {
    const subjects = this.subjects.map(s => {
      if (s.id !== subjectId) return s;
      const topics = s.topics.map(t => t.id === topicId ? { ...t, ...updates } : t);
      return this.recalcSubject({ ...s, topics });
    });
    this.subjectsSubject.next(subjects);
    this.saveSubjects();
  }

  deleteTopic(subjectId: string, topicId: string): void {
    const subjects = this.subjects.map(s => {
      if (s.id !== subjectId) return s;
      const topics = s.topics.filter(t => t.id !== topicId);
      return this.recalcSubject({ ...s, topics });
    });
    this.subjectsSubject.next(subjects);
    this.saveSubjects();
  }

  // ——— Tasks ———
  addTask(partial: Partial<StudyTask>): StudyTask {
    const task: StudyTask = {
      id: this.generateId(),
      subjectId: partial.subjectId || '',
      subjectName: partial.subjectName || '',
      subjectColor: partial.subjectColor || '#8175F5',
      topicName: partial.topicName || 'Study Session',
      scheduledDate: partial.scheduledDate || new Date(),
      scheduledTime: partial.scheduledTime || '09:00',
      durationMinutes: partial.durationMinutes || 60,
      difficulty: partial.difficulty || 'medium',
      status: 'pending',
      isRevision: partial.isRevision || false,
      type: partial.type || 'study',
      ...partial
    };
    this.tasksSubject.next([...this.tasks, task]);
    this.saveTasks();
    return task;
  }

  updateTask(id: string, updates: Partial<StudyTask>): void {
    const updated = this.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    this.tasksSubject.next(updated);
    this.saveTasks();
  }

  /** Update just the status of a task */
  updateTaskStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, {
      status,
      ...(status === 'completed' ? { completedAt: new Date() } : {})
    });
  }

  completeTask(id: string): void {
    this.updateTask(id, { status: 'completed', completedAt: new Date() });
    this.notification.success('Task completed', 'Great work! Keep it up! 🎉');
  }

  /** Reschedule a task to a new date and optional time */
  rescheduleTask(id: string, newDate: Date, newTime?: string): void {
    const updates: Partial<StudyTask> = { scheduledDate: newDate, status: 'pending' };
    if (newTime) updates.scheduledTime = newTime;
    this.updateTask(id, updates);
  }

  /** AI rebalance: reprioritise pending tasks by difficulty & exam proximity */
  rebalancePlan(): void {
    const pending = this.tasks.filter(t => t.status !== 'completed');
    const completed = this.tasks.filter(t => t.status === 'completed');

    // Sort by difficulty desc and scheduled date asc
    const difficultyWeight: Record<string, number> = { hard: 3, medium: 2, easy: 1 };
    const rebalanced = [...pending].sort((a, b) => {
      const dw = (difficultyWeight[b.difficulty] || 2) - (difficultyWeight[a.difficulty] || 2);
      if (dw !== 0) return dw;
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    // Reassign consecutive dates starting from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeSlots = ['08:00', '10:00', '14:00', '16:00', '19:00'];
    let dayOffset = 0;
    let slotIdx = 0;

    rebalanced.forEach((task, i) => {
      if (i > 0 && i % timeSlots.length === 0) dayOffset++;
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      task.scheduledDate = date;
      task.scheduledTime = timeSlots[slotIdx % timeSlots.length];
      slotIdx++;
    });

    this.tasksSubject.next([...completed, ...rebalanced]);
    this.saveTasks();
  }

  deleteTask(id: string): void {
    this.tasksSubject.next(this.tasks.filter(t => t.id !== id));
    this.saveTasks();
  }

  getTasksForDate(date: Date): StudyTask[] {
    return this.tasks.filter(t => this.isSameDay(t.scheduledDate, date));
  }

  getTasksForWeek(weekStart: Date): StudyTask[] {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this.tasks.filter(t => {
      const d = new Date(t.scheduledDate);
      return d >= weekStart && d < weekEnd;
    });
  }

  // ——— Exam Dates ———
  addExamDate(partial: Partial<ExamDate>): void {
    const exam: ExamDate = {
      id: this.generateId(),
      subjectId: partial.subjectId || '',
      subjectName: partial.subjectName || '',
      date: partial.date || new Date(),
      type: partial.type || 'final',
      ...partial
    };
    this.examDatesSubject.next([...this.examDates, exam]);
    this.saveExamDates();
  }

  removeExamDate(id: string): void {
    this.examDatesSubject.next(this.examDates.filter(e => e.id !== id));
    this.saveExamDates();
  }

  getNextExam(): ExamDate | null {
    const now = new Date();
    const future = this.examDates
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return future[0] || null;
  }

  getDaysUntilExam(exam: ExamDate): number {
    const now = new Date();
    const examDate = new Date(exam.date);
    const diff = examDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ——— Plan Generation (Demo Scheduler) ———
  generateStudyPlan(config: {
    subjects: Subject[];
    dailyHours: number;
    startDate: Date;
    preferredPeriods: StudyPeriod[];
  }): StudyTask[] {
    const tasks: StudyTask[] = [];
    const { subjects, dailyHours, startDate } = config;
    const timeSlots: Record<string, string[]> = {
      morning: ['08:00', '09:00', '10:00'],
      afternoon: ['13:00', '14:00', '15:00'],
      evening: ['17:00', '18:00', '19:00'],
      night: ['20:00', '21:00']
    };

    const preferredSlots = config.preferredPeriods.flatMap(p => timeSlots[p] || []);
    let slotIndex = 0;

    subjects.forEach(subject => {
      const incompletedTopics = subject.topics.filter(t => !t.isCompleted);
      incompletedTopics.forEach((topic, dayOffset) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayOffset);
        const time = preferredSlots[slotIndex % preferredSlots.length] || '09:00';
        slotIndex++;

        tasks.push({
          id: this.generateId(),
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          topicId: topic.id,
          topicName: topic.name,
          scheduledDate: date,
          scheduledTime: time,
          durationMinutes: Math.min(dailyHours * 60 / incompletedTopics.length, 120),
          difficulty: topic.difficulty,
          status: 'pending',
          isRevision: false,
          type: 'study'
        });
      });
    });

    // Keep existing completed tasks
    const existingCompleted = this.tasks.filter(t => t.status === 'completed');
    const allTasks = [...existingCompleted, ...tasks];
    this.tasksSubject.next(allTasks);
    this.saveTasks();
    return tasks;
  }

  // ——— Statistics ———
  getTodayProgress(): { completed: number; total: number; percentage: number } {
    const todayTasks = this.getTasksForDate(new Date());
    const completed = todayTasks.filter(t => t.status === 'completed').length;
    const total = todayTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  getWeeklyStudyMinutes(): { planned: number; completed: number } {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekTasks = this.getTasksForWeek(weekStart);
    return {
      planned: weekTasks.reduce((sum, t) => sum + t.durationMinutes, 0),
      completed: weekTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.durationMinutes, 0)
    };
  }

  resetToDemoData(): void {
    this.subjectsSubject.next(DEMO_SUBJECTS);
    this.tasksSubject.next(generateDemoTasks());
    this.examDatesSubject.next([
      { id: 'exam-001', subjectId: 'sub-001', subjectName: 'Java Programming', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: 'final' },
      { id: 'exam-002', subjectId: 'sub-002', subjectName: 'Database Management', date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), type: 'final' }
    ]);
    this.saveSubjects();
    this.saveTasks();
    this.saveExamDates();
  }

  getCurrentPlanSnapshot(): any {
    return {
      exportDate: new Date().toISOString(),
      subjects: this.subjects,
      tasks: this.tasks,
      examDates: this.examDates
    };
  }

  // ——— Private Helpers ———
  private recalcSubject(subject: Subject): Subject {
    const completed = subject.topics.filter(t => t.isCompleted).length;
    const total = subject.topics.length;
    const totalHours = subject.topics.reduce((s, t) => s + t.estimatedHours, 0);
    const completedHours = subject.topics.reduce((s, t) => s + t.completedHours, 0);
    const revised = subject.topics.filter(t => t.isRevised).length;
    return {
      ...subject,
      totalTopics: total,
      completedTopics: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours,
      completedHours,
      revisionStatus: revised === 0 ? 'not-started' : revised === total ? 'completed' : 'in-progress'
    };
  }

  private loadData(): void {
    const subjects = this.storage.get<Subject[]>('subjects', []);
    const tasks = this.storage.get<StudyTask[]>('tasks', []);
    const examDates = this.storage.get<ExamDate[]>('exam_dates', []);

    // Seed demo data on first load
    if (subjects.length === 0) {
      this.subjectsSubject.next(DEMO_SUBJECTS);
      this.tasksSubject.next(generateDemoTasks());
      this.examDatesSubject.next([
        { id: 'exam-001', subjectId: 'sub-001', subjectName: 'Java Programming', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: 'final' },
        { id: 'exam-002', subjectId: 'sub-002', subjectName: 'Database Management', date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), type: 'final' }
      ]);
      this.saveSubjects();
      this.saveTasks();
      this.saveExamDates();
    } else {
      this.subjectsSubject.next(subjects);
      this.tasksSubject.next(tasks.map(t => ({ ...t, scheduledDate: new Date(t.scheduledDate) })));
      this.examDatesSubject.next(examDates.map(e => ({ ...e, date: new Date(e.date) })));
    }
  }

  private saveSubjects(): void { this.storage.set('subjects', this.subjects); }
  private saveTasks(): void { this.storage.set('tasks', this.tasks); }
  private saveExamDates(): void { this.storage.set('exam_dates', this.examDates); }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private isSameDay(a: Date, b: Date): boolean {
    const da = new Date(a);
    const db = new Date(b);
    return da.getFullYear() === db.getFullYear() &&
           da.getMonth() === db.getMonth() &&
           da.getDate() === db.getDate();
  }
}
