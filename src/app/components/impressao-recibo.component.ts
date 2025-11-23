import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-impressao-recibo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="impressao-container" id="area-impressao-recibo">
      <!-- CABEÇALHO -->
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- TÍTULO -->
      <div class="titulo-documento">
        <h2>RECIBO DE PAGAMENTO</h2>
        <p class="numero-reserva">Reserva Nº {{ reserva.id }}</p>
        <p class="data-emissao">{{ dataAtual() }}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- DADOS DO HÓSPEDE -->
      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> {{ reserva.clienteNome }}</p>
        <p><strong>CPF:</strong> {{ formatarCPF(reserva.clienteCpf) }}</p>
        <p><strong>Telefone:</strong> {{ reserva.clienteCelular || 'Não informado' }}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <!-- PERÍODO DA HOSPEDAGEM -->
      <div class="secao">
        <h3>PERÍODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> {{ reserva.apartamentoNumero }}</p>
        <p><strong>Check-in:</strong> {{ formatarData(reserva.dataCheckin) }}</p>
        <p><strong>Check-out:</strong> {{ formatarData(reserva.dataCheckout) }}</p>
        <p><strong>Total de Diárias:</strong> {{ reserva.quantidadeDiaria }} dia(s)</p>
        <p><strong>Hóspedes:</strong> {{ reserva.quantidadeHospede }} pessoa(s)</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- DISCRIMINAÇÃO DE VALORES -->
      <div class="secao">
        <h3>DISCRIMINAÇÃO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diárias ({{ reserva.quantidadeDiaria }}x):</span>
          <span>R$ {{ formatarValor(reserva.totalDiaria) }}</span>
        </div>
        <div class="linha-valor" *ngIf="getConsumo() > 0">
          <span>Consumo:</span>
          <span>R$ {{ formatarValor(getConsumo()) }}</span>
        </div>
        <div class="linha-valor" *ngIf="getDesconto() > 0">
          <span>Desconto:</span>
          <span>- R$ {{ formatarValor(getDesconto()) }}</span>
        </div>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- TOTAL PAGO -->
      <div class="linha-valor total">
        <span>TOTAL PAGO:</span>
        <span>R$ {{ formatarValor(calcularTotalComDesconto()) }}</span>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- FORMA DE PAGAMENTO -->
      <div class="secao" *ngIf="formaPagamento">
        <h3>FORMA DE PAGAMENTO</h3>
        <p><strong>{{ formaPagamento }}</strong></p>
      </div>

      <!-- DECLARAÇÃO -->
      <div class="declaracao">
        <p>Recebi(emos) de {{ reserva.clienteNome }}</p>
        <p>a importância de <strong>R$ {{ formatarValor(calcularTotalComDesconto()) }}</strong></p>
        <p>referente à hospedagem no período citado.</p>
      </div>

      <!-- ASSINATURA -->
      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: {{ dataAtualSimples() }}</p>
      </div>

      <!-- RODAPÉ -->
      <div class="rodape">
        <p>Obrigado pela preferência!</p>
        <p>Volte sempre!</p>        
      </div>     
    </div>
  `,
  styles: [`
    /* Manter os mesmos estilos */
    .impressao-container {
      width: 80mm;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 5mm;
      background: white;
      color: black;
    }
    .cabecalho { text-align: center; margin-bottom: 10px; }
    .cabecalho h1 { font-size: 18px; font-weight: bold; margin: 0 0 5px 0; letter-spacing: 2px; }
    .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
    .separador { text-align: center; margin: 8px 0; font-size: 10px; }
    .titulo-documento { text-align: center; margin: 10px 0; }
    .titulo-documento h2 { font-size: 14px; font-weight: bold; margin: 0; }
    .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0 2px 0; }
    .data-emissao { font-size: 10px; margin: 2px 0; }
    .secao { margin: 10px 0; }
    .secao h3 { font-size: 12px; font-weight: bold; margin: 0 0 8px 0; text-decoration: underline; }
    .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
    .linha-valor { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
    .linha-valor.total { font-size: 14px; font-weight: bold; margin: 8px 0; }
    .declaracao { text-align: center; margin: 15px 0; font-size: 11px; }
    .declaracao p { margin: 3px 0; }
    .assinatura { margin-top: 20px; text-align: center; }
    .linha-assinatura { border-top: 1px solid #000; margin: 15px 20px 5px 20px; }
    .label-assinatura { font-size: 10px; margin: 2px 0; }
    .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
    .rodape p { margin: 3px 0; }
    @media print {
      .impressao-container { width: 80mm; min-height: 140mm; padding: 5mm; }
      @page { size: 80mm auto; margin: 0; }
      body { margin: 0; padding: 0; }
    }
  `]
})
export class ImpressaoReciboComponent implements OnInit {
  @Input() reserva: any;
  @Input() observacoes: string = '';
  @Input() formaPagamento: string = '';

  ngOnInit() {
    console.log('📊 Dados da reserva no recibo:', this.reserva);
    console.log('   totalHospedagem:', this.reserva?.totalHospedagem);
    console.log('   totalDiaria:', this.reserva?.totalDiaria);
    console.log('   desconto:', this.reserva?.desconto);
    console.log('   totalRecebido:', this.reserva?.totalRecebido);
  }

  // ✅ CALCULAR TOTAL COM DESCONTO
  calcularTotalComDesconto(): number {
    const totalHospedagem = this.reserva?.totalHospedagem || 0;
    const desconto = this.reserva?.desconto || 0;
    return totalHospedagem - desconto;
  }

  // ✅ OBTER DESCONTO
  getDesconto(): number {
    return this.reserva?.desconto || 0;
  }

  // ✅ OBTER CONSUMO
  getConsumo(): number {
    return this.reserva?.totalConsumo || this.reserva?.totalProduto || 0;
  }

  dataAtual(): string {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  dataAtualSimples(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatarValor(valor: number): string {
    if (!valor) return '0,00';
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}