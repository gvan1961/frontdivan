import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FechamentoCaixaService } from '../services/fechamento-caixa.service';
import { AuthService } from '../services/auth.service';
import { CaixaStateService } from '../services/caixa-state.service'; // ✅ ADICIONAR IMPORT
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>🏨 Di Van</h2>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="icon">📊</span>
          <span class="label">Dashboard</span>
        </a>

        <a routerLink="/reservas" routerLinkActive="active" class="nav-item">
          <span class="icon">📋</span>
          <span class="label">Reservas</span>
        </a>   

        <div class="nav-divider"></div>
        
        <!-- ✅ INDICADOR DE STATUS -->
        <div class="nav-item caixa-status" *ngIf="caixaAberto">
          <span class="icon">✅</span>
          <span class="label">Caixa Aberto</span>
        </div>

        <!-- ✅ LINK PARA ABRIR CAIXA -->
        <a *ngIf="!caixaAberto" 
           routerLink="/abertura-caixa" 
           class="nav-item nav-caixa abrir">
          <span class="icon">🔓</span>
          <span class="label">Abrir Caixa</span>
        </a>

        <!-- ✅ LINK DIRETO (SEM BOTÃO!) PARA MEU CAIXA -->
        <a *ngIf="caixaAberto && caixaAberto.id" 
           [routerLink]="['/fechamento-caixa', caixaAberto.id]"
           class="nav-item nav-caixa visualizar">
          <span class="icon">💰</span>
          <span class="label">Meu Caixa</span>
        </a>

        <div class="nav-divider"></div>

        <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
          <span class="icon">👥</span>
          <span class="label">Clientes</span>
        </a>

        <a routerLink="/apartamentos" routerLinkActive="active" class="nav-item">
          <span class="icon">🏨</span>
          <span class="label">Apartamentos</span>
        </a>

        <a routerLink="/apartamentos/limpeza" routerLinkActive="active" class="nav-item">
          <span class="icon">🧹</span>
          <span class="label">Limpeza</span>
        </a>

        <a routerLink="/tipos-apartamento" routerLinkActive="active" class="nav-item">
          <span class="icon">🏷️</span>
          <span class="label">Tipos</span>
        </a>

        <a routerLink="/diarias" routerLinkActive="active" class="nav-item">
          <span class="icon">💰</span>
          <span class="label">Diárias</span>
        </a>

        <a routerLink="/produtos" routerLinkActive="active" class="nav-item">
          <span class="icon">🛒</span>
          <span class="label">Produtos</span>
        </a>

        <a routerLink="/pdv" routerLinkActive="active" class="nav-item">
         <span class="icon">💳</span>
         <span class="label">PDV - Vendas</span>
        </a>

        <a routerLink="/contas-receber" routerLinkActive="active" class="nav-item">
           <span class="icon">💰</span>
           <span class="label">Contas a Receber</span>
        </a>

        <a routerLink="/categorias" routerLinkActive="active" class="nav-item">
          <span class="icon">🗂️</span>
          <span class="label">Categorias</span>
        </a>

        <a routerLink="/reservas/mapa" routerLinkActive="active" class="nav-item">
          <span class="icon">📅</span>
          <span class="label">Mapa de Reservas</span>
        </a>

        <a routerLink="/empresas" routerLinkActive="active" class="nav-item">
          <span class="icon">🏢</span>
          <span class="label">Empresas</span>
        </a>

        <a routerLink="/comandas-rapidas" 
           routerLinkActive="active" 
           class="nav-item"
           style="color: #ffc107 !important; font-weight: 700;">
           <span class="icon">🍽️</span>
           <span class="label">Comandas Rápidas</span>
        </a>

      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <span class="icon">🚪</span>
          <span class="label">Sair</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 200px;
      background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1);
      z-index: 100;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5em;
      font-weight: 700;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(52, 152, 219, 0.3);
      color: white;
      border-left: 3px solid #3498db;
    }

    .caixa-status {
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
      font-weight: 700;
      cursor: default;
    }

    .caixa-status:hover {
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
    }

    .nav-caixa {
      font-weight: 700;
    }

    .nav-caixa.abrir {
      background: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
    }

    .nav-caixa.abrir:hover {
      background: rgba(46, 204, 113, 0.3);
      color: #27ae60;
    }

    .nav-caixa.visualizar {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
    }

    .nav-caixa.visualizar:hover {
      background: rgba(52, 152, 219, 0.3);
      color: #2980b9;
    }

    .icon {
      font-size: 1.3em;
      width: 24px;
      text-align: center;
    }

    .label {
      font-size: 0.95em;
      font-weight: 500;
    }

    .nav-divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 10px 20px;
    }

    .sidebar-footer {
      padding: 15px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px;
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid rgba(231, 76, 60, 0.3);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(231, 76, 60, 0.4);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .label {
        display: none;
      }

      .sidebar-header h2 {
        font-size: 1.2em;
      }
    }

    @media print {
      .sidebar {
        display: none !important;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private fechamentoCaixaService = inject(FechamentoCaixaService);
  private authService = inject(AuthService);
  private caixaStateService = inject(CaixaStateService); // ✅ ADICIONAR INJECT

  caixaAberto: any = null;
  usuarioId: number = 1;
  
  private verificandoCaixa = false;
  private subscription?: Subscription;
  private caixaAtualizadoSubscription?: Subscription;

  ngOnInit(): void {
    console.log('🔄 Sidebar inicializado - COM EVENTOS');
    
    this.usuarioId = this.authService.getUsuarioId();
    
    // ✅ VERIFICAR APENAS UMA VEZ
    setTimeout(() => {
      this.verificarCaixaAberto();
    }, 1000);

    // ✅ ESCUTAR NOTIFICAÇÕES DE ATUALIZAÇÃO
    this.caixaAtualizadoSubscription = this.caixaStateService.caixaAtualizado$.subscribe(
      (atualizado) => {
        if (atualizado) {
          console.log('🔔 Recebida notificação de atualização do caixa');
          this.verificarCaixaAberto();
          this.caixaStateService.resetarNotificacao(); // ✅ RESETAR
        }
      }
    );
  }

  ngOnDestroy(): void {
    console.log('🛑 Sidebar destruído');
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.caixaAtualizadoSubscription) {
      this.caixaAtualizadoSubscription.unsubscribe();
    }
  }

  verificarCaixaAberto(): void {
    console.log('🔵 Verificando caixa...');
    
    if (this.verificandoCaixa) {
      return;
    }

    this.verificandoCaixa = true;

    this.subscription = this.fechamentoCaixaService.buscarCaixaAberto(this.usuarioId).subscribe({
      next: (caixa) => {
        this.verificandoCaixa = false;

        if (caixa && caixa.id) {
          this.caixaAberto = caixa;
          console.log('✅ Caixa aberto - ID:', caixa.id);
        } else {
          this.caixaAberto = null;
          console.log('📭 Nenhum caixa aberto');
        }
      },
      error: () => {
        this.verificandoCaixa = false;
        this.caixaAberto = null;
        console.log('📭 Nenhum caixa aberto (erro)');
      }
    });
  }

  logout(): void {
    if (confirm('🚪 Deseja realmente sair?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}