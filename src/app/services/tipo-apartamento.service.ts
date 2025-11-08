import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoApartamento, TipoApartamentoRequest } from '../models/tipo-apartamento.model';

@Injectable({
  providedIn: 'root'
})
export class TipoApartamentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/tipos-apartamento';

  getAll(): Observable<TipoApartamento[]> {
    return this.http.get<TipoApartamento[]>(this.apiUrl);
  }

  getById(id: number): Observable<TipoApartamento> {
    return this.http.get<TipoApartamento>(`${this.apiUrl}/${id}`);
  }

  create(tipo: TipoApartamentoRequest): Observable<TipoApartamento> {
    console.log('📤 Criando tipo apartamento:', JSON.stringify(tipo, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<TipoApartamento>(this.apiUrl, tipo, { headers });
  }

  update(id: number, tipo: TipoApartamentoRequest): Observable<TipoApartamento> {
    console.log('📤 Atualizando tipo apartamento:', id, JSON.stringify(tipo, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put<TipoApartamento>(`${this.apiUrl}/${id}`, tipo, { headers });
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando tipo apartamento:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}