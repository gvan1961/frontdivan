import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagamentoRequestDTO {
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
}

export interface PagamentoResponse {
  id: number;
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
  dataPagamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pagamentos';

  
  listarPorReserva(reservaId: number): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }

 processarPagamento(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/processar`, dto);
  }

  buscarPorReserva(reservaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }

}