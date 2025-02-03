import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

import { HistoriqueService,
  StatistiquesResponse,
  StatsPlanteEntry,
  DonneesDate,} from '../../../services/historique.service';

Chart.register(...registerables);

@Component({
 selector: 'app-historique-element',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './historique-element.component.html',
 styleUrls: ['./historique-element.component.scss']
})
export class HistoriqueElementComponent implements OnInit, OnDestroy {
 selectedPeriod: 'semaine' | 'mois' = 'semaine';
 combinedChart: Chart | null = null;
 waterVolume: number = 0;
 historiqueStatistiques: StatistiquesResponse | null = null;
 circumference = 2 * Math.PI * 85;

 constructor(private historiqueService: HistoriqueService) {}

 get dashOffset(): number {
   return this.circumference * (1 - this.waterVolume / 100);
 }

 ngOnInit() {
   this.loadStatistiques('semaine');
 }

 ngOnDestroy() {
   this.combinedChart?.destroy();
 }

 loadStatistiques(periode: 'semaine' | 'mois') {
   this.historiqueService.getStatistiquesPeriode(periode).subscribe({
     next: (data) => {
       this.historiqueStatistiques = data;
       this.waterVolume = data.resume.totalEau > 0
         ? Math.min(Math.round((data.resume.totalEau / 100) * 100), 100)
         : 0;
       this.updateChart(data);
     },
     error: (error) => {
       console.error('Erreur lors du chargement des statistiques', error);
     }
   });
 }

 updateChart(data: StatistiquesResponse) {
  if (!this.combinedChart) {
    this.initializeChart();
  }

  const statsParPlante = data.statsParPlante || [];
  const labels = statsParPlante.length > 0
    ? statsParPlante[0].donneesDates.map((d: DonneesDate) => d.date)
    : [];

  const arrosagesData = statsParPlante.flatMap((plante: StatsPlanteEntry) =>
    plante.donneesDates.map((d: DonneesDate) => d.nombreArrosages)
  );

  const volumeEauData = statsParPlante.flatMap((plante: StatsPlanteEntry) =>
    plante.donneesDates.map((d: DonneesDate) => d.volumeEau)
  );

  if (this.combinedChart) {
    this.combinedChart.data.labels = labels;
    this.combinedChart.data.datasets[0].data = arrosagesData;
    this.combinedChart.data.datasets[1].data = volumeEauData;
    this.combinedChart.update();
  }
}
 initializeChart() {
   const ctx = document.getElementById('combinedChart') as HTMLCanvasElement;
   if (!ctx) return;

   this.combinedChart = new Chart(ctx, {
     type: 'line',
     data: {
       labels: [],
       datasets: [
         {
           label: 'Nombre Arrosages',
           data: [],
           borderColor: '#2563eb',
           yAxisID: 'y-arrosages',
           tension: 0.4,
           fill: false
         },
         {
           label: 'Volume Eau (L)',
           data: [],
           borderColor: '#eab308',
           yAxisID: 'y-volume',
           tension: 0.4,
           fill: false
         }
       ]
     },
     options: {
       responsive: true,
       scales: {
         'y-arrosages': {
           type: 'linear',
           position: 'left',
           beginAtZero: true
         },
         'y-volume': {
           type: 'linear',
           position: 'right',
           beginAtZero: true
         }
       }
     }
   });
 }

 changePeriod(periode: 'semaine' | 'mois') {
   this.selectedPeriod = periode;
   this.loadStatistiques(periode);
 }

 getWeekdayLabels(): string[] {
   const currentDate = new Date();
   const monday = new Date(currentDate);
   monday.setDate(currentDate.getDate() - currentDate.getDay() + 1);

   const labels = [];
   for (let i = 0; i < 5; i++) {
     const date = new Date(monday);
     date.setDate(monday.getDate() + i);
     labels.push(date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
   }
   return labels;
 }
}
