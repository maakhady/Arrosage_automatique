import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { HeaderComponent } from '../header/header.component';

// Interface pour représenter une action dans l'historique
interface HistoriqueAction {
  _id: string;
  utilisateur: {
    _id: string;
    prenom: string;
    nom: string;
  };
  action: string;
  details: string;
  metadata: any;
  date: Date;
}

@Component({
  selector: 'app-historique-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, FontAwesomeModule, HeaderComponent],
  templateUrl: './historique-actions.component.html',
  styleUrls: ['./historique-actions.component.css']
})
export class HistoriqueActionsComponent implements OnInit {
  // Icônes FontAwesome
  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;

  // Propriétés pour la pagination et le filtrage
  historique: HistoriqueAction[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalActions: number = 0;
  searchQuery: string = '';
  sortField: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerHistorique();
  }

  // Charger l'historique des actions
  chargerHistorique(): void {
    const params = {
      page: this.currentPage.toString(),
      limit: this.pageSize.toString(),
      search: this.searchQuery,
      sortBy: this.sortField,
      sortOrder: this.sortOrder
    };

    this.http.get<any>('/api/historique', { params }).subscribe({
      next: (response) => {
        this.historique = response.historique;
        this.totalPages = response.totalPages;
        this.totalActions = response.totalActions;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    });
  }

  // Changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.chargerHistorique();
    }
  }

  // Trier les actions
  trier(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.chargerHistorique();
  }

  // Filtrer les actions
  filtrer(): void {
    this.currentPage = 1;
    this.chargerHistorique();
  }
}