import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagamentoService } from '../../services/pagamento.service';
import { AuthService } from '../../services/auth.service';

export interface PagamentoRequestDTO {
  reservaId: number;
  valor: number;
  formaPagamento: string;
  observacao?: string;
}

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagamento.component.html',
  styleUrls: ['./pagamento.component.css']
})
export class PagamentoComponent implements OnInit {
  
  @Input() reservaId: number = 0;
  
  valorPagamento: number = 0;
  formaSelecionada: string = 'DINHEIRO';
  observacao: string = '';
  
  pagamentos: any[] = [];
  loading: boolean = false;
  
  formasPagamento = [
    { valor: 'DINHEIRO', label: '💵 Dinheiro' },
    { valor: 'PIX', label: '📱 PIX' },
    { valor: 'CARTAO_DEBITO', label: '💳 Cartão de Débito' },
    { valor: 'CARTAO_CREDITO', label: '💳 Cartão de Crédito' },
    { valor: 'TRANSFERENCIA_BANCARIA', label: '🏦 Transferência' },
    { valor: 'FATURADO', label: '📄 Faturado' }
  ];
  
  constructor(
    private pagamentoService: PagamentoService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    if (this.reservaId > 0) {
      this.carregarPagamentos();
    }
  }
  
  processarPagamento(): void {
    if (this.valorPagamento <= 0) {
      alert('⚠️ Informe um valor válido!');
      return;
    }
    
    const usuarioId = this.authService.getUsuarioId();
    
    const pagamento: PagamentoRequestDTO = {
      reservaId: this.reservaId,
      valor: this.valorPagamento,
      formaPagamento: this.formaSelecionada,
      observacao: this.observacao.trim() || undefined
    };
    
    this.loading = true;
    
    this.pagamentoService.processarPagamento(pagamento, usuarioId).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.sucesso) {
          alert('✅ ' + response.mensagem);
          this.limparFormulario();
          this.carregarPagamentos();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao processar pagamento:', error);
        
        if (error.status === 403 && error.error.tipo === 'CAIXA_FECHADO') {
          const confirmar = confirm(
            '⚠️ CAIXA FECHADO!\n\n' + 
            error.error.erro + 
            '\n\nDeseja ir para abertura de caixa?'
          );
          
          if (confirmar) {
            window.location.href = '/components/abertura-caixa';
          }
        } else {
          alert('❌ ' + (error.error.erro || 'Erro ao processar pagamento'));
        }
      }
    });
  }
  
  carregarPagamentos(): void {
    this.pagamentoService.listarPorReserva(this.reservaId).subscribe({
      next: (pagamentos) => {
        this.pagamentos = pagamentos;
      },
      error: (error) => {
        console.error('Erro ao carregar pagamentos:', error);
      }
    });
  }
  
  limparFormulario(): void {
    this.valorPagamento = 0;
    this.observacao = '';
    this.formaSelecionada = 'DINHEIRO';
  }
  
  formatarMoeda(valor: number): string {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  
  formatarData(data: string): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatarFormaPagamento(forma: string): string {
    const item = this.formasPagamento.find(f => f.valor === forma);
    return item?.label || forma;
  }
  
  calcularTotalPagamentos(): number {
    return this.pagamentos.reduce((total, pag) => total + (pag.valor || 0), 0);
  }
}