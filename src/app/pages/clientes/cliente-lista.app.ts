import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Clientes</h1>
        <button class="btn-primary" (click)="novo()">+ Novo Cliente</button>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="Buscar cliente..."
          [(ngModel)]="filtro"
          (input)="filtrar()"
        />
      </div>

      <div *ngIf="loading" class="loading">Carregando...</div>

      <div *ngIf="!loading && clientesFiltrados.length === 0" class="empty">
        Nenhum cliente encontrado
      </div>

      <div class="table-container" *ngIf="!loading && clientesFiltrados.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Celular</th>
              <th>Cidade</th>
              <th>Empresa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cliente of clientesFiltrados">
              <td>{{ cliente.nome }}</td>
              <td>{{ cliente.cpf }}</td>
              <td>{{ cliente.celular }}</td>
              <td>{{ cliente.cidade || '-' }}</td>
              <td>{{ cliente.empresa?.nomeEmpresa || '-' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(cliente.id!)">Editar</button>
                <button class="btn-delete" (click)="excluir(cliente.id!)">Excluir</button>
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
export class ClienteListaApp implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtro = '';
  loading = true;

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      c.cpf.includes(termo) ||
      c.celular.includes(termo)
    );
  }

  novo(): void {
    this.router.navigate(['/clientes/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/clientes/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => {
          this.carregarClientes();
        },
        error: (err) => {
          console.error('Erro ao excluir cliente', err);
          alert('Erro ao excluir cliente');
        }
      });
    }
  }
}