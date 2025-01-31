import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Change this to your backend API URL

  constructor(private http: HttpClient) {}

  // Méthode pour enregistrer un utilisateur
  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Méthode pour obtenir la liste des utilisateurs
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Méthode pour supprimer un utilisateur
  deleteUser(user: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${user.id}`);
  }

  // Méthode pour supprimer plusieurs utilisateurs
  deleteUsers(users: any[]): Observable<any> {
    const userIds = users.map(user => user.id);
    return this.http.post(`${this.apiUrl}/delete-multiple`, { userIds });
  }

  // Méthode pour bloquer un utilisateur
  blockUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/block/${user.id}`, {});
  }

  // Méthode pour bloquer plusieurs utilisateurs
  blockUsers(users: any[]): Observable<any> {
    const userIds = users.map(user => user.id);
    return this.http.post(`${this.apiUrl}/block-multiple`, { userIds });
  }

  // Méthode pour mettre à jour un utilisateur
  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }
}
