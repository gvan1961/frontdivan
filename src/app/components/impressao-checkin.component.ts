import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-impressao-checkin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="impressao-container" id="area-impressao-checkin">
      <!-- CABEÇALHO -->
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- TÍTULO -->
      <div class="titulo-documento">
        <h2>FATURA DE CHECK-IN</h2>
        <p class="numero-reserva">Reserva Nº {{ reserva.id }}</p>
        <p class="data-emissao">{{ dataAtual() }}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- DADOS DO HÓSPEDE -->
      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> {{ reserva.clienteNome }}</p>
        <p><strong>Telefone:</strong> {{ reserva.clienteCelular || 'Não informado' }}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <!-- INFORMAÇÕES DA RESERVA -->
      <div class="secao">
        <h3>INFORMAÇÕES DA RESERVA</h3>
        <p><strong>Apartamento:</strong> {{ reserva.apartamentoNumero }}</p>
        <p><strong>Check-in:</strong> {{ formatarData(reserva.dataCheckin) }}</p>
        <p><strong>Check-out:</strong> {{ formatarData(reserva.dataCheckout) }}</p>
        <p><strong>Diárias:</strong> {{ reserva.quantidadeDiaria }} dia(s)</p>
        <p><strong>Hóspedes:</strong> {{ reserva.quantidadeHospede }} pessoa(s)</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <!-- VALORES -->
      <div class="secao valores">
        <p><strong>Valor da Diária:</strong></p>
        <p class="valor-destaque">R$ {{ formatarValor(reserva.valorDiaria) }}</p>
        <p><strong>Total Estimado:</strong></p>
        <p class="valor-total">R$ {{ formatarValor(reserva.totalEstimado) }}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- MENSAGEM ANIVERSARIANTE -->
      <div class="aniversariante" *ngIf="isAniversariante">
        <p>🎉 FELIZ ANIVERSÁRIO! 🎉</p>
        <p>Desejamos um mês especial!</p>
      </div>

      <!-- OBSERVAÇÕES -->
      <div class="observacoes" *ngIf="observacoes">
        <h3>OBSERVAÇÕES:</h3>
        <p>{{ observacoes }}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <!-- ASSINATURA -->
      <div class="assinatura">
        <p class="texto-assinatura">Declaro estar ciente das condições</p>
        <p class="texto-assinatura">da reserva e dos valores cobrados.</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Assinatura do Hóspede</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Data: ____/____/________</p>
      </div>

      <!-- RODAPÉ -->
      <div class="rodape">
        <p>Obrigado pela preferência!</p>
        <p>Tenha uma excelente estadia!</p>
      </div>
    </div>
  `,
  styles: [`
    /* ESTILOS PARA IMPRESSORA TÉRMICA 80MM */
    .impressao-container {
      width: 80mm;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 5mm;
      background: white;
      color: black;
    }

    .cabecalho {
      text-align: center;
      margin-bottom: 10px;
    }

    .cabecalho h1 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 5px 0;
      letter-spacing: 2px;
    }

    .cnpj, .endereco {
      font-size: 11px;
      margin: 2px 0;
    }

    .separador {
      text-align: center;
      margin: 8px 0;
      font-size: 10px;
    }

    .titulo-documento {
      text-align: center;
      margin: 10px 0;
    }

    .titulo-documento h2 {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
    }

    .numero-reserva {
      font-size: 13px;
      font-weight: bold;
      margin: 5px 0 2px 0;
    }

    .data-emissao {
      font-size: 10px;
      margin: 2px 0;
    }

    .secao {
      margin: 10px 0;
    }

    .secao h3 {
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 8px 0;
      text-decoration: underline;
    }

    .secao p {
      margin: 4px 0;
      font-size: 11px;
      line-height: 1.4;
    }

    .valores {
      text-align: center;
    }

    .valor-destaque {
      font-size: 14px;
      font-weight: bold;
      margin: 5px 0 10px 0 !important;
    }

    .valor-total {
      font-size: 16px;
      font-weight: bold;
      margin: 5px 0 !important;
    }

    .aniversariante {
      text-align: center;
      background: black;
      color: white;
      padding: 8px;
      margin: 10px 0;
      font-weight: bold;
    }

    .aniversariante p {
      margin: 3px 0;
    }

    .observacoes {
      margin: 10px 0;
      padding: 8px;
      border: 1px solid #000;
    }

    .observacoes h3 {
      font-size: 11px;
      margin: 0 0 5px 0;
    }

    .observacoes p {
      font-size: 10px;
      margin: 0;
      white-space: pre-wrap;
    }

    .assinatura {
      margin-top: 20px;
      text-align: center;
    }

    .texto-assinatura {
      font-size: 10px;
      margin: 2px 0;
    }

    .linha-assinatura {
      border-top: 1px solid #000;
      margin: 15px 10px 5px 10px;
    }

    .label-assinatura {
      font-size: 10px;
      margin: 2px 0;
    }

    .rodape {
      text-align: center;
      margin-top: 15px;
      font-size: 11px;
    }

    .rodape p {
      margin: 3px 0;
    }

    /* ESTILOS DE IMPRESSÃO */
    @media print {
      .impressao-container {
        width: 80mm;
        min-height: 140mm;
        padding: 5mm;
      }

      @page {
        size: 80mm auto;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
      }
    }
  `]
})
export class ImpressaoCheckinComponent {
  @Input() reserva: any;
  @Input() observacoes: string = '';
  @Input() isAniversariante: boolean = false;

  dataAtual(): string {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}