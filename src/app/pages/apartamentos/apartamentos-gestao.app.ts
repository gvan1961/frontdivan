import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApartamentoService } from '../../services/apartamento.service';
import { Apartamento } from '../../models/apartamento.model';

@Component({
  selector: 'app-apartamentos-gestao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>🔧 Gestão de Apartamentos</h1>
        <button class="btn-voltar" (click)="voltar()">← Voltar</button>
      </div>

      <!-- CARDS DE RESUMO -->
      <div class="cards-resumo">
        <div class="card card-todos" (click)="filtrarPorStatus('TODOS')">
          <div class="card-icon">🏨</div>
          <h3>Todos</h3>
          <p class="numero">{{ apartamentos.length }}</p>
        </div>

        <div class="card card-disponivel" (click)="filtrarPorStatus('DISPONIVEL')">
          <div class="card-icon">✅</div>
          <h3>Disponíveis</h3>
          <p class="numero">{{ contarPorStatus('DISPONIVEL') }}</p>
        </div>

        <div class="card card-ocupado" (click)="filtrarPorStatus('OCUPADO')">
          <div class="card-icon">🔴</div>
          <h3>Ocupados</h3>
          <p class="numero">{{ contarPorStatus('OCUPADO') }}</p>
        </div>

        <div class="card card-pre-reserva" (click)="filtrarPorStatus('PRE_RESERVA')">
          <div class="card-icon">📅</div>
          <h3>Pré-Reserva</h3>
          <p class="numero">{{ contarPorStatus('PRE_RESERVA') }}</p>
        </div>

        <div class="card card-limpeza" (click)="filtrarPorStatus('LIMPEZA')">
          <div class="card-icon">🧹</div>
          <h3>Limpeza</h3>
          <p class="numero">{{ contarPorStatus('LIMPEZA') }}</p>
        </div>       

        <div class="card card-manutencao" (click)="filtrarPorStatus('MANUTENCAO')">
          <div class="card-icon">🔧</div>
          <h3>Manutenção</h3>
          <p class="numero">{{ contarPorStatus('MANUTENCAO') }}</p>
        </div>

        <div class="card card-bloqueado" (click)="filtrarPorStatus('INDISPONIVEL')">
          <div class="card-icon">🚫</div>
          <h3>Bloqueados</h3>
          <p class="numero">{{ contarPorStatus('INDISPONIVEL') }}</p>
        </div>
      </div>

      <!-- FILTRO ATIVO -->
      <div class="filtro-ativo" *ngIf="statusFiltro !== 'TODOS'">
        <span>Filtro ativo: <strong>{{ obterTextoStatus(statusFiltro) }}</strong></span>
        <button class="btn-limpar-filtro" (click)="filtrarPorStatus('TODOS')">✕ Limpar</button>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando apartamentos...</p>
      </div>

      <!-- LISTA DE APARTAMENTOS -->
      <div *ngIf="!loading" class="apartamentos-grid">
        <div *ngFor="let apt of apartamentosFiltrados" class="apartamento-card">
          <div class="card-header">
            <h2>{{ apt.numeroApartamento }}</h2>
            <span [class]="'badge badge-' + apt.status?.toLowerCase()">
              {{ obterTextoStatus(apt.status || '') }}
            </span>
          </div>

          <div class="card-body">
            <p><strong>Tipo:</strong> {{ apt.tipoApartamentoNome }} - {{ apt.tipoApartamentoDescricao }}</p>
            <p><strong>Capacidade:</strong> {{ apt.capacidade }} pessoa(s)</p>
            <p><strong>Camas:</strong> {{ apt.camasDoApartamento }}</p>
            <p *ngIf="apt.tv"><strong>TV:</strong> {{ apt.tv }}</p>

            <!-- INFORMAÇÕES DA RESERVA -->
            <div class="reserva-info" *ngIf="apt.reservaAtiva">
              <div class="reserva-titulo">📋 Reserva Ativa</div>
              <p><strong>Hóspede:</strong> {{ apt.reservaAtiva.nomeHospede }}</p>
              <p><strong>Qtd:</strong> {{ apt.reservaAtiva.quantidadeHospede }} pessoa(s)</p>
              <p><strong>Check-in:</strong> {{ formatarData(apt.reservaAtiva.dataCheckin) }}</p>
              <p><strong>Check-out:</strong> {{ formatarData(apt.reservaAtiva.dataCheckout) }}</p>
            </div>
          </div>

          <div class="card-actions">

            <!-- ✅ NOVA RESERVA (DISPONÍVEL) -->
            <button 
               *ngIf="apt.status === 'DISPONIVEL'"
                class="btn-action btn-reservar"
                (click)="novaReserva(apt)"
                title="Criar nova reserva">
                 ➕ Nova Reserva
            </button>

            <!-- LIBERAR LIMPEZA -->
            <button 
              *ngIf="apt.status === 'LIMPEZA'"
              class="btn-action btn-success"
              (click)="liberarLimpeza(apt)"
              title="Confirmar limpeza">
              ✅ Liberar Limpeza
            </button>

            <!-- COLOCAR EM MANUTENÇÃO -->
            <button 
              *ngIf="apt.status === 'DISPONIVEL'"
              class="btn-action btn-warning"
              (click)="colocarEmManutencao(apt)"
              title="Colocar em manutenção">
              🔧 Manutenção
            </button>

            <!-- LIBERAR MANUTENÇÃO -->
            <button 
              *ngIf="apt.status === 'MANUTENCAO'"
              class="btn-action btn-success"
              (click)="liberarManutencao(apt)"
              title="Liberar manutenção">
              ✅ Liberar Manutenção
            </button>

            <!-- BLOQUEAR -->
            <button 
              *ngIf="apt.status === 'DISPONIVEL'"
              class="btn-action btn-danger"
              (click)="bloquear(apt)"
              title="Bloquear apartamento">
              🚫 Bloquear
            </button>

            <!-- DESBLOQUEAR -->
            <button 
              *ngIf="apt.status === 'INDISPONIVEL'"
              class="btn-action btn-success"
              (click)="desbloquear(apt)"
              title="Desbloquear apartamento">
              ✅ Desbloquear
            </button>

            <!-- VER RESERVA -->
            <button 
              *ngIf="apt.reservaAtiva"
              class="btn-action btn-info"
              (click)="abrirReserva(apt)"
              title="Ver detalhes da reserva">
              📋 Ver Reserva
            </button>
          </div>
        </div>
      </div>

      <!-- VAZIO -->
      <div *ngIf="!loading && apartamentosFiltrados.length === 0" class="vazio">
        <p>📭 Nenhum apartamento encontrado com o filtro aplicado</p>
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

    h1 {
      color: #2c3e50;
      margin: 0;
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

    /* CARDS DE RESUMO */
    .cards-resumo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }

    .card-todos { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-left-color: #667eea;
    }

    .card-disponivel { border-left-color: #27ae60; }
    .card-ocupado { border-left-color: #e74c3c; }
    .card-pre-reserva { border-left-color: #3498db; }
    .card-limpeza { border-left-color: #f39c12; }
    .card-sujo { border-left-color: #e67e22; }
    .card-manutencao { border-left-color: #9b59b6; }
    .card-bloqueado { border-left-color: #95a5a6; }

    .card-icon {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    .card h3 {
      margin: 10px 0 5px 0;
      font-size: 1em;
      color: #2c3e50;
    }

    .card-todos h3 {
      color: white;
    }

    .card .numero {
      font-size: 2em;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .card-todos .numero {
      color: white;
    }

    /* FILTRO ATIVO */
    .filtro-ativo {
      background: #e3f2fd;
      padding: 12px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-left: 4px solid #3498db;
    }

    .btn-limpar-filtro {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-limpar-filtro:hover {
      background: #c0392b;
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

    /* GRID DE APARTAMENTOS */
    .apartamentos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .apartamento-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .apartamento-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }

    .btn-reservar {
  background: #27ae60;
  color: white;
}

.btn-reservar:hover {
  background: #229954;
}

    .card-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5em;
    }

    .badge {
      padding: 5px 12px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-disponivel { background: #d4edda; color: #155724; }
    .badge-ocupado { background: #f8d7da; color: #721c24; }
    .badge-pre_reserva { background: #d1ecf1; color: #0c5460; }
    .badge-limpeza { background: #fff3cd; color: #856404; }
    .badge-sujo { background: #ffe5d0; color: #8a4b00; }
    .badge-manutencao { background: #e2d5f0; color: #5a3d7a; }
    .badge-indisponivel { background: #d6d8db; color: #383d41; }

    .card-body {
      margin-bottom: 15px;
    }

    .card-body p {
      margin: 8px 0;
      color: #555;
      font-size: 0.9em;
    }

    .reserva-info {
      background: #e3f2fd;
      border-left: 3px solid #3498db;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
    }

    .reserva-titulo {
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .reserva-info p {
      margin: 5px 0;
      font-size: 0.85em;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn-action {
      flex: 1;
      min-width: 120px;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85em;
      transition: all 0.3s;
    }

    .btn-action:hover {
      transform: translateY(-2px);
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover {
      background: #229954;
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover {
      background: #e67e22;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .btn-info {
      background: #3498db;
      color: white;
    }

    .btn-info:hover {
      background: #2980b9;
    }

    .vazio {
      text-align: center;
      padding: 60px;
      color: #7f8c8d;
      font-size: 1.2em;
    }

    @media (max-width: 768px) {
      .cards-resumo {
        grid-template-columns: repeat(2, 1fr);
      }

      .apartamentos-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ApartamentosGestaoApp implements OnInit {
  private apartamentoService = inject(ApartamentoService);
  private router = inject(Router);

  apartamentos: Apartamento[] = [];
  apartamentosFiltrados: Apartamento[] = [];
  statusFiltro = 'TODOS';
  loading = true;

  ngOnInit(): void {
    this.carregarApartamentos();
  }

  carregarApartamentos(): void {
    this.loading = true;
    this.apartamentoService.getAll().subscribe({
      next: (data) => {
        this.apartamentos = data;
        this.aplicarFiltro();
        this.loading = false;
        console.log('🏨 Apartamentos carregados:', data);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar apartamentos:', err);
        this.loading = false;
        alert('Erro ao carregar apartamentos');
      }
    });
  }

  filtrarPorStatus(status: string): void {
    this.statusFiltro = status;
    this.aplicarFiltro();
    console.log(`🔍 Filtrado por ${status}: ${this.apartamentosFiltrados.length} apartamentos`);
  }

  aplicarFiltro(): void {
    if (this.statusFiltro === 'TODOS') {
      this.apartamentosFiltrados = this.apartamentos;
    } else {
      this.apartamentosFiltrados = this.apartamentos.filter(a => a.status === this.statusFiltro);
    }
  }
  
  novaReserva(apartamento: Apartamento): void {
  console.log('➕ Nova reserva para apartamento:', apartamento.numeroApartamento);
  // Navegar para página de nova reserva com apartamento pré-selecionado
  this.router.navigate(['/reservas/novo'], {
    queryParams: { apartamentoId: apartamento.id }
  });
}

  contarPorStatus(status: string): number {
    return this.apartamentos.filter(a => a.status === status).length;
  }

  obterTextoStatus(status: string): string {
    const textos: any = {
      'TODOS': 'Todos',
      'DISPONIVEL': 'Disponível',
      'OCUPADO': 'Ocupado',
      'PRE_RESERVA': 'Pré-Reserva',
      'LIMPEZA': 'Em Limpeza',
      'SUJO': 'Sujo',
      'MANUTENCAO': 'Em Manutenção',
      'INDISPONIVEL': 'Bloqueado'
    };
    return textos[status] || status;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ========== AÇÕES ==========

  liberarLimpeza(apartamento: Apartamento): void {
    const confirmacao = confirm(`✅ Confirmar limpeza do apartamento ${apartamento.numeroApartamento}?`);
    if (!confirmacao) return;

    this.apartamentoService.liberarLimpeza(apartamento.id!).subscribe({
      next: () => {
        alert('✅ Limpeza confirmada!');
        this.carregarApartamentos();
      },
      error: (err) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  colocarEmManutencao(apartamento: Apartamento): void {
    const motivo = prompt('🔧 Motivo da manutenção:');
    if (!motivo) return;

    this.apartamentoService.colocarEmManutencao(apartamento.id!, motivo).subscribe({
      next: () => {
        alert('✅ Apartamento em manutenção!');
        this.carregarApartamentos();
      },
      error: (err) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  liberarManutencao(apartamento: Apartamento): void {
    const confirmacao = confirm(`✅ Liberar apartamento ${apartamento.numeroApartamento} da manutenção?`);
    if (!confirmacao) return;

    this.apartamentoService.liberarManutencao(apartamento.id!).subscribe({
      next: () => {
        alert('✅ Apartamento liberado!');
        this.carregarApartamentos();
      },
      error: (err) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  bloquear(apartamento: Apartamento): void {
    const motivo = prompt('🚫 Motivo do bloqueio:');
    if (!motivo) return;

    this.apartamentoService.bloquear(apartamento.id!, motivo).subscribe({
      next: () => {
        alert('✅ Apartamento bloqueado!');
        this.carregarApartamentos();
      },
      error: (err) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

  desbloquear(apartamento: Apartamento): void {
    const confirmacao = confirm(`✅ Desbloquear apartamento ${apartamento.numeroApartamento}?`);
    if (!confirmacao) return;

    this.apartamentoService.desbloquear(apartamento.id!).subscribe({
      next: () => {
        alert('✅ Apartamento desbloqueado!');
        this.carregarApartamentos();
      },
      error: (err) => {
        alert('❌ Erro: ' + (err.error || err.message));
      }
    });
  }

//  abrirReserva(apartamento: Apartamento): void {
//    if (apartamento.reservaAtiva) {
//      this.router.navigate(['/reservas/detalhes', apartamento.reservaAtiva.reservaId]);
   // }
//  }

abrirReserva(apartamento: any): void {
  // Navegar para nova reserva COM o ID do apartamento
  this.router.navigate(['/reservas/nova'], { 
    queryParams: { apartamentoId: apartamento.id } 
  });
}


  voltar(): void {
    this.router.navigate(['/apartamentos']);
  }
}