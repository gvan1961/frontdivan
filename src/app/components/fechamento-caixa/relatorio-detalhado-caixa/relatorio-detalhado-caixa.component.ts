import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FechamentoCaixaService } from '../../../services/fechamento-caixa.service';

@Component({
  selector: 'app-relatorio-detalhado-caixa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio-detalhado-caixa.component.html',
  styleUrls: ['./relatorio-detalhado-caixa.component.css']
})
export class RelatorioDetalhadoCaixaComponent implements OnInit {

  caixaId: number = 0;
  relatorio: any = null;
  loading: boolean = false;
  erro: string = '';

  // Controle de exibição
  mostrarReservas: boolean = true;
  mostrarAvulsas: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fechamentoCaixaService: FechamentoCaixaService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caixaId = +params['id'];
      this.carregarRelatorio();
    });
  }

  carregarRelatorio(): void {
    this.loading = true;
    this.erro = '';

    this.fechamentoCaixaService.gerarRelatorioDetalhado(this.caixaId).subscribe({
      next: (data: any) => {
        this.relatorio = data;
        this.loading = false;
        console.log('📊 Relatório carregado:', this.relatorio);
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar relatório:', error);
        this.erro = error.error?.erro || 'Erro ao carregar relatório';
        this.loading = false;
      }
    });
  }

  formatarData(data: string): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleString('pt-BR');
  }

  formatarMoeda(valor: number): string {
    if (!valor) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  imprimir(): void {
  if (!this.relatorio) return;

  // ✅ GERAR LINHAS DE CADA APARTAMENTO (RESERVAS)
  let apartamentosHtml = '';
  if (this.relatorio.vendasReservas && this.relatorio.vendasReservas.length > 0) {
    this.relatorio.vendasReservas.forEach((venda: any) => {
      let pagamentos = '';
      if (venda.pagamentos.dinheiro > 0) pagamentos += `Din:${this.formatarValor(venda.pagamentos.dinheiro)} `;
      if (venda.pagamentos.pix > 0) pagamentos += `Pix:${this.formatarValor(venda.pagamentos.pix)} `;
      if (venda.pagamentos.cartaoDebito > 0) pagamentos += `Deb:${this.formatarValor(venda.pagamentos.cartaoDebito)} `;
      if (venda.pagamentos.cartaoCredito > 0) pagamentos += `Cre:${this.formatarValor(venda.pagamentos.cartaoCredito)} `;
      if (venda.pagamentos.transferencia > 0) pagamentos += `Transf:${this.formatarValor(venda.pagamentos.transferencia)} `;
      if (venda.pagamentos.faturado > 0) pagamentos += `Fat:${this.formatarValor(venda.pagamentos.faturado)} `;

      apartamentosHtml += `
        <div class="apto">
          <div class="apto-header">
            <span>Apto ${venda.numeroApartamento} - ${venda.clienteNome?.substring(0, 15) || 'N/A'}</span>
            <span>${this.formatarValor(venda.total)}</span>
          </div>
          <div class="apto-pag">${pagamentos || 'Sem pagamentos'}</div>
        </div>
      `;
    });
  } else {
    apartamentosHtml = '<div class="info">Nenhuma venda de reserva</div>';
  }

  // ✅ GERAR LINHAS DE VENDAS AVULSAS FATURADAS
  let avulsasFaturadasHtml = '';
  let totalAvulsasFaturadas = 0;
  
  if (this.relatorio.vendasAvulsasFaturadas && this.relatorio.vendasAvulsasFaturadas.length > 0) {
    this.relatorio.vendasAvulsasFaturadas.forEach((venda: any) => {
      avulsasFaturadasHtml += `
        <div class="apto">
          <div class="apto-header">
            <span>${venda.clienteNome?.substring(0, 20) || 'Cliente N/A'}</span>
            <span>${this.formatarValor(venda.valor)}</span>
          </div>
        </div>
      `;
      totalAvulsasFaturadas += venda.valor || 0;
    });
  } else {
    avulsasFaturadasHtml = '<div class="info">Nenhuma venda avulsa faturada</div>';
  }

  const htmlImpressao = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fechamento Caixa #${this.relatorio.caixaId}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 7px; 
          width: 80mm; 
          margin: 0; 
          padding: 3mm;
          line-height: 1.1;
        }
        .titulo { font-size: 9px; font-weight: bold; text-align: center; margin-bottom: 2px; }
        .info { font-size: 6px; margin: 1px 0; }
        .separador { text-align: center; margin: 2px 0; font-size: 6px; }
        .linha { display: flex; justify-content: space-between; margin: 1px 0; font-size: 7px; }
        .linha.total { font-weight: bold; font-size: 8px; margin: 3px 0; }
        .secao-titulo { font-size: 7px; font-weight: bold; margin: 3px 0 2px 0; border-bottom: 1px dashed #000; }
        .apto { margin: 2px 0; padding: 2px 0; border-bottom: 1px dotted #ccc; }
        .apto-header { display: flex; justify-content: space-between; font-size: 7px; font-weight: bold; }
        .apto-pag { font-size: 6px; color: #333; margin-top: 1px; }
        .subtotal-box { background: #f0f0f0; padding: 2px; margin: 3px 0; }
      </style>
    </head>
    <body>
      <div class="titulo">FECHAMENTO DE CAIXA</div>
      <div class="info">Caixa #${this.relatorio.caixaId} - ${this.relatorio.recepcionistaNome || 'N/A'}</div>
      <div class="info">Abertura: ${this.formatarDataSimples(this.relatorio.dataHoraAbertura)}</div>
      <div class="info">Fechamento: ${this.formatarDataSimples(this.relatorio.dataHoraFechamento)}</div>
      
      <div class="separador">================================</div>
      
      <!-- VENDAS POR APARTAMENTO -->
      <div class="secao-titulo">VENDAS POR APARTAMENTO</div>
      ${apartamentosHtml}
      
      <div class="subtotal-box">
        <div class="linha"><span>Subtotal Reservas:</span><span>${this.formatarValor(this.relatorio.subtotalReservas?.total)}</span></div>
      </div>
      
      <!-- VENDAS AVULSAS FATURADAS -->
      <div class="secao-titulo">VENDAS AVULSAS (FATURADAS)</div>
      ${avulsasFaturadasHtml}
      
      <div class="subtotal-box">
        <div class="linha"><span>Subtotal Avulsas Faturadas:</span><span>${this.formatarValor(totalAvulsasFaturadas)}</span></div>
      </div>
      
      <div class="separador">================================</div>
      
      <!-- RESUMO GERAL -->
      <div class="secao-titulo">RESUMO GERAL</div>
      <div class="linha"><span>Dinheiro:</span><span>${this.formatarValor(this.relatorio.totalGeral?.dinheiro)}</span></div>
      <div class="linha"><span>PIX:</span><span>${this.formatarValor(this.relatorio.totalGeral?.pix)}</span></div>
      <div class="linha"><span>C. Debito:</span><span>${this.formatarValor(this.relatorio.totalGeral?.cartaoDebito)}</span></div>
      <div class="linha"><span>C. Credito:</span><span>${this.formatarValor(this.relatorio.totalGeral?.cartaoCredito)}</span></div>
      <div class="linha"><span>Transferencia:</span><span>${this.formatarValor(this.relatorio.totalGeral?.transferencia)}</span></div>
      <div class="linha"><span>Faturado:</span><span>${this.formatarValor(this.relatorio.totalGeral?.faturado)}</span></div>
      
      <div class="separador">================================</div>
      
      <div class="linha total"><span>TOTAL GERAL:</span><span>${this.formatarValor(this.relatorio.totalGeral?.total)}</span></div>
      
      <div class="separador">- - - - - - - - - - - - - - - -</div>
      
      <div class="linha total"><span>DINHEIRO A COBRAR:</span><span>${this.formatarValor(this.relatorio.totalGeral?.dinheiro)}</span></div>
      
      <div class="separador">================================</div>
      
      <div style="text-align: center; font-size: 6px; margin-top: 3px;">
        Conferido: ${new Date().toLocaleString('pt-BR')}
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const janelaImpressao = window.open('', '_blank', 'width=400,height=600');
  if (janelaImpressao) {
    janelaImpressao.document.write(htmlImpressao);
    janelaImpressao.document.close();
  }
}

// Métodos auxiliares
formatarDataSimples(data: string): string {
  if (!data) return '-';
  const d = new Date(data);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

formatarValor(valor: number): string {
  if (!valor) return '0,00';
  return valor.toFixed(2).replace('.', ',');
}

  exportarPDF(): void {
    alert('Funcionalidade de exportação PDF será implementada em breve!');
  }

  toggleReservas(): void {
    this.mostrarReservas = !this.mostrarReservas;
  }

  toggleAvulsas(): void {
    this.mostrarAvulsas = !this.mostrarAvulsas;
  }

  voltar(): void {
    this.router.navigate(['/components/fechamento-caixa']);
  }
}