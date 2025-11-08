import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContaReceberService, ContaAReceber, PagamentoConta } from '../../services/conta-receber.service';
import { HttpClient } from '@angular/common/http';

interface FiltrosAvancados {
  empresaId?: number;
  clienteId?: number;
  dataCheckInInicio?: string;
  dataCheckInFim?: string;
  dataCheckOutInicio?: string;
  dataCheckOutFim?: string;
  status?: string;
}

@Component({
  selector: 'app-contas-receber-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <h1>💰 Contas a Receber</h1>
        <div class="header-actions">
          <button class="btn btn-filtros" (click)="abrirModalFiltros()">
            🔍 Filtros Avançados
          </button>
          <button class="btn btn-atualizar" (click)="atualizarVencidas()">
            🔄 Atualizar
          </button>
          <button class="btn btn-criar" (click)="abrirModalCriar()">
            ➕ Nova Conta
          </button>
        </div>
      </div>

      <!-- FILTROS ATIVOS -->
      <div class="filtros-ativos" *ngIf="temFiltrosAtivos()">
        <div class="filtro-tag">
          <strong>📌 Filtros Ativos:</strong>
        </div>
        <div class="filtro-tag" *ngIf="filtrosAplicados.empresaId">
          🏢 Empresa: {{ obterNomeEmpresa(filtrosAplicados.empresaId) }}
          <button (click)="removerFiltro('empresaId')">✕</button>
        </div>
        <div class="filtro-tag" *ngIf="filtrosAplicados.clienteId">
          👤 Cliente: {{ obterNomeCliente(filtrosAplicados.clienteId) }}
          <button (click)="removerFiltro('clienteId')">✕</button>
        </div>
        <div class="filtro-tag" *ngIf="filtrosAplicados.dataCheckInInicio && filtrosAplicados.dataCheckInFim">
          📅 Check-in: {{ formatarData(filtrosAplicados.dataCheckInInicio) }} a {{ formatarData(filtrosAplicados.dataCheckInFim) }}
          <button (click)="removerFiltro('checkin')">✕</button>
        </div>
        <div class="filtro-tag" *ngIf="filtrosAplicados.dataCheckOutInicio && filtrosAplicados.dataCheckOutFim">
          📅 Check-out: {{ formatarData(filtrosAplicados.dataCheckOutInicio) }} a {{ formatarData(filtrosAplicados.dataCheckOutFim) }}
          <button (click)="removerFiltro('checkout')">✕</button>
        </div>
        <div class="filtro-tag" *ngIf="filtrosAplicados.status">
          📊 Status: {{ obterTextoStatus(filtrosAplicados.status) }}
          <button (click)="removerFiltro('status')">✕</button>
        </div>
        <button class="btn-limpar-todos" (click)="limparTodosFiltros()">
          🗑️ Limpar Todos
        </button>
      </div>

      <!-- RESUMO -->
      <div class="resumo">
        <div class="card-resumo verde">
          <div class="icone">💵</div>
          <div class="info">
            <span class="label">Total a Receber</span>
            <span class="valor">R$ {{ calcularTotalAReceber() | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="card-resumo amarelo">
          <div class="icone">⚠️</div>
          <div class="info">
            <span class="label">Vencidas</span>
            <span class="valor">{{ contarVencidas() }} conta(s)</span>
          </div>
        </div>

        <div class="card-resumo azul">
          <div class="icone">📋</div>
          <div class="info">
            <span class="label">Filtradas</span>
            <span class="valor">{{ contasFiltradas.length }} conta(s)</span>
          </div>
        </div>

        <div class="card-resumo roxo">
          <div class="icone">💰</div>
          <div class="info">
            <span class="label">Total Filtrado</span>
            <span class="valor">R$ {{ calcularTotalFiltrado() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>

      <!-- TABELA -->
      <div *ngIf="!loading" class="tabela-container">
        <div class="tabela-header">
          <h3>📋 Resultados ({{ contasFiltradas.length }})</h3>
          <button class="btn-imprimir" (click)="imprimirRelatorio()" *ngIf="contasFiltradas.length > 0">
            🖨️ Imprimir
          </button>
        </div>

        <table class="tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Descrição</th>
              <th>Check-in/Check-out</th>
              <th>Valor</th>
              <th>Pago</th>
              <th>Saldo</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th class="no-print">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let conta of contasFiltradas" [class]="'linha-' + conta.status.toLowerCase()">
              <td>{{ conta.id }}</td>
              <td>{{ conta.clienteNome }}</td>
              <td>
                <span *ngIf="conta.empresaNome" class="badge-empresa">
                  🏢 {{ conta.empresaNome }}
                </span>
                <span *ngIf="!conta.empresaNome" class="sem-empresa">-</span>
              </td>
              <td>{{ conta.descricao }}</td>
              <td class="datas">
                <div>✅ {{ formatarData(conta.reserva?.dataCheckin) }}</div>
                <div>📤 {{ formatarData(conta.reserva?.dataCheckout) }}</div>
              </td>
              <td>R$ {{ conta.valor | number:'1.2-2' }}</td>
              <td>R$ {{ conta.valorPago | number:'1.2-2' }}</td>
              <td class="saldo">R$ {{ conta.saldo | number:'1.2-2' }}</td>
              <td>
                {{ formatarData(conta.dataVencimento) }}
                <span *ngIf="conta.diasVencido > 0" class="badge-vencido">
                  {{ conta.diasVencido }} dia(s)
                </span>
              </td>
              <td>
                <span [class]="'badge badge-' + conta.status.toLowerCase()">
                  {{ obterTextoStatus(conta.status) }}
                </span>
              </td>
              <td class="acoes no-print">
                <button 
                  *ngIf="conta.status !== 'PAGA'"
                  class="btn-acao btn-pagar"
                  (click)="abrirModalPagamento(conta)"
                  title="Registrar pagamento">
                  💳
                </button>
                <button 
                  *ngIf="conta.status === 'PAGA'"
                  class="btn-acao btn-excluir"
                  (click)="excluir(conta)"
                  title="Excluir">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot *ngIf="contasFiltradas.length > 0">
            <tr class="total-row">
              <td colspan="5"><strong>TOTAL:</strong></td>
              <td><strong>R$ {{ calcularTotalValor() | number:'1.2-2' }}</strong></td>
              <td><strong>R$ {{ calcularTotalPago() | number:'1.2-2' }}</strong></td>
              <td><strong>R$ {{ calcularTotalSaldo() | number:'1.2-2' }}</strong></td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>

        <div *ngIf="contasFiltradas.length === 0" class="vazio">
          <p>📭 Nenhuma conta encontrada com os filtros aplicados</p>
          <button class="btn" (click)="abrirModalFiltros()">🔍 Ajustar Filtros</button>
        </div>
      </div>

      <!-- MODAL FILTROS AVANÇADOS -->
      <div class="modal-overlay" *ngIf="modalFiltros" (click)="fecharModalFiltros()">
        <div class="modal-content modal-grande" (click)="$event.stopPropagation()">
          <h2>🔍 Filtros Avançados</h2>
          <p class="subtitle">Selecione os critérios desejados para filtrar as contas</p>

          <div class="filtros-grid">
            <!-- EMPRESA -->
            <div class="campo">
              <label>🏢 Empresa</label>
              <select [(ngModel)]="filtrosTemp.empresaId">
                <option [ngValue]="undefined">Todas as empresas</option>
                <option *ngFor="let empresa of empresas" [ngValue]="empresa.id">
                  {{ empresa.nomeEmpresa }}
                </option>
              </select>
            </div>

            <!-- CLIENTE -->
            <div class="campo">
              <label>👤 Cliente</label>
              <select [(ngModel)]="filtrosTemp.clienteId">
                <option [ngValue]="undefined">Todos os clientes</option>
                <option *ngFor="let cliente of clientes" [ngValue]="cliente.id">
                  {{ cliente.nome }}
                </option>
              </select>
            </div>

            <!-- STATUS -->
            <div class="campo">
              <label>📊 Status</label>
              <select [(ngModel)]="filtrosTemp.status">
                <option [ngValue]="undefined">Todos os status</option>
                <option value="EM_ABERTO">Em Aberto</option>
                <option value="VENCIDA">Vencidas</option>
                <option value="PAGA">Pagas</option>
              </select>
            </div>

            <!-- PERÍODO CHECK-IN -->
            <div class="campo campo-duplo">
              <label>📅 Período de Check-in</label>
              <div class="periodo">
                <input type="date" [(ngModel)]="filtrosTemp.dataCheckInInicio" placeholder="De">
                <span>até</span>
                <input type="date" [(ngModel)]="filtrosTemp.dataCheckInFim" placeholder="Até">
              </div>
              <small>Filtra pelas reservas que deram check-in neste período</small>
            </div>

            <!-- PERÍODO CHECK-OUT -->
            <div class="campo campo-duplo">
              <label>📅 Período de Check-out</label>
              <div class="periodo">
                <input type="date" [(ngModel)]="filtrosTemp.dataCheckOutInicio" placeholder="De">
                <span>até</span>
                <input type="date" [(ngModel)]="filtrosTemp.dataCheckOutFim" placeholder="Até">
              </div>
              <small>Filtra pelas reservas que deram/darão check-out neste período</small>
            </div>
          </div>

          <!-- ATALHOS RÁPIDOS -->
          <div class="atalhos">
            <h3>⚡ Atalhos Rápidos</h3>
            <div class="atalhos-btns">
              <button class="btn-atalho" (click)="atalhoMesAtual()">
                📅 Mês Atual
              </button>
              <button class="btn-atalho" (click)="atalhoMesPassado()">
                📅 Mês Passado
              </button>
              <button class="btn-atalho" (click)="atalhoVencidas()">
                ⚠️ Apenas Vencidas
              </button>
              <button class="btn-atalho" (click)="atalhoPagas()">
                ✅ Apenas Pagas
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar" (click)="fecharModalFiltros()">Cancelar</button>
            <button class="btn-limpar" (click)="limparFiltrosTemp()">🗑️ Limpar</button>
            <button class="btn-confirmar" (click)="aplicarFiltrosAvancados()">Aplicar Filtros</button>
          </div>
        </div>
      </div>

      <!-- MODAL CRIAR CONTA -->
      <div class="modal-overlay" *ngIf="modalCriar" (click)="fecharModalCriar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>➕ Nova Conta a Receber</h2>

          <div class="campo">
            <label>Reserva *</label>
            <select [(ngModel)]="novaConta.reservaId">
              <option [ngValue]="0">Selecione uma reserva...</option>
              <option *ngFor="let reserva of reservasDisponiveis" [ngValue]="reserva.id">
                #{{ reserva.id }} - {{ reserva.clienteNome }} - R$ {{ reserva.totalApagar | number:'1.2-2' }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Empresa (opcional)</label>
            <select [(ngModel)]="novaConta.empresaId">
              <option [ngValue]="0">Nenhuma</option>
              <option *ngFor="let empresa of empresas" [ngValue]="empresa.id">
                {{ empresa.nomeEmpresa }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Valor *</label>
            <input type="number" [(ngModel)]="novaConta.valor" step="0.01" min="0.01">
          </div>

          <div class="campo">
            <label>Data de Vencimento *</label>
            <input type="date" [(ngModel)]="novaConta.dataVencimento">
          </div>

          <div class="campo">
            <label>Descrição *</label>
            <textarea [(ngModel)]="novaConta.descricao" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar" (click)="fecharModalCriar()">Cancelar</button>
            <button class="btn-confirmar" (click)="criarConta()">Criar Conta</button>
          </div>
        </div>
      </div>

      

      <!-- MODAL PAGAMENTO -->
      <div class="modal-overlay" *ngIf="modalPagamento" (click)="fecharModalPagamento()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>💳 Registrar Pagamento</h2>

          <div class="info-conta">
            <p><strong>Cliente:</strong> {{ contaSelecionada?.clienteNome }}</p>
            <p><strong>Descrição:</strong> {{ contaSelecionada?.descricao }}</p>
            <p><strong>Saldo:</strong> R$ {{ contaSelecionada?.saldo | number:'1.2-2' }}</p>
          </div>

          <div class="campo">
            <label>Valor a Pagar *</label>
            <input type="number" [(ngModel)]="pagamento.valorPago" step="0.01" min="0.01" 
                   [max]="contaSelecionada?.saldo || 0">
            <small>Máximo: R$ {{ contaSelecionada?.saldo | number:'1.2-2' }}</small>
          </div>

          <div class="campo">
            <label>Data do Pagamento *</label>
            <input type="date" [(ngModel)]="pagamento.dataPagamento">
          </div>

          <div class="campo">
            <label>Forma de Pagamento *</label>
            <select [(ngModel)]="pagamento.formaPagamento">
              <option value="">Selecione...</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="CARTAO_DEBITO">Cartão Débito</option>
              <option value="CARTAO_CREDITO">Cartão Crédito</option>
              <option value="TRANSFERENCIA_BANCARIA">Transferência</option>
            </select>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="pagamento.observacao" rows="3"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar" (click)="fecharModalPagamento()">Cancelar</button>
            <button class="btn-confirmar" (click)="registrarPagamento()">Confirmar Pagamento</button>
          </div>
        </div>
      </div>

          

    </div>

    <!-- ÁREA DE IMPRESSÃO (OCULTA NA TELA) -->
   <div class="print-only">
   <div class="print-header">
    <h1>{{ obterTituloCabecalho() }}</h1>
    <p class="print-subtitle">Relatório de Contas a Receber</p>
    <p class="print-date">{{ obterDataHoraRelatorio() }}</p>
    
    <div class="print-filters" *ngIf="temFiltrosAtivos()">
      <strong>Filtros Aplicados:</strong>
      <span *ngIf="filtrosAplicados.empresaId">Empresa: {{ obterNomeEmpresa(filtrosAplicados.empresaId) }}</span>
      <span *ngIf="filtrosAplicados.clienteId">Cliente: {{ obterNomeCliente(filtrosAplicados.clienteId) }}</span>
      <span *ngIf="filtrosAplicados.status">Status: {{ obterTextoStatus(filtrosAplicados.status) }}</span>
      <span *ngIf="filtrosAplicados.dataCheckOutInicio">Período: {{ formatarData(filtrosAplicados.dataCheckOutInicio) }} a {{ formatarData(filtrosAplicados.dataCheckOutFim) }}</span>
    </div>
  </div>

  <table class="print-table">
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Apto</th>
        <th>Hósp.</th>
        <th>Diár.</th>
        <th>Vlr Diárias</th>
        <th>Consumo</th>
        <th>Total Hosp.</th>
        <th>Recebido</th>
        <th>Desconto</th>
        <th>A Pagar</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let conta of contasFiltradas">
        <td>{{ conta.clienteNome }}</td>
        <td>{{ conta.numeroApartamento || '-' }}</td>
        <td>{{ conta.quantidadeHospede || '-' }}</td>
        <td>{{ conta.quantidadeDiaria || '-' }}</td>
        <td class="valor">{{ formatarMoeda(conta.totalDiaria) }}</td>
        <td class="valor">{{ formatarMoeda(conta.totalConsumo) }}</td>
        <td class="valor">{{ formatarMoeda(conta.totalHospedagem) }}</td>
        <td class="valor">{{ formatarMoeda(conta.totalRecebido) }}</td>
        <td class="valor">{{ formatarMoeda(conta.desconto) }}</td>
        <td class="valor destaque">{{ formatarMoeda(conta.totalApagar) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4"><strong>TOTAIS:</strong></td>
        <td class="valor"><strong>{{ formatarMoeda(calcularTotalGeralDiarias()) }}</strong></td>
        <td class="valor"><strong>{{ formatarMoeda(calcularTotalGeralConsumo()) }}</strong></td>
        <td class="valor"><strong>{{ formatarMoeda(calcularTotalGeralHospedagem()) }}</strong></td>
        <td class="valor"><strong>{{ formatarMoeda(calcularTotalGeralRecebido()) }}</strong></td>
        <td class="valor"><strong>{{ formatarMoeda(calcularTotalGeralDesconto()) }}</strong></td>
        <td class="valor destaque"><strong>{{ formatarMoeda(calcularTotalGeralAPagar()) }}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="print-footer">
    <p>Total de registros: {{ contasFiltradas.length }}</p>
  </div>
</div>

  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      color: white;
    }

    .btn-filtros {
      background: #9b59b6;
    }

    .btn-filtros:hover {
      background: #8e44ad;
    }

    .btn-atualizar {
      background: #3498db;
    }

    .btn-atualizar:hover {
      background: #2980b9;
    }

    .btn-criar {
      background: #27ae60;
    }

    .btn-criar:hover {
      background: #229954;
    }

    /* FILTROS ATIVOS */
    .filtros-ativos {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      background: white;
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      align-items: center;
    }

    .filtro-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filtro-tag button {
      background: none;
      border: none;
      color: #1976d2;
      font-size: 1.2em;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .filtro-tag button:hover {
      color: #c62828;
    }

    .btn-limpar-todos {
      background: #e74c3c;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-limpar-todos:hover {
      background: #c0392b;
    }

    /* RESUMO */
    .resumo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .card-resumo {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .card-resumo.verde { border-left-color: #27ae60; }
    .card-resumo.amarelo { border-left-color: #f39c12; }
    .card-resumo.azul { border-left-color: #3498db; }
    .card-resumo.roxo { border-left-color: #9b59b6; }

    .card-resumo .icone {
      font-size: 2.5em;
    }

    .card-resumo .info {
      display: flex;
      flex-direction: column;
    }

    .card-resumo .label {
      font-size: 0.9em;
      color: #7f8c8d;
      margin-bottom: 5px;
    }

    .card-resumo .valor {
      font-size: 1.3em;
      font-weight: 700;
      color: #2c3e50;
    }

    /* LOADING */
    .loading {
      text-align: center;
      padding: 60px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
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

    /* TABELA */
    .tabela-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tabela-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .tabela-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-imprimir {
      padding: 10px 20px;
      background: #9b59b6;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-imprimir:hover {
      background: #8e44ad;
    }

    .tabela {
      width: 100%;
      border-collapse: collapse;
    }

    .tabela th {
      background: #2c3e50;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 0.9em;
    }

    .tabela td {
      padding: 12px 15px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.9em;
    }

    .tabela tbody tr:hover {
      background: #f5f5f5;
    }

    .linha-vencida {
      background: #ffebee !important;
    }

    .linha-paga {
      opacity: 0.7;
    }

    .datas {
      font-size: 0.85em;
    }

    .datas div {
      padding: 2px 0;
    }

    .badge-empresa {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .sem-empresa {
      color: #bdc3c7;
    }

    .saldo {
      font-weight: 700;
      color: #27ae60;
    }

    .badge {
      padding: 5px 10px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .badge-em_aberto {
      background: #e3f2fd;
      color: #1976d2;
    }

    .badge-vencida {
      background: #ffebee;
      color: #c62828;
    }

    .badge-paga {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .badge-vencido {
      background: #ffebee;
      color: #c62828;
      padding: 3px 8px;
      border-radius: 8px;
      font-size: 0.75em;
      margin-left: 5px;
      display: inline-block;
    }

    .total-row {
      background: #f5f5f5;
      font-weight: 700;
    }

    .total-row td {
      border-top: 2px solid #2c3e50;
      padding: 15px;
    }

    .acoes {
      display: flex;
      gap: 5px;
    }

    .btn-acao {
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2em;
      transition: all 0.3s;
    }

    .btn-pagar {
      background: #27ae60;
      color: white;
    }

    .btn-pagar:hover {
      background: #229954;
      transform: scale(1.1);
    }

    .btn-excluir {
      background: #e74c3c;
      color: white;
    }

    .btn-excluir:hover {
      background: #c0392b;
      transform: scale(1.1);
    }

    .vazio {
      text-align: center;
      padding: 60px;
      color: #7f8c8d;
    }

    .vazio p {
      font-size: 1.2em;
      margin-bottom: 20px;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      min-width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-grande {
      min-width: 800px;
    }

    .modal-content h2 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .subtitle {
      color: #7f8c8d;
      margin-bottom: 30px;
    }

    .filtros-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .campo-duplo {
      grid-column: 1 / -1;
    }

    .info-conta {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .info-conta p {
      margin: 8px 0;
    }

    .campo {
      margin-bottom: 20px;
    }

    .campo label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .campo input,
    .campo select,
    .campo textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      font-family: inherit;
    }

    .campo input:focus,
    .campo select:focus,
    .campo textarea:focus {
      outline: none;
      border-color: #3498db;
    }

    .campo small {
      display: block;
      margin-top: 5px;
      color: #7f8c8d;
      font-size: 0.85em;
    }

    .periodo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .periodo input {
      flex: 1;
    }

    .periodo span {
      color: #7f8c8d;
      font-weight: 600;
    }

    .atalhos {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .atalhos h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 1em;
    }

    .atalhos-btns {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .btn-atalho {
      padding: 10px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-atalho:hover {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-cancelar,
    .btn-limpar,
    .btn-confirmar {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancelar {
      background: #95a5a6;
      color: white;
    }

    .btn-cancelar:hover {
      background: #7f8c8d;
    }

    .btn-limpar {
      background: #e74c3c;
      color: white;
    }

    .btn-limpar:hover {
      background: #c0392b;
    }

    .btn-confirmar {
      background: #27ae60;
      color: white;
    }

    .btn-confirmar:hover {
      background: #229954;
    }

    /* IMPRESSÃO */
    @media print {
      .header-actions,
      .filtros-ativos button,
      .btn-imprimir,
      .no-print {
        display: none !important;
      }

      .tabela-container {
        box-shadow: none;
      }

      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }

    @media (max-width: 768px) {
      .resumo {
        grid-template-columns: 1fr;
      }

      .filtros-grid {
        grid-template-columns: 1fr;
      }

      .atalhos-btns {
        grid-template-columns: 1fr;
      }

      .modal-content {
        min-width: 90%;
      }

      .modal-grande {
        min-width: 90%;
      }

      .tabela-container {
        overflow-x: auto;
      }

      /* ESTILOS DE IMPRESSÃO */
.print-only {
  display: none;
}

@media print {
  /* OCULTAR TELA NORMAL */
  .container > *:not(.print-only) {
    display: none !important;
  }

  /* MOSTRAR ÁREA DE IMPRESSÃO */
  .print-only {
    display: block !important;
    padding: 20px;
  }

  /* CABEÇALHO */
  .print-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #2c3e50;
    padding-bottom: 15px;
  }

  .print-header h1 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 24px;
  }

  .print-subtitle {
    margin: 5px 0;
    color: #7f8c8d;
    font-size: 14px;
  }

  .print-date {
    margin: 5px 0;
    color: #95a5a6;
    font-size: 12px;
  }

  .print-filters {
    margin-top: 15px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 12px;
  }

  .print-filters span {
    display: inline-block;
    margin: 0 10px;
  }

  /* TABELA */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 11px;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .print-table th {
    background-color: #2c3e50;
    color: white;
    font-weight: bold;
    font-size: 10px;
  }

  .print-table td.valor {
    text-align: right;
    font-family: 'Courier New', monospace;
  }

  .print-table td.destaque {
    font-weight: bold;
    background: #f0f0f0;
  }

  .print-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .print-table tfoot tr {
    background-color: #e8e8e8;
    font-weight: bold;
  }

  .print-table tfoot td {
    border-top: 2px solid #2c3e50;
    padding: 12px 8px;
  }

  /* RODAPÉ */
  .print-footer {
    margin-top: 30px;
    text-align: center;
    font-size: 10px;
    color: #7f8c8d;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }

  /* CONFIGURAÇÕES GERAIS */
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  @page {
    margin: 1cm;
  }
} 

    }
  `]
})
export class ContasReceberListaApp implements OnInit {
  private contaReceberService = inject(ContaReceberService);
  private http = inject(HttpClient);
  private router = inject(Router);

  contas: ContaAReceber[] = [];
  contasFiltradas: ContaAReceber[] = [];
  reservas: any[] = [];
  loading = false;

  // FILTROS
  modalFiltros = false;
  filtrosTemp: FiltrosAvancados = {};
  filtrosAplicados: FiltrosAvancados = {};
  empresas: any[] = [];
  clientes: any[] = [];

  // MODAL CRIAR
  modalCriar = false;
  novaConta: any = {
    reservaId: 0,
    empresaId: 0,
    valor: 0,
    dataVencimento: '',
    descricao: ''
  };
  reservasDisponiveis: any[] = [];

  // MODAL PAGAMENTO
  modalPagamento = false;
  contaSelecionada: ContaAReceber | null = null;
  pagamento: PagamentoConta = {
    valorPago: 0,
    dataPagamento: '',
    formaPagamento: '',
    observacao: ''
  };

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;

    // Carregar contas
    this.contaReceberService.listarTodas().subscribe({
      next: (contas) => {
        this.contas = contas;
        
        // Carregar reservas para ter datas de checkin/checkout
        this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe({
          next: (reservas) => {
            this.reservas = reservas;
            
            // Associar reserva às contas
            this.contas.forEach(conta => {
              (conta as any).reserva = reservas.find(r => r.id === conta.reservaId);
            });
            
            this.aplicarFiltros();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        this.loading = false;
        alert('Erro ao carregar contas');
      }
    });

    // Carregar empresas
    this.http.get<any[]>('http://localhost:8080/api/empresas').subscribe({
      next: (data) => this.empresas = data
    });

    // Carregar clientes
    this.http.get<any[]>('http://localhost:8080/api/clientes').subscribe({
      next: (data) => this.clientes = data
    });
  }

  // ========== FILTROS ==========

  abrirModalFiltros(): void {
    this.filtrosTemp = { ...this.filtrosAplicados };
    this.modalFiltros = true;
  }

  fecharModalFiltros(): void {
    this.modalFiltros = false;
  }

  aplicarFiltrosAvancados(): void {
    this.filtrosAplicados = { ...this.filtrosTemp };
    this.aplicarFiltros();
    this.fecharModalFiltros();
    console.log('🔍 Filtros aplicados:', this.filtrosAplicados);
  }

  aplicarFiltros(): void {
    let resultado = [...this.contas];

    // Filtro por Empresa
    if (this.filtrosAplicados.empresaId) {
      const empresaSelecionada = this.empresas.find(e => e.id === this.filtrosAplicados.empresaId);
      resultado = resultado.filter(c => c.empresaNome === empresaSelecionada?.nomeEmpresa);
    }

    // Filtro por Cliente
    if (this.filtrosAplicados.clienteId) {
      const clienteSelecionado = this.clientes.find(c => c.id === this.filtrosAplicados.clienteId);
      resultado = resultado.filter(c => c.clienteNome === clienteSelecionado?.nome);
    }

    // Filtro por Status
    if (this.filtrosAplicados.status) {
      resultado = resultado.filter(c => c.status === this.filtrosAplicados.status);
    }

    // Filtro por Check-in
    if (this.filtrosAplicados.dataCheckInInicio && this.filtrosAplicados.dataCheckInFim) {
      resultado = resultado.filter(c => {
        const reserva = (c as any).reserva;
        if (!reserva) return false;
        const dataCheckin = new Date(reserva.dataCheckin).toISOString().split('T')[0];
        return dataCheckin >= this.filtrosAplicados.dataCheckInInicio! && 
               dataCheckin <= this.filtrosAplicados.dataCheckInFim!;
      });
    }

    // Filtro por Check-out
    if (this.filtrosAplicados.dataCheckOutInicio && this.filtrosAplicados.dataCheckOutFim) {
      resultado = resultado.filter(c => {
        const reserva = (c as any).reserva;
        if (!reserva) return false;
        const dataCheckout = new Date(reserva.dataCheckout).toISOString().split('T')[0];
        return dataCheckout >= this.filtrosAplicados.dataCheckOutInicio! && 
               dataCheckout <= this.filtrosAplicados.dataCheckOutFim!;
      });
    }

    this.contasFiltradas = resultado;
  }

  temFiltrosAtivos(): boolean {
    return Object.keys(this.filtrosAplicados).length > 0 && 
           Object.values(this.filtrosAplicados).some(v => v !== undefined);
  }

  removerFiltro(tipo: string): void {
    if (tipo === 'empresaId') delete this.filtrosAplicados.empresaId;
    if (tipo === 'clienteId') delete this.filtrosAplicados.clienteId;
    if (tipo === 'status') delete this.filtrosAplicados.status;
    if (tipo === 'checkin') {
      delete this.filtrosAplicados.dataCheckInInicio;
      delete this.filtrosAplicados.dataCheckInFim;
    }
    if (tipo === 'checkout') {
      delete this.filtrosAplicados.dataCheckOutInicio;
      delete this.filtrosAplicados.dataCheckOutFim;
    }
    this.aplicarFiltros();
  }

  limparTodosFiltros(): void {
    this.filtrosAplicados = {};
    this.aplicarFiltros();
  }

  limparFiltrosTemp(): void {
    this.filtrosTemp = {};
  }

  // ATALHOS
  atalhoMesAtual(): void {
    const hoje = new Date();
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    this.filtrosTemp.dataCheckOutInicio = primeiro.toISOString().split('T')[0];
    this.filtrosTemp.dataCheckOutFim = ultimo.toISOString().split('T')[0];
  }

  atalhoMesPassado(): void {
    const hoje = new Date();
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const ultimo = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    this.filtrosTemp.dataCheckOutInicio = primeiro.toISOString().split('T')[0];
    this.filtrosTemp.dataCheckOutFim = ultimo.toISOString().split('T')[0];
  }

  atalhoVencidas(): void {
    this.filtrosTemp.status = 'VENCIDA';
  }

  atalhoPagas(): void {
    this.filtrosTemp.status = 'PAGA';
  }

  // ========== UTILITÁRIOS ==========

  obterNomeEmpresa(id: number): string {
    return this.empresas.find(e => e.id === id)?.nomeEmpresa || '';
  }

  obterNomeCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nome || '';
  }

  calcularTotalAReceber(): number {
    return this.contas.filter(c => c.status !== 'PAGA').reduce((sum, c) => sum + c.saldo, 0);
  }

  contarVencidas(): number {
    return this.contas.filter(c => c.status === 'VENCIDA').length;
  }

  calcularTotalFiltrado(): number {
    return this.contasFiltradas.filter(c => c.status !== 'PAGA').reduce((sum, c) => sum + c.saldo, 0);
  }

  calcularTotalValor(): number {
    return this.contasFiltradas.reduce((sum, c) => sum + c.valor, 0);
  }

  calcularTotalPago(): number {
    return this.contasFiltradas.reduce((sum, c) => sum + c.valorPago, 0);
  }

  calcularTotalSaldo(): number {
    return this.contasFiltradas.reduce((sum, c) => sum + c.saldo, 0);
  }

  formatarData(data: any): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  obterTextoStatus(status: string): string {
    const textos: any = {
      'EM_ABERTO': 'Em Aberto',
      'VENCIDA': 'Vencida',
      'PAGA': 'Paga'
    };
    return textos[status] || status;
  }

  imprimirRelatorio(): void {
    window.print();
  }

  atualizarVencidas(): void {
    this.contaReceberService.atualizarVencidas().subscribe({
      next: () => {
        alert('✅ Status atualizado!');
        this.carregarDados();
      },
      error: () => alert('❌ Erro ao atualizar')
    });
  }

  // ========== MODAL CRIAR ==========

  abrirModalCriar(): void {
    this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe({
      next: (data) => {
        this.reservasDisponiveis = data.filter(r => r.status === 'ATIVA' && r.totalApagar > 0);
        this.modalCriar = true;
      }
    });
  }

  fecharModalCriar(): void {
    this.modalCriar = false;
    this.novaConta = {
      reservaId: 0,
      empresaId: 0,
      valor: 0,
      dataVencimento: '',
      descricao: ''
    };
  }

  criarConta(): void {
    if (!this.validarNovaConta()) return;

    const dados: any = {
      reservaId: this.novaConta.reservaId,
      valor: this.novaConta.valor,
      dataVencimento: this.novaConta.dataVencimento,
      descricao: this.novaConta.descricao
    };

    if (this.novaConta.empresaId > 0) {
      dados.empresaId = this.novaConta.empresaId;
    }

    this.contaReceberService.criar(dados).subscribe({
      next: () => {
        alert('✅ Conta criada!');
        this.fecharModalCriar();
        this.carregarDados();
      },
      error: (err) => alert('❌ Erro: ' + (err.error || err.message))
    });
  }

  validarNovaConta(): boolean {
    if (this.novaConta.reservaId === 0) {
      alert('Selecione uma reserva');
      return false;
    }
    if (this.novaConta.valor <= 0) {
      alert('Valor inválido');
      return false;
    }
    if (!this.novaConta.dataVencimento) {
      alert('Informe a data de vencimento');
      return false;
    }
    if (!this.novaConta.descricao.trim()) {
      alert('Informe a descrição');
      return false;
    }
    return true;
  }

  // ========== MODAL PAGAMENTO ==========

  abrirModalPagamento(conta: ContaAReceber): void {
    this.contaSelecionada = conta;
    this.pagamento = {
      valorPago: conta.saldo,
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: '',
      observacao: ''
    };
    this.modalPagamento = true;
  }

  fecharModalPagamento(): void {
    this.modalPagamento = false;
    this.contaSelecionada = null;
  }

  registrarPagamento(): void {
    if (!this.validarPagamento()) return;

    this.contaReceberService.registrarPagamento(this.contaSelecionada!.id, this.pagamento).subscribe({
      next: () => {
        alert('✅ Pagamento registrado!');
        this.fecharModalPagamento();
        this.carregarDados();
      },
      error: (err) => alert('❌ Erro: ' + (err.error || err.message))
    });
  }

  validarPagamento(): boolean {
    if (this.pagamento.valorPago <= 0) {
      alert('Valor inválido');
      return false;
    }
    if (this.pagamento.valorPago > this.contaSelecionada!.saldo) {
      alert('Valor maior que o saldo');
      return false;
    }
    if (!this.pagamento.dataPagamento) {
      alert('Informe a data do pagamento');
      return false;
    }
    if (!this.pagamento.formaPagamento) {
      alert('Selecione a forma de pagamento');
      return false;
    }
    return true;
  }

  excluir(conta: ContaAReceber): void {
    const confirmacao = confirm(`🗑️ Excluir a conta #${conta.id}?\n\nApenas contas PAGAS podem ser excluídas.`);
    if (!confirmacao) return;

    this.contaReceberService.excluir(conta.id).subscribe({
      next: () => {
        alert('✅ Conta excluída!');
        this.carregarDados();
      },
      error: (err) => alert('❌ Erro: ' + (err.error || err.message))
    });
  }

  obterTituloCabecalho(): string {
  if (this.filtrosAplicados.empresaId) {
    const empresa = this.empresas.find(e => e.id === this.filtrosAplicados.empresaId);
    return empresa ? empresa.nomeEmpresa : 'Relatório de Contas a Receber';
  }
  
  if (this.filtrosAplicados.clienteId) {
    const cliente = this.clientes.find(c => c.id === this.filtrosAplicados.clienteId);
    return cliente ? cliente.nome : 'Relatório de Contas a Receber';
  }
  
  return 'Relatório de Contas a Receber';
}

obterDataHoraRelatorio(): string {
  return new Date().toLocaleString('pt-BR');
}

formatarMoeda(valor?: number): string {
  if (!valor) return 'R$ 0,00';
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

calcularTotalGeralDiarias(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.totalDiaria || 0), 0);
}

calcularTotalGeralConsumo(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.totalConsumo || 0), 0);
}

calcularTotalGeralHospedagem(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.totalHospedagem || 0), 0);
}

calcularTotalGeralRecebido(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.totalRecebido || 0), 0);
}

calcularTotalGeralDesconto(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.desconto || 0), 0);
}

calcularTotalGeralAPagar(): number {
  return this.contasFiltradas.reduce((sum, c) => sum + (c.totalApagar || 0), 0);
}

}