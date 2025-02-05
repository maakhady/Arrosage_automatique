import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HistoriqueSectionService, StatistiquesPeriodeResponse } from '../../../services/historique-section.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
  ],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dualAxisChart') dualAxisChart!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  periodeSelectionnee: 'semaine' | 'mois' = 'semaine';
  loading = true;
  error: string | null = null;
  statistiques: StatistiquesPeriodeResponse | null = null;

  constructor(private historiqueSectionService: HistoriqueSectionService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadStatistiques();
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadStatistiques(): void {
    this.loading = true;
    this.error = null;

    this.historiqueSectionService.getStatistiquesPeriode(this.periodeSelectionnee)
      .subscribe({
        next: (response) => {
          console.log('Données reçues:', response);
          if (response.success) {
            this.statistiques = response;
            // On utilise statistiques qui contient les données journalières
            this.initializeChart(response.statistiques);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error = err.status === 401
            ? 'Session expirée. Veuillez vous reconnecter.'
            : 'Erreur lors du chargement des statistiques';
          this.loading = false;
        }
      });
  }

  changePeriode(periode: 'semaine' | 'mois'): void {
    this.periodeSelectionnee = periode;
    if (this.chart) {
      this.chart.destroy();
    }
    this.loadStatistiques();
  }

  private initializeChart(data: any[]): void {
    if (!this.dualAxisChart?.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = this.dualAxisChart.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    console.log('Données pour initialisation du graphique:', data);
    const chartData = this.prepareChartData(data);
    const chartOptions = this.getChartOptions();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }

  private prepareChartData(data: any[]): ChartConfiguration['data'] {
    console.log('Préparation des données:', data);
    const aggregatedData = this.periodeSelectionnee === 'semaine'
      ? this.aggregateByWeek(data)
      : this.aggregateByMonth(data);

    const labels = this.getLabels();
    const dataLength = labels.length;

    // Initialiser les tableaux avec des valeurs nulles
    const datasets = {
      volumeEau: new Array(dataLength).fill(null),
      humiditeSol: new Array(dataLength).fill(null),
      luminosite: new Array(dataLength).fill(null)
    };

    // Remplir avec les données agrégées
    Object.entries(aggregatedData).forEach(([index, data]: [string, any]) => {
      const i = parseInt(index);
      if (data.count > 0) {
        datasets.volumeEau[i] = data.volumeEau / data.count;
        datasets.humiditeSol[i] = data.humiditeSol / data.count;
        datasets.luminosite[i] = data.luminosite / data.count;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Volume d\'eau (ml)',
          data: datasets.volumeEau,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          yAxisID: 'y-volume',
          fill: true
        },
        {
          label: 'Humidité du sol (%)',
          data: datasets.humiditeSol,
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          yAxisID: 'y-humidite',
          fill: true
        },
        {
          label: 'Luminosité (lux)',
          data: datasets.luminosite,
          borderColor: '#f6c23e',
          backgroundColor: 'rgba(246, 194, 62, 0.1)',
          yAxisID: 'y-luminosite',
          fill: true
        }
      ]
    };
  }

  private getLabels(): string[] {
    return this.periodeSelectionnee === 'semaine'
      ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
      : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  }

  private aggregateByWeek(data: any[]): any {
    return data.reduce((acc: any, item) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();

      if (!acc[dayIndex]) {
        acc[dayIndex] = {
          volumeEau: 0,
          humiditeSol: 0,
          luminosite: 0,
          count: 0
        };
      }

      acc[dayIndex].volumeEau += item.volumeEauTotal || 0;
      acc[dayIndex].humiditeSol += item.humiditeSolMoyenne || 0;
      acc[dayIndex].luminosite += item.luminositeMoyenne || 0;
      acc[dayIndex].count++;

      return acc;
    }, {});
  }
  private aggregateByMonth(data: any[]): any {
    return data.reduce((acc: any, item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();

      if (!acc[monthIndex]) {
        acc[monthIndex] = {
          volumeEau: 0,
          humiditeSol: 0,
          luminosite: 0,
          count: 0
        };
      }

      acc[monthIndex].volumeEau += item.volumeEauTotal || 0;
      acc[monthIndex].humiditeSol += item.humiditeSolMoyenne || 0;
      acc[monthIndex].luminosite += item.luminositeMoyenne || 0;
      acc[monthIndex].count++;

      return acc;
    }, {});
  }

  private getChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Évolution des mesures par ${this.periodeSelectionnee === 'semaine' ? 'jour' : 'mois'}`,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#2c3e50',
          bodyColor: '#2c3e50',
          borderColor: '#e0e0e0',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              let value = context.parsed.y;
              if (label.includes('Volume')) return `${label}: ${value?.toFixed(0)} ml`;
              if (label.includes('Humidité')) return `${label}: ${value?.toFixed(1)}%`;
              if (label.includes('Luminosité')) return `${label}: ${value?.toFixed(0)} lux`;
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        'y-volume': {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Volume d\'eau (ml)', color: '#4e73df' },
          ticks: { color: '#4e73df' },
          min: 0
        },
        'y-humidite': {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Humidité (%)', color: '#1cc88a' },
          ticks: { color: '#1cc88a' },
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false }
        },
        'y-luminosite': {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Luminosité (lux)', color: '#f6c23e' },
          ticks: { color: '#f6c23e' },
          min: 0,
          grid: { drawOnChartArea: false }
        }
      }
    };
  }

  backToDashboard(): void {
    window.history.back();
  }
}
