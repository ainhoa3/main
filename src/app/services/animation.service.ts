import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private showFireAnimation = new Subject<boolean>();
  private streak = new Subject<{ date: string; streak: number }>();

  showFire(streakData: { date: string; streak: number }) {
    this.streak.next(streakData);
    this.showFireAnimation.next(true);
    setTimeout(() => {
      this.showFireAnimation.next(false);
    }, 5000);
  }

  get showFireAnimation$() {
    return this.showFireAnimation.asObservable();
  }

  get streak$() {
    return this.streak.asObservable();
  }
}
