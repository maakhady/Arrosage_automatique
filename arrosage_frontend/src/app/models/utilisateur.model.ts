export type Role = 'super-admin' | 'utilisateur';

export interface Utilisateur {
  _id?: string;
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  password?: string;
  role: Role;
  code?: string;
  cardId?: string;
  actif?: boolean;
  date_creation?: Date;
  date_modification?: Date;
  selected?: boolean;
}