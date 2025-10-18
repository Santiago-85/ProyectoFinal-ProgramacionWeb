import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<{ title: string, body: string }>();

  notification$ = this.notificationSubject.asObservable();

  constructor() { }

  show(title: string, body: string) {
    this.notificationSubject.next({ title, body });
  }
}