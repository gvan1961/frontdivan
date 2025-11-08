import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ReservaService } from '../../services/reserva.service';

interface ReservaLista {
  id: number;
  cliente?: {
    nome: string;
    cpf: string;
  };
  apartamento?: {
    numeroApartamento: string;
  };
  dataCheckin: string;
  dataCheckout: string;
  totalHospedagem: number;
  status: string;
}

@Component({
  selector: 'app-reserva-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-lista">
      <div class="header">
        <h1>📋 Reservas</h1>
        <button class="btn-novo" (click)="novaReserva()">
          ➕ Nova Reserva
        </button>
      </div>

      <!-- FILTROS -->
      <div class="filtros">
        <button 
          [class.active]="filtroStatus === ''"
          (click)="filtrarPorStatus('')">
          Todas
        </button>
        <button 
          [class.active]="filtroStatus === 'ATIVA'"
          (click)="filtrarPorStatus('ATIVA')">
          Ativas
        </button>
        <button 
          [class.active]="filtroStatus === 'FINALIZADA'"
          (click)="filtrarPorStatus('FINALIZADA')">
          Finalizadas
        </button>
        <button 
          [class.active]="filtroStatus === 'CANCELADA'"
          (click)="filtrarPorStatus('CANCELADA')">
          Canceladas
        </button>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando reservas...</p>
      </div>

      <!-- TABELA -->
      <div *ngIf="!loading" class="tabela-container">
        <table>
          <thead>
            <tr>
              <th>#ID</th>
              <th>Cliente</th>
              <th>Apartamento</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="reservasFiltradas.length === 0">
              <td colspan="8" class="sem-dados">
                Nenhuma reserva encontrada
              </td>
            </tr>
            <tr *ngFor="let reserva of reservasFiltradas">
              <td>{{ reserva.id }}</td>
              <td>{{ reserva.cliente?.nome || 'N/A' }}</td>
              <td>
                <span class="numero-apt">{{ reserva.apartamento?.numeroApartamento || 'N/A' }}</span>
              </td>
              <td>{{ formatarData(reserva.dataCheckin) }}</td>
              <td>{{ formatarData(reserva.dataCheckout) }}</td>
              <td>R$ {{ formatarMoeda(reserva.totalHospedagem) }}</td>
              <td>
                <span [class]="'badge-status status-' + reserva.status.toLowerCase()">
                  {{ reserva.status }}
                </span>
              </td>
              <td class="acoes">
                <button 
                  class="btn-visualizar" 
                  (click)="verDetalhes(reserva.id)"
                  title="Ver detalhes">
                  👁️
                </button>
                
                <button 
                  *ngIf="reserva.status === 'ATIVA'"
                  class="btn-finalizar" 
                  (click)="confirmarFinalizacao(reserva)"
                  title="Finalizar reserva">
                  ✅
                </button>
                
                <button 
                  *ngIf="reserva.status === 'ATIVA'"
                  class="btn-cancelar" 
                  (click)="confirmarCancelamento(reserva)"
                  title="Cancelar reserva">
                  ❌
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL FINALIZAR -->
      <div class="modal-overlay" *ngIf="modalFinalizar" (click)="fecharModalFinalizar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>✅ Finalizar Reserva</h2>
          <div class="modal-info">
            <p><strong>Reserva:</strong> #{{ reservaParaFinalizar?.id }}</p>
            <p><strong>Cliente:</strong> {{ reservaParaFinalizar?.cliente?.nome }}</p>
            <p><strong>Apartamento:</strong> {{ reservaParaFinalizar?.apartamento?.numeroApartamento }}</p>
          </div>
          
          <div class="aviso" *ngIf="temSaldoDevedor()">
            ⚠️ ATENÇÃO: Existe saldo devedor!
          </div>
          
          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalFinalizar()">
              Cancelar
            </button>
            <button 
              class="btn-confirmar" 
              (click)="finalizarReserva()">
              Confirmar Finalização
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CANCELAR -->
      <div class="modal-overlay" *ngIf="modalCancelar" (click)="fecharModalCancelar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>❌ Cancelar Reserva</h2>
          <div class="modal-info">
            <p><strong>Reserva:</strong> #{{ reservaParaCancelar?.id }}</p>
            <p><strong>Cliente:</strong> {{ reservaParaCancelar?.cliente?.nome }}</p>
            <p><strong>Apartamento:</strong> {{ reservaParaCancelar?.apartamento?.numeroApartamento }}</p>
          </div>
          
          <div class="campo">
            <label>Motivo do Cancelamento *</label>
            <textarea 
              [(ngModel)]="motivoCancelamento"
              rows="4"
              placeholder="Informe o motivo do cancelamento...">
            </textarea>
          </div>
          
          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalCancelar()">
              Voltar
            </button>
            <button class="btn-confirmar" (click)="cancelarReserva()">
              Confirmar Cancelamento
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-lista {
      padding: 20px;
      max-width: 1400px;
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

    .btn-novo {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-novo:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .filtros {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filtros button {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .filtros button:hover {
      border-color: #4CAF50;
      background: #f0f4ff;
    }

    .filtros button.active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #4CAF50;
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

    .tabela-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #2c3e50;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    tr:hover {
      background: #f5f5f5;
    }

    .sem-dados {
      text-align: center;
      color: #7f8c8d;
      font-style: italic;
      padding: 40px;
    }

    .numero-apt {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
    }

    .badge-status {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-ativa {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .status-finalizada {
      background: #bbdefb;
      color: #1565c0;
    }

    .status-cancelada {
      background: #ffcdd2;
      color: #c62828;
    }

    .acoes {
      display: flex;
      gap: 5px;
    }

    .acoes button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.3s ease;
    }

    .btn-visualizar {
      background: #2196F3;
      color: white;
    }

    .btn-finalizar {
      background: #4CAF50;
      color: white;
    }

    .btn-cancelar {
      background: #f44336;
      color: white;
    }

    .acoes button:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }

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
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .modal-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .modal-info p {
      margin: 8px 0;
    }

    .aviso {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      color: #856404;
      font-weight: 600;
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

    .campo textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }

    .campo textarea:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-cancelar-modal,
    .btn-confirmar {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancelar-modal {
      background: #95a5a6;
      color: white;
    }

    .btn-cancelar-modal:hover {
      background: #7f8c8d;
    }

    .btn-confirmar {
      background: #4CAF50;
      color: white;
    }

    .btn-confirmar:hover {
      background: #45a049;
    }
  `]
})
export class ReservaListaApp implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private reservaService = inject(ReservaService);

  reservas: ReservaLista[] = [];
  reservasFiltradas: ReservaLista[] = [];
  loading = false;
  filtroStatus = 'ATIVA';

  modalFinalizar = false;
  modalCancelar = false;
  reservaParaFinalizar: ReservaLista | null = null;
  reservaParaCancelar: ReservaLista | null = null;
  motivoCancelamento = '';

  ngOnInit(): void {
    this.carregarReservas();
  }

 carregarReservas(): void {
  this.loading = true;
  
  this.reservaService.listarTodas().subscribe({
    next: (data: any[]) => {
      this.reservas = data;
      
      // ✅ APLICAR FILTRO INICIAL DE ATIVAS
      this.filtrarPorStatus(this.filtroStatus);
      
      this.loading = false;
      console.log('✅ Reservas carregadas:', data);
    },
    error: (err: any) => {
      console.error('❌ Erro ao carregar reservas:', err);
      this.loading = false;
    }
  });
}

  filtrarPorStatus(status: string): void {
    this.filtroStatus = status;
    
    if (status === '') {
      this.reservasFiltradas = this.reservas;
    } else {
      this.reservasFiltradas = this.reservas.filter(r => r.status === status);
    }
  }

  novaReserva(): void {
    this.router.navigate(['/reservas/novo']);
  }

  verDetalhes(id: number): void {
  console.log('🔵 Navegando para detalhes da reserva:', id);
  this.router.navigate(['/reservas', id]);  // ✅ CORRETO!
}

  confirmarFinalizacao(reserva: ReservaLista): void {
    this.reservaParaFinalizar = reserva;
    this.modalFinalizar = true;
  }

  fecharModalFinalizar(): void {
    this.modalFinalizar = false;
    this.reservaParaFinalizar = null;
  }

  temSaldoDevedor(): boolean {
    return false; // Simplificado
  }

  finalizarReserva(): void {
    if (!this.reservaParaFinalizar) return;

    this.http.patch(`http://localhost:8080/api/reservas/${this.reservaParaFinalizar.id}/finalizar`, {}).subscribe({
      next: () => {
        alert('✅ Reserva finalizada com sucesso!');
        this.fecharModalFinalizar();
        this.carregarReservas();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  confirmarCancelamento(reserva: ReservaLista): void {
    this.reservaParaCancelar = reserva;
    this.motivoCancelamento = '';
    this.modalCancelar = true;
  }

  fecharModalCancelar(): void {
    this.modalCancelar = false;
    this.reservaParaCancelar = null;
    this.motivoCancelamento = '';
  }

  cancelarReserva(): void {
    if (!this.reservaParaCancelar) return;

    if (!this.motivoCancelamento.trim()) {
      alert('⚠️ Informe o motivo do cancelamento');
      return;
    }

    this.http.patch(`http://localhost:8080/api/reservas/${this.reservaParaCancelar.id}/cancelar`, 
      null,
      { params: { motivo: this.motivoCancelamento } }
    ).subscribe({
      next: () => {
        alert('✅ Reserva cancelada com sucesso!');
        this.fecharModalCancelar();
        this.carregarReservas();
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error?.message || err.message));
      }
    });
  }

  formatarData(data: any): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  formatarMoeda(valor: any): string {
    if (valor === null || valor === undefined) return '0,00';
    return Number(valor).toFixed(2).replace('.', ',');
  }
}