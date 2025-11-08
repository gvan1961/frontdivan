import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { EmpresaRequest } from '../../models/empresa.model';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Empresa' : 'Nova Empresa' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Nome da Empresa *</label>
            <input type="text" [(ngModel)]="empresa.nomeEmpresa" name="nomeEmpresa" required />
          </div>

          <div class="form-group">
            <label>CNPJ *</label>
            <input type="text" [(ngModel)]="empresa.cnpj" name="cnpj" required 
                   (input)="formatarCnpj()" maxlength="18" 
                   placeholder="00.000.000/0000-00" />
          </div>

          <div class="form-group">
            <label>Contato *</label>
            <input type="text" [(ngModel)]="empresa.contato" name="contato" required />
          </div>

          <div class="form-group">
            <label>Celular *</label>
            <input type="text" [(ngModel)]="empresa.celular" name="celular" required 
                   (input)="formatarCelular()" maxlength="15" 
                   placeholder="(00) 00000-0000" />
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

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
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
export class EmpresaFormApp implements OnInit {
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  empresa: EmpresaRequest = {
    nomeEmpresa: '',
    cnpj: '',
    contato: '',
    celular: ''
  };

  loading = false;
  errorMessage = '';
  isEdit = false;
  empresaId?: number;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.empresaId = +params['id'];
        this.carregarEmpresa(this.empresaId);
      }
    });
  }

  carregarEmpresa(id: number): void {
    this.empresaService.getById(id).subscribe({
      next: (data) => {
        this.empresa = {
          nomeEmpresa: data.nomeEmpresa,
          cnpj: data.cnpj,
          contato: data.contato,
          celular: data.celular
        };
      },
      error: (err) => {
        console.error('Erro ao carregar empresa', err);
        this.errorMessage = 'Erro ao carregar empresa';
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const empresaRequest: EmpresaRequest = {
      nomeEmpresa: this.empresa.nomeEmpresa,
      cnpj: this.empresa.cnpj,
      contato: this.empresa.contato,
      celular: this.empresa.celular
    };

    console.log('📤 Enviando empresa:', empresaRequest);

    const request = this.isEdit
      ? this.empresaService.update(this.empresaId!, empresaRequest)
      : this.empresaService.create(empresaRequest);

    request.subscribe({
      next: () => {
        console.log('✅ Empresa salva com sucesso!');
        this.router.navigate(['/empresas']);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ ERRO COMPLETO:', err);
        console.error('   Status:', err.status);
        console.error('   Mensagem:', err.error);
        
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Acesso não autorizado. Verifique suas permissões.';
        } else {
          this.errorMessage = err.error?.message || 'Erro ao salvar empresa';
        }
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.empresa.nomeEmpresa || !this.empresa.cnpj || 
        !this.empresa.contato || !this.empresa.celular) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return false;
    }
    return true;
  }

  formatarCnpj(): void {
    if (!this.empresa.cnpj) return;
    
    // Remove tudo que não é número
    let cnpj = this.empresa.cnpj.replace(/\D/g, '');
    
    // Adiciona a formatação: 00.000.000/0000-00
    if (cnpj.length > 2) {
      cnpj = cnpj.substring(0, 2) + '.' + cnpj.substring(2);
    }
    if (cnpj.length > 6) {
      cnpj = cnpj.substring(0, 6) + '.' + cnpj.substring(6);
    }
    if (cnpj.length > 10) {
      cnpj = cnpj.substring(0, 10) + '/' + cnpj.substring(10);
    }
    if (cnpj.length > 15) {
      cnpj = cnpj.substring(0, 15) + '-' + cnpj.substring(15, 17);
    }
    
    this.empresa.cnpj = cnpj;
  }

  formatarCelular(): void {
    if (!this.empresa.celular) return;
    
    // Remove tudo que não é número
    let celular = this.empresa.celular.replace(/\D/g, '');
    
    // Adiciona a formatação: (00) 00000-0000
    if (celular.length > 0) {
      celular = '(' + celular;
    }
    if (celular.length > 3) {
      celular = celular.substring(0, 3) + ') ' + celular.substring(3);
    }
    if (celular.length > 10) {
      celular = celular.substring(0, 10) + '-' + celular.substring(10, 14);
    }
    
    this.empresa.celular = celular;
  }

  voltar(): void {
    this.router.navigate(['/empresas']);
  }
}