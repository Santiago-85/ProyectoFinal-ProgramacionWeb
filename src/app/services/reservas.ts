import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getAsientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asientos`);
  }

  crearReserva(reservaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, reservaData);
  }

  getMisReservas(id_usuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-reservas/${id_usuario}`);
  }

  modificarReserva(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/modificar-reserva`, data);
  }

  cancelarReserva(data: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancelar-reserva`, { body: data });
  }



  uploadXML(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivoReservas', file, file.name);
    
    return this.http.post(`${this.apiUrl}/reservas/upload-xml`, formData);
  }

  
}