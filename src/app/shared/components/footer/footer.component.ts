import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  productLinks = [
    { label: 'Subjects & Syllabus', route: '/subjects' },
    { label: 'AI Study Planner', route: '/planner' },
    { label: 'AI Study Coach', route: '/coach' },
    { label: 'Flashcards & Recall', route: '/flashcards' },
    { label: 'Adaptive Quizzes', route: '/quizzes' },
    { label: 'Focus Pomodoro', route: '/focus' },
    { label: 'Progress Analytics', route: '/analytics' }
  ];

  exploreLinks = [
    { label: 'Features', anchor: '#features' },
    { label: 'How It Works', anchor: '#how-it-works' },
    { label: 'About', route: '/' },
    { label: 'Contact', href: 'mailto:hello@studypilot.ai' }
  ];

  accountLinks = [
    { label: 'Sign In', route: '/auth' },
    { label: 'Create Account', route: '/auth' },
    { label: 'Settings', route: '/settings' }
  ];

  constructor(private router: Router) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  scrollTo(anchor: string): void {
    const el = document.querySelector(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
