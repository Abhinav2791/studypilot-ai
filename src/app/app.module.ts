import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingScreenComponent } from './shared/components/loading-screen/loading-screen.component';
import { ToastComponent } from './shared/components/toast/toast.component';

// Feature Components
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

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoadingScreenComponent,
    ToastComponent,
    LandingComponent,
    WelcomeComponent,
    DashboardComponent,
    PlannerComponent,
    CoachComponent,
    FocusComponent,
    AnalyticsComponent,
    SettingsComponent,
    AuthComponent,
    SubjectsComponent,
    FlashcardsComponent,
    QuizzesComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
