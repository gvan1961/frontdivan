import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoApartamentoService } from '../../services/tipo-apartamento.service';
import { TipoApartamento } from '../../models/tipo-apartamento.model';

@Component({
  selector: 'app-tipo-apartamento-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Tipos de Apartamento</h1>
        <button class="btn-primary" (click)="novo()">+ Novo Tipo</button>
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && tipos.length === 0" class="empty">
        Nenhum tipo de apartamento encontrado
      </div>

      <div class="table-container" *ngIf="!loading && tipos.length > 0">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tipo of tipos">
              <td><strong>{{ tipo.tipo }}</strong></td>
              <td>{{ tipo.descricao || '-' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(tipo.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(tipo.id!)">Excluir</button>
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
      max-width: 1200px;
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
export class TipoApartamentoListaApp implements OnInit {
  private tipoApartamentoService = inject(TipoApartamentoService);
  private router = inject(Router);

  tipos: TipoApartamento[] = [];
  loading = true;

  ngOnInit(): void {
    this.carregarTipos();
  }

  carregarTipos(): void {
    this.tipoApartamentoService.getAll().subscribe({
      next: (data) => {
        this.tipos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de apartamento', err);
        this.loading = false;
      }
    });
  }

  novo(): void {
    this.router.navigate(['/tipos-apartamento/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/tipos-apartamento/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este tipo de apartamento?')) {
      this.tipoApartamentoService.delete(id).subscribe({
        next: () => {
          this.carregarTipos();
        },
        error: (err) => {
          console.error('Erro ao excluir tipo', err);
          alert('Erro ao excluir tipo de apartamento');
        }
      });
    }
  }
}