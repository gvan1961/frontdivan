import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiariaService } from '../../services/diaria.service';
import { DiariaResponse } from '../../models/diaria.model';

@Component({
  selector: 'app-diaria-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>💰 Diárias</h1>
        <button class="btn-new" (click)="nova()">+ Nova Diária</button>
      </div>

      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="filtro" 
            (input)="filtrar()"
            placeholder="🔍 Buscar por tipo..."
          />
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo Apartamento</th>
              <th>Quantidade Hóspedes</th>
              <th>Valor (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let diaria of diariasFiltradas">
              <td>{{ diaria.id }}</td>
              <td>
                <span class="badge-tipo tipo-{{ diaria.tipoApartamento }}">
                  {{ diaria.tipoApartamento }}
                </span>
                <small>{{ diaria.descricaoTipoApartamento }}</small>
              </td>
              <td>
                <span class="quantidade">{{ diaria.quantidade }} {{ diaria.quantidade === 1 ? 'pessoa' : 'pessoas' }}</span>
              </td>
              <td class="valor">R$ {{ diaria.valor }}</td>
              <td class="actions">
                <button class="btn-edit" (click)="editar(diaria.id)" title="Editar">
                  ✏️
                </button>
                <button class="btn-delete" (click)="confirmarExclusao(diaria)" title="Excluir">
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="diariasFiltradas.length === 0">
              <td colspan="5" class="empty">
                Nenhuma diária cadastrada
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal" *ngIf="showDeleteModal" (click)="cancelarExclusao()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>⚠️ Confirmar Exclusão</h3>
          <p>Deseja realmente excluir esta diária?</p>
          <p class="info-delete" *ngIf="diariaParaExcluir">
            <strong>Tipo:</strong> {{ diariaParaExcluir.tipoApartamento }} - {{ diariaParaExcluir.descricaoTipoApartamento }}<br>
            <strong>Quantidade:</strong> {{ diariaParaExcluir.quantidade }} hóspede(s)<br>
            <strong>Valor:</strong> R$ {{ diariaParaExcluir.valor }}
          </p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="cancelarExclusao()">Cancelar</button>
            <button class="btn-confirm" (click)="excluir()">Excluir</button>
          </div>
        </div>
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
      margin-bottom: 30px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .btn-new {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }

    .btn-new:hover {
      background: #218838;
    }

    .filters {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .search-box input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    .badge-tipo {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }

    .tipo-A { background: #ffd700; color: #000; }
    .tipo-B { background: #c0c0c0; color: #000; }
    .tipo-C { background: #cd7f32; color: #fff; }
    .tipo-D { background: #90ee90; color: #000; }

    small {
      display: block;
      color: #666;
      font-size: 12px;
      margin-top: 4px;
    }

    .quantidade {
      font-weight: 500;
      color: #667eea;
    }

    .valor {
      font-weight: 600;
      color: #28a745;
      font-size: 16px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-edit, .btn-delete {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 5px 10px;
      border-radius: 3px;
      transition: all 0.2s;
    }

    .btn-edit:hover {
      background: #e3f2fd;
    }

    .btn-delete:hover {
      background: #ffebee;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 40px !important;
      font-style: italic;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
    }

    .modal-content h3 {
      margin: 0 0 15px 0;
      color: #d32f2f;
    }

    .info-delete {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      font-size: 14px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-cancel, .btn-confirm {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-confirm {
      background: #dc3545;
      color: white;
    }

    .btn-confirm:hover {
      background: #c82333;
    }
  `]
})
export class DiariaListaApp implements OnInit {
  private diariaService = inject(DiariaService);
  private router = inject(Router);

  diarias: DiariaResponse[] = [];
  diariasFiltradas: DiariaResponse[] = [];
  filtro = '';
  showDeleteModal = false;
  diariaParaExcluir: DiariaResponse | null = null;

  ngOnInit(): void {
    console.log('🔵 Inicializando DiariaLista');
    this.carregarDiarias();
  }

  carregarDiarias(): void {
    console.log('📋 Carregando diárias...');
    this.diariaService.getAll().subscribe({
      next: (data) => {
        this.diarias = data;
        this.diariasFiltradas = data;
        console.log('✅ Diárias carregadas:', data.length);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar diárias:', err);
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase();
    this.diariasFiltradas = this.diarias.filter(d =>
      d.tipoApartamento.toLowerCase().includes(termo) ||
      d.descricaoTipoApartamento.toLowerCase().includes(termo) ||
      d.quantidade.toString().includes(termo)
    );
  }

 // nova(): void {
 //   this.router.navigate(['/diarias/novo']);
 // }

 nova(): void {
  console.log('🎯 BOTÃO NOVA DIÁRIA CLICADO!');
  console.log('🔀 Router:', this.router);
  console.log('🔀 Navegando para: /diarias/novo');
  
  this.router.navigate(['/diarias/novo']).then(
    (success) => console.log('✅ Navegação bem-sucedida:', success),
    (error) => console.error('❌ Erro na navegação:', error)
  );
}

  editar(id: number): void {
    this.router.navigate(['/diarias/editar', id]);
  }

  confirmarExclusao(diaria: DiariaResponse): void {
    this.diariaParaExcluir = diaria;
    this.showDeleteModal = true;
  }

  cancelarExclusao(): void {
    this.showDeleteModal = false;
    this.diariaParaExcluir = null;
  }

  excluir(): void {
    if (!this.diariaParaExcluir) return;

    console.log('🗑️ Excluindo diária:', this.diariaParaExcluir.id);
    this.diariaService.delete(this.diariaParaExcluir.id).subscribe({
      next: () => {
        console.log('✅ Diária excluída com sucesso');
        this.carregarDiarias();
        this.cancelarExclusao();
      },
      error: (err) => {
        console.error('❌ Erro ao excluir diária:', err);
        alert('Erro ao excluir diária: ' + (err.error?.message || err.message));
        this.cancelarExclusao();
      }
    });
  }
}