import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FechamentoCaixaDTO {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  dataHoraAbertura: string;
  dataHoraFechamento?: string;
  status: string;
  turno?: string;
  
  totalDiarias: number;
  totalProdutos: number;
  totalDescontos: number;
  totalEstornos: number;
  totalBruto: number;
  totalLiquido: number;
  
  totalDinheiro: number;
  totalPix: number;
  totalCartaoDebito: number;
  totalCartaoCredito: number;
  totalTransferencia: number;
  totalFaturado: number;
  
  quantidadeCheckins: number;
  quantidadeCheckouts: number;
  quantidadeVendas: number;
  quantidadeReservas: number;
  
  observacoes?: string;
  detalhes?: FechamentoCaixaDetalheDTO[];
  resumoApartamentos?: ResumoApartamentoDTO[];
}

export interface FechamentoCaixaDetalheDTO {
  id: number;
  tipo: string;
  descricao: string;
  apartamentoNumero?: string;
  reservaId?: number;
  valor: number;
  formaPagamento?: string;
  dataHora: string;
}

export interface ResumoApartamentoDTO {
  numeroApartamento: string;
  reservaId?: number;
  clienteNome?: string;
  totalDiarias?: number;
  totalProdutos?: number;
  totalPagamentos: number;
  saldo?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FechamentoCaixaService {
  
  private apiUrl = 'http://localhost:8080/api/fechamento-caixa';
  
  constructor(private http: HttpClient) {}
  
  /**
   * 🔓 Abrir caixa
   */
  abrirCaixa(usuarioId: number, turno: string, observacoes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/abrir`, {
      usuarioId,
      turno,
      observacoes
    });
  }
  
  /**
   * 🔍 Buscar caixa aberto do usuário (CORRIGIDO!)
   */
  buscarCaixaAberto(usuarioId: number): Observable<any> {
    const params = new HttpParams().set('usuarioId', usuarioId.toString());
    return this.http.get(`${this.apiUrl}/aberto`, { params });
  }
  
  /**
   * 🔒 Fechar caixa
   */
  fecharCaixa(caixaId: number, observacoes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${caixaId}/fechar`, {
      observacoes
    });
  }
  
  /**
   * 📋 Buscar por ID
   */
  buscarPorId(id: number): Observable<FechamentoCaixaDTO> {
    return this.http.get<FechamentoCaixaDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * 📊 Gerar relatório detalhado
   */
  gerarRelatorioDetalhado(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/relatorio-detalhado`);
}

   buscarResumoCompleto(caixaId: number): Observable<any> {
     return this.http.get(`${this.apiUrl}/${caixaId}/resumo-completo`);
}
  
  /**
   * 📋 Listar por período
   */
  listarPorPeriodo(inicio: string, fim: string): Observable<FechamentoCaixaDTO[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);
    
    return this.http.get<FechamentoCaixaDTO[]>(`${this.apiUrl}/periodo`, { params });
  }

  /**
   * 🖨️ Gerar relatório (abre em nova aba)
   */
  gerarRelatorio(id: number): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      window.open(`${this.apiUrl}/${id}/relatorio?token=${token}`, '_blank');
    } else {
      alert('Token não encontrado! Faça login novamente.');
    }
  }
}