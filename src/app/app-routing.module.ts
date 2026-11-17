import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './features/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PlannerComponent } from './features/planner/planner.component';
import { CoachComponent } from './features/coach/coach.component';
import { FocusComponent } from './features/focus/focus.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AuthComponent } from './features/auth/auth.component';
import { SubjectsComponent } from './features/subjects/subjects.component';
import { FlashcardsComponent } from './features/flashcards/flashcards.component';
import { QuizzesComponent } from './features/quizzes/quizzes.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

const routes: Routes = [
  { path: '', component: LandingComponent, title: 'StudyPilot AI – Intelligent Study Coach & Adaptive Planner' },
  { path: 'welcome', component: WelcomeComponent, title: 'Welcome – StudyPilot AI Onboarding' },
  { path: 'onboarding', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard – StudyPilot AI' },
  { path: 'subjects', component: SubjectsComponent, title: 'Subjects & Curriculum – StudyPilot AI' },
  { path: 'planner', component: PlannerComponent, title: 'Smart Study Planner – StudyPilot AI' },
  { path: 'flashcards', component: FlashcardsComponent, title: 'Flashcards & Active Recall – StudyPilot AI' },
  { path: 'quizzes', component: QuizzesComponent, title: 'Adaptive Quizzes – StudyPilot AI' },
  { path: 'coach', component: CoachComponent, title: 'AI Study Coach – StudyPilot AI' },
  { path: 'focus', component: FocusComponent, title: 'Focus Pomodoro – StudyPilot AI' },
  { path: 'analytics', component: AnalyticsComponent, title: 'Learning Analytics – StudyPilot AI' },
  { path: 'settings', component: SettingsComponent, title: 'Settings & Pacing – StudyPilot AI' },
  { path: 'auth', component: AuthComponent, title: 'Sign In – StudyPilot AI' },
  { path: 'auth/signin', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth/signup', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'ai-coach', redirectTo: 'coach', pathMatch: 'full' },
  { path: 'pomodoro', redirectTo: 'focus', pathMatch: 'full' },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
