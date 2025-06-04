import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StrikeDTO } from '../../models/strike.model';
import { Chart } from 'chart.js';
import { Observable, forkJoin } from 'rxjs';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-streak-metrics',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="streak-metrics-container">
      <app-spinner *ngIf="loading"></app-spinner>
      <div class="controls" *ngIf="!loading">
        <button class="btn btn-filter" [class.selected]="view === 'year'" (click)="setView('year')">
          Ver por año
        </button>
        <button class="btn btn-filter" [class.selected]="view === 'month'" (click)="setView('month')">
          Ver por mes
        </button>
      </div>

      <div class="stats-container">
        <div class="stat-item">
          <h3>Racha actual</h3>
          <p>{{currentStreak || 0}} días</p>
        </div>
        <div class="stat-item">
          <h3>Máxima racha</h3>
          <p>{{maxStreak || 0}} días</p>
        </div>
        <div class="stat-item">
          <h3>Racha media</h3>
          <p>{{averageStreak || 0}} días</p>
        </div>
      </div>

      <div class="chart-container">
        <canvas #chartCanvas>
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .streak-metrics-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-filter {
      flex: 1 1 auto;
      min-width: 120px;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      background-color: #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .btn-filter:hover {
      background-color: #e0e0e0;
      transform: translateY(-1px);
    }

    .btn-filter.selected {
      background-color: #007bff;
      color: white;
      transform: translateY(-2px);
    }

    .stats-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      justify-content: center;
    }

    .stat-item {
      flex: 1 1 250px;
      min-width: 200px;
      text-align: center;
      padding: 1.5rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      box-sizing: border-box;
    }

    .stat-item h3 {
      color: #6c757d;
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }

    .stat-item p {
      font-size: 1.75rem;
      font-weight: bold;
      color: #007bff;
      margin: 0;
    }

    .chart-container {
      width: 100%;
      height: 400px;
      position: relative;
    }

    @media (max-width: 768px) {
      .streak-metrics-container {
        padding: 1rem;
      }

      .controls {
        gap: 0.5rem;
      }

      .btn-filter {
        min-width: 100px;
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
      }

      .stat-item {
        flex: 1 1 100%;
        max-width: 250px;
        margin: 0 auto;
      }

      .stats-container {
        justify-content: space-between;
      }

      .stat-item h3 {
        font-size: 0.9rem;
      }

      .stat-item p {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .streak-metrics-container {
        padding: 0.75rem;
      }

      .chart-container {
        height: 300px;
      }

      .stat-item {
        flex: 1 1 100%;
        max-width: 200px;
      }
    }
  `]
})
export class StreakMetricsComponent implements OnInit {
  view = 'year';
  strikes: StrikeDTO[] = [];
  currentStreak = 0;
  maxStreak = 0;
  averageStreak = 0;
  chart: Chart | null = null;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Días de racha'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };
  chartData = {
    labels: [] as string[],
    datasets: [{
      label: 'Racha diaria',
      data: [] as number[],
      borderColor: '#007bff',
      tension: 0.4,
      fill: false
    }]
  };

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  loading = true;

  constructor(private authService: AuthService) {
    this.loadMetrics();
  }

  setView(view: 'year' | 'month'): void {
    this.view = view;
    this.loadMetrics();
  }

  ngAfterViewInit() {
    if (this.chartCanvas) {
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: this.chartData,
        options: this.chartOptions
      });
    }
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading = true;
    const obs = this.view === 'year' 
      ? this.authService.getStrikesOfYear() 
      : this.authService.getStrikesOfMonth();

    obs.subscribe({
      next: (strikes) => {
        this.strikes = strikes;
        this.calculateMetrics();
        this.updateChart();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading streak metrics:', error);
        this.loading = false;
      }
    });
  }

  private calculateMetrics(): void {
    if (!this.strikes.length) return;

    // Ordenar strikes por fecha
    this.strikes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let streakSum = 0;
    let streakCount = 0;
    let lastDate = null;

    for (const strike of this.strikes) {
      const currentDate = new Date(strike.date);
      
      if (lastDate) {
        const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          if (currentStreak > 0) {
            maxStreak = Math.max(maxStreak, currentStreak);
            streakSum += currentStreak;
            streakCount++;
          }
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      lastDate = currentDate;
    }

    // Si la última racha está activa
    if (currentStreak > 0) {
      maxStreak = Math.max(maxStreak, currentStreak);
      this.currentStreak = currentStreak;
      streakSum += currentStreak;
      streakCount++;
    }

    this.maxStreak = maxStreak;
    this.averageStreak = streakCount > 0 ? Math.round(streakSum / streakCount) : 0;
  }

  private updateChart(): void {
    if (!this.strikes.length) return;

    const dates: string[] = [];
    const streaks: number[] = [];

    this.strikes.forEach(strike => {
      const date = new Date(strike.date);
      dates.push(this.view === 'year' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getDate()}/${date.getMonth() + 1}`);
      streaks.push(strike.streak);
    });

    this.chartData.labels = dates;
    this.chartData.datasets[0].data = streaks;

    if (this.chart) {
      this.chart.update();
    }
  }
}
