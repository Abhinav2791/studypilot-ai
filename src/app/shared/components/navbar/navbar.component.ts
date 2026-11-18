import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

export interface FeatureOption {
  label: string;
  desc: string;
  route: string;
  icon: string;
  color: string;
  badge?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  isFeaturesDropdownOpen = false;
  isMobileFeaturesOpen = true; // open by default in mobile drawer
  currentRoute = '';
  isDark = false;
  isAuthenticated = false;

  private destroy$ = new Subject<void>();

  featureOptions: FeatureOption[] = [
    {
      label: 'Smart Study Planner',
      desc: 'Adaptive calendar, day/week pacing & AI auto-rebalance',
      route: '/planner',
      icon: 'calendar',
      color: '#8175F5',
      badge: 'Smart'
    },
    {
      label: 'Subjects & Curriculum',
      desc: 'Syllabus tracking, exam dates & topic difficulty',
      route: '/subjects',
      icon: 'book',
      color: '#38B98A',
      badge: 'New'
    },
    {
      label: 'Active Recall Flashcards',
      desc: '3D interactive flip cards with spaced repetition',
      route: '/flashcards',
      icon: 'cards',
      color: '#E9AC55',
      badge: 'New'
    },
    {
      label: 'Adaptive Quizzes',
      desc: 'Timed practice tests, diagnostics & answer review',
      route: '/quizzes',
      icon: 'help',
      color: '#5BA4F5',
      badge: 'New'
    },
    {
      label: 'AI Study Coach',
      desc: 'Socratic guidance, metaphors & concept explanation',
      route: '/coach',
      icon: 'message',
      color: '#A78BFA',
      badge: 'AI'
    },
    {
      label: 'Focus Pomodoro',
      desc: 'Deep work timer with ambient binaural soundscapes',
      route: '/focus',
      icon: 'clock',
      color: '#F06565',
      badge: 'Audio'
    },
    {
      label: 'Learning Analytics',
      desc: '30-day heatmap, consistency streak & velocity',
      route: '/analytics',
      icon: 'chart',
      color: '#34D399',
      badge: 'Stats'
    },
    {
      label: 'Settings & Pacing',
      desc: 'Custom study capacity, preferred hours & theme',
      route: '/settings',
      icon: 'layers',
      color: '#60A5FA'
    }
  ];

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.isDark = t === 'dark';
    });

    this.authService.auth$.pipe(takeUntil(this.destroy$)).subscribe(a => {
      this.isAuthenticated = a.isAuthenticated;
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
      this.closeMobileMenu();
      this.closeFeaturesDropdown();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 40;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeFeaturesDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
    this.closeFeaturesDropdown();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleFeaturesDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isFeaturesDropdownOpen = !this.isFeaturesDropdownOpen;
  }

  openFeaturesDropdown(): void {
    this.isFeaturesDropdownOpen = true;
  }

  closeFeaturesDropdown(): void {
    this.isFeaturesDropdownOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleMobileFeatures(): void {
    this.isMobileFeaturesOpen = !this.isMobileFeaturesOpen;
  }

  navigateToFeature(route: string): void {
    this.closeFeaturesDropdown();
    this.closeMobileMenu();
    this.router.navigate([route]);
  }

  scrollTo(anchor: string): void {
    this.closeFeaturesDropdown();
    this.closeMobileMenu();
    if (this.currentRoute !== '/' && this.currentRoute !== '') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.doScroll(anchor), 150);
      });
    } else {
      this.doScroll(anchor);
    }
  }

  private doScroll(anchor: string): void {
    const el = document.querySelector(anchor);
    if (el) {
      const navHeight = 68;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.closeMobileMenu();
    this.closeFeaturesDropdown();
  }

  navigateToSignIn(): void {
    this.router.navigate(['/auth']);
    this.closeMobileMenu();
    this.closeFeaturesDropdown();
  }

  navigateToGetStarted(): void {
    this.router.navigate(['/auth']);
    this.closeMobileMenu();
    this.closeFeaturesDropdown();
  }

  isLandingPage(): boolean {
    return this.currentRoute === '/' || this.currentRoute === '';
  }
}
