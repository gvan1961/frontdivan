import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-categoria-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Categorias</h1>
        <button class="btn-primary" (click)="novo()">+ Nova Categoria</button>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="Buscar categoria..."
          [(ngModel)]="filtro"
          (input)="filtrar()"
        />
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && categoriasFiltradas.length === 0" class="empty">
        Nenhuma categoria encontrada
      </div>

      <div class="table-container" *ngIf="!loading && categoriasFiltradas.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let categoria of categoriasFiltradas">
              <td>{{ categoria.nome }}</td>
              <td>{{ categoria.descricao || '-' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(categoria.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(categoria.id!)">Excluir</button>
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
export class CategoriaListaApp implements OnInit {
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);

  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  filtro = '';
  loading = true;

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categoriasFiltradas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(c =>
      c.nome.toLowerCase().includes(termo)
    );
  }

  novo(): void {
    this.router.navigate(['/categorias/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/categorias/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir esta categoria?')) {
      this.categoriaService.delete(id).subscribe({
        next: () => {
          this.carregarCategorias();
        },
        error: (err) => {
          console.error('Erro ao excluir categoria', err);
          alert('Erro ao excluir categoria');
        }
      });
    }
  }
}