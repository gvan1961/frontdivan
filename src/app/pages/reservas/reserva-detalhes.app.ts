import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface DescontoSimples {
  id: number;
  valor: number;
  motivo: string;
  dataHoraDesconto: string;
}

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
  descontos?: DescontoSimples[];
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
  
  <!-- ✅ LINHA DE DESCONTOS COM BOTÃO ADICIONAR -->
  <div class="info-item-com-botao">
    <div class="info-item">
      <span class="label">Descontos:</span>
      <span class="value valor-positivo">- R$ {{ calcularTotalDescontos() }}</span>
    </div>
    <button 
      *ngIf="reserva.status === 'ATIVA'"
      class="btn-mini btn-desconto"
      (click)="abrirModalDesconto()"
      title="Adicionar desconto">
      ➕
    </button>
  </div>
  
  <!-- ✅ LISTA DE DESCONTOS APLICADOS -->
  <div *ngIf="reserva.descontos && reserva.descontos.length > 0" class="lista-descontos">
    <div *ngFor="let desc of reserva.descontos" class="desconto-item">
      <span class="desconto-valor">- R$ {{ formatarMoeda(desc.valor) }}</span>
      <span class="desconto-motivo">{{ desc.motivo || 'Sem motivo' }}</span>
      <button 
        *ngIf="reserva.status === 'ATIVA'"
        class="btn-remover-desc"
        (click)="removerDesconto(desc.id)"
        title="Remover este desconto">
        🗑️
      </button>
    </div>
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
                <th *ngIf="reserva.status === 'ATIVA'">Ações</th>
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
                <td *ngIf="reserva.status === 'ATIVA'">
                  <button 
                    *ngIf="extrato.statusLancamento === 'PRODUTO' && extrato.totalLancamento > 0"
                    class="btn-estornar"
                    (click)="abrirModalEstorno(extrato)"
                    title="Estornar este lançamento">
                    ❌ Estornar
                  </button>
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
            <!-- BOTÃO IMPRIMIR CHECK-IN -->
            <button class="btn-acao btn-checkin" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="imprimirCheckin()">
              🖨️ Imprimir Check-in
            </button>

            <!-- BOTÃO COMANDA DE CONSUMO -->
            <button class="btn-acao btn-comanda" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirComanda()">
              🏨 Comanda de Consumo
            </button>

            <!-- BOTÃO REGISTRAR PAGAMENTO -->
            <button class="btn-acao btn-pagamento" 
                    *ngIf="reserva.status === 'ATIVA' && (reserva.totalApagar || 0) > 0"
                    (click)="abrirModalPagamento()">
              💳 Registrar Pagamento
            </button>
            
            <!-- BOTÃO ADICIONAR CONSUMO -->
            <button class="btn-acao btn-consumo" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalConsumo()">
              🛒 Adicionar Consumo
            </button>
            
            <!-- BOTÃO TRANSFERIR APARTAMENTO -->
            <button class="btn-acao btn-transferir" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="abrirModalTransferencia()">
              🔄 Transferir Apartamento
            </button>
            
            <!-- BOTÃO FINALIZAR (INTELIGENTE - Paga ou Faturada) -->
            <button class="btn-acao" 
                    *ngIf="reserva.status === 'ATIVA'"
                    [ngClass]="{
                      'btn-finalizar-paga': (reserva.totalApagar || 0) === 0,
                      'btn-finalizar': (reserva.totalApagar || 0) > 0
                    }"
                    (click)="finalizarCheckout()">
              {{ (reserva.totalApagar || 0) === 0 ? '💚 Finalizar Paga' : '✅ Finalizar Faturada' }}
            </button>
            
            <!-- BOTÃO IMPRIMIR RECIBO/FATURA -->
            <button class="btn-acao btn-recibo" 
                    *ngIf="reserva.status === 'FINALIZADA'"
                    (click)="imprimirRecibo()">
              📄 {{ (reserva.totalApagar || 0) > 0 ? 'Imprimir Fatura' : 'Imprimir Recibo' }}
            </button>
            
            <!-- BOTÃO CANCELAR RESERVA -->
            <button class="btn-acao btn-cancelar" 
                    *ngIf="reserva.status === 'ATIVA'"
                    (click)="cancelarReserva()">
              ❌ Cancelar Reserva
            </button>
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

        <!-- MODAL ESTORNO -->
        <div class="modal-overlay" *ngIf="modalEstorno" (click)="fecharModalEstorno()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>❌ Estornar Lançamento</h2>
            
            <div class="info-box info-box-alerta">
              <p><strong>⚠️ ATENÇÃO:</strong></p>
              <p>Esta ação criará um lançamento de estorno negativo no extrato.</p>
              <p>O produto será devolvido ao estoque.</p>
            </div>

            <div class="info-box" *ngIf="extratoParaEstornar">
              <p><strong>Lançamento a estornar:</strong></p>
              <p>{{ extratoParaEstornar.descricao }}</p>
              <p><strong>Quantidade:</strong> {{ extratoParaEstornar.quantidade }}</p>
              <p><strong>Valor:</strong> R$ {{ formatarMoeda(extratoParaEstornar.totalLancamento) }}</p>
            </div>

            <div class="campo">
              <label>Motivo do Estorno *</label>
              <textarea [(ngModel)]="motivoEstorno" rows="3"
                        placeholder="Ex: Produto lançado errado, quantidade incorreta, etc."
                        required></textarea>
              <small>Obrigatório - Informe o motivo do estorno para auditoria</small>
            </div>

            <div class="campo">
              <label>
                <input type="checkbox" [(ngModel)]="criarLancamentoCorreto">
                Criar lançamento correto automaticamente
              </label>
              <small>Marque se deseja já lançar o produto correto</small>
            </div>

            <div *ngIf="criarLancamentoCorreto" class="secao-correcao">
              <h3>📝 Dados do Lançamento Correto</h3>
              
              <div class="campo">
                <label>Produto Correto *</label>
                <select [(ngModel)]="produtoCorretoId">
                  <option value="0">Selecione um produto...</option>
                  <option *ngFor="let produto of produtos" [value]="produto.id">
                    {{ produto.nomeProduto }} - R$ {{ formatarMoeda(produto.valorVenda) }} 
                    (Estoque: {{ produto.quantidade }})
                  </option>
                </select>
              </div>

              <div class="campo">
                <label>Quantidade Correta *</label>
                <input type="number" [(ngModel)]="quantidadeCorreta" min="1">
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancelar-modal" (click)="fecharModalEstorno()">
                Cancelar
              </button>
              <button class="btn-confirmar btn-estornar-confirmar" (click)="confirmarEstorno()">
                ✅ Confirmar Estorno
              </button>
            </div>
          </div>
        </div>

      </div>    

      <!-- MODAL DESCONTO -->
       <div class="modal-overlay" *ngIf="modalDesconto" (click)="fecharModalDesconto()">
       <div class="modal-content" (click)="$event.stopPropagation()">
    <h2>💰 Aplicar Desconto</h2>
    
    <div class="info-box">
      <p><strong>Total da Hospedagem:</strong> R$ {{ formatarMoeda(reserva?.totalHospedagem) }}</p>
      <p><strong>Já Recebido:</strong> R$ {{ formatarMoeda(reserva?.totalRecebido) }}</p>
      <p><strong>Saldo Atual:</strong> R$ {{ formatarMoeda(reserva?.totalApagar) }}</p>
    </div>

    <div class="campo">
      <label>Valor do Desconto (R$) *</label>
      <input type="number" [(ngModel)]="valorDesconto" step="0.01" min="0" 
             [max]="reserva?.totalHospedagem || 0"
             placeholder="0,00">
      <small>Máximo: R$ {{ formatarMoeda(reserva?.totalHospedagem) }}</small>
    </div>

    <div class="campo" *ngIf="valorDesconto > 0">
      <div class="info-box" style="background: #d4edda; border-color: #28a745;">
        <p style="color: #155724;"><strong>Novo Total:</strong> R$ {{ formatarMoeda((reserva?.totalHospedagem || 0) - valorDesconto) }}</p>
        <p style="color: #155724;"><strong>Novo Saldo:</strong> R$ {{ formatarMoeda((reserva?.totalHospedagem || 0) - valorDesconto - (reserva?.totalRecebido || 0)) }}</p>
      </div>
    </div>

    <div class="campo">
      <label>Motivo do Desconto</label>
      <textarea [(ngModel)]="motivoDesconto" rows="3"
                placeholder="Ex: Desconto promocional, cortesia, problema na hospedagem, etc."></textarea>
      <small>Opcional - Informe o motivo do desconto para controle</small>
    </div>

    <div class="modal-footer">
      <button class="btn-cancelar-modal" (click)="fecharModalDesconto()">
        Cancelar
      </button>
      <button class="btn-confirmar" (click)="confirmarDesconto()">
        💰 Aplicar Desconto
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

    .status-pre_reserva {
      background: #d1ecf1;
      color: #0c5460;
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

    .badge-produto {
      background: #fff3cd;
      color: #856404;
    }

    .badge-estorno {
      background: #f8d7da;
      color: #721c24;
    }

    /* BOTÃO ESTORNAR NA TABELA */
    .btn-estornar {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-estornar:hover {
      background: #c0392b;
      transform: scale(1.05);
    }

    /* COLUNA DE AÇÕES NA TABELA */
    .tabela-extrato th:last-child,
    .tabela-extrato td:last-child {
      text-align: center;
      width: 120px;
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

    .btn-comanda {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

    .btn-finalizar-paga {
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
    }

    .btn-recibo {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      color: white;
    }

    .btn-cancelar {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
    }

    /* BOTÕES DE DESCONTO */
.btn-desconto {
  background: #28a745 !important;
}

.btn-desconto:hover {
  background: #218838 !important;
}

.btn-remover-desconto {
  background: #dc3545 !important;
}

.btn-remover-desconto:hover {
  background: #c82333 !important;
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

    /* INFO BOX ALERTA */
    .info-box-alerta {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .info-box-alerta p {
      color: #856404;
    }

    .info-box-alerta p:first-child {
      font-weight: bold;
      margin-bottom: 10px;
    }

    /* SEÇÃO DE CORREÇÃO */
    .secao-correcao {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      border-left: 4px solid #2196f3;
    }

    .secao-correcao h3 {
      margin: 0 0 15px 0;
      color: #1976d2;
      font-size: 1.1em;
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

    /* BOTÃO CONFIRMAR ESTORNO */
    .btn-estornar-confirmar {
      background: #e74c3c !important;
    }

    .btn-estornar-confirmar:hover {
      background: #c0392b !important;
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

      /* LISTA DE DESCONTOS */
.lista-descontos {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #28a745;
}

.desconto-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: white;
  border-radius: 4px;
  border-left: 2px solid #28a745;
}

.desconto-item:last-child {
  margin-bottom: 0;
}

.desconto-valor {
  font-weight: bold;
  color: #28a745;
  min-width: 80px;
}

.desconto-motivo {
  flex: 1;
  margin: 0 10px;
  font-size: 0.9em;
  color: #666;
}

.btn-remover-desc {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}

.btn-remover-desc:hover {
  background: #c82333;
  transform: scale(1.1);
}
    }
  `]
})

export class ReservaDetalhesApp implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService); 

  reserva: ReservaDetalhes | null = null;
  reservaId: number = 0;
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

  // ESTORNO
  modalEstorno = false;
  extratoParaEstornar: any = null;
  motivoEstorno = '';
  criarLancamentoCorreto = false;
  produtoCorretoId = 0;
  quantidadeCorreta = 1;

  // DESCONTO
modalDesconto = false;
valorDesconto = 0;
motivoDesconto = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservaId = Number(id);
      this.carregarReserva(this.reservaId);
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
      },
      error: (err: any) => {
        console.error('❌ Erro:', err);
        this.erro = err.error?.message || 'Erro ao carregar reserva';
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }

  abrirComanda(): void {
    if (this.reservaId) {
      this.router.navigate(['/comanda-consumo', this.reservaId]);
    } else {
      alert('⚠️ Erro: ID da reserva não encontrado');
    }
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

  // ============= IMPRIMIR CHECK-IN =============
  imprimirCheckin(): void {
    if (!this.reserva) return;
    
    const htmlImpressao = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ficha de Check-in - Reserva #${this.reserva.id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 9px; 
            width: 80mm; 
            margin: 0; 
            padding: 5mm;
            line-height: 1.3;
          }
          .cabecalho { text-align: left; margin-bottom: 8px; }
          .cabecalho h1 { font-size: 13px; margin: 0 0 2px 0; letter-spacing: 1px; }
          .cnpj, .endereco { font-size: 8px; margin: 1px 0; }
          .separador { text-align: center; margin: 6px 0; font-size: 8px; }
          .titulo-documento { text-align: left; margin: 8px 0; }
          .titulo-documento h2 { font-size: 10px; margin: 0; }
          .numero-reserva { font-size: 9px; font-weight: bold; margin: 3px 0; }
          .data-emissao { font-size: 8px; margin: 2px 0; }
          .secao { margin: 8px 0; }
          .secao h3 { font-size: 9px; margin: 0 0 5px 0; text-decoration: underline; }
          .secao p { margin: 3px 0; font-size: 8px; line-height: 1.3; }
          .linha-valor { 
            display: flex; 
            justify-content: space-between;
            margin: 3px 0; 
            font-size: 8px; 
            padding-right: 20mm;
          }
          .linha-valor.destaque { font-size: 9px; font-weight: bold; margin: 5px 0; }
          .assinatura { margin-top: 15px; text-align: center; }
          .texto-assinatura { font-size: 8px; margin: 2px 0; }
          .linha-assinatura { 
            border-top: 1px solid #000; 
            margin: 12px 20mm 4px 20mm;
            width: auto;
          }
          .label-assinatura { font-size: 7px; margin: 2px 0; }
          .rodape { text-align: left; margin-top: 12px; font-size: 8px; }
          .rodape p { margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <h1>HOTEL DI VAN</h1>
          <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
          <p class="endereco">Arapiraca - AL</p>
          <div class="separador">================================</div>
        </div>

        <div class="titulo-documento">
          <h2>FICHA DE CHECK-IN</h2>
          <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
          <p class="data-emissao">${this.dataAtualCompleta()}</p>
        </div>

        <div class="separador">================================</div>

        <div class="secao">
          <h3>DADOS DO HOSPEDE</h3>
          <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
          <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Nao informado'}</p>
        </div>

        <div class="separador">- - - - - - - - - - - - - - - -</div>

        <div class="secao">
          <h3>INFORMACOES DA RESERVA</h3>
          <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
          <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
          <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
          <p><strong>Diarias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
          <p><strong>Hospedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
        </div>

        <div class="separador">- - - - - - - - - - - - - - - -</div>

        <div class="secao">
          <h3>VALORES</h3>
          <div class="linha-valor">
            <span>Valor da Diaria:</span>
            <span>R$ ${this.formatarMoeda(this.reserva.valorDiaria)}</span>
          </div>
          <div class="linha-valor destaque">
            <span>Total Estimado:</span>
            <span>R$ ${this.formatarMoeda(this.reserva.totalDiaria)}</span>
          </div>
        </div>

        <div class="separador">================================</div>

        <div class="assinatura">
          <p class="texto-assinatura">Declaro estar ciente das condicoes</p>
          <p class="texto-assinatura">da reserva e dos valores cobrados.</p>
          <div class="linha-assinatura"></div>
          <p class="label-assinatura">Assinatura do Hospede</p>
          <div class="linha-assinatura"></div>
          <p class="label-assinatura">Data: ____/____/________</p>
        </div>

        <div class="rodape">
          <p>Obrigado pela preferencia!</p>
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

  // ============= RECIBO/FATURA =============
  imprimirRecibo(): void {
    if (!this.reserva) return;

    const temSaldo = (this.reserva.totalApagar || 0) > 0;
    
    if (temSaldo) {
      console.log('🔸 Gerando FATURA');
      this.gerarFatura();
    } else {
      console.log('🔸 Gerando RECIBO');
      this.gerarRecibo();
    }
  }

 gerarRecibo(): void {
  if (!this.reserva) return;

  // ✅ CALCULAR TOTAL COM DESCONTO
  const totalComDesconto = (this.reserva.totalHospedagem || 0) - (this.reserva.desconto || 0);

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
          font-size: 10px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: left; margin-bottom: 8px; }
        .cabecalho h1 { font-size: 14px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 9px; margin: 2px 0; }
        .separador { text-align: center; margin: 6px 0; font-size: 10px; }
        .titulo-documento { text-align: left; margin: 8px 0; }
        .titulo-documento h2 { font-size: 11px; margin: 0; }
        .numero-reserva { font-size: 10px; font-weight: bold; margin: 4px 0; }
        .data-emissao { font-size: 8px; margin: 2px 0; }
        .secao { margin: 8px 0; }
        .secao h3 { font-size: 10px; margin: 0 0 6px 0; text-decoration: underline; }
        .secao p { margin: 3px 0; font-size: 9px; line-height: 1.3; }
        .linha-valor { display: flex; justify-content: space-between; margin: 4px 0; font-size: 9px; }
        .linha-valor.total { font-size: 11px; font-weight: bold; margin: 6px 0; }
        .declaracao { text-align: left; margin: 12px 0; font-size: 9px; }
        .declaracao p { margin: 2px 0; }
        .assinatura { margin-top: 15px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 12px 15px 4px 15px; }
        .label-assinatura { font-size: 8px; margin: 2px 0; }
        .rodape { text-align: left; margin-top: 12px; font-size: 9px; }
        .rodape p { margin: 2px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">================================</div>
      </div>

      <div class="titulo-documento">
        <h2>RECIBO DE PAGAMENTO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">================================</div>

      <div class="secao">
        <h3>DADOS DO HOSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Nao informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERIODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diarias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hospedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">================================</div>

      <div class="secao">
        <h3>DISCRIMINACAO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diarias (${this.reserva.quantidadeDiaria}x):</span>
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
        <div class="separador">================================</div>
        <div class="linha-valor total">
          <span>TOTAL PAGO:</span>
          <span>R$ ${this.formatarMoeda(totalComDesconto)}</span>
        </div>
      </div>

      <div class="separador">================================</div>

      <div class="declaracao">
        <p>Recebi(emos) de ${this.reserva.cliente?.nome}</p>
        <p>a importancia de <strong>R$ ${this.formatarMoeda(totalComDesconto)}</strong></p>
        <p>referente a hospedagem no periodo citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Obrigado pela preferencia!</p>
        <p>Volte sempre!</p>
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
          font-size: 10px; 
          width: 80mm; 
          margin: 0; 
          padding: 5mm;
        }
        .cabecalho { text-align: left; margin-bottom: 8px; }
        .cabecalho h1 { font-size: 14px; margin: 0; letter-spacing: 2px; }
        .cnpj, .endereco { font-size: 9px; margin: 2px 0; }
        .separador { text-align: center; margin: 6px 0; font-size: 10px; }
        .titulo-documento { text-align: left; margin: 8px 0; }
        .titulo-documento h2 { font-size: 11px; margin: 0; }
        .numero-reserva { font-size: 10px; font-weight: bold; margin: 4px 0; }
        .data-emissao { font-size: 8px; margin: 2px 0; }
        .secao { margin: 8px 0; }
        .secao h3 { font-size: 10px; margin: 0 0 6px 0; text-decoration: underline; }
        .secao p { margin: 3px 0; font-size: 9px; line-height: 1.3; }
        .linha-valor { display: flex; justify-content: space-between; margin: 4px 0; font-size: 9px; }
        .linha-valor.subtotal { font-weight: bold; margin-top: 6px; }
        .linha-valor.total { font-size: 11px; font-weight: bold; margin: 6px 0; }
        .declaracao { text-align: left; margin: 12px 0; font-size: 9px; }
        .declaracao p { margin: 2px 0; }
        .assinatura { margin-top: 15px; text-align: center; }
        .linha-assinatura { border-top: 1px solid #000; margin: 12px 15px 4px 15px; }
        .label-assinatura { font-size: 8px; margin: 2px 0; }
        .rodape { text-align: left; margin-top: 12px; font-size: 9px; }
        .rodape p { margin: 2px 0; }
        .destaque-apagar { background: #000; color: #fff; padding: 6px; text-align: center; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="cabecalho">
        <h1>HOTEL DI VAN</h1>
        <p class="cnpj">CNPJ: 07.757.726/0001-12</p>
        <p class="endereco">Arapiraca - AL</p>
        <div class="separador">================================</div>
      </div>

      <div class="titulo-documento">
        <h2>FATURA - PAGAMENTO FATURADO</h2>
        <p class="numero-reserva">Reserva Nº ${this.reserva.id}</p>
        <p class="data-emissao">${this.dataAtualCompleta()}</p>
      </div>

      <div class="separador">================================</div>

      <div class="secao">
        <h3>DADOS DO HOSPEDE</h3>
        <p><strong>Nome:</strong> ${this.reserva.cliente?.nome}</p>
        <p><strong>CPF:</strong> ${this.formatarCPF(this.reserva.cliente?.cpf)}</p>
        <p><strong>Telefone:</strong> ${this.reserva.cliente?.celular || this.reserva.cliente?.telefone || 'Nao informado'}</p>
      </div>

      <div class="separador">- - - - - - - - - - - - - - - -</div>

      <div class="secao">
        <h3>PERIODO DA HOSPEDAGEM</h3>
        <p><strong>Apartamento:</strong> ${this.reserva.apartamento?.numeroApartamento}</p>
        <p><strong>Check-in:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckin)}</p>
        <p><strong>Check-out:</strong> ${this.formatarDataCompleta(this.reserva.dataCheckout)}</p>
        <p><strong>Total de Diarias:</strong> ${this.reserva.quantidadeDiaria} dia(s)</p>
        <p><strong>Hospedes:</strong> ${this.reserva.quantidadeHospede} pessoa(s)</p>
      </div>

      <div class="separador">================================</div>

      <div class="secao">
        <h3>DISCRIMINACAO DE VALORES</h3>
        <div class="linha-valor">
          <span>Diarias (${this.reserva.quantidadeDiaria}x):</span>
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
        <div class="separador">- - - - - - - - - - - - - - - -</div>
        <div class="linha-valor subtotal">
          <span>Subtotal:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}</span>
        </div>
        ${(this.reserva.totalRecebido || 0) > 0 ? `
          <div class="linha-valor">
            <span>Ja Recebido:</span>
            <span>- R$ ${this.formatarMoeda(this.reserva.totalRecebido)}</span>
          </div>
        ` : ''}
        <div class="separador">================================</div>
        <div class="linha-valor total">
          <span>VALOR A PAGAR:</span>
          <span>R$ ${this.formatarMoeda(this.reserva.totalApagar)}</span>
        </div>
      </div>

      <div class="destaque-apagar">
        <p style="margin: 0; font-size: 10px; font-weight: bold;">
          VALOR A PAGAR: R$ ${this.formatarMoeda(this.reserva.totalApagar)}
        </p>
      </div>

      <div class="separador">================================</div>

      <div class="declaracao">
        <p>O Sr(a). ${this.reserva.cliente?.nome}</p>
        <p>devera pagar a importancia de</p>
        <p><strong>R$ ${this.formatarMoeda(this.reserva.totalApagar)}</strong></p>
        <p>referente a hospedagem no periodo citado.</p>
      </div>

      <div class="assinatura">
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Assinatura do Hospede</p>
        <div class="linha-assinatura"></div>
        <p class="label-assinatura">Hotel Di Van</p>
        <p class="label-assinatura">Data: ${this.dataAtualSimples()}</p>
      </div>

      <div class="rodape">
        <p>Esta fatura devera ser paga</p>
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
  console.log('═══════════════════════════════════════════');
  console.log('💰 INICIANDO SALVAMENTO DE PAGAMENTO');
  console.log('═══════════════════════════════════════════');
  
  if (!this.reserva) {
    console.error('❌ Reserva não encontrada');
    alert('Reserva não encontrada');
    return;
  }

  if (!this.pagFormaPagamento) {
    console.error('❌ Forma de pagamento não selecionada');
    alert('Selecione uma forma de pagamento');
    return;
  }

  if (this.pagValor <= 0) {
    console.error('❌ Valor inválido:', this.pagValor);
    alert('Valor inválido');
    return;
  }

  if (this.pagValor > (this.reserva.totalApagar || 0)) {
    console.error('❌ Valor maior que saldo:', this.pagValor, '>', this.reserva.totalApagar);
    alert(`Valor maior que saldo (R$ ${(this.reserva.totalApagar || 0).toFixed(2)})`);
    return;
  }

  // ✅ PEGAR O ID DO USUÁRIO LOGADO
  const usuarioId = this.authService.getUsuarioId();
  console.log('👤 Usuario ID:', usuarioId);

  const dto = {
    reservaId: this.reserva.id,
    valor: this.pagValor,
    formaPagamento: this.pagFormaPagamento,
    observacao: this.pagObs || undefined
  };

  console.log('📦 DTO preparado:', dto);

  const url = `http://localhost:8080/api/pagamentos?usuarioId=${usuarioId}`;
  console.log('🌐 URL da requisição:', url);

  // ✅ ADICIONAR usuarioId COMO QUERY PARAMETER
  this.http.post(url, dto).subscribe({
    next: (response: any) => {
      console.log('═══════════════════════════════════════════');
      console.log('✅ RESPOSTA DO BACKEND:');
      console.log('═══════════════════════════════════════════');
      console.log('📊 Response completo:', response);
      console.log('✔️ Sucesso:', response.sucesso);
      console.log('💰 Pagamento:', response.pagamento);
      
      if (response.sucesso || response.pagamento) {
        alert('✅ Pagamento registrado com sucesso!');
        this.fecharModalPagamento();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }
      } else {
        alert('⚠️ ' + (response.mensagem || 'Pagamento registrado, mas sem confirmação'));
      }
    },
    error: (err: any) => {
      console.log('═══════════════════════════════════════════');
      console.error('❌ ERRO AO REGISTRAR PAGAMENTO');
      console.log('═══════════════════════════════════════════');
      console.error('📊 Erro completo:', err);
      console.error('🔢 Status Code:', err.status);
      console.error('📝 Status Text:', err.statusText);
      console.error('🌐 URL:', err.url);
      console.error('📋 Headers:', err.headers);
      
      if (err.error) {
        console.error('💥 Corpo do erro (error):', err.error);
        console.error('📄 Tipo do erro:', typeof err.error);
        
        if (typeof err.error === 'object') {
          console.error('🔍 Erro em JSON:', JSON.stringify(err.error, null, 2));
        }
      }
      
      console.error('📨 Message:', err.message);
      console.log('═══════════════════════════════════════════');
      
      let mensagemErro = 'Erro ao registrar pagamento';
      
      // ✅ TRATAMENTO ESPECÍFICO PARA CAIXA FECHADO
      if (err.status === 403 && err.error?.tipo === 'CAIXA_FECHADO') {
        alert('⚠️ CAIXA FECHADO!\n\n' + err.error.erro + '\n\nAbra o caixa antes de fazer pagamentos.');
        return;
      }
      
      // ✅ TRATAMENTO PARA ERRO DE CONEXÃO
      if (err.status === 0) {
        alert('❌ Erro de conexão!\n\nVerifique se o backend está rodando em http://localhost:8080');
        return;
      }
      
      // ✅ TRATAMENTO PARA ERRO DE AUTENTICAÇÃO
      if (err.status === 401) {
        alert('⚠️ Não autorizado!\n\nFaça login novamente.');
        this.router.navigate(['/login']);
        return;
      }
      
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

  calcularTotalDescontos(): string {
  if (!this.reserva?.descontos || this.reserva.descontos.length === 0) {
    return '0,00';
  }
  const total = this.reserva.descontos.reduce((sum, desc) => sum + desc.valor, 0);
  return this.formatarMoeda(total);
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
  finalizarCheckout(): void {
    if (!this.reserva) return;

    const temSaldo = (this.reserva.totalApagar || 0) > 0;
    
    if (temSaldo) {
      this.finalizarReservaFaturada();
    } else {
      this.finalizarReservaPaga();
    }
  }

  finalizarReservaFaturada(): void {
    if (!this.reserva) return;

    const saldoDevedor = this.reserva.totalApagar || 0;

    const confirmacao = confirm(
      `⚠️ FINALIZAR FATURADA?\n\n` +
      `Saldo devedor: R$ ${this.formatarMoeda(saldoDevedor)}\n\n` +
      `✅ Reserva será finalizada\n` +
      `🧹 Apartamento irá para LIMPEZA\n` +
      `💳 Valor será enviado para Contas a Receber`
    );

    if (!confirmacao) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/finalizar`, {}).subscribe({
      next: () => {
        alert('✅ Reserva finalizada! Valor enviado para Contas a Receber.');
        this.carregarReserva(this.reserva!.id);
        
        setTimeout(() => {
          const imprimir = confirm('📄 Deseja imprimir a FATURA agora?');
          if (imprimir) {
            this.gerarFatura();
          }
        }, 500);
      },
      error: (err: any) => {
        let mensagemErro = 'Erro ao finalizar reserva';
        
        if (err.error && err.error.erro) {
          mensagemErro = err.error.erro;
        } else if (err.error && err.error.message) {
          mensagemErro = err.error.message;
        }
        
        alert(mensagemErro);
      }
    });
  }

  finalizarReservaPaga(): void {
    if (!this.reserva) return;

    const confirmacao = confirm(
      `💚 FINALIZAR PAGA?\n\n` +
      `Total: R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}\n` +
      `Recebido: R$ ${this.formatarMoeda(this.reserva.totalRecebido)}\n\n` +
      `✅ Reserva será finalizada\n` +
      `🧹 Apartamento irá para LIMPEZA`
    );

    if (!confirmacao) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reserva.id}/finalizar-paga`, {}).subscribe({
      next: () => {
        alert('✅ Reserva finalizada com sucesso!');
        this.carregarReserva(this.reserva!.id);
        
        setTimeout(() => {
          const imprimir = confirm('📄 Deseja imprimir o RECIBO agora?');
          if (imprimir) {
            this.gerarRecibo();
          }
        }, 500);
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
      }
    });
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

  // ============= ESTORNO =============
  abrirModalEstorno(extrato: any): void {
    this.extratoParaEstornar = extrato;
    this.motivoEstorno = '';
    this.criarLancamentoCorreto = false;
    this.produtoCorretoId = 0;
    this.quantidadeCorreta = 1;
    
    // Carregar produtos disponíveis
    this.carregarProdutosDisponiveis();
    
    this.modalEstorno = true;
  }

  fecharModalEstorno(): void {
    this.modalEstorno = false;
    this.extratoParaEstornar = null;
  }

  confirmarEstorno(): void {
    if (!this.extratoParaEstornar) {
      alert('⚠️ Erro: Lançamento não encontrado');
      return;
    }

    if (!this.motivoEstorno || this.motivoEstorno.trim() === '') {
      alert('⚠️ Motivo do estorno é obrigatório');
      return;
    }

    if (this.criarLancamentoCorreto) {
      if (this.produtoCorretoId === 0) {
        alert('⚠️ Selecione o produto correto');
        return;
      }
      if (this.quantidadeCorreta <= 0) {
        alert('⚠️ Quantidade correta deve ser maior que zero');
        return;
      }
    }

    const confirmacao = confirm(
      `⚠️ CONFIRMA O ESTORNO?\n\n` +
      `Lançamento: ${this.extratoParaEstornar.descricao}\n` +
      `Valor: R$ ${this.formatarMoeda(this.extratoParaEstornar.totalLancamento)}\n` +
      `Motivo: ${this.motivoEstorno}\n\n` +
      `Esta ação será registrada para auditoria.`
    );

    if (!confirmacao) return;

    const request: any = {
      extratoId: this.extratoParaEstornar.id,
      motivo: this.motivoEstorno,
      criarLancamentoCorreto: this.criarLancamentoCorreto
    };

    if (this.criarLancamentoCorreto) {
      request.correcao = {
        produtoId: this.produtoCorretoId,
        quantidade: this.quantidadeCorreta
      };
    }

    this.http.post('http://localhost:8080/api/estornos/consumo-apartamento', request).subscribe({
      next: (response: any) => {
        alert('✅ Estorno realizado com sucesso!');
        this.fecharModalEstorno();
        if (this.reserva) {
          this.carregarReserva(this.reserva.id);
        }    


      },
      error: (err: any) => {
        console.error('❌ Erro no estorno:', err);
        alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
      }
    });
  }

  // ============= DESCONTO =============
abrirModalDesconto(): void {
  this.valorDesconto = 0;
  this.motivoDesconto = '';
  this.modalDesconto = true;

}

fecharModalDesconto(): void {
  this.modalDesconto = false;
}

confirmarDesconto(): void {
  if (!this.reserva) {
    alert('⚠️ Reserva não encontrada');
    return;
  }

  if (this.valorDesconto <= 0) {
    alert('⚠️ Valor do desconto deve ser maior que zero');
    return;
  }

  const totalDescontosAtual = this.reserva.descontos ? 
    this.reserva.descontos.reduce((sum, d) => sum + d.valor, 0) : 0;
  
  const novoTotalDescontos = totalDescontosAtual + this.valorDesconto;

  if (novoTotalDescontos > (this.reserva.totalHospedagem || 0)) {
    alert('⚠️ Total de descontos não pode ser maior que o total da hospedagem');
    return;
  }

  const novoTotal = (this.reserva.totalHospedagem || 0) - novoTotalDescontos;
  const novoSaldo = novoTotal - (this.reserva.totalRecebido || 0);

  const confirmacao = confirm(
    `💰 CONFIRMA APLICAÇÃO DO DESCONTO?\n\n` +
    `Valor do Desconto: R$ ${this.formatarMoeda(this.valorDesconto)}\n` +
    `Descontos Atuais: R$ ${this.formatarMoeda(totalDescontosAtual)}\n` +
    `Novo Total de Descontos: R$ ${this.formatarMoeda(novoTotalDescontos)}\n` +
    `Total da Hospedagem: R$ ${this.formatarMoeda(this.reserva.totalHospedagem)}\n` +
    `Novo Saldo: R$ ${this.formatarMoeda(novoSaldo)}\n\n` +
    `${this.motivoDesconto ? 'Motivo: ' + this.motivoDesconto : ''}`
  );

  if (!confirmacao) return;

  const usuarioId = this.authService.getUsuarioId();

  const dto = {
    reservaId: this.reserva.id,
    valor: this.valorDesconto,
    motivo: this.motivoDesconto || 'Desconto aplicado',
    usuarioId: usuarioId
  };

  this.http.post(`http://localhost:8080/api/descontos`, dto).subscribe({
    next: (response: any) => {
      alert('✅ Desconto aplicado com sucesso!');
      this.fecharModalDesconto();
      if (this.reserva) {
        this.carregarReserva(this.reserva.id);
      }
    },
    error: (err: any) => {
      console.error('❌ Erro ao aplicar desconto:', err);
      alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
    }
  });
}

removerDesconto(descontoId: number): void {
  if (!this.reserva) return;

  const desc = this.reserva.descontos?.find(d => d.id === descontoId);
  if (!desc) return;

  const confirmacao = confirm(
    `⚠️ CONFIRMA REMOÇÃO DO DESCONTO?\n\n` +
    `Valor: R$ ${this.formatarMoeda(desc.valor)}\n` +
    `Motivo: ${desc.motivo || 'Sem motivo'}\n\n` +
    `Este desconto será removido permanentemente.`
  );

  if (!confirmacao) return;

  const usuarioId = this.authService.getUsuarioId();

  this.http.delete(
    `http://localhost:8080/api/descontos/${descontoId}?usuarioId=${usuarioId}`
  ).subscribe({
    next: (response: any) => {
      alert('✅ Desconto removido com sucesso!');
      if (this.reserva) {
        this.carregarReserva(this.reserva.id);
      }
    },
    error: (err: any) => {
      console.error('❌ Erro ao remover desconto:', err);
      alert('❌ Erro: ' + (err.error?.erro || err.error?.message || err.message));
    }
  });
}
}