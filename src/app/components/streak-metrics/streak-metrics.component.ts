import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StrikeDTO } from '../../models/strike.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { StreakTimelineComponent } from '../streak-timeline/streak-timeline.component';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-streak-metrics',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, StreakTimelineComponent],
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
          <h3>Máxima racha (año)</h3>
          <p>{{maxYearlyStreak || 0}} días</p>
        </div>
        <div class="stat-item">
          <h3>Máxima racha (mes)</h3>
          <p>{{maxMonthlyStreak || 0}} días</p>
        </div>
        <div class="stat-item">
          <h3>Media mensual</h3>
          <p>{{monthlyAverage.toFixed(1) || 0}} días</p>
        </div>
        <div class="stat-item">
          <h3>Media anual</h3>
          <p>{{yearlyAverage.toFixed(1) || 0}} días</p>
        </div>
      </div>

      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
      
      <!-- Línea de tiempo de rachas -->
      <app-streak-timeline [monthlyStrikes]="monthlyStrikes"></app-streak-timeline>
    </div>
  `,
  styles: [
    `.streak-metrics-container {
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
export class StreakMetricsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') private chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private destroy$ = new Subject<void>();

  view: 'year' | 'month' = 'month';
  loading = true;

  currentStreak = 0;
  maxStreak = 0;
  averageStreak = 0;
  maxMonthlyStreak = 0;
  maxYearlyStreak = 0;
  monthlyAverage = 0;
  yearlyAverage = 0;

  monthlyStrikes: StrikeDTO[] = [];
  yearlyStrikes: StrikeDTO[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMonthlyStrikes();
    this.loadYearlyStrikes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  setView(view: 'year' | 'month'): void {
    this.view = view;
    this.updateChart();
  }

  private initChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Media mensual de racha',
          data: [],
          backgroundColor: '#007bff',
          borderColor: '#007bff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: (context: any) => `Media: ${context.raw.toFixed(1)} días`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Días de racha'
            },
            ticks: {
              precision: 1
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  private updateChart(): void {
    if (!this.yearlyStrikes?.length) {
      this.clearChart();
      return;
    }

    const { labels, averages } = this.calculateMonthlyAverages();

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = averages;
      this.chart.update();
    }
  }

  private clearChart(): void {
    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.update();
    }
  }

  private resetMetrics(): void {
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.averageStreak = 0;
  }

  private calculateMonthlyAverages(): { labels: string[], averages: number[] } {
    if (!this.yearlyStrikes?.length) {
      this.resetMetrics();
      return { labels: [], averages: [] };
    }

    const sortedStrikes = [...this.yearlyStrikes].sort((a: StrikeDTO, b: StrikeDTO) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const monthlyAverages: { [key: string]: { total: number; count: number; max: number } } = {};
    let currentYearlyStreak = 0;
    let maxYearlyStreak = 0;
    let yearlyTotal = 0;
    let yearlyCount = 0;
    let lastDate: Date | null = null;
    const oneDay = 24 * 60 * 60 * 1000;

    // Calcular rachas mensuales y anuales
    for (const strike of sortedStrikes) {
      const date = new Date(strike.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthKey = `${year}-${month}`;

      // Calcular racha mensual
      if (!monthlyAverages[monthKey]) {
        monthlyAverages[monthKey] = { total: 0, count: 0, max: 0 };
      }

      // Actualizar el máximo mensual con el valor real del strike
      monthlyAverages[monthKey].max = Math.max(monthlyAverages[monthKey].max, strike.streak);
      maxYearlyStreak = Math.max(maxYearlyStreak, strike.streak);
      
      // Actualizar estadísticas mensuales usando el valor real del strike
      monthlyAverages[monthKey].total += strike.streak;
      monthlyAverages[monthKey].count++;
      
      // Actualizar estadísticas anuales usando el valor real del strike
      yearlyTotal += strike.streak;
      yearlyCount++;
      
      // Actualizar la racha actual del usuario
      this.currentStreak = strike.streak;
      
      lastDate = date;
    }

    // Si no hay strikes, la racha actual es 0
    if (!sortedStrikes.length) {
      this.currentStreak = 0;
    }

    // Calcular promedios y preparar datos para el gráfico
    const labels: string[] = [];
    const averages: number[] = [];
    let maxMonthlyStreak = 0;
    let monthlyAverage = 0;

    // Ordenar los meses
    const sortedMonths = Object.keys(monthlyAverages).sort();
    
    for (const monthKey of sortedMonths) {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(parseInt(year), parseInt(month)).toLocaleString('es-ES', { month: 'long' });
      labels.push(`${monthName} ${year}`);
      
      const { total, count, max } = monthlyAverages[monthKey];
      const average = count > 0 ? total / count : 0;
      averages.push(average);
      
      // Actualizar métricas mensuales
      maxMonthlyStreak = Math.max(maxMonthlyStreak, max);
      monthlyAverage += average;
    }

    // Calcular promedio mensual
    monthlyAverage = sortedMonths.length > 0 ? monthlyAverage / sortedMonths.length : 0;
    // Calcular promedio anual
    this.yearlyAverage = yearlyCount > 0 ? yearlyTotal / yearlyCount : 0;

    // Actualizar propiedades del componente
    this.maxMonthlyStreak = maxMonthlyStreak;
    this.maxYearlyStreak = maxYearlyStreak;
    this.monthlyAverage = monthlyAverage;

    return { labels, averages };
  }

  private calculateYearlyMetrics(): void {
    if (!this.yearlyStrikes?.length) {
      this.resetMetrics();
      return;
    }

    const sortedStrikes = [...this.yearlyStrikes].sort((a: StrikeDTO, b: StrikeDTO) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let currentStreak = 0;
    let maxStreak = 0;
    const streaks: number[] = [];
    let lastDate: Date | null = null;
    const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día

    for (const strike of sortedStrikes) {
      const currentDate = new Date(strike.date);
      
      if (lastDate) {
        const diffDays = Math.round(Math.abs((currentDate.getTime() - lastDate.getTime()) / oneDay));
        
        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (diffDays > 1) {
          streaks.push(currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = currentDate;
    }

    if (sortedStrikes.length > 0) {
      streaks.push(currentStreak);
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    this.currentStreak = currentStreak;
    this.maxStreak = maxStreak;
    this.averageStreak = streaks.length > 0 
      ? Math.round((streaks.reduce((sum: number, days: number) => sum + days, 0) / streaks.length) * 10) / 10 
      : 0;
  }

  private loadMonthlyStrikes(): void {
    this.authService.getStrikesOfMonth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (strikes: StrikeDTO[]) => {
          this.monthlyStrikes = strikes;
          this.updateChart();
        },
        error: (error: any) => {
          console.error('Error loading monthly strikes:', error);
        }
      });
  }

  private loadYearlyStrikes(): void {
    this.authService.getStrikesOfYear()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (strikes: StrikeDTO[]) => {
          this.yearlyStrikes = strikes;
          this.calculateYearlyMetrics();
          this.updateChart();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading yearly strikes:', error);
        }
      });
  }
}
