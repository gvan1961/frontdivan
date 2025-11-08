import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-produto-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Produtos</h1>
        <button class="btn-primary" (click)="novo()">+ Novo Produto</button>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="Buscar produto..."
          [(ngModel)]="filtro"
          (input)="filtrar()"
        />
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && produtosFiltrados.length === 0" class="empty">
        Nenhum produto encontrado
      </div>

      <div class="table-container" *ngIf="!loading && produtosFiltrados.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Valor Venda</th>
              <th>Valor Compra</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let produto of produtosFiltrados">
              <td>{{ produto.nomeProduto }}</td>
              <td>{{ produto.categoria?.nome || '-' }}</td>
              <td [class.estoque-baixo]="produto.quantidade < 10">{{ produto.quantidade }}</td>
              <td>{{ produto.valorVenda | currency:'BRL' }}</td>
              <td>{{ produto.valorCompra | currency:'BRL' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(produto.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(produto.id!)">Excluir</button>
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

    .estoque-baixo {
      color: #dc3545;
      font-weight: bold;
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
export class ProdutoListaApp implements OnInit {
  private produtoService = inject(ProdutoService);
  private router = inject(Router);

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  filtro = '';
  loading = true;

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.getAll().subscribe({
      next: (data) => {
        this.produtos = data;
        this.produtosFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.produtosFiltrados = this.produtos.filter(p =>
      p.nomeProduto.toLowerCase().includes(termo)
    );
  }

  novo(): void {
    this.router.navigate(['/produtos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/produtos/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este produto?')) {
      this.produtoService.delete(id).subscribe({
        next: () => {
          this.carregarProdutos();
        },
        error: (err) => {
          console.error('Erro ao excluir produto', err);
          alert('Erro ao excluir produto');
        }
      });
    }
  }
}