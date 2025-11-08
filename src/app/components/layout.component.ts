import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent
    
  ],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      
      <main class="main-content">
        <!-- ✅ ADICIONAR O INDICADOR AQUI -->
            
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: #ecf0f1;
    }

    .main-content {
      flex: 1;
      margin-left: 200px;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
      position: relative;  /* ✅ ADICIONAR para o indicador ficar posicionado corretamente */
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 70px;
      }
    }

    @media print {
      app-sidebar {
        display: none !important;
      }

      .main-content {
        margin-left: 0 !important;
        width: 100% !important;
      }

      .layout {
        background: white !important;
      }
      
      /* ✅ ESCONDER INDICADOR NA IMPRESSÃO */
      app-indicador-caixa {
        display: none !important;
      }
    }
  `]
})
export class LayoutComponent {}