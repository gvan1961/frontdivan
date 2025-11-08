import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ReservaDetalhes {
  id: number;
  cliente?: {
    id: number;
    nome: string;
    cpf: string;
    telefone?: string;
    celular?: string;
    dataNascimento?: string;
  };
  apartamento?: {
    id: number;
    numeroApartamento: string;
    capacidade: number;
    tipoApartamentoNome?: string;
  };
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria: number;
  valorDiaria: number;
  totalDiaria: number;
  totalHospedagem: number;
  totalRecebido: number;
  totalApagar: number;
  totalProduto?: number;
  desconto?: number;
  totalConsumo?: number;
  status: string;
  extratos?: any[];
  historicos?: any[];
  observacoes?: string;
}

interface Produto {
  id: number;
  nomeProduto: string;
  valorVenda: number;
  quantidade: number;
}

interface Apartamento {
  id: number;
  numeroApartamento: string;
  capacidade: number;
  tipoApartamento?: {
    tipo: string;
  };
  tipoApartamentoNome?: string;
}

@Component({
  selector: 'app-reserva-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-detalhes">
      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando reserva...</p>
      </div>

      <!-- ERRO -->
      <div *ngIf="erro && !loading" class="erro">
        <h2>❌ Erro</h2>
        <p>{{ erro }}</p>
        <button (click)="voltar()">← Voltar</button>
      </div>

      <!-- DETALHES -->
      <div *ngIf="reserva && !loading" class="detalhes">
        <!-- HEADER -->
        <div class="header">
          <div>
            <h1>📋 Reserva #{{ reserva.id }}</h1>
            <span [class]="'badge-status ' + obterStatusClass()">
              {{ reserva.status }}
            </span>
          </div>
          <button class="btn-voltar" (click)="voltar()">
            ← Voltar
          </button>
        </div>

        <!-- GRID DE CARDS -->
        <div class="grid">
          <!-- CLIENTE -->
          <div class="card">
            <h2>👤 Cliente</h2>
            <div class="info-item">
              <span class="label">Nome:</span>
              <span class="value">{{ reserva.cliente?.nome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPF:</span>
              <span class="value">{{ reserva.cliente?.cpf || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone:</span>
              <span class="value">{{ reserva.cliente?.celular || reserva.cliente?.telefone || 'N/A' }}</span>
            </div>
          </div>

          <!-- APARTAMENTO -->
          <div class="card">
            <h2>🏨 Apartamento</h2>
            <div class="info-item">
              <span class="label">Número:</span>
              <span class="value numero-apt">
                {{ reserva.apartamento?.numeroApartamento || 'N/A' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Tipo:</span>
              <span class="value">{{ reserva.apartamento?.tipoApartamentoNome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Capacidade:</span>
              <span class="value">{{ reserva.apartamento?.capacidade || 0 }} pessoas</span>
            </div>
          </div>

          <!-- HOSPEDAGEM -->
          <div class="card">
            <h2>📅 Hospedagem</h2>
            <div class="info-item">
              <span class="label">Check-in:</span>
              <span class="value">{{ formatarData(reserva.dataCheckin) }}</span>
            </div>
            <div class="info-item-com-botao">
              <div class="info-item">
                <span class="label">Check-out:</span>
                <span class="value">{{ formatarData(reserva.dataCheckout) }}</span>
              </div>
              <button 
                *ngIf="reserva.status === 'ATIVA'"
                class="btn-mini"
                (click)="abrirModalAlterarCheckout()"
                title="Alterar data de checkout">
                ✏️
              </button>
            </div>
            <div class="info-item-com-botao">
              <div class="info-item">
                <span class="label">Hóspedes:</span>
                <span class="value">{{ reserva.quantidadeHospede }}</span>
              </div>
              <button 
                *ngIf="reserva.status === 'ATIVA'"
                class="btn-mini"
                (click)="abrirModalAlterarHospedes()"
                title="Alterar quantidade de hóspedes">
                ✏️
              </button>
            </div>
            <div class="info-item">
              <span class="label">Diárias:</span>
              <span class="value">{{ reserva.quantidadeDiaria }}</span>
            </div>
          </div>

          <!-- FINANCEIRO -->
          <div class="card">
            <h2>💰 Financeiro</h2>
            <div class="info-item">
              <span class="label">Valor Diária:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.valorDiaria) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Diárias:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalDiaria) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Consumo:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalProduto || 0) }}</span>
            </div>
            <div class="info-item destaque">
              <span class="label">Total Hospedagem:</span>
              <span class="value">R$ {{ formatarMoeda(reserva.totalHospedagem) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Recebido:</span>
              <span class="value valor-positivo">R$ {{ formatarMoeda(reserva.totalRecebido) }}</span>
            </div>
            <div class="info-item destaque">
              <span class="label">Saldo:</span>
              <span class="value" [class.valor-negativo]="(reserva.totalApagar || 0) > 0">
                R$ {{ formatarMoeda(reserva.totalApagar) }}
              </span>
            </div>
          </div>
        </div>

        <!-- EXTRATO -->
        <div class="card extrato-card" *ngIf="reserva.extratos && reserva.extratos.length > 0">
          <h2>📊 Extrato</h2>
          <table class="tabela-extrato">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let extrato of reserva.extratos">
                <td>{{ formatarData(extrato.dataHoraLancamento) }}</td>
                <td>
                  <span [class]="'badge-extrato badge-' + extrato.statusLancamento.toLowerCase()">
                    {{ extrato.statusLancamento }}
                  </span>
                  {{ extrato.descricao }}
                </td>
                <td>{{ extrato.quantidade }}</td>
                <td>R$ {{ formatarMoeda(extrato.valorUnitario) }}</td>
                <td [class.valor-negativo]="extrato.totalLancamento < 0"
                    [class.valor-positivo]="extrato.totalLancamento > 0">
                  R$ {{ formatarMoeda(extrato.totalLancamento) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- HISTÓRICO -->
        <div class="card historico-card" *ngIf="reserva.historicos && reserva.historicos.length > 0">
          <h2>📜 Histórico</h2>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let hist of reserva.historicos">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-date">{{ formatarDataHora(hist.dataHora) }}</span>
                </div>
                <div class="timeline-body">
                  <p>{{ hist.motivo }}</p>
                  <small *ngIf="hist.quantidadeAnterior !== hist.quantidadeNova">
                    Hóspedes: {{ hist.quantidadeAnterior }} → {{ hist.quantidadeNova }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AÇÕES -->
        <div class="card acoes-card">
          <h2>⚙️ Ações</h2>
          <div class="botoes-acoes">
            <!-- BOTÃO DOCUMENTAR CHECK-IN -->
            <button class="btn-acao btn-checkin" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalCheckin()">
              📄 Documentar Check-in
            </button>

            <button class="btn-acao btn-pagamento" 
                    *ngIf="reserva.status === 'ATIVA' && (reserva.totalApagar || 0) > 0"
                    (click)="abrirModalPagamento()">
              💳 Registrar Pagamento
            </button>
            
            <button class="btn-acao btn-consumo" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalConsumo()">
              🛒 Adicionar Consumo
            </button>
            
            <button class="btn-acao btn-transferir" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalTransferencia()">
              🔄 Transferir Apartamento
            </button>
            
            <button class="btn-acao btn-finalizar" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="finalizarReserva()">
              ✅ Finalizar Faturada
            </button>
            
           <!-- BOTÃO IMPRIMIR RECIBO/FATURA -->
             <button class="btn-acao btn-recibo" 
             *ngIf="reserva.status === 'FINALIZADA'"
             (click)="imprimirRecibo()">
             📄 {{ (reserva.totalApagar || 0) > 0 ? 'Imprimir Fatura' : 'Imprimir Recibo' }}
             </button>
            
            <button class="btn-acao btn-cancelar" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="cancelarReserva()">
              ❌ Cancelar Reserva
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL DOCUMENTAR CHECK-IN -->
      <div class="modal-overlay" *ngIf="modalCheckin" (click)="fecharModalCheckin()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>📄 Documentar Check-in</h2>
          
          <div class="info-box">
            <p><strong>Reserva:</strong> #{{ reserva?.id }}</p>
            <p><strong>Cliente:</strong> {{ reserva?.cliente?.nome }}</p>
            <p><strong>Apartamento:</strong> {{ reserva?.apartamento?.numeroApartamento }}</p>
          </div>

          <div class="campo">
            <label>Observações</label>
            <textarea 
              [(ngModel)]="observacoesCheckin" 
              rows="4"
              placeholder="Digite observações sobre a reserva (opcional)..."></textarea>
            <small>Informações adicionais que aparecerão na fatura</small>
          </div>

          <div class="campo">
            <label>
              <input type="checkbox" [(ngModel)]="mensagemAniversariante">
              Incluir mensagem de aniversariante
            </label>
            <small>Mostrará "Feliz Aniversário" se o hóspede faz aniversário este mês</small>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalCheckin()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="gerarDocumentoCheckin()">
              📄 Gerar e Imprimir
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ALTERAR CHECKOUT -->
      <div class="modal-overlay" *ngIf="modalAlterarCheckout" (click)="fecharModalAlterarCheckout()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>📅 Alterar Data de Check-out</h2>
          
          <div class="info-box">
            <p><strong>Check-in:</strong> {{ formatarData(reserva?.dataCheckin) }}</p>
            <p><strong>Check-out atual:</strong> {{ formatarData(reserva?.dataCheckout) }}</p>
          </div>

          <div class="campo">
            <label>Nova Data de Check-out *</label>
            <input type="date" [(ngModel)]="novaDataCheckout" [min]="obterDataMinimaCheckout()">
          </div>

          <div class="campo">
            <label>Motivo</label>
            <textarea [(ngModel)]="motivoAlteracaoCheckout" rows="3"
                      placeholder="Informe o motivo da alteração..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalAlterarCheckout()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarAlteracaoCheckout()">
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ALTERAR HÓSPEDES -->
      <div class="modal-overlay" *ngIf="modalAlterarHospedes" (click)="fecharModalAlterarHospedes()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>👥 Alterar Quantidade de Hóspedes</h2>
          
          <div class="info-box">
            <p><strong>Quantidade atual:</strong> {{ reserva?.quantidadeHospede }} hóspede(s)</p>
            <p><strong>Capacidade do apartamento:</strong> {{ reserva?.apartamento?.capacidade }} pessoa(s)</p>
          </div>

          <div class="campo">
            <label>Nova Quantidade *</label>
            <input type="number" [(ngModel)]="novaQuantidadeHospedes" 
                   min="1" [max]="reserva?.apartamento?.capacidade || 10">
          </div>

          <div class="campo">
            <label>Motivo</label>
            <textarea [(ngModel)]="motivoAlteracaoHospedes" rows="3"
                      placeholder="Informe o motivo da alteração..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalAlterarHospedes()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarAlteracaoHospedes()">
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL PAGAMENTO -->
      <div class="modal-overlay" *ngIf="modalPagamento" (click)="fecharModalPagamento()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>💳 Registrar Pagamento</h2>
          
          <div class="campo">
            <label>Valor a Pagar *</label>
            <input type="number" [(ngModel)]="pagValor" step="0.01" min="0">
            <small>Saldo devedor: R$ {{ formatarMoeda(reserva?.totalApagar) }}</small>
          </div>

          <div class="campo">
            <label>Forma de Pagamento *</label>
            <select [(ngModel)]="pagFormaPagamento">
              <option value="">Selecione...</option>
              <option *ngFor="let forma of formasPagamento" [value]="forma.codigo">
                {{ forma.nome }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="pagObs" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalPagamento()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="salvarPagamento()">
              Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CONSUMO -->
      <div class="modal-overlay" *ngIf="modalConsumo" (click)="fecharModalConsumo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>🛒 Adicionar Consumo</h2>
          
          <div class="campo">
            <label>Produto *</label>
            <select [(ngModel)]="produtoSelecionadoId">
              <option value="0">Selecione um produto...</option>
              <option *ngFor="let produto of produtos" [value]="produto.id">
                {{ produto.nomeProduto }} - R$ {{ formatarMoeda(produto.valorVenda) }} 
                (Estoque: {{ produto.quantidade }})
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Quantidade *</label>
            <input type="number" [(ngModel)]="quantidadeConsumo" min="1">
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="observacaoConsumo" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalConsumo()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="salvarConsumo()">
              Adicionar ao Consumo
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL TRANSFERÊNCIA -->
      <div class="modal-overlay" *ngIf="modalTransferencia" (click)="fecharModalTransferencia()">
        <div class="modal-content modal-grande" (click)="$event.stopPropagation()">
          <h2>🔄 Transferir Apartamento</h2>
          
          <div class="campo">
            <label>Novo Apartamento *</label>
            <select [(ngModel)]="novoApartamentoId">
              <option value="0">Selecione um apartamento...</option>
              <option *ngFor="let apt of apartamentosDisponiveis" [value]="apt.id">
                {{ apt.numeroApartamento }} - 
                {{ obterNomeTipoApartamento(apt) }} 
                (Cap: {{ apt.capacidade }})
              </option>
            </select>
          </div>

          <div class="campo">
            <label>
              <input type="checkbox" [(ngModel)]="transferenciaImediata">
              Transferência Imediata
            </label>
            <small>Se desmarcado, informe a data da transferência</small>
          </div>

          <div class="campo" *ngIf="!transferenciaImediata">
            <label>Data da Transferência *</label>
            <input type="date" [(ngModel)]="dataTransferencia" [min]="obterDataMinima()">
          </div>

          <div class="campo">
            <label>Motivo *</label>
            <textarea [(ngModel)]="motivoTransferencia" rows="3" 
                      placeholder="Informe o motivo da transferência..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalTransferencia()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarTransferencia()">
              Confirmar Transferência
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* CONTAINER PRINCIPAL */
    .container-detalhes {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f5f7fa;
    }

    /* LOADING */
    .loading {
      text-align: center;
      padding: 60px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ERRO */
    .erro {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .erro h2 {
      color: #e74c3c;
      margin-bottom: 15px;
    }

    .erro button {
      margin-top: 20px;
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 2em;
    }

    .badge-status {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 15px;
      text-transform: uppercase;
    }

    .status-ativa {
      background: #d4edda;
      color: #155724;
    }

    .status-finalizada {
      background: #cce5ff;
      color: #004085;
    }

    .status-cancelada {
      background: #f8d7da;
      color: #721c24;
    }

    .btn-voltar {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-voltar:hover {
      background: #7f8c8d;
      transform: translateY(-2px);
    }

    /* GRID DE CARDS */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    /* CARDS */
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.3em;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    /* INFO ITEMS */
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item .label {
      color: #7f8c8d;
      font-weight: 500;
    }

    .info-item .value {
      color: #2c3e50;
      font-weight: 600;
    }

    .info-item.destaque {
      background: #f8f9fa;
      margin: 0 -10px;
      padding: 12px 10px;
      border-radius: 6px;
      border-bottom: none;
    }

    .numero-apt {
      font-size: 1.3em;
      color: #667eea;
    }

    .valor-positivo {
      color: #27ae60;
    }

    .valor-negativo {
      color: #e74c3c;
    }

    /* INFO ITEM COM BOTÃO */
    .info-item-com-botao {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ecf0f1;
      padding: 12px 0;
    }

    .info-item-com-botao .info-item {
      flex: 1;
      border: none;
      padding: 0;
    }

    .btn-mini {
      background: #3498db;
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.3s;
      margin-left: 10px;
    }

    .btn-mini:hover {
      background: #2980b9;
      transform: scale(1.1);
    }

    /* EXTRATO */
    .extrato-card {
      grid-column: 1 / -1;
    }

    .tabela-extrato {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .tabela-extrato th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #dee2e6;
    }

    .tabela-extrato td {
      padding: 12px;
      border-bottom: 1px solid #ecf0f1;
    }

    .tabela-extrato tr:hover {
      background: #f8f9fa;
    }

    .badge-extrato {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
      margin-right: 8px;
    }

    .badge-diaria {
      background: #d4edda;
      color: #155724;
    }

    .badge-consumo {
      background: #fff3cd;
      color: #856404;
    }

    .badge-pagamento {
      background: #cce5ff;
      color: #004085;
    }

    .badge-desconto {
      background: #f8d7da;
      color: #721c24;
    }

    /* HISTÓRICO */
    .historico-card {
      grid-column: 1 / -1;
    }

    .timeline {
      position: relative;
      padding: 20px 0 20px 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #dee2e6;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }

    .timeline-marker {
      position: absolute;
      left: -35px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #667eea;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #667eea;
    }

    .timeline-content {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }

    .timeline-header {
      margin-bottom: 8px;
    }

    .timeline-date {
      font-size: 0.9em;
      color: #7f8c8d;
      font-weight: 600;
    }

    .timeline-body p {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }

    .timeline-body small {
      color: #95a5a6;
    }

    /* AÇÕES */
    .acoes-card {
      grid-column: 1 / -1;
    }

    .botoes-acoes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .btn-acao {
      padding: 15px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1em;
      transition: all 0.3s;
      text-align: center;
    }

    .btn-acao:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-checkin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-pagamento {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      color: white;
    }

    .btn-consumo {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
      color: white;
    }

    .btn-transferir {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
    }

    .btn-finalizar {
      background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
      color: white;
    }

    .btn-recibo {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .btn-cancelar {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
    }

    /* MODAIS */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .modal-content.modal-grande {
      max-width: 700px;
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .info-box {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #2196f3;
    }

    .info-box p {
      margin: 5px 0;
      color: #1976d2;
    }

    .campo {
      margin-bottom: 20px;
    }

    .campo label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
    }

    .campo input[type="text"],
    .campo input[type="number"],
    .campo input[type="date"],
    .campo select,
    .campo textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .campo input:focus,
    .campo select:focus,
    .campo textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .campo small {
      display: block;
      margin-top: 5px;
      color: #7f8c8d;
      font-size: 0.9em;
    }

    .campo input[type="checkbox"] {
      margin-right: 8px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }

    .btn-cancelar-modal,
    .btn-confirmar {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-cancelar-modal {
      background: #95a5a6;
      color: white;
    }

    .btn-cancelar-modal:hover {
      background: #7f8c8d;
    }

    .btn-confirmar {
      background: #667eea;
      color: white;
    }

    .btn-confirmar:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    /* RESPONSIVO */
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .botoes-acoes {
        grid-template-columns: 1fr;
      }

      .modal-content {
        padding: 20px;
        max-width: 95%;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header h1 {
        font-size: 1.5em;
        margin-bottom: 10px;
      }

      .btn-voltar {
        width: 100%;
        margin-top: 10px;
      }
    }
  `]
})
export class ReservaDetalhesApp implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  reserva: ReservaDetalhes | null = null;
  loading = false;
  erro = '';

  // ALTERAR CHECKOUT
  modalAlterarCheckout = false;
  novaDataCheckout = '';
  motivoAlteracaoCheckout = '';

  // ALTERAR HÓSPEDES
  modalAlterarHospedes = false;
  novaQuantidadeHospedes = 1;
  motivoAlteracaoHospedes = '';

  // PAGAMENTO
  modalPagamento = false;
  pagValor = 0;
  pagFormaPagamento = '';
  pagObs = '';
  formasPagamento = [
    { codigo: 'DINHEIRO', nome: 'Dinheiro' },
    { codigo: 'PIX', nome: 'PIX' },
    { codigo: 'CARTAO_DEBITO', nome: 'Cartão Débito' },
    { codigo: 'CARTAO_CREDITO', nome: 'Cartão Crédito' },
    { codigo: 'TRANSFERENCIA_BANCARIA', nome: 'Transferência' }   
  ];

  // CONSUMO
  modalConsumo = false;
  produtos: Produto[] = [];
  produtoSelecionadoId = 0;
  quantidadeConsumo = 1;
  observacaoConsumo = '';

  // TRANSFERÊNCIA
  modalTransferencia = false;
  apartamentosDisponiveis: Apartamento[] = [];
  novoApartamentoId = 0;
  dataTransferencia = '';
  transferenciaImediata = true;
  motivoTransferencia = '';

  // CHECK-IN
  modalCheckin = false;
  observacoesCheckin = '';
  mensagemAniversariante = false;
  isAniversariante = false;
  tipoDocumentoFinalizado: 'recibo' | 'fatura' | null = null;
  valorAPagarFinalizado = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarReserva(Number(id));
    } else {
      this.erro = 'ID da reserva não fornecido';
    }
  }

  carregarReserva(id: number): void {
    this.loading = true;
    this.erro = '';

    this.http.get<ReservaDetalhes>(`http://localhost:8080/api/reservas/${id}`).subscribe({
      next: (data) => {
        this.reserva = data;
        this.loading = false;
        console.log('✅ Reserva carregada:', data);
        this.verificarAniversariante();
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        this.erro = err.error?.message || 'Erro ao carregar reserva';
        this.loading = false;
      }
    });
  }

  verificarAniversariante(): void {
    if (!this.reserva?.cliente?.dataNascimento) {
      this.isAniversariante = false;
      return;
    }

    const hoje = new Date();
    const dataNasc = new Date(this.reserva.cliente.dataNascimento);
    
    this.isAniversariante = hoje.getMonth() === dataNasc.getMonth();
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }

  formatarData(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarMoeda(valor: any): string {
    if (valor === null || valor === undefined) return '0,00';
    return Number(valor).toFixed(2).replace('.', ',');
  }

  obterStatusClass(): string {
    if (!this.reserva?.status) return 'status-ativa';
    return 'status-' + this.reserva.status.toLowerCase();
  }

  dataAtualCompleta(): string {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  dataAtualSimples(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  formatarDataCompleta(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarCPF(cpf: any): string {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // ============= CHECK-IN =============
  abrirModalCheckin(): void {
    this.observacoesCheckin = this.reserva?.observacoes || '';
    this.mensagemAniversariante = this.isAniversariante;
    this.modalCheckin = true;
  }

  fecharModalCheckin(): void {
    this.modalCheckin = false;
  }

  gerarDocumentoCheckin(): void {
    if (!this.reserva) return;
    
    this.fecharModalCheckin();
    
    const htmlImpressao = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fatura Check-in - Reserva #${this.reserva.id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            width: 80mm; 
            margin: 0; 
            padding: 5mm;
          }
          .cabecalho { text-align: center; margin-bottom: 10px; }
          .cabecalho h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
          .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
          .separador { text-align: center; margin: 8px 0; font-size: 10px; }
          .titulo-documento { text-align: center; margin: 10px 0; }
          .titulo-documento h2 { font-size: 14px; margin: 0; }
          .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0; }
          .data-emissao { font-size: 10px; margin: 2px 0; }
          .secao { margin: 10px 0; }
          .secao h3 { font-size: 12px; margin: 0 0 8px 0; text-decoration: underline; }
          .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
          .valores { text-align: center; }
          .valor-destaque { font-size: 14px; font-weight: bold; margin: 5px 0 10px 0; }
          .valor-total { font-size: 16px; font-weight: bold; margin: 5px 0; }
          .aniversariante { text-align: center; background: black; color: white; padding: 8px; margin: 10px 0; font-weight: bold; }
          .observacoes { margin: 10px 0; padding: 8px; border: 1px solid #000; }
          .observacoes h3 { font-size: 11px; margin: 0 0 5px 0; }
          .observacoes p { font-size: 10px; margin: 0; white-space: pre-wrap; }
          .assinatura { margin-top: 20px; text-align: center; }
          .texto-assinatura { font-size: 10px; margin: 2px 0; }
          .linha-assinatura { border-top: 1px solid #000; margin: 15px 10px 5px 10px; }
          .label-assinatura { font-size: 10px; margin: 2px 0; }
          .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
          .rodape p { margin: 3px 0; }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <h1>HOTEL DI VAN</h1>
          <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
          <p class="endereco">Arapiraca - AL</p>
          <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        </div>

        <div class="titulo-documento">
          <h2>FATURA DE CHECK-IN</h2>
          <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
          <p class="data-emissao">${this.dataAtualCompleta()}</p>
        </div>

        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <div class="secao">
          <h3>DADOS DO HÓSPEDE</h3>
          <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
          <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Não informado'}</p>
        </div>

        <div class="separador">- - - - - - - - - - - - - - -</div>

        <div class="secao">
          <h3>INFORMAÇÕES DA RESERVA</h3>
          <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
          <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
          <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
          <p><strong>Diárias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
          <p><strong>Hóspedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
        </div>

        <div class="separador">- - - - - - - - - - - - - - -</div>

        <div class="secao valores">
          <p><strong>Valor da Diária:</strong></p>
          <p class="valor-destaque">R$ ${this.formatarMoeda(this.reserva.valorDiaria)}</p>
          <p><strong>Total Estimado:</strong></p>
          <p class="valor-total">R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</p>
        </div>

        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        ${this.isAniversariante && this.mensagemAniversariante ? `
          <div class="aniversariante">
            <p>🎉 FELIZ ANIVERSÁRIO! 🎉</p>
            <p>Desejamos um mês especial!</p>
          </div>
        ` : ''}

        ${this.observacoesCheckin ? `
          <div class="observacoes">
            <h3>OBSERVAÇÕES:</h3>
            <p>${this.observacoesCheckin}</p>
          </div>
          <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        ` : ''}

        <div class="assinatura">
          <p class="texto-assinatura">Declaro estar ciente das condições</p>
          <p class="texto-assinatura">da reserva e dos valores cobrados.</p>
          <div class="linha-assinatura"></div>
          <p class="label-assinatura">Assinatura do Hóspede</p>
          <div class="linha-assinatura"></div>
          <p class="label-assinatura">Data: ____/____/________</p>
        </div>

        <div class="rodape">
          <p>Obrigado pela preferência!</p>
          <p>Tenha uma excelente estadia!</p>
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

    const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
    if (janelaImpressao) {
      janelaImpressao.document.write(htmlImpressao);
      janelaImpressao.document.close();
    }
  }

  // ============= RECIBO =============

  imprimirRecibo(): void {
  if (!this.reserva) return;

  console.log('📄 Total a pagar:', this.reserva.totalApagar);
  console.log('📄 Total recebido:', this.reserva.totalRecebido);
  console.log('📄 Total hospedagem:', this.reserva.totalHospedagem);

  // ✅ DECISÃO: Se tem saldo > 0, é FATURA. Se não, é RECIBO.
  const temSaldo = (this.reserva.totalApagar || 0) > 0;
  
  if (temSaldo) {
    console.log('🔸 Gerando FATURA (há saldo a pagar)');
    this.gerarFatura();
  } else {
    console.log('🔸 Gerando RECIBO (tudo pago)');
    this.gerarRecibo();
  }
}

// ============= GERAR RECIBO (PAGO) =============
gerarRecibo(): void {
  if (!this.reserva) return;

  const htmlImpressao = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - Reserva #${this.reserva.id}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: center; margin-bottom: 10px; }
        .cabecalho h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
        .separador { text-align: center; margin: 8px 0; font-size: 10px; }
        .titulo-documento { text-align: center; margin: 10px 0; }
        .titulo-documento h2 { font-size: 14px; margin: 0; }
        .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0; }
        .data-emissao { font-size: 10px; margin: 2px 0; }
        .secao { margin: 10px 0; }
        .secao h3 { font-size: 12px; margin: 0 0 8px 0; text-decoration: underline; }
        .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
        .linha-valor { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
        .linha-valor.subtotal { font-weight: bold; margin-top: 8px; }
        .linha-valor.total { font-size: 14px; font-weight: bold; margin: 8px 0; }
        .declaracao { text-align: center; margin: 15px 0; font-size: 11px; }
        .declaracao p { margin: 3px 0; }
        .assinatura { margin-top: 20px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 15px 20px 5px 20px; }
        .label-assinatura { font-size: 10px; margin: 2px 0; }
        .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
        .rodape p { margin: 3px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <div class="titulo-documento">
        <h2>RECIBO DE PAGAMENTO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Não informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERÍODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diárias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hóspedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DISCRIMINAÇÃO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diárias (${this.reserva.quantidadeDiaria}x):</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</span>
        </div>
        <div class="linha-valor">
          <span>Consumo:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalProduto || 0)}</span>
        </div>
        ${(this.reserva.desconto || 0) > 0 ? `
          <div class="linha-valor">
            <span>Desconto:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.desconto)}</span>
          </div>
        ` : ''}
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div class="linha-valor total">
          <span>TOTAL PAGO:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</span>
        </div>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="declaracao">
        <p>Recebi(emos) de ${this.reserva.cliente?.nome}</p>
        <p>a importância de <strong>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</strong></p>
        <p>referente à hospedagem no período citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Obrigado pela preferência!</p>
        <p>Volte sempre!</p>
      </div>

      <script>
        window.onload = function() {
          console.log('Imprimindo RECIBO');
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
  if (janelaImpressao) {
    janelaImpressao.document.write(htmlImpressao);
    janelaImpressao.document.close();
  }
}

// ============= GERAR FATURA (A PAGAR) =============
gerarFatura(): void {
  if (!this.reserva) return;

  const htmlImpressao = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fatura - Reserva #${this.reserva.id}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: center; margin-bottom: 10px; }
        .cabecalho h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
        .separador { text-align: center; margin: 8px 0; font-size: 10px; }
        .titulo-documento { text-align: center; margin: 10px 0; }
        .titulo-documento h2 { font-size: 14px; margin: 0; }
        .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0; }
        .data-emissao { font-size: 10px; margin: 2px 0; }
        .secao { margin: 10px 0; }
        .secao h3 { font-size: 12px; margin: 0 0 8px 0; text-decoration: underline; }
        .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
        .linha-valor { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
        .linha-valor.subtotal { font-weight: bold; margin-top: 8px; }
        .linha-valor.total { font-size: 14px; font-weight: bold; margin: 8px 0; }
        .declaracao { text-align: center; margin: 15px 0; font-size: 11px; }
        .declaracao p { margin: 3px 0; }
        .assinatura { margin-top: 20px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 15px 20px 5px 20px; }
        .label-assinatura { font-size: 10px; margin: 2px 0; }
        .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
        .rodape p { margin: 3px 0; }
        .destaque-apagar { background: #000; color: #fff; padding: 8px; text-align: center; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <div class="titulo-documento">
        <h2>FATURA - PAGAMENTO FATURADO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Não informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERÍODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diárias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hóspedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DISCRIMINAÇÃO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diárias (${this.reserva.quantidadeDiaria}x):</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</span>
        </div>
        <div class="linha-valor">
          <span>Consumo:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalProduto || 0)}</span>
        </div>
        ${(this.reserva.desconto || 0) > 0 ? `
          <div class="linha-valor">
            <span>Desconto:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.desconto)}</span>
          </div>
        ` : ''}
        <div class="separador">- - - - - - - - - - - - - - -</div>
        <div class="linha-valor subtotal">
          <span>Subtotal:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</span>
        </div>
        ${(this.reserva.totalRecebido || 0) > 0 ? `
          <div class="linha-valor">
            <span>Já Recebido:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.totalRecebido)}</span>
          </div>
        ` : ''}
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div class="linha-valor total">
          <span>VALOR A PAGAR:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalApagar)}</span>
        </div>
      </div>

      <div class="destaque-apagar">
        <p style="margin: 0; font-size: 13px; font-weight: bold;">
          VALOR A PAGAR: R$ ${this.formatarMoeda(this.reserva.totalApagar)}
        </p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="declaracao">
        <p>O Sr(a). ${this.reserva.cliente?.nome}</p>
        <p>deverá pagar a importância de</p>
        <p><strong>R$ ${this.formatarMoeda(this.reserva.totalApagar)}</strong></p>
        <p>referente à hospedagem no período citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Assinatura do Hóspede</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Esta fatura deverá ser paga</p>
        <p>conforme acordado.</p>
      </div>

      <script>
        window.onload = function() {
          console.log('Imprimindo FATURA - Valor a pagar: R$ ${this.formatarMoeda(this.reserva!.totalApagar)}');
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
  if (janelaImpressao) {
    janelaImpressao.document.write(htmlImpressao);
    janelaImpressao.document.close();
  }
}

  // ============= ALTERAR CHECKOUT =============
  abrirModalAlterarCheckout(): void {
    if (!this.reserva) return;
    
    const dataCheckout = new Date(this.reserva.dataCheckout);
    this.novaDataCheckout = dataCheckout.toISOString().split('T')[0];
    this.motivoAlteracaoCheckout = '';
    this.modalAlterarCheckout = true;
  }

  fecharModalAlterarCheckout(): void {
    this.modalAlterarCheckout = false;
  }

  obterDataMinimaCheckout(): string {
    if (!this.reserva) return '';
    const dataCheckin = new Date(this.reserva.dataCheckin);
    dataCheckin.setDate(dataCheckin.getDate() + 1);
    return dataCheckin.toISOString().split('T')[0];
  }

  confirmarAlteracaoCheckout(): void {
    if (!this.reserva) return;

    if (!this.novaDataCheckout) {
      alert('⚠️ Informe a nova data de check-out');
      return;
    }

    const params: any = {
      novaDataCheckout: this.novaDataCheckout + 'T13:00:00'
    };

    if (this.motivoAlteracaoCheckout.trim()) {
      params.motivo = this.motivoAlteracaoCheckout;
    }

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/alterar-checkout`, null, { params }).subscribe({
      next: () => {
        alert('✅ Data de check-out alterada com sucesso!');
        this.fecharModalAlterarCheckout();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  // ============= ALTERAR HÓSPEDES =============
  abrirModalAlterarHospedes(): void {
    if (!this.reserva) return;
    
    this.novaQuantidadeHospedes = this.reserva.quantidadeHospede;
    this.motivoAlteracaoHospedes = '';
    this.modalAlterarHospedes = true;
  }

  fecharModalAlterarHospedes(): void {
    this.modalAlterarHospedes = false;
  }

  confirmarAlteracaoHospedes(): void {
    if (!this.reserva) return;

    if (this.novaQuantidadeHospedes < 1) {
      alert('⚠️ Quantidade inválida');
      return;
    }

    if (this.novaQuantidadeHospedes > (this.reserva.apartamento?.capacidade || 0)) {
      alert('⚠️ Quantidade excede a capacidade do apartamento');
      return;
    }

    const params: any = {
      quantidade: this.novaQuantidadeHospedes
    };

    if (this.motivoAlteracaoHospedes.trim()) {
      params.motivo = this.motivoAlteracaoHospedes;
    }

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/alterar-hospedes`, null, { params }).subscribe({
      next: () => {
        alert('✅ Quantidade de hóspedes alterada com sucesso!');
        this.fecharModalAlterarHospedes();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  // ============= PAGAMENTO =============
  abrirModalPagamento(): void {
    if (!this.reserva) return;
    this.pagValor = Number(this.reserva.totalApagar);
    this.pagFormaPagamento = '';
    this.pagObs = '';
    this.modalPagamento = true;
  }

  fecharModalPagamento(): void {
    this.modalPagamento = false;
  }

 salvarPagamento(): void {
  if (!this.reserva) {
    alert('Reserva não encontrada');
    return;
  }

  if (!this.pagFormaPagamento) {
    alert('Selecione uma forma de pagamento');
    return;
  }

  if (this.pagValor <= 0) {
    alert('Valor inválido');
    return;
  }

  if (this.pagValor > (this.reserva.totalApagar || 0)) {
    alert(`Valor maior que saldo (R$ ${(this.reserva.totalApagar || 0).toFixed(2)})`);
    return;
  }

  const dto = {
    reservaId: this.reserva.id,
    valor: this.pagValor,
    formaPagamento: this.pagFormaPagamento,
    observacao: this.pagObs || undefined
  };

  console.log('💳 Enviando pagamento:', dto);

  this.http.post('http://localhost:8080/api/pagamentos', dto).subscribe({
    next: () => {
      alert('✅ Pagamento registrado!');
      this.fecharModalPagamento();
      if (this.reserva) {
        this.carregarReserva(this.reserva.id);
      }
    },
    error: (err: any) => {
      console.log('═══════════════════════════════════════');
      console.log('❌ ERRO AO REGISTRAR PAGAMENTO');
      console.log('═══════════════════════════════════════');
      console.log('Erro completo:', err);
      console.log('err.error:', err.error);
      console.log('err.message:', err.message);
      console.log('err.status:', err.status);
      
      // ✅ EXTRAIR MENSAGEM DE ERRO CORRETAMENTE
      let mensagemErro = 'Erro ao registrar pagamento';
      
      if (err.error) {
        if (typeof err.error === 'string') {
          mensagemErro = err.error;
        } else if (err.error.message) {
          mensagemErro = err.error.message;
        } else if (err.error.erro) {
          mensagemErro = err.error.erro;
        } else {
          mensagemErro = JSON.stringify(err.error);
        }
      } else if (err.message) {
        mensagemErro = err.message;
      }
      
      console.log('📝 Mensagem extraída:', mensagemErro);
      console.log('═══════════════════════════════════════');
      
      alert('❌ Erro: ' + mensagemErro);
    }
  });
}

  // ============= CONSUMO =============
  abrirModalConsumo(): void {
    this.carregarProdutosDisponiveis();
    this.produtoSelecionadoId = 0;
    this.quantidadeConsumo = 1;
    this.observacaoConsumo = '';
    this.modalConsumo = true;
  }

  fecharModalConsumo(): void {
    this.modalConsumo = false;
  }

  carregarProdutosDisponiveis(): void {
    this.http.get<Produto[]>('http://localhost:8080/api/produtos').subscribe({
      next: (data) => {
        this.produtos = data.filter(p => p.quantidade > 0);
        if (this.produtos.length === 0) {
          alert('⚠️ Nenhum produto disponível!');
        }
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar produtos');
      }
    });
  }

  salvarConsumo(): void {
    if (!this.reserva) {
      alert('Reserva não encontrada');
      return;
    }

    if (this.produtoSelecionadoId === 0) {
      alert('⚠️ Selecione um produto');
      return;
    }

    if (this.quantidadeConsumo <= 0) {
      alert('⚠️ Quantidade inválida');
      return;
    }

    const dto = {
      produtoId: this.produtoSelecionadoId,
      quantidade: this.quantidadeConsumo,
      observacao: this.observacaoConsumo
    };

    this.http.post(`http://localhost:8080/api/reservas/${this.reserva.id}/consumo`, dto).subscribe({
      next: () => {
        alert('✅ Produto adicionado ao consumo!');
        this.fecharModalConsumo();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
      }
    });
  }

  // ============= TRANSFERÊNCIA =============
  abrirModalTransferencia(): void {
    if (!this.reserva) return;

    this.http.get<Apartamento[]>('http://localhost:8080/api/apartamentos').subscribe({
      next: (data) => {
        this.apartamentosDisponiveis = data.filter(
          (apt: Apartamento) => 
            apt.id !== this.reserva?.apartamento?.id &&
            apt.capacidade >= (this.reserva?.quantidadeHospede || 0)
        );

        if (this.apartamentosDisponiveis.length === 0) {
          alert('⚠️ Nenhum apartamento disponível para transferência');
          return;
        }

        this.novoApartamentoId = 0;
        this.dataTransferencia = '';
        this.transferenciaImediata = true;
        this.motivoTransferencia = '';
        this.modalTransferencia = true;
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('Erro ao carregar apartamentos disponíveis');
      }
    });
  }

  fecharModalTransferencia(): void {
    this.modalTransferencia = false;
  }

  confirmarTransferencia(): void {
    if (!this.reserva) {
      alert('Reserva não encontrada');
      return;
    }

    if (this.novoApartamentoId === 0) {
      alert('⚠️ Selecione um apartamento');
      return;
    }

    if (!this.transferenciaImediata && !this.dataTransferencia) {
      alert('⚠️ Informe a data da transferência');
      return;
    }

    if (!this.motivoTransferencia.trim()) {
      alert('⚠️ Informe o motivo da transferência');
      return;
    }

    const confirmacao = confirm(
      this.transferenciaImediata
        ? '⚠️ Confirma transferência IMEDIATA de apartamento?'
        : `⚠️ Confirma transferência para o dia ${this.dataTransferencia}?`
    );

    if (!confirmacao) return;

    const dto = {
      reservaId: this.reserva.id,
      novoApartamentoId: this.novoApartamentoId,
      dataTransferencia: this.transferenciaImediata ? null : this.dataTransferencia + 'T00:00:00',
      motivo: this.motivoTransferencia
    };

    this.http.post('http://localhost:8080/api/reservas/transferir-apartamento', dto).subscribe({
      next: () => {
        alert('✅ Transferência realizada com sucesso!');
        this.fecharModalTransferencia();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        alert('❌ Erro: ' + (err.error?.erro || err.error || err.message));
      }
    });
  }

  obterNomeTipoApartamento(apt: Apartamento): string {
    return apt.tipoApartamento?.tipo || apt.tipoApartamentoNome || 'Sem tipo';
  }

  obterDataMinima(): string {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
  }

  // ============= FINALIZAR / CANCELAR =============
  finalizarReserva(): void {
  if (!this.reserva) return;

  // ✅ CAPTURAR O SALDO ANTES DE FINALIZAR (apenas para impressão)
  const saldoAntesDeFinalizar = this.reserva.totalApagar || 0;

   
  console.log('=====================================');
  console.log('💰 FRONTEND - ANTES DE FINALIZAR:');
  console.log('   Saldo capturado:', saldoAntesDeFinalizar);
  console.log('   Reserva ID:', this.reserva.id);
  console.log('=====================================');


  
  // Confirmação simples
  if (saldoAntesDeFinalizar > 0) {
    const confirmacao = confirm(
      `⚠️ ATENÇÃO: Ainda há saldo devedor de R$ ${saldoAntesDeFinalizar.toFixed(2)}\n\n` +
      `Deseja finalizar mesmo assim?\n\n` +
      `Será gerada uma FATURA com o valor a pagar.`
    );
    
    if (!confirmacao) return;
  } else {
    const confirmacao = confirm('✅ Confirma a finalização da reserva?\n\nO apartamento ficará em status LIMPEZA.');
    if (!confirmacao) return;
  }

  // ✅ FINALIZAR NO BACKEND (SEM ENVIAR NADA ALÉM DO QUE ENVIAVA ANTES)
  this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/finalizar`, {}).subscribe({
    next: () => {
      alert('✅ Reserva finalizada com sucesso!');

      console.log('=====================================');
      console.log('💰 FRONTEND - APÓS FINALIZAR:');
      console.log('   Saldo que será usado na impressão:', saldoAntesDeFinalizar);
      console.log('=====================================');
      
      
      // ✅ RECARREGAR RESERVA
      this.carregarReserva(this.reserva!.id);
      
      // ✅ OFERECER IMPRESSÃO
      setTimeout(() => {
        const temSaldo = saldoAntesDeFinalizar > 0;
        const tipoDoc = temSaldo ? 'FATURA' : 'RECIBO';
        
        const imprimirDoc = confirm(`📄 Deseja imprimir ${temSaldo ? 'a' : 'o'} ${tipoDoc} agora?`);
        
        if (imprimirDoc) {
          if (temSaldo) {
            // Imprimir FATURA com o saldo capturado
            this.imprimirFaturaFinalizada(saldoAntesDeFinalizar);
          } else {
            // Imprimir RECIBO
            this.gerarRecibo();
          }
        }
      }, 500);
    },
    error: (err: any) => {
      alert('❌ Erro: ' + (err.error?.message || err.message));
    }
  });
}

  imprimirFaturaFinalizada(valorAPagar: number): void {
  if (!this.reserva) return;

  console.log('📄 Imprimindo FATURA com valor a pagar:', valorAPagar);

  const htmlImpressao = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fatura - Reserva #${this.reserva.id}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: center; margin-bottom: 10px; }
        .cabecalho h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
        .separador { text-align: center; margin: 8px 0; font-size: 10px; }
        .titulo-documento { text-align: center; margin: 10px 0; }
        .titulo-documento h2 { font-size: 14px; margin: 0; }
        .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0; }
        .data-emissao { font-size: 10px; margin: 2px 0; }
        .secao { margin: 10px 0; }
        .secao h3 { font-size: 12px; margin: 0 0 8px 0; text-decoration: underline; }
        .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
        .linha-valor { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
        .linha-valor.subtotal { font-weight: bold; margin-top: 8px; }
        .linha-valor.total { font-size: 14px; font-weight: bold; margin: 8px 0; }
        .declaracao { text-align: center; margin: 15px 0; font-size: 11px; }
        .declaracao p { margin: 3px 0; }
        .assinatura { margin-top: 20px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 15px 20px 5px 20px; }
        .label-assinatura { font-size: 10px; margin: 2px 0; }
        .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
        .rodape p { margin: 3px 0; }
        .destaque-apagar { background: #000; color: #fff; padding: 8px; text-align: center; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <div class="titulo-documento">
        <h2>FATURA - PAGAMENTO FATURADO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Não informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERÍODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diárias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hóspedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DISCRIMINAÇÃO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diárias (${this.reserva.quantidadeDiaria}x):</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</span>
        </div>
        <div class="linha-valor">
          <span>Consumo:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalProduto || 0)}</span>
        </div>
        ${(this.reserva.desconto || 0) > 0 ? `
          <div class="linha-valor">
            <span>Desconto:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.desconto)}</span>
          </div>
        ` : ''}
        <div class="separador">- - - - - - - - - - - - - - -</div>
        <div class="linha-valor subtotal">
          <span>Subtotal:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</span>
        </div>
        ${(this.reserva.totalRecebido || 0) > 0 ? `
          <div class="linha-valor">
            <span>Já Recebido:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.totalRecebido)}</span>
          </div>
        ` : ''}
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div class="linha-valor total">
          <span>VALOR A PAGAR:</span>
          <span>R$ ${this.formatarMoeda(valorAPagar)}</span>
        </div>
      </div>

      <div class="destaque-apagar">
        <p style="margin: 0; font-size: 13px; font-weight: bold;">
          VALOR A PAGAR: R$ ${this.formatarMoeda(valorAPagar)}
        </p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="declaracao">
        <p>O Sr(a). ${this.reserva.cliente?.nome}</p>
        <p>deverá pagar a importância de</p>
        <p><strong>R$ ${this.formatarMoeda(valorAPagar)}</strong></p>
        <p>referente à hospedagem no período citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Assinatura do Hóspede</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Esta fatura deverá ser paga</p>
        <p>conforme acordado.</p>
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

  const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
  if (janelaImpressao) {
    janelaImpressao.document.write(htmlImpressao);
    janelaImpressao.document.close();
  }
}


  
// ============= GERAR FATURA COM VALOR ESPECÍFICO =============
gerarFaturaComValor(valorAPagar: number): void {
  if (!this.reserva) return;

  const htmlImpressao = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fatura - Reserva #${this.reserva.id}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: center; margin-bottom: 10px; }
        .cabecalho h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 11px; margin: 2px 0; }
        .separador { text-align: center; margin: 8px 0; font-size: 10px; }
        .titulo-documento { text-align: center; margin: 10px 0; }
        .titulo-documento h2 { font-size: 14px; margin: 0; }
        .numero-reserva { font-size: 13px; font-weight: bold; margin: 5px 0; }
        .data-emissao { font-size: 10px; margin: 2px 0; }
        .secao { margin: 10px 0; }
        .secao h3 { font-size: 12px; margin: 0 0 8px 0; text-decoration: underline; }
        .secao p { margin: 4px 0; font-size: 11px; line-height: 1.4; }
        .linha-valor { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
        .linha-valor.subtotal { font-weight: bold; margin-top: 8px; }
        .linha-valor.total { font-size: 14px; font-weight: bold; margin: 8px 0; }
        .declaracao { text-align: center; margin: 15px 0; font-size: 11px; }
        .declaracao p { margin: 3px 0; }
        .assinatura { margin-top: 20px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 15px 20px 5px 20px; }
        .label-assinatura { font-size: 10px; margin: 2px 0; }
        .rodape { text-align: center; margin-top: 15px; font-size: 11px; }
        .rodape p { margin: 3px 0; }
        .destaque-apagar { background: #000; color: #fff; padding: 8px; text-align: center; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <div class="titulo-documento">
        <h2>FATURA - PAGAMENTO FATURADO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DADOS DO HÓSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Não informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERÍODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diárias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hóspedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="secao">
        <h3>DISCRIMINAÇÃO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diárias (${this.reserva.quantidadeDiaria}x):</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</span>
        </div>
        <div class="linha-valor">
          <span>Consumo:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalProduto || 0)}</span>
        </div>
        ${(this.reserva.desconto || 0) > 0 ? `
          <div class="linha-valor">
            <span>Desconto:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.desconto)}</span>
          </div>
        ` : ''}
        <div class="separador">- - - - - - - - - - - - - - -</div>
        <div class="linha-valor subtotal">
          <span>Subtotal:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</span>
        </div>
        ${(this.reserva.totalRecebido || 0) > 0 ? `
          <div class="linha-valor">
            <span>Já Recebido:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.totalRecebido)}</span>
          </div>
        ` : ''}
        <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div class="linha-valor total">
          <span>VALOR A PAGAR:</span>
          <span>R$ ${this.formatarMoeda(valorAPagar)}</span>
        </div>
      </div>

      <div class="destaque-apagar">
        <p style="margin: 0; font-size: 13px; font-weight: bold;">
          VALOR A PAGAR: R$ ${this.formatarMoeda(valorAPagar)}
        </p>
      </div>

      <div class="separador">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="declaracao">
        <p>O Sr(a). ${this.reserva.cliente?.nome}</p>
        <p>deverá pagar a importância de</p>
        <p><strong>R$ ${this.formatarMoeda(valorAPagar)}</strong></p>
        <p>referente à hospedagem no período citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Assinatura do Hóspede</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Esta fatura deverá ser paga</p>
        <p>conforme acordado.</p>
      </div>

      <script>
        window.onload = function() {
          console.log('Imprimindo FATURA - Valor a pagar: R$ ${this.formatarMoeda(valorAPagar)}');
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
  if (janelaImpressao) {
    janelaImpressao.document.write(htmlImpressao);
    janelaImpressao.document.close();
  }
}

  cancelarReserva(): void {
    if (!this.reserva) return;

    const motivo = prompt('❌ Informe o motivo do cancelamento:');
    if (!motivo || motivo.trim() === '') {
      alert('⚠️ Motivo é obrigatório!');
      return;
    }

    const confirmacao = confirm(`❌ Confirma o cancelamento da reserva?\n\nMotivo: ${motivo}\n\nO apartamento será liberado.`);
    if (!confirmacao) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/cancelar`, null, { params: { motivo } }).subscribe({
      next: () => {
        alert('✅ Reserva cancelada!');
        this.carregarReserva(this.reserva!.id);
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  
}