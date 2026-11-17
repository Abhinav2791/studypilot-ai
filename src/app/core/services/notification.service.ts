import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, NotificationType } from '../../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: NotificationType, title: string, message?: string, duration = 4000): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message, 6000);
  }

  warning(title: string, message?: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  dismiss(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
