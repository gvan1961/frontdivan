import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

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

 processarPagamento(dto: PagamentoRequestDTO, usuarioId: number): Observable<any> {
  const params = new HttpParams().set('usuarioId', usuarioId.toString());
  return this.http.post(`${this.apiUrl}`, dto, { params });
}

  buscarPorReserva(reservaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }

}