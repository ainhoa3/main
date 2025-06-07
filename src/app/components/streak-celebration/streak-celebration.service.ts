import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreakCelebrationService {
  private showCelebrationSubject = new BehaviorSubject<boolean>(false);
  showCelebration$ = this.showCelebrationSubject.asObservable();

  constructor() {}

  showCelebration(): void {
    this.showCelebrationSubject.next(true);
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      this.hideCelebration();
    }, 5000);
  }

  hideCelebration(): void {
    this.showCelebrationSubject.next(false);
  }
}
