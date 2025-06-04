import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StrikeDTO } from '../../models/strike.model';

interface StreakPeriod {
  startDate: Date;
  endDate: Date;
  days: number;
}

@Component({
  selector: 'app-streak-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container" *ngIf="streaks && streaks.length > 0">
      <h3>Línea de tiempo de rachas</h3>
      <div class="timeline">
        <div *ngFor="let streak of streaks" class="streak-item">
          <div class="streak-dot"></div>
          <div class="streak-content">
            <div class="streak-dates">
              {{ formatDate(streak.startDate) }} - {{ formatDate(streak.endDate) }}
            </div>
            <div class="streak-duration">
              {{ streak.days }} día{{ streak.days > 1 ? 's' : '' }}
            </div>
            <div class="streak-bar" [style.width]="calculateBarWidth(streak.days)"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="!streaks || streaks.length === 0" class="no-streaks">
      No hay rachas registradas este mes.
    </div>
  `,
  styles: [`
    .timeline-container {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .timeline-container h3 {
      margin-top: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .timeline {
      position: relative;
      padding-left: 2rem;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }
    
    .streak-item {
      position: relative;
      padding-bottom: 2rem;
      display: flex;
      align-items: flex-start;
    }
    
    .streak-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: #4CAF50;
      position: absolute;
      left: -2rem;
      top: 0.25rem;
      z-index: 1;
    }
    
    .streak-content {
      background: #f9f9f9;
      border-radius: 6px;
      padding: 1rem;
      flex: 1;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .streak-dates {
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .streak-duration {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.75rem;
    }
    
    .streak-bar {
      height: 6px;
      background: #4CAF50;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .no-streaks {
      text-align: center;
      color: #666;
      padding: 2rem;
      font-style: italic;
    }
  `]
})
export class StreakTimelineComponent implements OnChanges {
  @Input() monthlyStrikes: StrikeDTO[] = [];
  streaks: StreakPeriod[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyStrikes']) {
      this.calculateStreaks();
    }
  }

  private calculateStreaks(): void {
    if (!this.monthlyStrikes || this.monthlyStrikes.length === 0) {
      this.streaks = [];
      return;
    }

    // Ordenar las fechas de los strikes
    const dates = this.monthlyStrikes
      .map(strike => new Date(strike.date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      this.streaks = [];
      return;
    }

    const streaks: StreakPeriod[] = [];
    let currentStreak: StreakPeriod | null = null;
    const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día

    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      
      if (!currentStreak) {
        // Iniciar una nueva racha
        currentStreak = {
          startDate: currentDate,
          endDate: currentDate,
          days: 1
        };
      } else {
        const prevDate = new Date(dates[i - 1]);
        const diffDays = Math.round(Math.abs((currentDate.getTime() - prevDate.getTime()) / oneDay));
        
        if (diffDays === 1) {
          // Extender la racha actual
          currentStreak.endDate = currentDate;
          currentStreak.days++;
        } else if (diffDays > 1) {
          // Guardar la racha actual y comenzar una nueva
          streaks.push({...currentStreak});
          currentStreak = {
            startDate: currentDate,
            endDate: currentDate,
            days: 1
          };
        }
        // Si diffDays es 0, es el mismo día, lo ignoramos
      }
    }

    // Asegurarse de agregar la última racha
    if (currentStreak) {
      streaks.push(currentStreak);
    }

    this.streaks = streaks.sort((a, b) => b.days - a.days);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  calculateBarWidth(days: number): string {
    // Encontrar la racha más larga para la escala
    const maxDays = this.streaks.length > 0 
      ? Math.max(...this.streaks.map(s => s.days))
      : days;
    
    // Calcular el ancho como porcentaje de la racha más larga
    const percentage = (days / Math.max(maxDays, 1)) * 100;
    return `${Math.min(100, Math.max(10, percentage))}%`;
  }
}
