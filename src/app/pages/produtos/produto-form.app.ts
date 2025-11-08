import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProdutoRequest } from '../../models/produto.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Produto' : 'Novo Produto' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Nome do Produto *</label>
            <input type="text" [(ngModel)]="produto.nomeProduto" name="nomeProduto" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantidade *</label>
              <input type="number" [(ngModel)]="produto.quantidade" name="quantidade" required min="0" />
            </div>

            <div class="form-group">
              <label>Categoria</label>
              <select [(ngModel)]="produto.categoriaId" name="categoriaId">
                <option [value]="undefined">Selecione uma categoria</option>
                <option *ngFor="let cat of categorias" [value]="cat.id">
                  {{ cat.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor de Compra *</label>
              <input type="number" [(ngModel)]="produto.valorCompra" name="valorCompra" required min="0" step="0.01" />
            </div>

            <div class="form-group">
              <label>Valor de Venda *</label>
              <input type="number" [(ngModel)]="produto.valorVenda" name="valorVenda" required min="0" step="0.01" />
            </div>
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
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

    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus, select:focus {
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProdutoFormApp implements OnInit {
  private produtoService = inject(ProdutoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  produto: ProdutoRequest = {
    nomeProduto: '',
    quantidade: 0,
    valorVenda: 0,
    valorCompra: 0
  };

  categorias: Categoria[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  produtoId?: number;

  ngOnInit(): void {
    this.carregarCategorias();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.produtoId = +params['id'];
        this.carregarProduto(this.produtoId);
      }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
      }
    });
  }

 carregarProduto(id: number): void {
    this.produtoService.getById(id).subscribe({
      next: (data) => {
        console.log('📦 Produto carregado:', data);
        
        this.produto = {
          nomeProduto: data.nomeProduto,
          quantidade: data.quantidade,
          valorVenda: data.valorVenda,
          valorCompra: data.valorCompra,
          categoriaId: data.categoria?.id  // ✅ CORRIGIDO: pegar ID do objeto categoria
        };
        
        console.log('✅ Produto mapeado:', this.produto);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar produto:', err);
        this.errorMessage = 'Erro ao carregar produto';
      }
    });
}

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const produtoRequest: ProdutoRequest = {
      nomeProduto: this.produto.nomeProduto,
      quantidade: this.produto.quantidade,
      valorVenda: this.produto.valorVenda,
      valorCompra: this.produto.valorCompra,
      categoriaId: this.produto.categoriaId || undefined
    };

    console.log('═══════════════════════════════════════');
    console.log('💾 SALVANDO PRODUTO');
    console.log('═══════════════════════════════════════');
    console.log('📌 Modo:', this.isEdit ? 'EDITAR' : 'CRIAR');
    console.log('📌 ID:', this.produtoId);
    console.log('📌 Payload:', JSON.stringify(produtoRequest, null, 2));
    console.log('═══════════════════════════════════════');

    const request = this.isEdit
      ? this.produtoService.update(this.produtoId!, produtoRequest)
      : this.produtoService.create(produtoRequest);

    request.subscribe({
      next: (resultado) => {
        console.log('✅ SUCESSO ao salvar produto:', resultado);
        this.router.navigate(['/produtos']);
      },
      error: (err) => {
        console.error('❌ ERRO ao salvar produto:');
        console.error('   Status:', err.status);
        console.error('   Mensagem:', err.error);
        console.error('   Erro completo:', err);
        
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || 'Erro ao salvar produto';
      }
    });
}

  validarFormulario(): boolean {
    if (!this.produto.nomeProduto || this.produto.quantidade < 0 || 
        this.produto.valorVenda < 0 || this.produto.valorCompra < 0) {
      this.errorMessage = 'Preencha todos os campos obrigatórios corretamente';
      return false;
    }
    return true;
  }

  voltar(): void {
    this.router.navigate(['/produtos']);
  }
}