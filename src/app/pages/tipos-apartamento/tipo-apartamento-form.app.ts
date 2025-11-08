import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoApartamentoService } from '../../services/tipo-apartamento.service';
import { TipoApartamentoRequest } from '../../models/tipo-apartamento.model';

@Component({
  selector: 'app-tipo-apartamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Tipo de Apartamento' : 'Novo Tipo de Apartamento' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Tipo *</label>
            <input type="text" [(ngModel)]="tipo.tipo" name="tipo" required maxlength="1" 
                   placeholder="Ex: A, B, C" />
            <small>Digite apenas uma letra (A, B, C, etc.)</small>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="tipo.descricao" name="descricao" rows="4" 
                      placeholder="Descreva as características deste tipo de apartamento"></textarea>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="voltar()">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="loading">
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
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

    .btn-back {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
    }

    .btn-back:hover {
      background: #5a6268;
    }

    .form-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    small {
      display: block;
      color: #666;
      font-size: 12px;
      margin-top: 5px;
    }

    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    textarea {
      resize: vertical;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    .btn-cancel, .btn-save {
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

    .btn-save {
      background: #667eea;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-save:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class TipoApartamentoFormApp implements OnInit {
  private tipoApartamentoService = inject(TipoApartamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tipo: TipoApartamentoRequest = {
    tipo: '',
    descricao: ''
  };

  loading = false;
  errorMessage = '';
  isEdit = false;
  tipoId?: number;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.tipoId = +params['id'];
        this.carregarTipo(this.tipoId);
      }
    });
  }

  carregarTipo(id: number): void {
    this.tipoApartamentoService.getById(id).subscribe({
      next: (data) => {
        this.tipo = {
          tipo: data.tipo,
          descricao: data.descricao
        };
      },
      error: (err) => {
        console.error('Erro ao carregar tipo', err);
        this.errorMessage = 'Erro ao carregar tipo de apartamento';
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const tipoRequest: TipoApartamentoRequest = {
      tipo: this.tipo.tipo.toUpperCase(),
      descricao: this.tipo.descricao || undefined
    };

    const request = this.isEdit
      ? this.tipoApartamentoService.update(this.tipoId!, tipoRequest)
      : this.tipoApartamentoService.create(tipoRequest);

    request.subscribe({
      next: () => {
        this.router.navigate(['/tipos-apartamento']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao salvar tipo de apartamento';
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.tipo.tipo || this.tipo.tipo.trim().length === 0) {
      this.errorMessage = 'Preencha o tipo do apartamento';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/tipos-apartamento']);
  }
}