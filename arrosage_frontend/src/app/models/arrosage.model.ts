export interface Arrosage {
  _id?: string;
  plante: {
    _id: string;
    nom: string;
    categorie: string;
  };
  utilisateur: string;
  type: string;
  heureDebut: {
    heures: number;
    minutes: number;
    secondes: number;
  };
  heureFin: {
    heures: number;
    minutes: number;
    secondes: number;
  };
  volumeEau: number;
  parametresArrosage?: {
    humiditeSolRequise: number;
    luminositeRequise: number;
    volumeEau: number;
  };
  actif: boolean;
  date_creation?: Date;
  date_modification?: Date;
}
