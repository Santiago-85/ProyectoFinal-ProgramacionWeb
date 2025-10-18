import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  // La URL base de tu API
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Método para registrar un usuario
  // Recibe un objeto 'userData' con los datos del formulario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
  
  // Método para iniciar sesión
  // Modifica el método de login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Guarda los datos del usuario en localStorage después de un login exitoso
        this.saveUser(response.usuario);
      })
    );
  }


  // Guarda la información del usuario en localStorage
  saveUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Cierra la sesión del usuario
  logout() {
    localStorage.removeItem('currentUser');
  }

  // Obtiene la información del usuario logueado
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Verifica si hay un usuario logueado
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}