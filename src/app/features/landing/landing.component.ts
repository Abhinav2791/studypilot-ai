import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
  route: string;
  tag: string;
  actionText: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: 'plan' | 'progress' | 'coach' = 'plan';
  isAnnual = true;
  private observers: IntersectionObserver[] = [];

  features: LandingFeature[] = [
    {
      icon: 'calendar',
      title: 'Smart Study Planning',
      description: 'Turn your syllabus, exam dates, and daily available hours into a realistic, adaptive study schedule.',
      color: '#8175F5',
      route: '/planner',
      tag: 'Adaptive Engine',
      actionText: 'Explore Planner →'
    },
    {
      icon: 'book',
      title: 'Subjects & Curriculum',
      description: 'Break syllabi into atomic topics, set difficulty ratings, and track mastery percentage per subject.',
      color: '#38B98A',
      route: '/subjects',
      tag: 'Curriculum Tracking',
      actionText: 'Manage Subjects →'
    },
    {
      icon: 'cards',
      title: 'Active Recall Flashcards',
      description: 'Reinforce memory with 3D interactive flip cards powered by spaced repetition review algorithms.',
      color: '#E9AC55',
      route: '/flashcards',
      tag: 'Spaced Repetition',
      actionText: 'Practice Flashcards →'
    },
    {
      icon: 'help',
      title: 'Adaptive Quizzes',
      description: 'Challenge your knowledge with timed diagnostic tests, instant scoring, and detailed explanations.',
      color: '#5BA4F5',
      route: '/quizzes',
      tag: 'Self Assessment',
      actionText: 'Take a Quiz →'
    },
    {
      icon: 'message',
      title: 'AI Study Coach',
      description: 'Explore difficult concepts, get Socratic explanations, mental models, and rapid-fire practice questions.',
      color: '#A78BFA',
      route: '/coach',
      tag: '24/7 Guidance',
      actionText: 'Chat With Coach →'
    },
    {
      icon: 'chart',
      title: 'Progress Insights & Peaks',
      description: 'Understand completed study hours, 30-day consistency heatmap, and identify your cognitive peak hours.',
      color: '#F06565',
      route: '/analytics',
      tag: 'Analytics',
      actionText: 'View Analytics →'
    }
  ];

  principles = [
    {
      icon: 'clock',
      title: 'Built around your available time.',
      description: 'No generic plans. Your schedule adapts to your actual free hours each day.'
    },
    {
      icon: 'trending-up',
      title: 'Focused on meaningful progress.',
      description: 'Track what matters — completed topics, revision status, and exam readiness.'
    },
    {
      icon: 'shuffle',
      title: 'Flexible when life interrupts.',
      description: 'Missed a session? The planner adjusts without piling up an impossible backlog.'
    }
  ];

  coachConversation = [
    { role: 'user', text: 'Can you explain Java Streams in simple terms?' },
    { role: 'assistant', text: 'Absolutely! Java Streams let you process collections of data in a clean, functional style. Think of a stream as a pipeline: data flows in, gets transformed through operations like filter() and map(), and something useful comes out at the end.\n\nFor example, filtering a list of students with grades above 80 becomes: students.stream().filter(s -> s.grade > 80).collect(Collectors.toList())' },
    { role: 'user', text: 'Give me 3 practice questions on this topic.' },
    { role: 'assistant', text: '1. What is the difference between intermediate and terminal operations in Java Streams?\n2. How would you use streams to find the average score from a list of exam results?\n3. Explain the purpose of the flatMap() operation with an example.' }
  ];

  pricingPlans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: 'Zero Commitment',
      monthlyPrice: '$0',
      annualPrice: '$0',
      period: 'forever',
      description: 'Essential AI study planning tools for self-motivated students.',
      features: [
        'Up to 3 Active Subjects',
        'Smart Study Calendar & Day Pacing',
        '5 AI Coach Questions Daily',
        'Basic Spaced Repetition Flashcards',
        'Weekly Progress Summary'
      ],
      isPopular: false,
      ctaText: 'Start Learning Free',
      ctaClass: 'btn-ghost'
    },
    {
      id: 'pro',
      name: 'Pro Scholar',
      badge: 'Most Popular',
      monthlyPrice: '$9',
      annualPrice: '$6',
      period: 'per month',
      description: 'Uncapped adaptive planning, deep-work tools, and unlimited AI coaching.',
      features: [
        'Unlimited Subjects & Atomic Topics',
        'Full AI Auto-Rebalance Engine',
        'Unlimited 24/7 AI Coach Explanations',
        'Unlimited Flashcard Decks & 3D Review',
        'Adaptive Concept Mastery Quizzes',
        'Ambient Binaural Focus Audio',
        '30-Day Heatmap & Cognitive Peak Analytics'
      ],
      isPopular: true,
      ctaText: 'Start 14-Day Free Trial',
      ctaClass: 'btn-primary'
    },
    {
      id: 'campus',
      name: 'Campus Cohort',
      badge: 'Best For Groups',
      monthlyPrice: '$19',
      annualPrice: '$14',
      period: 'per month',
      description: 'Collaborative decks, syllabus sync, and peer benchmarks for study groups.',
      features: [
        'Everything in Pro Scholar',
        'Up to 5 Collaborative Members',
        'Shared Syllabus & Exam Countdown Sync',
        'Peer Flashcard Deck Sharing',
        'Group Velocity & Progress Leaderboard',
        'Priority AI Coach Model Speed'
      ],
      isPopular: false,
      ctaText: 'Explore Cohort Plan',
      ctaClass: 'btn-ghost'
    }
  ];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
  }

  private initScrollAnimations(): void {
    const elements = document.querySelectorAll('.animate-fade-up, .animate-fade-in, .animate-scale-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  openFeature(route: string): void {
    this.router.navigate([route]);
  }

  buildMyPlan(): void {
    this.router.navigate(['/auth']);
  }

  openWelcomeWizard(): void {
    this.router.navigate(['/welcome']);
  }

  exploreFeatures(): void {
    const el = document.querySelector('#features');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  setActiveTab(tab: 'plan' | 'progress' | 'coach'): void {
    this.activeTab = tab;
  }

  createPlan(): void {
    this.router.navigate(['/auth']);
  }

  selectPlan(planId: string): void {
    this.notificationService.success('Plan Selected', `You selected the ${planId.toUpperCase()} plan. Opening onboarding.`);
    this.router.navigate(['/auth']);
  }

  navigateToTabFeature(): void {
    if (this.activeTab === 'plan') {
      this.router.navigate(['/planner']);
    } else if (this.activeTab === 'progress') {
      this.router.navigate(['/analytics']);
    } else if (this.activeTab === 'coach') {
      this.router.navigate(['/coach']);
    }
  }
}
