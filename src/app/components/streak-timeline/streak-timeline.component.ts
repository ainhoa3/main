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
          <div class="streak-dot" [ngClass]="{'streak-dot-broken': streak.days === 0}"></div>
          <div class="streak-content">
            <div class="streak-dates">
              {{ formatDate(streak.startDate) }}
              <span *ngIf="streak.startDate !== streak.endDate"> - {{ formatDate(streak.endDate) }}</span>
            </div>
            <div class="streak-duration">
              <span *ngIf="streak.days === 0">Racha rota</span>
              <span *ngIf="streak.days > 0">{{ streak.days }} día{{ streak.days > 1 ? 's' : '' }}</span>
            </div>
            <div class="streak-bar" *ngIf="streak.days > 0" [style.width]="calculateBarWidth(streak.days)"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="!streaks || streaks.length === 0" class="no-streaks">
      No hay strikes registrados este mes.
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
    
    .streak-dot-broken {
      background: #ff4444;
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

    // Ordenar los strikes por fecha (de más reciente a más viejo)
    const sortedStrikes = [...this.monthlyStrikes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const streaks: StreakPeriod[] = [];
    let currentGroup: { startDate: Date, endDate: Date, maxDays: number } | null = null;

    // Procesar los strikes
    for (const strike of sortedStrikes) {
      const date = new Date(strike.date);
      
      if (strike.streak === 0) {
        // Si es una racha rota, la mostramos como un punto individual
        streaks.push({
          startDate: date,
          endDate: date,
          days: 0
        });
      } else {
        // Si es una racha válida (distinta de 0)
        if (!currentGroup) {
          // Iniciar un nuevo grupo
          currentGroup = { startDate: date, endDate: date, maxDays: strike.streak };
        } else {
          // Si es consecutivo con el grupo actual
          const lastDate = currentGroup.endDate;
          const diffDays = Math.round(Math.abs((date.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)));
          
          if (diffDays === 1) {
            // Extender el grupo
            currentGroup.endDate = date;
            currentGroup.maxDays = Math.max(currentGroup.maxDays, strike.streak);
          } else {
            // Guardar el grupo actual y empezar uno nuevo
            streaks.push({
              startDate: currentGroup.startDate,
              endDate: currentGroup.endDate,
              days: currentGroup.maxDays
            });
            currentGroup = { startDate: date, endDate: date, maxDays: strike.streak };
          }
        }
      }
    }

    // Asegurarse de agregar el último grupo
    if (currentGroup) {
      streaks.push({
        startDate: currentGroup.startDate,
        endDate: currentGroup.endDate,
        days: currentGroup.maxDays
      });
    }

    // Ordenar los strikes resultantes por fecha
    this.streaks = streaks.sort((a, b) => 
      b.startDate.getTime() - a.startDate.getTime()
    );
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
