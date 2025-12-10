import { Component, OnInit, ViewChildren, QueryList, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ReportsService } from '../../../services/models/business-models/reports.service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

/**
 * Componente del Dashboard de Reportes y Análisis.
 * Muestra estadísticas visuales del negocio mediante gráficas y KPIs.
 * Consume datos del microservicio de negocio (AdonisJS).
 */
@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  statistics: any;
  loading = true;
  error: string | null = null;
  private resizeTimeout: any;

  // Configuración de gráfica de líneas (Histórico de Ingresos)
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString('es-CO')}`
        }
      }
    },
    onResize: (chart) => {
      chart.update('none');
    }
  };

  // Configuración de gráfica de barras (Viajes por Municipio)
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    onResize: (chart) => {
      chart.update('none');
    }
  };

  // Configuración de gráfica circular (Distribución de Transporte)
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i] as number;
                return {
                  text: `${label}: ${value.toFixed(2)}%`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])?.[i] || '#000',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
    onResize: (chart) => {
      chart.update('none');
    }
  };

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  /**
   * Maneja el evento de resize de la ventana con debounce
   * para actualizar las gráficas correctamente
   */
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.updateCharts();
    }, 250);
  }

  /**
   * Actualiza todas las gráficas para que se redimensionen correctamente
   */
  private updateCharts(): void {
    if (this.charts) {
      this.charts.forEach((chart) => {
        if (chart.chart) {
          chart.chart.resize();
        }
      });
    }
  }

  /**
   * Carga todos los datos del dashboard desde el backend.
   * Utiliza forkJoin para hacer peticiones paralelas.
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      dashboard: this.reportsService.getDashboard(),
      statistics: this.reportsService.getStatistics()
    }).subscribe({
      next: (response) => {
        this.statistics = response.statistics.data;
        this.setupCharts(response.dashboard.data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del dashboard. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error loading dashboard:', err);
      }
    });
  }

  /**
   * Configura las gráficas con los datos recibidos del backend.
   * @param data Datos del dashboard
   */
  setupCharts(data: any): void {
    // Configurar gráfica de líneas (histórico de ingresos)
    this.lineChartData = {
      labels: data.revenueHistory.map((item: any) => this.formatDate(item.date)),
      datasets: [
        {
          label: 'Ingresos ($)',
          data: data.revenueHistory.map((item: any) => item.revenue),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Configurar gráfica de barras (viajes por municipio)
    this.barChartData = {
      labels: data.municipalityTrips.map((item: any) => item.municipalityName),
      datasets: [
        {
          label: 'Cantidad de Viajes',
          data: data.municipalityTrips.map((item: any) => item.tripCount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }
      ]
    };

    // Configurar gráfica circular (distribución de transporte)
    const aereo = data.transportDistribution.find((item: any) => item.type === 'aereo');
    const terrestre = data.transportDistribution.find((item: any) => item.type === 'terrestre');

    this.pieChartData = {
      labels: ['Transporte Aéreo', 'Transporte Terrestre'],
      datasets: [
        {
          data: [aereo?.percentage || 0, terrestre?.percentage || 0],
          backgroundColor: ['#2196F3', '#FF9800']
        }
      ]
    };
  }

  /**
   * Formatea una fecha en formato YYYY-MM a formato legible (Ene 2024).
   * @param dateStr Fecha en formato YYYY-MM
   * @returns Fecha formateada
   */
  formatDate(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }
}

