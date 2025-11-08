// src/app/pages/dashboard/dashboard.app.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="navbar">
        <div class="nav-brand">
          <h2>🏨 Sistema Di Van</h2>
        </div>
        <div class="nav-user">
          <span>Olá, {{ nomeUsuario }}</span>
        </div>
      </div>

      <div class="content">
        <div class="welcome">
          <h1>Bem-vindo ao Sistema Divan</h1>
          <p>Selecione uma opção abaixo para começar</p>
          
          <div class="cards">
            <!-- RESERVAS -->
            <div class="card highlight" (click)="navigate('/reservas')">
              <div class="card-icon">📋</div>
              <h3>Reservas</h3>
              <p>Gerenciar reservas de hóspedes</p>
            </div>

            <!-- ✅ ADICIONAR ESTE CARD -->
              <div class="card limpeza" (click)="navigate('/apartamentos/limpeza')">
                <div class="card-icon">🧹</div>
                  <h3>Limpeza</h3>
                  <p>Gestão de limpeza de apartamentos</p>
              </div>

            <!-- APARTAMENTOS -->
            <div class="card" (click)="navigate('/apartamentos')">
              <div class="card-icon">🏨</div>
              <h3>Apartamentos</h3>
              <p>Gerenciar apartamentos do hotel</p>
            </div>

            <!-- TIPOS APARTAMENTO -->
            <div class="card" (click)="navigate('/tipos-apartamento')">
              <div class="card-icon">🏷️</div>
              <h3>Tipos Apartamento</h3>
              <p>Gerenciar tipos de apartamentos</p>
            </div>

            <!-- DIÁRIAS -->
            <div class="card" (click)="navigate('/diarias')">
              <div class="card-icon">💰</div>
              <h3>Diárias</h3>
              <p>Gerenciar valores de diárias</p>
            </div>

            <!-- CLIENTES -->
            <div class="card" (click)="navigate('/clientes')">
              <div class="card-icon">👥</div>
              <h3>Clientes</h3>
              <p>Gerenciar clientes do sistema</p>
            </div>

            <!-- EMPRESAS -->
            <div class="card" (click)="navigate('/empresas')">
              <div class="card-icon">🏢</div>
              <h3>Empresas</h3>
              <p>Gerenciar empresas cadastradas</p>
            </div>

            <!-- PRODUTOS -->
            <div class="card" (click)="navigate('/produtos')">
              <div class="card-icon">🛒</div>
              <h3>Produtos</h3>
              <p>Gerenciar produtos e estoque</p>
            </div>

            <!-- CATEGORIAS -->
            <div class="card" (click)="navigate('/categorias')">
              <div class="card-icon">🗂️</div>
              <h3>Categorias</h3>
              <p>Gerenciar categorias de produtos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 1.5em;
      font-weight: 700;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .nav-user span {
      font-weight: 500;
    }

    .content {
      padding: 40px 30px;
    }

    .welcome {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 2em;
    }

    .welcome p {
      color: #7f8c8d;
      margin-bottom: 40px;
      font-size: 1.1em;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.12);
      border-color: #667eea;
    }

    .card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }

    .card.highlight:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
    }

    .card.highlight h3,
    .card.highlight p,
    .card.highlight .card-icon {
      color: white;
    }

    .card-icon {
      font-size: 3em;
      margin-bottom: 15px;
    }

    .card h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 1.2em;
      font-weight: 600;
    }

    .card p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.95em;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .cards {
        grid-template-columns: 1fr;
      }

      .content {
        padding: 20px 15px;
      }

      .navbar {
        padding: 15px 20px;
      }

      .nav-brand h2 {
        font-size: 1.2em;
      }

      .card.limpeza {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.card.limpeza h3,
.card.limpeza p,
.card.limpeza .card-icon {
  color: white;
}

.card.limpeza:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 24px rgba(243, 156, 18, 0.3);
}

    }
  `]
})
export class DashboardApp {
  private authService = inject(AuthService);
  private router = inject(Router);

  nomeUsuario = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomeUsuario = user?.nome || 'Usuário';
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}