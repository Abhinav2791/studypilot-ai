import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';
import { Flashcard, FlashcardRating, Subject as SubjectModel } from '../../models';

const DEMO_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'sub-001',
    subjectName: 'Java Programming',
    topicName: 'OOP Concepts',
    question: 'What is the key difference between an Interface and an Abstract Class in Java 8+?',
    answer: 'An abstract class can have instance fields and state constructors, and supports single inheritance. An interface can have default & static methods, cannot maintain instance state, and supports multiple inheritance implementation.',
    rating: 'easy',
    reviewCount: 3,
    createdAt: new Date(),
    lastReviewed: new Date()
  },
  {
    id: 'fc-2',
    subjectId: 'sub-001',
    subjectName: 'Java Programming',
    topicName: 'Streams & Lambda',
    question: 'What is the difference between map() and flatMap() in Java Streams?',
    answer: 'map() transforms each element of a Stream into another object (1-to-1). flatMap() transforms each element into a Stream of other objects and then flattens the resulting streams into a single stream (1-to-many).',
    rating: 'medium',
    reviewCount: 2,
    createdAt: new Date()
  },
  {
    id: 'fc-3',
    subjectId: 'sub-002',
    subjectName: 'Database Management',
    topicName: 'Normalization',
    question: 'Define Third Normal Form (3NF).',
    answer: 'A relation is in 3NF if and only if it is in 2NF and no non-prime attribute is transitively dependent on any candidate key (i.e., for every non-trivial X -> Y, either X is a superkey or Y is a prime attribute).',
    rating: 'hard',
    reviewCount: 1,
    createdAt: new Date()
  },
  {
    id: 'fc-4',
    subjectId: 'sub-002',
    subjectName: 'Database Management',
    topicName: 'SQL Queries',
    question: 'What are the ACID properties in database management?',
    answer: 'Atomicity (all or nothing), Consistency (preserves database integrity), Isolation (concurrent transactions execute independently), Durability (committed changes persist even after crashes).',
    rating: 'easy',
    reviewCount: 4,
    createdAt: new Date()
  },
  {
    id: 'fc-5',
    subjectId: 'sub-003',
    subjectName: 'Operating Systems',
    topicName: 'Process Management',
    question: 'What are the four necessary conditions for Deadlock to occur?',
    answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait. (Coffman Conditions)',
    rating: 'medium',
    reviewCount: 2,
    createdAt: new Date()
  },
  {
    id: 'fc-6',
    subjectId: 'sub-003',
    subjectName: 'Operating Systems',
    topicName: 'Memory Management',
    question: 'What is Thrashing in virtual memory?',
    answer: 'Thrashing occurs when the operating system spends more time swapping pages in and out of memory than executing actual instructions, caused by insufficient allocated physical frames.',
    rating: 'hard',
    reviewCount: 1,
    createdAt: new Date()
  },
  {
    id: 'fc-7',
    subjectId: 'sub-004',
    subjectName: 'Computer Networks',
    topicName: 'TCP/IP Protocol',
    question: 'Explain the 3-Way Handshake in TCP connection establishment.',
    answer: '1. Client sends SYN (Synchronize sequence number) packet.\n2. Server responds with SYN-ACK (Synchronize-Acknowledgment).\n3. Client sends ACK (Acknowledgment) to confirm connection established.',
    rating: 'easy',
    reviewCount: 5,
    createdAt: new Date()
  }
];

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss']
})
export class FlashcardsComponent implements OnInit, OnDestroy {
  flashcards: Flashcard[] = [];
  subjects: SubjectModel[] = [];
  selectedSubjectId: string = 'all';
  currentIndex: number = 0;
  isFlipped: boolean = false;
  isDark: boolean = false;
  isSidebarCollapsed: boolean = false;
  isMobileNavOpen: boolean = false;

  showAddCardModal: boolean = false;
  cardForm!: FormGroup;

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
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });

    this.plannerService.subjects$.pipe(takeUntil(this.destroy$)).subscribe(subs => {
      this.subjects = subs;
    });

    this.loadFlashcards();
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.showAddCardModal) return;
    if (event.code === 'Space') {
      event.preventDefault();
      this.flipCard();
    } else if (event.code === 'ArrowRight') {
      this.nextCard();
    } else if (event.code === 'ArrowLeft') {
      this.prevCard();
    } else if (event.key === '1') {
      this.rateCurrentCard('hard');
    } else if (event.key === '2') {
      this.rateCurrentCard('medium');
    } else if (event.key === '3') {
      this.rateCurrentCard('easy');
    }
  }

  private initForm(): void {
    this.cardForm = this.fb.group({
      subjectId: ['', Validators.required],
      topicName: [''],
      question: ['', [Validators.required, Validators.minLength(5)]],
      answer: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private loadFlashcards(): void {
    const saved = this.storage.get<Flashcard[]>('flashcards', []);
    if (saved && saved.length > 0) {
      this.flashcards = saved;
    } else {
      this.flashcards = DEMO_FLASHCARDS;
      this.saveFlashcards();
    }
  }

  private saveFlashcards(): void {
    this.storage.set('flashcards', this.flashcards);
  }

  get filteredCards(): Flashcard[] {
    if (this.selectedSubjectId === 'all') {
      return this.flashcards;
    }
    return this.flashcards.filter(c => c.subjectId === this.selectedSubjectId);
  }

  get currentCard(): Flashcard | null {
    const cards = this.filteredCards;
    if (cards.length === 0) return null;
    if (this.currentIndex >= cards.length) {
      this.currentIndex = 0;
    }
    return cards[this.currentIndex];
  }

  get masteredCount(): number {
    return this.filteredCards.filter(c => c.rating === 'easy').length;
  }

  get learningCount(): number {
    return this.filteredCards.filter(c => c.rating === 'medium').length;
  }

  get needsReviewCount(): number {
    return this.filteredCards.filter(c => c.rating === 'hard' || c.rating === 'unreviewed').length;
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {
    const cards = this.filteredCards;
    if (cards.length === 0) return;
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex + 1) % cards.length;
  }

  prevCard(): void {
    const cards = this.filteredCards;
    if (cards.length === 0) return;
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex - 1 + cards.length) % cards.length;
  }

  rateCurrentCard(rating: FlashcardRating): void {
    const card = this.currentCard;
    if (!card) return;

    card.rating = rating;
    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewed = new Date();
    this.saveFlashcards();

    const labelMap: Record<FlashcardRating, string> = {
      easy: 'Marked as Mastered! 🎉',
      medium: 'Marked as Reviewing 👍',
      hard: 'Needs More Practice 🔄',
      unreviewed: 'Unreviewed'
    };
    this.notification.info('Rating Saved', labelMap[rating]);
    this.nextCard();
  }

  selectSubject(subjectId: string): void {
    this.selectedSubjectId = subjectId;
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  openAddModal(): void {
    this.cardForm.reset({
      subjectId: this.subjects[0]?.id || '',
      topicName: '',
      question: '',
      answer: ''
    });
    this.showAddCardModal = true;
  }

  closeAddModal(): void {
    this.showAddCardModal = false;
  }

  submitAddCard(): void {
    if (this.cardForm.invalid) return;
    const { subjectId, topicName, question, answer } = this.cardForm.value;
    const sub = this.subjects.find(s => s.id === subjectId);

    const newCard: Flashcard = {
      id: 'fc-' + Date.now(),
      subjectId,
      subjectName: sub ? sub.name : 'General',
      topicName: topicName ? topicName.trim() : 'General',
      question: question.trim(),
      answer: answer.trim(),
      rating: 'unreviewed',
      reviewCount: 0,
      createdAt: new Date()
    };

    this.flashcards.unshift(newCard);
    this.saveFlashcards();
    this.notification.success('Flashcard Created', 'Your new flashcard is ready to study.');
    this.closeAddModal();
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  deleteCard(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.flashcards = this.flashcards.filter(c => c.id !== id);
    this.saveFlashcards();
    this.notification.info('Flashcard Deleted');
    if (this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = Math.max(0, this.filteredCards.length - 1);
    }
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
