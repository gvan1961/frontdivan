import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa } from '../../models/empresa.model';

@Component({
  selector: 'app-empresa-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Empresas</h1>
        <button class="btn-primary" (click)="novo()">+ Nova Empresa</button>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="Buscar empresa..."
          [(ngModel)]="filtro"
          (input)="filtrar()"
        />
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && empresasFiltradas.length === 0" class="empty">
        Nenhuma empresa encontrada
      </div>

      <div class="table-container" *ngIf="!loading && empresasFiltradas.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nome da Empresa</th>
              <th>CNPJ</th>
              <th>Contato</th>
              <th>Celular</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let empresa of empresasFiltradas">
              <td>{{ empresa.nomeEmpresa }}</td>
              <td>{{ empresa.cnpj }}</td>
              <td>{{ empresa.contato }}</td>
              <td>{{ empresa.celular }}</td>
              <td>
                <button class="btn-edit" (click)="editar(empresa.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(empresa.id!)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .search-box {
      margin-bottom: 20px;
    }

    .search-box input {
      width: 100%;
      max-width: 400px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .loading, .empty {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .btn-edit, .btn-delete {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-right: 5px;
    }

    .btn-edit {
      background: #28a745;
      color: white;
    }

    .btn-edit:hover {
      background: #218838;
    }

    .btn-delete {
      background: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background: #c82333;
    }
  `]
})
export class EmpresaListaApp implements OnInit {
  private empresaService = inject(EmpresaService);
  private router = inject(Router);

  empresas: Empresa[] = [];
  empresasFiltradas: Empresa[] = [];
  filtro = '';
  loading = true;

  ngOnInit(): void {
    this.carregarEmpresas();
  }

  carregarEmpresas(): void {
    this.empresaService.getAll().subscribe({
      next: (data) => {
        this.empresas = data;
        this.empresasFiltradas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empresas', err);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.empresasFiltradas = this.empresas.filter(e =>
      e.nomeEmpresa.toLowerCase().includes(termo) ||
      e.cnpj.includes(termo) ||
      e.contato.toLowerCase().includes(termo)
    );
  }

  novo(): void {
    this.router.navigate(['/empresas/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/empresas/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir esta empresa?')) {
      this.empresaService.delete(id).subscribe({
        next: () => {
          this.carregarEmpresas();
        },
        error: (err) => {
          console.error('Erro ao excluir empresa', err);
          alert('Erro ao excluir empresa');
        }
      });
    }
  }
}