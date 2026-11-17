import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject as RxSubject, takeUntil, interval, Subscription } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { StudyTask } from '../../models';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type AmbientSound = 'none' | 'rain' | 'whitenoise' | 'binaural';

@Component({
  selector: 'app-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss']
})
export class FocusComponent implements OnInit, OnDestroy {
  // Timer States
  mode: TimerMode = 'focus';
  durationMinutes = 25;
  remainingSeconds = 25 * 60;
  isRunning = false;
  isPaused = false;
  isDark = false;
  isFullscreen = false;

  // Stats
  completedPomodoros = 0;
  targetPomodoros = 4;
  totalFocusMinutesToday = 75;

  // Linked Task
  linkedTaskId: string | null = null;
  linkedSubject = 'General Deep Work';
  linkedTopic = 'Autonomous Study Session';
  availableTasks: StudyTask[] = [];

  // Ambient Sound
  currentSound: AmbientSound = 'none';
  soundVolume = 0.5;
  private audioCtx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;

  private timerSub?: Subscription;
  private destroy$ = new RxSubject<void>();

  isSidebarCollapsed = false;
  isMobileNavOpen = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plannerService: StudyPlannerService,
    private notificationService: NotificationService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDark = theme === 'dark');

    // Route query parameters (e.g. launched from planner)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['taskId']) this.linkedTaskId = params['taskId'];
        if (params['subject']) this.linkedSubject = params['subject'];
        if (params['topic']) this.linkedTopic = params['topic'];
        if (params['duration']) {
          this.durationMinutes = Number(params['duration']) || 25;
          this.remainingSeconds = this.durationMinutes * 60;
        }
      });

    this.plannerService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.availableTasks = tasks.filter(t => t.status !== 'completed');
      });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopAmbientSound();
    this.destroy$.next();
    this.destroy$.complete();
  }

  setMode(mode: TimerMode): void {
    if (this.isRunning) {
      this.stopTimer();
    }
    this.mode = mode;
    if (mode === 'focus') {
      this.durationMinutes = 25;
    } else if (mode === 'shortBreak') {
      this.durationMinutes = 5;
    } else if (mode === 'longBreak') {
      this.durationMinutes = 15;
    }
    this.remainingSeconds = this.durationMinutes * 60;
  }

  toggleTimer(): void {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    this.isRunning = true;
    this.isPaused = false;

    this.timerSub = interval(1000).subscribe(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        this.handleTimerComplete();
      }
    });

    if (this.currentSound !== 'none') {
      this.playAmbientSound(this.currentSound);
    }
  }

  pauseTimer(): void {
    this.isRunning = false;
    this.isPaused = true;
    this.timerSub?.unsubscribe();
    this.stopAmbientSound();
  }

  resetTimer(): void {
    this.stopTimer();
    this.remainingSeconds = this.durationMinutes * 60;
    this.stopAmbientSound();
  }

  private stopTimer(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.timerSub?.unsubscribe();
  }

  private handleTimerComplete(): void {
    this.stopTimer();
    this.stopAmbientSound();

    if (this.mode === 'focus') {
      this.completedPomodoros++;
      this.totalFocusMinutesToday += this.durationMinutes;

      // Mark linked task completed if one was linked
      if (this.linkedTaskId) {
        this.plannerService.updateTaskStatus(this.linkedTaskId, 'completed');
      }

      this.notificationService.success(
        'Focus Session Completed! 🏆',
        `Great job finishing your ${this.durationMinutes}-minute study sprint. Time for a well-earned break.`
      );

      // Auto switch to short break or long break
      if (this.completedPomodoros % 4 === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
    } else {
      this.notificationService.info(
        'Break Over! ⚡',
        'Ready to jump back into deep focus?'
      );
      this.setMode('focus');
    }
  }

  // Circular SVG progress percentage calculation
  getProgressPercent(): number {
    const total = this.durationMinutes * 60;
    if (total === 0) return 0;
    return ((total - this.remainingSeconds) / total) * 100;
  }

  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 130; // r = 130
    const progress = this.getProgressPercent() / 100;
    return circumference - (progress * circumference);
  }

  formatTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  selectLinkedTask(task: StudyTask): void {
    this.linkedTaskId = task.id;
    this.linkedSubject = task.subjectName;
    this.linkedTopic = task.topicName;
    this.durationMinutes = task.durationMinutes || 25;
    this.remainingSeconds = this.durationMinutes * 60;
    this.notificationService.info('Task Linked', `Timer set to ${task.topicName} (${this.durationMinutes}m)`);
  }

  // ============================================================
  // Web Audio Synthetic Sound Generator
  // ============================================================
  setAmbientSound(sound: AmbientSound): void {
    if (this.currentSound === sound) {
      this.stopAmbientSound();
      this.currentSound = 'none';
      return;
    }
    this.currentSound = sound;
    if (this.isRunning) {
      this.playAmbientSound(sound);
    }
  }

  private playAmbientSound(sound: AmbientSound): void {
    try {
      this.stopAmbientSound();
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.soundVolume * 0.15, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      if (sound === 'whitenoise' || sound === 'rain') {
        // Generate buffer with smooth pink/brown noise
        const bufferSize = this.audioCtx.sampleRate * 2;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise filter
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(this.gainNode);
        whiteNoise.start();
        this.noiseNode = whiteNoise;
      } else if (sound === 'binaural') {
        // Binaural 10Hz Alpha wave (200Hz left, 210Hz right)
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        this.noiseNode = osc;
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private stopAmbientSound(): void {
    try {
      if (this.noiseNode && 'stop' in this.noiseNode) {
        (this.noiseNode as AudioBufferSourceNode).stop();
      }
      this.audioCtx?.close();
      this.audioCtx = null;
      this.noiseNode = null;
      this.gainNode = null;
    } catch {
      // Safe teardown
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }
}
