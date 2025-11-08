import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, ReservaRequest, ReservaResponse } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservas';

  getAll(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.apiUrl}/${id}`);
  }

  getAtivas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/ativas`);
  }

  getCheckinsDoDia(data: string): Observable<ReservaResponse[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/checkins-do-dia`, { params });
  }

  getCheckoutsDoDia(data: string): Observable<ReservaResponse[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/checkouts-do-dia`, { params });
  }

  getPorPeriodo(inicio: string, fim: string): Observable<ReservaResponse[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/periodo`, { params });
  }

  create(reserva: ReservaRequest): Observable<ReservaResponse> {
    console.log('📤 Criando reserva:', reserva);
    return this.http.post<ReservaResponse>(this.apiUrl, reserva);
  }

  alterarQuantidadeHospedes(id: number, quantidade: number, motivo?: string): Observable<ReservaResponse> {
    console.log('🔄 Alterando quantidade de hóspedes:', id, quantidade);
    let params = new HttpParams().set('quantidade', quantidade.toString());
    if (motivo) {
      params = params.set('motivo', motivo);
    }
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/alterar-hospedes`, null, { params });
  }

  alterarCheckout(id: number, novaDataCheckout: string, motivo?: string): Observable<ReservaResponse> {
    console.log('🔄 Alterando checkout:', id, novaDataCheckout);
    let params = new HttpParams().set('novaDataCheckout', novaDataCheckout);
    if (motivo) {
      params = params.set('motivo', motivo);
    }
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/alterar-checkout`, null, { params });
  }

  finalizar(id: number): Observable<ReservaResponse> {
    console.log('✅ Finalizando reserva:', id);
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/finalizar`, null);
  }

  cancelar(id: number, motivo: string): Observable<ReservaResponse> {
    console.log('❌ Cancelando reserva:', id, motivo);
    const params = new HttpParams().set('motivo', motivo);
    return this.http.patch<ReservaResponse>(`${this.apiUrl}/${id}/cancelar`, null, { params });
  }

adicionarConsumo(reservaId: number, produtoId: number, quantidade: number, observacao?: string): Observable<ReservaResponse> {
  const body = {
    produtoId,
    quantidade,
    observacao
  };
  return this.http.post<ReservaResponse>(`${this.apiUrl}/${reservaId}/consumo`, body);
}

// Listar consumo da reserva
listarConsumo(reservaId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${reservaId}/consumo`);
}

// Listar notas de venda da reserva
listarNotasVenda(reservaId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${reservaId}/notas-venda`);
}

transferirApartamento(dto: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/transferir-apartamento`, dto);
}

   buscarPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

//  listarTodas(): Observable<Reserva[]> {
//    return this.http.get<Reserva[]>(`${this.apiUrl}/dto`);
//  }
    

   listarTodas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.apiUrl);
  }

  
  criar(reserva: any): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  atualizar(id: number, reserva: any): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reserva);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

