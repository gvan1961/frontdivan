import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FechamentoCaixaService, FechamentoCaixaDTO } from '../../services/fechamento-caixa.service';
import { CaixaStateService } from '../../services/caixa-state.service'; 

@Component({
  selector: 'app-fechamento-caixa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fechamento-caixa.component.html',
  styleUrls: ['./fechamento-caixa.component.css']
})
export class FechamentoCaixaComponent implements OnInit {
  
  caixaId!: number;
  caixa?: FechamentoCaixaDTO;
  carregando: boolean = true;
  fechando: boolean = false;
  
  observacoesFechamento: string = '';
  mostrarModalFechamento: boolean = false;
  
  // Abas
  abaAtiva: string = 'resumo'; // resumo, movimentacao, apartamentos, detalhes
 // resumoCompleto: any = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fechamentoCaixaService: FechamentoCaixaService,
    private caixaStateService: CaixaStateService
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caixaId = +params['id'];
      this.carregarCaixa();
    });
  }

  verRelatorioDetalhado(caixaId: number): void {
  this.router.navigate(['/fechamento-caixa', caixaId, 'relatorio']);
}
  
  carregarCaixa(): void {
  console.log('🔵 Carregando caixa ID:', this.caixaId);
  this.carregando = true;
  
  this.fechamentoCaixaService.buscarPorId(this.caixaId).subscribe({
    next: (caixa) => {
      console.log('✅ Caixa carregado:', caixa);
      this.caixa = caixa;
      
      // ✅ IMPORTANTE: Desativar o loading
      this.carregando = false;
      
      console.log('✅ Caixa pronto para exibição');
    },
    error: (error) => {
      console.error('❌ Erro ao carregar caixa:', error);
      alert('Erro ao carregar caixa: ' + (error.error?.erro || error.message));
      this.carregando = false;
      this.router.navigate(['/dashboard']);
    }
  });
}


//carregarResumoCompleto(): void {
//  this.fechamentoCaixaService.buscarResumoCompleto(this.caixaId).subscribe({
//    next: (resumo) => {
//      console.log('✅ Resumo completo:', resumo);
//      this.resumoCompleto = resumo;
//      this.carregando = false;
//    },
//    error: (error) => {
//      console.error('❌ Erro ao carregar resumo:', error);
//      this.carregando = false;
//    }
//  });
//}
  
  abrirModalFechamento(): void {
    if (confirm('Deseja realmente fechar o caixa?\n\nApós o fechamento não será possível fazer alterações.')) {
      this.mostrarModalFechamento = true;
    }
  }
  
  fecharCaixa(): void {
    this.fechando = true;
    
    this.fechamentoCaixaService.fecharCaixa(this.caixaId, this.observacoesFechamento).subscribe({
      next: (response) => {
        console.log('✅ Caixa fechado:', response);
        alert('✅ Caixa fechado com sucesso!');
        this.mostrarModalFechamento = false;
        this.fechando = false;

        // ✅ NOTIFICAR O SIDEBAR
        this.caixaStateService.notificarAtualizacao();
        
        this.carregarCaixa(); // Recarregar para mostrar dados atualizados
      },
      error: (error) => {
        console.error('❌ Erro ao fechar caixa:', error);
        alert('❌ Erro ao fechar caixa: ' + (error.error?.erro || error.message));
        this.fechando = false;

      }
    });
  }
  
  imprimirRelatorio(): void {
    this.fechamentoCaixaService.gerarRelatorio(this.caixaId);
  }
  
  // ✅ MÉTODOS DE FORMATAÇÃO
  
  formatarMoeda(valor: number | undefined | null): string {
    if (!valor && valor !== 0) return '0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }
  
  formatarDataHora(dataHora: string | undefined): string {
    if (!dataHora) return '-';
    
    return new Date(dataHora).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  getCorStatus(status: string): string {
    return status === 'ABERTO' ? '#4caf50' : '#2196f3';
  }
  
  // ✅ MÉTODOS DE CÁLCULO DE TOTAIS
  
  calcularTotalFormasPagamento(): number {
    if (!this.caixa) return 0;
    
    return (
      (this.caixa.totalDinheiro || 0) +
      (this.caixa.totalPix || 0) +
      (this.caixa.totalCartaoDebito || 0) +
      (this.caixa.totalCartaoCredito || 0) +
      (this.caixa.totalTransferencia || 0) +
      (this.caixa.totalFaturado || 0)
    );
  }

  calcularTotalRecebidoAVista(): number {
  if (!this.caixa) return 0;
  
  return (
    (this.caixa.totalDinheiro || 0) +
    (this.caixa.totalPix || 0) +
    (this.caixa.totalCartaoDebito || 0) +
    (this.caixa.totalCartaoCredito || 0) +
    (this.caixa.totalTransferencia || 0)
    // ❌ NÃO somar totalFaturado aqui
  );
}
  
  calcularTotalPorApartamento(): number {
    if (!this.caixa || !this.caixa.resumoApartamentos) return 0;
    
    return this.caixa.resumoApartamentos.reduce(
      (total, apto) => total + (apto.totalPagamentos || 0), 
      0
    );
  }
  
  calcularTotalDetalhes(): number {
  if (!this.caixa || !this.caixa.detalhes) return 0;
  
  return this.caixa.detalhes.reduce(
    (total, detalhe) => total + (detalhe.valor || 0), 
    0
  );
}
  
  // ✅ NAVEGAÇÃO
  
  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}