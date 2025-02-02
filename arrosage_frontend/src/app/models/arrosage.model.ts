export interface Arrosage {
    _id?: string;
    plante: string; // ou Plante si vous avez un modèle Plante
    utilisateur: string;
    type: 'manuel' | 'automatique';
    heureDebut: { heures: number, minutes: number, secondes: number };
    heureFin: { heures: number, minutes: number, secondes: number };
    volumeEau: number;
    actif: boolean;
    date_creation?: Date;
    date_modification?: Date;
  }