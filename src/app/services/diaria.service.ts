// src/app/services/diaria.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diaria, DiariaRequest, DiariaResponse } from '../models/diaria.model';

@Injectable({
  providedIn: 'root'
})
export class DiariaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/diarias';

  //constructor(private http: HttpClient) {}

   buscarPorTipoApartamento(tipoApartamentoId: number): Observable<Diaria[]> {
    return this.http.get<Diaria[]>(`${this.apiUrl}/tipo-apartamento/${tipoApartamentoId}`);
  }

  getAll(): Observable<DiariaResponse[]> {
    return this.http.get<DiariaResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<DiariaResponse> {
    return this.http.get<DiariaResponse>(`${this.apiUrl}/${id}`);
  }

  create(diaria: DiariaRequest): Observable<DiariaResponse> {
    console.log('📤 Criando diária:', diaria);
    return this.http.post<DiariaResponse>(this.apiUrl, diaria);
  }

  update(id: number, diaria: DiariaRequest): Observable<DiariaResponse> {
    console.log('📤 Atualizando diária:', id, diaria);
    return this.http.put<DiariaResponse>(`${this.apiUrl}/${id}`, diaria);
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando diária:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }



}