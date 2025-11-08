import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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

        <a routerLink="/contas-receber" routerLinkActive="active" class="nav-item">
          <span class="icon">💰</span>
          <span class="label">Contas a Receber</span>
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

    .icon {
      font-size: 1.3em;
      width: 24px;
      text-align: center;
    }

    .label {
      font-size: 0.95em;
      font-weight: 500;
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

    .nav-section {
    padding: 15px 20px 5px 20px;
    margin-top: 10px;
  }

  .section-title {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
  }

  .nav-divider {
    height: 1px;
    background: rgba(255,255,255,0.1);
    margin: 10px 20px;
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
export class SidebarComponent {
  private router = inject(Router);

  logout(): void {
    if (confirm('🚪 Deseja realmente sair?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }
}