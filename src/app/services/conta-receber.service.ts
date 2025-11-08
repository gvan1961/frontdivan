import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContaAReceber {
  id: number;
  reservaId: number;
  clienteNome: string;
  empresaNome?: string;
  valor: number;
  valorPago: number;
  saldo: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'EM_ABERTO' | 'PAGA' | 'VENCIDA';
  descricao: string;
  diasVencido: number;
   reserva?: {  // ✅ ADICIONAR
    id: number;
    dataCheckin: string;
    dataCheckout: string;
    clienteNome: string;
  };

  // ✅ NOVOS CAMPOS
  numeroApartamento?: string;
  quantidadeHospede?: number;
  quantidadeDiaria?: number;
  totalDiaria?: number;
  totalConsumo?: number;
  totalHospedagem?: number;
  totalRecebido?: number;
  desconto?: number;
  totalApagar?: number;

}

export interface ContaAReceberRequest {
  reservaId: number;
  empresaId?: number;
  valor: number;
  dataVencimento: string;
  descricao: string;
}

export interface PagamentoConta {
  valorPago: number;
  dataPagamento: string;
  formaPagamento: string;
  observacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContaReceberService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/contas-receber';

  listarTodas(): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(this.apiUrl);
  }

  listarEmAberto(): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(`${this.apiUrl}/em-aberto`);
  }

  listarVencidas(): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(`${this.apiUrl}/vencidas`);
  }

  listarPorStatus(status: string): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(`${this.apiUrl}/status/${status}`);
  }

  listarPorCliente(clienteId: number): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  listarPorEmpresa(empresaId: number): Observable<ContaAReceber[]> {
    return this.http.get<ContaAReceber[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  buscarPorId(id: number): Observable<ContaAReceber> {
    return this.http.get<ContaAReceber>(`${this.apiUrl}/${id}`);
  }

  criar(dados: ContaAReceberRequest): Observable<ContaAReceber> {
    return this.http.post<ContaAReceber>(this.apiUrl, dados);
  }

  registrarPagamento(id: number, dados: PagamentoConta): Observable<ContaAReceber> {
    return this.http.post<ContaAReceber>(`${this.apiUrl}/${id}/pagamento`, dados);
  }

  atualizarVencidas(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/atualizar-vencidas`, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}