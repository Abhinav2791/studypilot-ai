import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { StudyGoal, StudyPeriod, Subject } from '../../models';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentStep = 1; // 1: Goals & Name, 2: Subjects, 3: Capacity & Focus, 4: Generating
  isDark = false;
  isGenerating = false;
  generationProgress = 0;
  generationStatus = 'Analyzing your syllabus difficulty...';

  // Step 1: Profile & Goals
  studentName = 'Alex Johnson';
  studentEmail = 'alex@university.edu';
  selectedGoal: StudyGoal = 'semester';

  goals: { id: StudyGoal; title: string; desc: string; icon: string }[] = [
    {
      id: 'semester',
      title: 'Semester Finals & GPA',
      desc: 'Balanced study plans to maximize grades across all university courses.',
      icon: '🎓'
    },
    {
      id: 'placement',
      title: 'Placements & Technical Prep',
      desc: 'Deep focus on DSA, System Design, Algorithms, and Core CS Fundamentals.',
      icon: '💻'
    },
    {
      id: 'competitive',
      title: 'Competitive & Entrance Exams',
      desc: 'High-velocity test pacing, mock test reviews, and weak topic diagnostic sprints.',
      icon: '⚡'
    },
    {
      id: 'general',
      title: 'Lifelong Skill Mastery',
      desc: 'Self-paced learning routines without stress or looming exam deadlines.',
      icon: '🧠'
    }
  ];

  // Step 2: Selected Subjects
  onboardingSubjects: { name: string; color: string; examDays: number; totalTopics: number; selected: boolean }[] = [
    { name: 'Java Programming', color: '#8175F5', examDays: 14, totalTopics: 4, selected: true },
    { name: 'Database Management Systems', color: '#38B98A', examDays: 21, totalTopics: 3, selected: true },
    { name: 'Operating Systems & Concurrency', color: '#E9AC55', examDays: 28, totalTopics: 3, selected: true },
    { name: 'Computer Networks & TCP/IP', color: '#5BA4F5', examDays: 35, totalTopics: 3, selected: true }
  ];
  newSubjectName = '';

  // Step 3: Capacity & Rhythm
  dailyHours = 4;
  selectedPeriods: StudyPeriod[] = ['morning', 'evening'];

  periodOptions: { id: StudyPeriod; label: string; time: string; icon: string }[] = [
    { id: 'morning', label: 'Morning Sprint', time: '08:00 - 11:30', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon Block', time: '13:00 - 16:30', icon: '☀️' },
    { id: 'evening', label: 'Evening Deep Work', time: '18:00 - 21:00', icon: '🌇' },
    { id: 'night', label: 'Late Night Review', time: '21:30 - 00:30', icon: '🌙' }
  ];

  private destroy$ = new RxSubject<void>();

  constructor(
    private plannerService: StudyPlannerService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });

    if (this.authService.currentUser) {
      this.studentName = this.authService.currentUser.name || 'Alex Johnson';
      this.studentEmail = this.authService.currentUser.email || 'alex@university.edu';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    } else if (this.currentStep === 3) {
      this.generatePlan();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  toggleSubject(sub: any): void {
    sub.selected = !sub.selected;
  }

  addNewSubject(): void {
    const name = this.newSubjectName.trim();
    if (!name) return;
    const colors = ['#8175F5', '#38B98A', '#E9AC55', '#5BA4F5', '#A78BFA', '#F06565'];
    this.onboardingSubjects.push({
      name,
      color: colors[this.onboardingSubjects.length % colors.length],
      examDays: 30,
      totalTopics: 3,
      selected: true
    });
    this.newSubjectName = '';
    this.notificationService.success('Subject Added', `Added "${name}" to your onboarding list.`);
  }

  togglePeriod(periodId: StudyPeriod): void {
    if (this.selectedPeriods.includes(periodId)) {
      if (this.selectedPeriods.length > 1) {
        this.selectedPeriods = this.selectedPeriods.filter(p => p !== periodId);
      }
    } else {
      this.selectedPeriods.push(periodId);
    }
  }

  isPeriodSelected(p: StudyPeriod): boolean {
    return this.selectedPeriods.includes(p);
  }

  generatePlan(): void {
    this.currentStep = 4;
    this.isGenerating = true;
    this.generationProgress = 15;

    // Login/Authenticate demo user profile
    this.authService.signInDemo(this.studentName, this.studentEmail);
    this.authService.updateProfile({
      goal: this.selectedGoal,
      dailyStudyHours: this.dailyHours,
      preferredPeriods: this.selectedPeriods
    });

    // Step animation sequence
    setTimeout(() => {
      this.generationProgress = 45;
      this.generationStatus = 'Balancing topic difficulty with exam deadlines...';
    }, 700);

    setTimeout(() => {
      this.generationProgress = 75;
      this.generationStatus = 'Generating active recall flashcards & revision intervals...';
    }, 1400);

    setTimeout(() => {
      this.generationProgress = 100;
      this.generationStatus = 'Personalized Study Plan Ready!';
      this.isGenerating = false;
    }, 2100);
  }

  launchDashboard(): void {
    this.notificationService.success('Welcome to StudyPilot AI! 🎉', 'Your personalized adaptive schedule is active.');
    this.router.navigate(['/dashboard']);
  }

  skipToDashboard(): void {
    this.authService.signInDemo(this.studentName, this.studentEmail);
    this.router.navigate(['/dashboard']);
  }
}
