import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { Quiz, QuizQuestion, QuizAttempt, Subject as SubjectModel } from '../../models';

const DEMO_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    name: 'Java Fundamentals & OOP',
    subjectId: 'sub-001',
    createdAt: new Date(),
    attempts: [],
    questions: [
      {
        id: 'q1-1',
        question: 'Which of the following principles allows a subclass to provide a specific implementation of a method that is already provided by its superclass?',
        difficulty: 'easy',
        explanation: 'Method overriding allows a subclass to provide a specific implementation of a method defined in its parent class, enabling runtime polymorphism.',
        options: [
          { id: 'opt-1', text: 'Encapsulation', isCorrect: false },
          { id: 'opt-2', text: 'Method Overriding', isCorrect: true },
          { id: 'opt-3', text: 'Method Overloading', isCorrect: false },
          { id: 'opt-4', text: 'Abstraction', isCorrect: false }
        ]
      },
      {
        id: 'q1-2',
        question: 'Which Java Collection class is synchronized and thread-safe by default?',
        difficulty: 'medium',
        explanation: 'Vector is synchronized and thread-safe, whereas ArrayList is unsynchronized for higher single-threaded performance.',
        options: [
          { id: 'opt-5', text: 'ArrayList', isCorrect: false },
          { id: 'opt-6', text: 'LinkedList', isCorrect: false },
          { id: 'opt-7', text: 'Vector', isCorrect: true },
          { id: 'opt-8', text: 'HashSet', isCorrect: false }
        ]
      },
      {
        id: 'q1-3',
        question: 'What happens when an exception is thrown in a try block that has no matching catch block, but has a finally block?',
        difficulty: 'hard',
        explanation: 'The finally block executes unconditionally before the exception propagates up the call stack to the caller.',
        options: [
          { id: 'opt-9', text: 'The finally block does not execute', isCorrect: false },
          { id: 'opt-10', text: 'The finally block executes, then the exception propagates', isCorrect: true },
          { id: 'opt-11', text: 'Compilation error occurs', isCorrect: false },
          { id: 'opt-12', text: 'The exception is swallowed silently', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'quiz-2',
    name: 'Database SQL & Normalization',
    subjectId: 'sub-002',
    createdAt: new Date(),
    attempts: [],
    questions: [
      {
        id: 'q2-1',
        question: 'Which normal form eliminates partial dependencies where non-prime attributes depend on a subset of a candidate key?',
        difficulty: 'medium',
        explanation: 'Second Normal Form (2NF) requires 1NF plus the removal of any partial functional dependencies on candidate keys.',
        options: [
          { id: 'opt-13', text: 'First Normal Form (1NF)', isCorrect: false },
          { id: 'opt-14', text: 'Second Normal Form (2NF)', isCorrect: true },
          { id: 'opt-15', text: 'Third Normal Form (3NF)', isCorrect: false },
          { id: 'opt-16', text: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false }
        ]
      },
      {
        id: 'q2-2',
        question: 'Which SQL clause is used to filter the results of an aggregate function such as COUNT() or AVG()?',
        difficulty: 'easy',
        explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.',
        options: [
          { id: 'opt-17', text: 'WHERE', isCorrect: false },
          { id: 'opt-18', text: 'ORDER BY', isCorrect: false },
          { id: 'opt-19', text: 'HAVING', isCorrect: true },
          { id: 'opt-20', text: 'GROUP BY', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'quiz-3',
    name: 'Operating Systems & Concurrency',
    subjectId: 'sub-003',
    createdAt: new Date(),
    attempts: [],
    questions: [
      {
        id: 'q3-1',
        question: 'Which CPU scheduling algorithm can lead to starvation for longer processes?',
        difficulty: 'medium',
        explanation: 'Shortest Job First (SJF) can starve longer processes if shorter jobs continually arrive in the ready queue.',
        options: [
          { id: 'opt-21', text: 'Round Robin (RR)', isCorrect: false },
          { id: 'opt-22', text: 'First-Come, First-Served (FCFS)', isCorrect: false },
          { id: 'opt-23', text: 'Shortest Job First (SJF)', isCorrect: true },
          { id: 'opt-24', text: 'Multilevel Feedback Queue with aging', isCorrect: false }
        ]
      },
      {
        id: 'q3-2',
        question: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
        difficulty: 'hard',
        explanation: 'The TLB is a high-speed hardware cache used by the memory management unit to reduce the time taken to translate virtual addresses to physical addresses.',
        options: [
          { id: 'opt-25', text: 'To store recently executed machine instructions', isCorrect: false },
          { id: 'opt-26', text: 'To cache page table translations for fast address lookup', isCorrect: true },
          { id: 'opt-27', text: 'To handle interrupt requests from peripherals', isCorrect: false },
          { id: 'opt-28', text: 'To manage hard drive block allocations', isCorrect: false }
        ]
      }
    ]
  }
];

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.scss']
})
export class QuizzesComponent implements OnInit, OnDestroy {
  quizzes: Quiz[] = [];
  subjects: SubjectModel[] = [];
  isDark = false;
  isSidebarCollapsed = false;
  isMobileNavOpen = false;

  // Active quiz session state
  activeQuiz: Quiz | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: Record<string, string> = {}; // questionId -> optionId
  isSubmitted = false;
  latestAttempt: QuizAttempt | null = null;

  // Timer
  timerSeconds = 0;
  private timerInterval: any = null;

  sidebarLinks = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Subjects', route: '/subjects', icon: 'book' },
    { label: 'Study Planner', route: '/planner', icon: 'calendar' },
    { label: 'Flashcards', route: '/flashcards', icon: 'cards' },
    { label: 'Quizzes', route: '/quizzes', icon: 'help' },
    { label: 'AI Coach', route: '/coach', icon: 'message' },
    { label: 'Analytics', route: '/analytics', icon: 'chart' },
    { label: 'Settings', route: '/settings', icon: 'layers' }
  ];

  private destroy$ = new RxSubject<void>();

  constructor(
    private plannerService: StudyPlannerService,
    private storage: StorageService,
    private notification: NotificationService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });

    this.plannerService.subjects$.pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.subjects = s;
    });

    this.loadQuizzes();
  }

  ngOnDestroy(): void {
    this.clearInterval();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadQuizzes(): void {
    const saved = this.storage.get<Quiz[]>('quizzes', []);
    if (saved && saved.length > 0) {
      this.quizzes = saved;
    } else {
      this.quizzes = DEMO_QUIZZES;
      this.saveQuizzes();
    }
  }

  private saveQuizzes(): void {
    this.storage.set('quizzes', this.quizzes);
  }

  get currentQuestion(): QuizQuestion | null {
    if (!this.activeQuiz) return null;
    return this.activeQuiz.questions[this.currentQuestionIndex] || null;
  }

  get formattedTime(): string {
    const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  getSubjectName(subjectId?: string): string {
    if (!subjectId) return 'General';
    const sub = this.subjects.find(s => s.id === subjectId);
    return sub ? sub.name : 'General';
  }

  getSubjectColor(subjectId?: string): string {
    if (!subjectId) return '#8175F5';
    const sub = this.subjects.find(s => s.id === subjectId);
    return sub ? sub.color : '#8175F5';
  }

  startQuiz(quiz: Quiz): void {
    this.activeQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.isSubmitted = false;
    this.latestAttempt = null;
    this.timerSeconds = 0;
    this.startTimer();
  }

  private startTimer(): void {
    this.clearInterval();
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
    }, 1000);
  }

  private clearInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  selectOption(questionId: string, optionId: string): void {
    if (this.isSubmitted) return;
    this.selectedAnswers[questionId] = optionId;
  }

  nextQuestion(): void {
    if (!this.activeQuiz) return;
    if (this.currentQuestionIndex < this.activeQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  isOptionSelected(questionId: string, optionId: string): boolean {
    return this.selectedAnswers[questionId] === optionId;
  }

  submitQuiz(): void {
    if (!this.activeQuiz) return;
    this.clearInterval();

    let score = 0;
    this.activeQuiz.questions.forEach(q => {
      const selected = this.selectedAnswers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        score++;
      }
    });

    const attempt: QuizAttempt = {
      id: 'att-' + Date.now(),
      quizId: this.activeQuiz.id,
      quizName: this.activeQuiz.name,
      subjectId: this.activeQuiz.subjectId,
      questions: this.activeQuiz.questions,
      answers: { ...this.selectedAnswers },
      score,
      totalQuestions: this.activeQuiz.questions.length,
      completedAt: new Date(),
      timeTakenSeconds: this.timerSeconds
    };

    this.latestAttempt = attempt;
    this.activeQuiz.attempts.unshift(attempt);
    this.saveQuizzes();
    this.isSubmitted = true;

    const percentage = Math.round((score / this.activeQuiz.questions.length) * 100);
    this.notification.success('Quiz Completed!', `You scored ${score}/${this.activeQuiz.questions.length} (${percentage}%)`);
  }

  exitQuiz(): void {
    this.clearInterval();
    this.activeQuiz = null;
    this.isSubmitted = false;
    this.latestAttempt = null;
  }

  retakeQuiz(): void {
    if (!this.activeQuiz) return;
    this.startQuiz(this.activeQuiz);
  }

  getOptionClass(q: QuizQuestion, optionId: string): string {
    if (!this.isSubmitted) {
      return this.isOptionSelected(q.id, optionId) ? 'selected' : '';
    }
    const option = q.options.find(o => o.id === optionId);
    if (option?.isCorrect) return 'correct';
    if (this.isOptionSelected(q.id, optionId) && !option?.isCorrect) return 'wrong';
    return '';
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
