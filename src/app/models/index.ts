// ============================================================
// StudyPilot AI – Core Data Models
// ============================================================

export type ThemeMode = 'light' | 'dark';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;
export type StudyGoal = 'semester' | 'placement' | 'competitive' | 'general';
export type StudyPeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ============================================================
// Subject & Topic
// ============================================================
export interface Topic {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  confidence: ConfidenceLevel;
  isCompleted: boolean;
  isRevised: boolean;
  estimatedHours: number;
  completedHours: number;
  notes?: string;
  lastStudied?: Date;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  topics: Topic[];
  examDate?: Date;
  targetCompletionDate?: Date;
  progress: number; // 0-100
  totalTopics: number;
  completedTopics: number;
  totalHours: number;
  completedHours: number;
  revisionStatus: 'not-started' | 'in-progress' | 'completed';
  createdAt: Date;
}

// ============================================================
// Study Task
// ============================================================
export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicId?: string;
  topicName: string;
  scheduledDate: Date;
  scheduledTime: string; // "HH:MM"
  durationMinutes: number;
  difficulty: DifficultyLevel;
  status: TaskStatus;
  isRevision: boolean;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  type: 'study' | 'revision' | 'quiz' | 'break';
}

// ============================================================
// Study Plan
// ============================================================
export interface StudyPlan {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: StudyTask[];
  subjects: Subject[];
  examDates: ExamDate[];
  dailyStudyHours: number;
  preferredPeriods: StudyPeriod[];
  goal: StudyGoal;
  weekStartDate: Date;
}

// ============================================================
// Exam Date
// ============================================================
export interface ExamDate {
  id: string;
  subjectId: string;
  subjectName: string;
  date: Date;
  type: 'mid-term' | 'final' | 'quiz' | 'assignment' | 'other';
  notes?: string;
}

// ============================================================
// Onboarding State
// ============================================================
export interface OnboardingState {
  step: number;
  goal: StudyGoal | null;
  subjects: Partial<Subject>[];
  examDates: Partial<ExamDate>[];
  dailyStudyHours: number;
  preferredPeriods: StudyPeriod[];
  existingCommitments: string[];
  startDate: Date;
}

// ============================================================
// User / Auth
// ============================================================
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  createdAt: Date;
  goal: StudyGoal;
  dailyStudyHours: number;
  preferredPeriods: StudyPeriod[];
  theme: ThemeMode;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  preferredFocusDuration: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isDemoMode: boolean;
}

// ============================================================
// Flashcard
// ============================================================
export type FlashcardRating = 'easy' | 'medium' | 'hard' | 'unreviewed';

export interface Flashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  question: string;
  answer: string;
  rating: FlashcardRating;
  nextReviewDate?: Date;
  reviewCount: number;
  createdAt: Date;
  lastReviewed?: Date;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subjectId: string;
  cards: Flashcard[];
  createdAt: Date;
}

// ============================================================
// Quiz
// ============================================================
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: DifficultyLevel;
  subjectId?: string;
  topicId?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizName: string;
  subjectId?: string;
  questions: QuizQuestion[];
  answers: Record<string, string>; // questionId -> selectedOptionId
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeTakenSeconds: number;
}

export interface Quiz {
  id: string;
  name: string;
  subjectId?: string;
  topicId?: string;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  createdAt: Date;
}

// ============================================================
// Focus Session
// ============================================================
export interface FocusSession {
  id: string;
  subjectId?: string;
  taskId?: string;
  durationMinutes: number;
  elapsedSeconds: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
}

// ============================================================
// AI Chat
// ============================================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  subjectId?: string;
  topicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Notification Toast
// ============================================================
export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// ============================================================
// Analytics
// ============================================================
export interface WeeklyStats {
  weekLabel: string;
  plannedMinutes: number;
  completedMinutes: number;
  tasksPlanned: number;
  tasksCompleted: number;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  color: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  studyMinutes: number;
}
