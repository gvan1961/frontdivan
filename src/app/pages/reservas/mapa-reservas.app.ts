import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ReservaMapa {
  id: number;
  apartamentoId: number;
  apartamentoNumero: string;
  clienteNome: string;
  dataCheckin: string;
  dataCheckout: string;
  status: string;
  quantidadeHospede: number;
}

interface ApartamentoMapa {
  id: number;
  numeroApartamento: string;
  status: string;
  reservas: ReservaMapa[];
}

@Component({
  selector: 'app-mapa-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <h1>📅 Mapa de Reservas</h1>
        <div class="header-actions">
          <button class="btn-voltar" (click)="voltar()">← Voltar</button>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="filtros">
        <div class="filtro-periodo">
          <label>Período:</label>
          <select [(ngModel)]="periodoSelecionado" (change)="mudarPeriodo()">
            <option value="7">Próximos 7 dias</option>
            <option value="15">Próximos 15 dias</option>
            <option value="30">Próximos 30 dias</option>
            <option value="60">Próximos 60 dias</option>
          </select>
        </div>

        <div class="filtro-data">
          <label>Data inicial:</label>
          <input type="date" [(ngModel)]="dataInicio" (change)="carregarMapa()">
        </div>

        <button class="btn-hoje" (click)="voltarParaHoje()">📅 Hoje</button>
        <button class="btn-atualizar" (click)="carregarMapa()">🔄 Atualizar</button>
      </div>

      <!-- LEGENDA -->
      <div class="legenda">
        <div class="legenda-item">
          <span class="cor-disponivel"></span>
          <span>Disponível</span>
        </div>
        <div class="legenda-item">
          <span class="cor-ocupado"></span>
          <span>Ocupado</span>
        </div>
        <div class="legenda-item">
          <span class="cor-pre-reserva"></span>
          <span>Pré-Reserva</span>
        </div>
        <div class="legenda-item">
          <span class="cor-limpeza"></span>
          <span>Limpeza</span>
        </div>
        <div class="legenda-item">
          <span class="cor-manutencao"></span>
          <span>Manutenção</span>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando mapa...</p>
      </div>

      <!-- MAPA DE RESERVAS -->
      <div *ngIf="!loading" class="mapa-container">
        <div class="mapa-scroll">
          <table class="mapa-table">
            <!-- CABEÇALHO COM DATAS -->
            <thead>
              <tr>
                <th class="col-apartamento">Apt</th>
                <th *ngFor="let data of datas" class="col-data" [class.hoje]="isHoje(data)">
                  <div class="data-header">
                    <span class="dia-semana">{{ getDiaSemana(data) }}</span>
                    <span class="dia-mes">{{ getDiaMes(data) }}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <!-- CORPO COM APARTAMENTOS -->
            <tbody>
              <tr *ngFor="let apt of apartamentos">
                <td class="col-apartamento">
                  <div class="apt-info">
                    <span class="apt-numero">{{ apt.numeroApartamento }}</span>
                  </div>
                </td>
                
                <td *ngFor="let data of datas; let i = index" 
                    class="col-reserva"
                    [class.hoje]="isHoje(data)"
                    (click)="clicarCelula(apt, data)">
                  
                  <!-- CÉLULA DE RESERVA -->
                  <div class="celula-reserva" 
                       [class]="getClasseReserva(apt, data)"
                       [title]="getTituloReserva(apt, data)">
                    
                    <span class="reserva-info" *ngIf="getReservaInfo(apt, data)">
                      {{ getReservaInfo(apt, data) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DETALHES -->
      <div class="modal-overlay" *ngIf="modalDetalhes" (click)="fecharModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ modalTitulo }}</h2>
          
          <div *ngIf="reservaSelecionada" class="modal-info">
            <p><strong>Reserva:</strong> #{{ reservaSelecionada.id }}</p>
            <p><strong>Cliente:</strong> {{ reservaSelecionada.clienteNome }}</p>
            <p><strong>Apartamento:</strong> {{ reservaSelecionada.apartamentoNumero }}</p>
            <p><strong>Check-in:</strong> {{ formatarData(reservaSelecionada.dataCheckin) }}</p>
            <p><strong>Check-out:</strong> {{ formatarData(reservaSelecionada.dataCheckout) }}</p>
            <p><strong>Hóspedes:</strong> {{ reservaSelecionada.quantidadeHospede }}</p>
            <p><strong>Status:</strong> <span [class]="'badge-' + reservaSelecionada.status.toLowerCase()">{{ reservaSelecionada.status }}</span></p>
            
            <!-- AVISO PARA PRÉ-RESERVA -->
            <div class="aviso-pre-reserva" *ngIf="reservaSelecionada.status === 'PRE_RESERVA'">
              ℹ️ Esta é uma pré-reserva. Você pode pagar para ativar, editar ou excluir.
            </div>
          </div>

          <div *ngIf="!reservaSelecionada" class="modal-info">
            <p><strong>Apartamento:</strong> {{ apartamentoSelecionado?.numeroApartamento }}</p>
            <p><strong>Data:</strong> {{ formatarDataSimples(dataSelecionada) }}</p>
            
            <div class="alerta-sucesso">
              <p class="texto-disponivel">✅ Este apartamento está LIVRE nesta data!</p>
              <p class="texto-info">Você pode criar uma reserva para este dia.</p>
            </div>
          </div>

          <div class="modal-footer">
            <!-- COLUNA ESQUERDA: Fechar -->
            <button class="btn-cancelar" (click)="fecharModal()">Fechar</button>
            
            <!-- COLUNA DIREITA: Ações -->
            <div class="acoes-direita">
              <!-- ✅ PAGAR E ATIVAR - PRIMEIRO (mais importante para PRE_RESERVA) -->
              <button *ngIf="reservaSelecionada && reservaSelecionada.status === 'PRE_RESERVA'" 
                      class="btn-pagar" 
                      (click)="abrirModalPagamento()">
                💳 Pagar e Ativar
              </button>
              
              <!-- EDITAR -->
              <button *ngIf="reservaSelecionada && reservaSelecionada.status === 'PRE_RESERVA'" 
                      class="btn-editar" 
                      (click)="editarPreReserva()">
                ✏️ Editar
              </button>
              
              <!-- EXCLUIR -->
              <button *ngIf="reservaSelecionada && reservaSelecionada.status === 'PRE_RESERVA'" 
                      class="btn-excluir" 
                      (click)="excluirPreReserva()">
                🗑️ Excluir
              </button>
              
              <!-- VER DETALHES COMPLETOS -->
              <button *ngIf="reservaSelecionada" 
                      class="btn-ver-detalhes" 
                      (click)="verDetalhesReserva()">
                📋 Detalhes Completos
              </button>
              
              <!-- CRIAR RESERVA (para disponíveis) -->
              <button *ngIf="!reservaSelecionada && podeReservar()" 
                      class="btn-criar-reserva" 
                      (click)="criarNovaReserva()">
                ➕ Criar Reserva
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL PAGAMENTO PRÉ-RESERVA -->
      <div class="modal-overlay" *ngIf="modalPagamento" (click)="fecharModalPagamento()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>💳 Pagamento de Pré-Reserva</h2>
          
          <div class="info-box" *ngIf="reservaSelecionada">
            <p><strong>Reserva:</strong> #{{ reservaSelecionada.id }}</p>
            <p><strong>Cliente:</strong> {{ reservaSelecionada.clienteNome }}</p>
            <p><strong>Apartamento:</strong> {{ reservaSelecionada.apartamentoNumero }}</p>
            <p><strong>Check-in:</strong> {{ formatarData(reservaSelecionada.dataCheckin) }}</p>
            <p><strong>Check-out:</strong> {{ formatarData(reservaSelecionada.dataCheckout) }}</p>
            <p><strong>Hóspedes:</strong> {{ reservaSelecionada.quantidadeHospede }}</p>
          </div>

          <div class="aviso-ativacao">
            ✅ Após o pagamento, a reserva será <strong>ATIVADA</strong> automaticamente e o apartamento ficará <strong>OCUPADO</strong>.
          </div>
          
          <div class="campo">
            <label>Valor a Pagar *</label>
            <input type="number" [(ngModel)]="pagPreReservaValor" step="0.01" min="0">
            <small>Valor total da hospedagem</small>
          </div>

          <div class="campo">
            <label>Forma de Pagamento *</label>
            <select [(ngModel)]="pagPreReservaFormaPagamento">
              <option value="">Selecione...</option>
              <option value="DINHEIRO">💵 Dinheiro</option>
              <option value="PIX">📱 PIX</option>
              <option value="CARTAO_DEBITO">💳 Cartão Débito</option>
              <option value="CARTAO_CREDITO">💳 Cartão Crédito</option>
              <option value="TRANSFERENCIA_BANCARIA">🏦 Transferência</option>
            </select>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="pagPreReservaObs" rows="3" 
                      placeholder="Observações sobre o pagamento (opcional)..."></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar" (click)="fecharModalPagamento()">
              Cancelar
            </button>
            <button class="btn-confirmar-pagamento" (click)="confirmarPagamentoPreReserva()">
              💳 Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 100%;
      margin: 0 auto;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h1 {
      margin: 0;
      color: #2c3e50;
    }

    .header-actions {
      display: flex;
      gap: 10px;
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
    }

    /* FILTROS */
    .filtros {
      display: flex;
      gap: 15px;
      align-items: center;
      background: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex-wrap: wrap;
    }

    .filtro-periodo, .filtro-data {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filtros label {
      font-weight: 600;
      color: #2c3e50;
    }

    .filtros select,
    .filtros input[type="date"] {
      padding: 8px 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .btn-hoje,
    .btn-atualizar {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-hoje {
      background: #3498db;
      color: white;
    }

    .btn-hoje:hover {
      background: #2980b9;
    }

    .btn-atualizar {
      background: #27ae60;
      color: white;
    }

    .btn-atualizar:hover {
      background: #229954;
    }

    /* LEGENDA */
    .legenda {
      display: flex;
      gap: 20px;
      background: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex-wrap: wrap;
    }

    .legenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legenda-item span:first-child {
      width: 30px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .cor-disponivel { background: #d4edda; }
    .cor-ocupado { background: #f8d7da; }
    .cor-pre-reserva { background: #d1ecf1; }
    .cor-limpeza { background: #fff3cd; }
    .cor-manutencao { background: #e2d5f0; }

    /* LOADING */
    .loading {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
    }

    .aviso-pre-reserva {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 12px;
      border-radius: 6px;
      margin-top: 15px;
      color: #1976d2;
      font-weight: 600;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }

    .acoes-direita {
      display: flex;
      gap: 10px;
    }

    .btn-cancelar {
      background: #95a5a6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-cancelar:hover {
      background: #7f8c8d;
    }

    .btn-excluir {
      background: #e74c3c;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-excluir:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .btn-editar {
      background: #ff9800;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-editar:hover {
      background: #f57c00;
      transform: translateY(-2px);
    }

    .btn-ver-detalhes {
      background: #3498db;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-ver-detalhes:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn-criar-reserva {
      background: #27ae60;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-criar-reserva:hover {
      background: #229954;
      transform: translateY(-2px);
    }

    /* BOTÃO PAGAR */
    .btn-pagar {
      background: #27ae60;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-pagar:hover {
      background: #229954;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }

    /* RESPONSIVO */
    @media (max-width: 768px) {
      .modal-footer {
        flex-direction: column;
        align-items: stretch;
      }
      
      .acoes-direita {
        flex-direction: column;
      }
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

    /* MAPA */
    .mapa-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .mapa-scroll {
      overflow-x: auto;
      overflow-y: auto;
      max-height: calc(100vh - 350px);
    }

    .mapa-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
    }

    th {
      background: #2c3e50;
      color: white;
      padding: 12px 8px;
      text-align: center;
      border: 1px solid #34495e;
      font-weight: 600;
      font-size: 0.9em;
    }

    .col-apartamento {
      position: sticky;
      left: 0;
      z-index: 20;
      background: #2c3e50 !important;
      min-width: 80px;
      max-width: 80px;
    }

    .col-data {
      min-width: 80px;
      max-width: 80px;
    }

    .col-data.hoje {
      background: #667eea !important;
    }

    .data-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .dia-semana {
      font-size: 0.75em;
      opacity: 0.9;
    }

    .dia-mes {
      font-size: 1em;
      font-weight: 700;
    }

    tbody tr {
      border-bottom: 1px solid #ecf0f1;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    td {
      padding: 0;
      border: 1px solid #e0e0e0;
      text-align: center;
      vertical-align: middle;
    }

    td.col-apartamento {
      position: sticky;
      left: 0;
      z-index: 5;
      background: white;
      font-weight: 600;
      color: #2c3e50;
      border-right: 2px solid #bdc3c7;
    }

    td.col-reserva {
      cursor: pointer;
      transition: all 0.2s;
      padding: 4px;
    }

    td.col-reserva:hover {
      background: #f0f0f0;
    }

    td.col-reserva.hoje {
      background: #e3f2fd;
    }

    .apt-info {
      padding: 12px 8px;
    }

    .apt-numero {
      font-size: 1.1em;
      font-weight: 700;
      color: #667eea;
    }

    /* CÉLULA DE RESERVA */
    .celula-reserva {
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
      padding: 4px;
      transition: all 0.2s;
    }

    .alerta-sucesso {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }

    .texto-info {
      color: #155724;
      font-size: 0.95em;
      margin-top: 8px;
    }

    .info-adicional {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 12px;
      border-radius: 6px;
      margin-top: 10px;
    }

    .texto-aviso {
      color: #1976d2;
      font-size: 0.9em;
      margin: 0;
    }

    .celula-reserva:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .celula-disponivel {
      background: #d4edda;
      color: #155724;
    }

    .celula-ocupado {
      background: #f8d7da;
      color: #721c24;
    }

    .celula-pre-reserva {
      background: #d1ecf1;
      color: #0c5460;
    }

    .celula-limpeza {
      background: #fff3cd;
      color: #856404;
    }

    .celula-manutencao {
      background: #e2d5f0;
      color: #5a3d7a;
    }

    .celula-indisponivel {
      background: #d6d8db;
      color: #383d41;
    }

    .reserva-info {
      font-size: 0.75em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* MODAL */
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

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .modal-info {
      margin-bottom: 20px;
    }

    .modal-info p {
      margin: 10px 0;
      color: #2c3e50;
    }

    .texto-disponivel {
      color: #27ae60;
      font-weight: 600;
      font-size: 1.1em;
      margin-top: 15px;
    }

    .badge-ativa {
      background: #d4edda;
      color: #155724;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .badge-pre_reserva {
      background: #d1ecf1;
      color: #0c5460;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .badge-finalizada {
      background: #cce5ff;
      color: #004085;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* INFO BOX DO MODAL DE PAGAMENTO */
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
      font-size: 0.95em;
    }

    /* AVISO ATIVAÇÃO */
    .aviso-ativacao {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      color: #856404;
      font-size: 0.95em;
    }

    .aviso-ativacao strong {
      color: #856404;
      font-weight: 700;
    }

    /* CAMPOS DO FORMULÁRIO */
    .campo {
      margin-bottom: 20px;
    }

    .campo label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
    }

    .campo input[type="number"],
    .campo select,
    .campo textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      transition: all 0.3s;
      box-sizing: border-box;
      font-family: inherit;
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

    .campo textarea {
      resize: vertical;
      min-height: 80px;
    }

    /* BOTÃO CONFIRMAR PAGAMENTO */
    .btn-confirmar-pagamento {
      background: #27ae60;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      font-size: 1em;
    }

    .btn-confirmar-pagamento:hover {
      background: #229954;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }

    /* RESPONSIVO */
    @media (max-width: 768px) {
      .filtros {
        flex-direction: column;
        align-items: stretch;
      }

      .filtro-periodo,
      .filtro-data {
        flex-direction: column;
        align-items: stretch;
      }

      .legenda {
        flex-direction: column;
      }

      .mapa-scroll {
        max-height: calc(100vh - 450px);
      }
    }
  `]
})
export class MapaReservasApp implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  apartamentos: ApartamentoMapa[] = [];
  datas: string[] = [];
  dataInicio = '';
  periodoSelecionado = '15';

  // Modal Detalhes
  modalDetalhes = false;
  modalTitulo = '';
  reservaSelecionada: ReservaMapa | null = null;
  apartamentoSelecionado: ApartamentoMapa | null = null;
  dataSelecionada = '';

  // Modal Pagamento
  modalPagamento = false;
  pagPreReservaValor = 0;
  pagPreReservaFormaPagamento = '';
  pagPreReservaObs = '';

  mapaReservas: Map<string, ReservaMapa> = new Map();

  ngOnInit(): void {
    this.voltarParaHoje();
  }

  voltarParaHoje(): void {
    const hoje = new Date();
    this.dataInicio = hoje.toISOString().split('T')[0];
    this.carregarMapa();
  }

  mudarPeriodo(): void {
    this.carregarMapa();
  }

  carregarMapa(): void {
    this.loading = true;
    this.mapaReservas.clear();

    // Gerar datas
    this.gerarDatas();

    // Buscar apartamentos
    this.http.get<any[]>('http://localhost:8080/api/apartamentos').subscribe({
      next: (apartamentos) => {
        // Buscar reservas
        this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe({
          next: (reservas) => {
            console.log('📋 Reservas carregadas:', reservas.length);

            // Processar apartamentos
            this.apartamentos = apartamentos
              .filter(apt => apt.status !== 'INDISPONIVEL')
              .map(apt => ({
                id: apt.id,
                numeroApartamento: apt.numeroApartamento,
                status: apt.status,
                reservas: []
              }))
              .sort((a, b) => {
                const numA = parseInt(a.numeroApartamento) || 0;
                const numB = parseInt(b.numeroApartamento) || 0;
                return numA - numB;
              });

            // Mapear reservas por apartamento e data
            reservas
              .filter(r => r.status === 'ATIVA' || r.status === 'PRE_RESERVA')
              .forEach(reserva => {
                const checkin = new Date(reserva.dataCheckin);
                const checkout = new Date(reserva.dataCheckout);

                // Para cada dia da reserva
                for (let d = new Date(checkin); d < checkout; d.setDate(d.getDate() + 1)) {
                  const dataStr = d.toISOString().split('T')[0];
                  const chave = `${reserva.apartamento.id}-${dataStr}`;

                  this.mapaReservas.set(chave, {
                    id: reserva.id,
                    apartamentoId: reserva.apartamento.id,
                    apartamentoNumero: reserva.apartamento.numeroApartamento,
                    clienteNome: reserva.cliente?.nome || 'Sem nome',
                    dataCheckin: reserva.dataCheckin,
                    dataCheckout: reserva.dataCheckout,
                    status: reserva.status,
                    quantidadeHospede: reserva.quantidadeHospede
                  });
                }
              });

            this.loading = false;
            console.log('✅ Mapa carregado com sucesso');
          },
          error: (err) => {
            console.error('❌ Erro ao carregar reservas:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Erro ao carregar apartamentos:', err);
        this.loading = false;
      }
    });
  }

  gerarDatas(): void {
    const dias = parseInt(this.periodoSelecionado);
    const inicio = new Date(this.dataInicio);
    this.datas = [];

    for (let i = 0; i < dias; i++) {
      const data = new Date(inicio);
      data.setDate(data.getDate() + i);
      this.datas.push(data.toISOString().split('T')[0]);
    }

    console.log('📅 Datas geradas:', this.datas.length);
  }

  getDiaSemana(data: string): string {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
  }

  getDiaMes(data: string): string {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  isHoje(data: string): boolean {
    const hoje = new Date().toISOString().split('T')[0];
    return data === hoje;
  }

  getClasseReserva(apt: ApartamentoMapa, data: string): string {
    const chave = `${apt.id}-${data}`;
    const reserva = this.mapaReservas.get(chave);

    if (reserva) {
      if (reserva.status === 'ATIVA') return 'celula-ocupado';
      if (reserva.status === 'PRE_RESERVA') return 'celula-pre-reserva';
    }

    const hoje = new Date().toISOString().split('T')[0];
    const dataClicada = new Date(data + 'T00:00:00');
    const dataHoje = new Date(hoje + 'T00:00:00');

    if (dataClicada > dataHoje) {
      return 'celula-disponivel';
    }

    if (apt.status === 'LIMPEZA') return 'celula-limpeza';
    if (apt.status === 'MANUTENCAO') return 'celula-manutencao';

    return 'celula-disponivel';
  }

  getTituloReserva(apt: ApartamentoMapa, data: string): string {
    const chave = `${apt.id}-${data}`;
    const reserva = this.mapaReservas.get(chave);

    if (reserva) {
      const checkin = this.formatarData(reserva.dataCheckin);
      const checkout = this.formatarData(reserva.dataCheckout);
      
      return `🔴 OCUPADO\n\n` +
             `Reserva #${reserva.id}\n` +
             `Cliente: ${reserva.clienteNome}\n` +
             `Hóspedes: ${reserva.quantidadeHospede}\n\n` +
             `Check-in: ${checkin}\n` +
             `Check-out: ${checkout}`;
    }

    const dataObj = new Date(data + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataObj >= hoje) {
      return `✅ DISPONÍVEL\n\n` +
             `Apartamento ${apt.numeroApartamento}\n` +
             `Data: ${this.getDiaMes(data)}\n\n` +
             `Clique para criar uma reserva`;
    }

    return `Apt ${apt.numeroApartamento} - ${data}`;
  }

  getReservaInfo(apt: ApartamentoMapa, data: string): string {
    const chave = `${apt.id}-${data}`;
    const reserva = this.mapaReservas.get(chave);

    if (reserva) {
      const primeiroNome = reserva.clienteNome.split(' ')[0];
      return primeiroNome;
    }

    return '';
  }

  clicarCelula(apt: ApartamentoMapa, data: string): void {
    const chave = `${apt.id}-${data}`;
    const reserva = this.mapaReservas.get(chave);

    this.apartamentoSelecionado = apt;
    this.dataSelecionada = data;

    if (reserva) {
      this.reservaSelecionada = reserva;
      this.modalTitulo = `Reserva #${reserva.id}`;
    } else {
      this.reservaSelecionada = null;
      this.modalTitulo = `Criar Nova Reserva`;
    }

    this.modalDetalhes = true;
  }

  formatarDataSimples(data: string): string {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  podeReservar(): boolean {
    if (!this.apartamentoSelecionado || !this.dataSelecionada) return false;

    const chave = `${this.apartamentoSelecionado.id}-${this.dataSelecionada}`;
    const reserva = this.mapaReservas.get(chave);

    if (reserva) {
      return false;
    }

    const dataClicada = new Date(this.dataSelecionada + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataClicada >= hoje) {
      return true;
    }

    return this.apartamentoSelecionado.status === 'DISPONIVEL';
  }

  criarNovaReserva(): void {
    console.log('═══════════════════════════════════════');
    console.log('➕ CRIAR NOVA RESERVA - INICIANDO');
    
    const apartamentoId = this.apartamentoSelecionado?.id;
    const apartamentoNumero = this.apartamentoSelecionado?.numeroApartamento;
    const dataCheckin = this.dataSelecionada;

    console.log('📋 Valores capturados:');
    console.log('   Apartamento ID:', apartamentoId);
    console.log('   Apartamento Nº:', apartamentoNumero);
    console.log('   Data:', dataCheckin);

    if (!apartamentoId || !dataCheckin) {
      console.error('❌ ERRO: Dados incompletos!');
      alert('❌ Erro: Dados incompletos para criar a reserva');
      return;
    }

    const queryParams = {
      apartamentoId: apartamentoId.toString(),
      dataCheckin: dataCheckin,
      bloqueado: 'true'
    };

    console.log('📤 Query Params:', queryParams);
    console.log('🔒 Fechando modal...');
    this.fecharModal();

    console.log('🚀 Navegando para /reservas/novo...');
    
    setTimeout(() => {
      this.router.navigate(['/reservas/novo'], {
        queryParams: queryParams
      }).then(
        (success) => {
          console.log('✅ Navegação concluída:', success);
        },
        (error) => {
          console.error('❌ ERRO na navegação:', error);
          alert('❌ Erro ao navegar: ' + error);
        }
      );
    }, 50);

    console.log('═══════════════════════════════════════');
  }

  verDetalhesReserva(): void {
    console.log('═══════════════════════════════════════');
    console.log('🔍 VER DETALHES COMPLETOS');
    console.log('═══════════════════════════════════════');
    
    if (!this.reservaSelecionada) {
      console.error('❌ ERRO: Nenhuma reserva selecionada');
      alert('❌ Erro: Nenhuma reserva selecionada');
      return;
    }

    const reservaId = this.reservaSelecionada.id;
    
    console.log('📋 Reserva selecionada:');
    console.log('   ID:', reservaId);
    console.log('   Cliente:', this.reservaSelecionada.clienteNome);
    console.log('   Apartamento:', this.reservaSelecionada.apartamentoNumero);
    console.log('   Status:', this.reservaSelecionada.status);
    
    console.log('🚀 Navegando para: /reservas/' + reservaId);
    
    setTimeout(() => {
      this.fecharModal();
    }, 100);
    
    setTimeout(() => {
      this.router.navigate(['/reservas', reservaId]).then(
        (success) => {
          console.log('✅ Navegação concluída com SUCESSO:', success);
          console.log('═══════════════════════════════════════');
        },
        (error) => {
          console.error('❌ ERRO na navegação:', error);
          console.log('═══════════════════════════════════════');
          alert('❌ Erro ao abrir detalhes da reserva: ' + error);
        }
      );
    }, 200);
  }

  fecharModal(): void {
    this.modalDetalhes = false;
    
    setTimeout(() => {
      this.reservaSelecionada = null;
      this.apartamentoSelecionado = null;
      this.dataSelecionada = '';
      console.log('🧹 Variáveis do modal limpas');
    }, 200);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  excluirPreReserva(): void {
    if (!this.reservaSelecionada) {
      console.error('❌ Nenhuma reserva selecionada');
      return;
    }

    const reservaId = this.reservaSelecionada.id;
    const clienteNome = this.reservaSelecionada.clienteNome;
    const apartamentoNumero = this.reservaSelecionada.apartamentoNumero;
    const dataCheckin = this.formatarData(this.reservaSelecionada.dataCheckin);
    
    console.log('🗑️ Solicitação de exclusão da pré-reserva:', reservaId);
    
    const confirmacao = confirm(
      `⚠️ CONFIRMA A EXCLUSÃO DESTA PRÉ-RESERVA?\n\n` +
      `Reserva: #${reservaId}\n` +
      `Cliente: ${clienteNome}\n` +
      `Apartamento: ${apartamentoNumero}\n` +
      `Check-in: ${dataCheckin}\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    );

    if (!confirmacao) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    console.log('✅ Exclusão confirmada, enviando requisição...');
    this.fecharModal();

    this.http.delete(`http://localhost:8080/api/reservas/${reservaId}/pre-reserva`).subscribe({
      next: () => {
        console.log('✅ Pré-reserva excluída com sucesso');
        alert('✅ Pré-reserva excluída com sucesso!');
        this.carregarMapa();
      },
      error: (err: any) => {
        console.error('❌ Erro ao excluir:', err);
        alert('❌ Erro ao excluir pré-reserva: ' + (err.error?.message || err.message || 'Erro desconhecido'));
      }
    });
  }

  editarPreReserva(): void {
    if (!this.reservaSelecionada) {
      console.error('❌ Nenhuma reserva selecionada');
      return;
    }

    const reservaId = this.reservaSelecionada.id;
    
    console.log('✏️ Editando pré-reserva:', reservaId);
    
    this.fecharModal();
    this.router.navigate(['/reservas', reservaId, 'editar']);
  }

  // ============= PAGAMENTO PRÉ-RESERVA =============
  abrirModalPagamento(): void {
    if (!this.reservaSelecionada) return;
    
    console.log('💳 Abrindo modal de pagamento para reserva:', this.reservaSelecionada.id);
    
    this.http.get<any>(`http://localhost:8080/api/reservas/${this.reservaSelecionada.id}`).subscribe({
      next: (reserva) => {
        this.pagPreReservaValor = reserva.totalHospedagem;
        this.pagPreReservaFormaPagamento = '';
        this.pagPreReservaObs = '';
        
        this.modalDetalhes = false;
        this.modalPagamento = true;
      },
      error: (err: any) => {
        console.error('❌ Erro ao carregar reserva:', err);
        alert('Erro ao carregar dados da reserva');
      }
    });
  }

  fecharModalPagamento(): void {
    this.modalPagamento = false;
    this.pagPreReservaValor = 0;
    this.pagPreReservaFormaPagamento = '';
    this.pagPreReservaObs = '';
  }

  confirmarPagamentoPreReserva(): void {
    if (!this.reservaSelecionada) return;

    if (!this.pagPreReservaFormaPagamento) {
      alert('⚠️ Selecione uma forma de pagamento');
      return;
    }

    if (this.pagPreReservaValor <= 0) {
      alert('⚠️ Valor inválido');
      return;
    }

    const dto = {
      reservaId: this.reservaSelecionada.id,
      valor: this.pagPreReservaValor,
      formaPagamento: this.pagPreReservaFormaPagamento,
      observacao: this.pagPreReservaObs || undefined
    };

    console.log('💳 Processando pagamento de pré-reserva:', dto);

    this.http.post('http://localhost:8080/api/pagamentos/pre-reserva', dto).subscribe({
      next: () => {
        alert('✅ Pagamento registrado! Reserva ativada com sucesso!');
        this.fecharModalPagamento();
        
        this.reservaSelecionada = null;
        this.apartamentoSelecionado = null;
        this.dataSelecionada = '';
        
        this.carregarMapa();
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        
        let mensagemErro = 'Erro ao processar pagamento';
        
        if (err.error) {
          if (typeof err.error === 'string') {
            mensagemErro = err.error;
          } else if (err.error.message) {
            mensagemErro = err.error.message;
          } else if (err.error.erro) {
            mensagemErro = err.error.erro;
          }
        }
        
        alert('❌ Erro: ' + mensagemErro);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }
}