import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Arrosage {
  nom: string;
  prenom: string;
  date: Date;
  heure: string;
  duree: number;
  type: 'manuel' | 'automatique';
}

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.css']
})
export class HistoriquesComponent implements OnInit {
  periode: 'jour' | 'semaine' | 'mois' = 'jour';
  jourSelectionne: Date = new Date();
  jourSemaine: string = 'all';
  moisSelectionne: string = 'all';
  dateActuelle: Date = new Date();

  pageCourante: number = 1;
  elementParPage: number = 10;
  arrosagesPageCourante: Arrosage[] = [];

  get nombreTotalPages(): number {
    return Math.ceil(this.arrosagesFiltres.length / this.elementParPage);
  }

  // Données d'arrosage par défaut
  arrosages: Arrosage[] = [
    // Aujourd'hui
    {
      nom: 'Dubois',
      prenom: 'Marie',
      date: new Date(new Date().setHours(8, 0, 0, 0)),
      heure: '08:00',
      duree: 15,
      type: 'automatique'
    },
    {
      nom: 'Dubois',
      prenom: 'Marie',
      date: new Date(new Date().setHours(18, 30, 0, 0)),
      heure: '18:30',
      duree: 10,
      type: 'manuel'
    },
    // Hier
    {
      nom: 'Martin',
      prenom: 'Pierre',
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      heure: '07:30',
      duree: 20,
      type: 'automatique'
    },
    // Il y a 3 jours
    {
      nom: 'Bernard',
      prenom: 'Sophie',
      date: new Date(new Date().setDate(new Date().getDate() - 3)),
      heure: '19:15',
      duree: 12,
      type: 'manuel'
    },
    // Il y a une semaine
    {
      nom: 'Petit',
      prenom: 'Thomas',
      date: new Date(new Date().setDate(new Date().getDate() - 7)),
      heure: '09:00',
      duree: 25,
      type: 'automatique'
    },
    // Il y a 2 semaines
    {
      nom: 'Robert',
      prenom: 'Julie',
      date: new Date(new Date().setDate(new Date().getDate() - 14)),
      heure: '17:45',
      duree: 8,
      type: 'manuel'
    },
    // Il y a 3 semaines
    {
      nom: 'Durand',
      prenom: 'Michel',
      date: new Date(new Date().setDate(new Date().getDate() - 21)),
      heure: '16:30',
      duree: 18,
      type: 'automatique'
    },
    // Il y a 1 mois
    {
      nom: 'Moreau',
      prenom: 'Claire',
      date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      heure: '10:45',
      duree: 30,
      type: 'automatique'
    }
  ];

  arrosagesFiltres: Arrosage[] = [];

  ngOnInit(): void {
    this.filtrerArrosages();

    setInterval(() => {
      this.dateActuelle = new Date();
    }, 86400000); // 24 heures en millisecondes
  }

  setJourSelectionne(date: string): void {
    this.jourSelectionne = new Date(date);
    this.filtrerArrosages();
  }

  // Filtrer les arrosages en fonction de la période sélectionnée
  filtrerArrosages(): void {
    const maintenant = new Date();
    let dateDebut: Date;
    let arrosagesFiltres = [...this.arrosages];

    switch (this.periode) {
      case 'jour':
        // Filtrer pour le jour sélectionné
        dateDebut = new Date(this.jourSelectionne);
        dateDebut.setHours(0, 0, 0, 0);
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + 1);
        arrosagesFiltres = arrosagesFiltres.filter(arrosage => 
          arrosage.date >= dateDebut && arrosage.date < dateFin
        );
        break;

      case 'semaine':
        dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - 7);
        arrosagesFiltres = arrosagesFiltres.filter(arrosage => arrosage.date >= dateDebut);
        
        // Filtrer par jour de la semaine si sélectionné
        if (this.jourSemaine !== 'all') {
          arrosagesFiltres = arrosagesFiltres.filter(arrosage => 
            arrosage.date.getDay().toString() === this.jourSemaine
          );
        }
        break;

      case 'mois':
        dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, maintenant.getDate());
        arrosagesFiltres = arrosagesFiltres.filter(arrosage => arrosage.date >= dateDebut);
        
        // Filtrer par mois si sélectionné
        if (this.moisSelectionne !== 'all') {
          arrosagesFiltres = arrosagesFiltres.filter(arrosage => 
            arrosage.date.getMonth().toString() === this.moisSelectionne
          );
        }
        break;
    }

    this.arrosagesFiltres = arrosagesFiltres;

    this.arrosagesFiltres = arrosagesFiltres;
    this.pageCourante = 1; // Réinitialiser à la première page après un filtrage
    this.mettreAJourPageCourante();
  }

  // Méthode pour changer de page
  changerPage(numeroPage: number): void {
    if (numeroPage >= 1 && numeroPage <= this.nombreTotalPages) {
      this.pageCourante = numeroPage;
      this.mettreAJourPageCourante();
    }
  }

   // Méthode pour mettre à jour les données de la page courante
   private mettreAJourPageCourante(): void {
    const indexDebut = (this.pageCourante - 1) * this.elementParPage;
    const indexFin = indexDebut + this.elementParPage;
    this.arrosagesPageCourante = this.arrosagesFiltres.slice(indexDebut, indexFin);
  }

  
  setPeriode(nouvellePeriode: 'jour' | 'semaine' | 'mois'): void {
    this.periode = nouvellePeriode;
    this.filtrerArrosages();
  }
}