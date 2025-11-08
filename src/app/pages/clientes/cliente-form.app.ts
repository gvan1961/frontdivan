import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { EmpresaService } from '../../services/empresa.service';
import { ClienteRequest } from '../../models/cliente.model';
import { Empresa } from '../../models/empresa.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEdit ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <div class="form-card">
        <form (ngSubmit)="salvar()">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input type="text" [(ngModel)]="cliente.nome" name="nome" required />
            </div>

            <div class="form-group">
              <label>CPF *</label>
              <input type="text" [(ngModel)]="cliente.cpf" name="cpf" required 
                     (input)="formatarCpf()" maxlength="14" 
                     placeholder="000.000.000-00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Celular *</label>
              <input type="text" [(ngModel)]="cliente.celular" name="celular" required 
                     (input)="formatarCelular()" maxlength="15" 
                     placeholder="(00) 00000-0000" />
            </div>

            <div class="form-group">
              <label>Data de Nascimento *</label>
              <input type="date" [(ngModel)]="dataNascimento" name="dataNascimento" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Endereço</label>
              <input type="text" [(ngModel)]="cliente.endereco" name="endereco" />
            </div>

            <div class="form-group">
              <label>CEP</label>
              <input type="text" [(ngModel)]="cliente.cep" name="cep" 
                     (input)="formatarCep()" maxlength="9" 
                     placeholder="00000-000" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="cliente.cidade" name="cidade" />
            </div>

            <div class="form-group">
              <label>Estado</label>
              <input type="text" [(ngModel)]="cliente.estado" name="estado" maxlength="2" />
            </div>
          </div>

          <div class="form-group">
            <label>Empresa</label>
            <select [(ngModel)]="cliente.empresaId" name="empresaId">
              <option [value]="undefined">Selecione uma empresa</option>
              <option *ngFor="let empresa of empresas" [value]="empresa.id">
                {{ empresa.nomeEmpresa }}
              </option>
            </select>
          </div>

          <!-- ✅ CHECKBOX DE CRÉDITO - APENAS UMA VEZ -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" 
                     [(ngModel)]="cliente.creditoAprovado" 
                     name="creditoAprovado">
              <span class="checkbox-text">✅ Aprovar Crédito (permite reservas faturadas)</span>
            </label>
            <small class="field-help">
              Cliente poderá fazer check-out sem pagar (gera conta a receber)
            </small>
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
      max-width: 1000px;
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
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    input, select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }

    /* ✅ ESTILOS PARA O CHECKBOX */
    .checkbox-group {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      margin-bottom: 20px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      cursor: pointer;
    }

    .checkbox-text {
      color: #2c3e50;
      font-size: 14px;
    }

    .field-help {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      margin-left: 30px;
      font-style: italic;
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
export class ClienteFormApp implements OnInit {
  private clienteService = inject(ClienteService);
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  cliente: ClienteRequest = {
    nome: '',
    cpf: '',
    celular: '',
    dataNascimento: '',
    creditoAprovado: false  // ✅ JÁ ESTÁ AQUI
  };

  dataNascimento = '';
  empresas: Empresa[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  clienteId?: number;

  ngOnInit(): void {
    this.carregarEmpresas();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.clienteId = +params['id'];
        this.carregarCliente(this.clienteId);
      }
    });
  }

  carregarEmpresas(): void {
    this.empresaService.getAll().subscribe({
      next: (data) => {
        this.empresas = data;
      },
      error: (err) => {
        console.error('Erro ao carregar empresas', err);
      }
    });
  }

  carregarCliente(id: number): void {
    this.clienteService.getById(id).subscribe({
      next: (data) => {
        this.cliente = {
          nome: data.nome,
          cpf: data.cpf,
          celular: data.celular,
          endereco: data.endereco,
          cep: data.cep,
          cidade: data.cidade,
          estado: data.estado,
          dataNascimento: data.dataNascimento,
          empresaId: data.empresaId,
          creditoAprovado: data.creditoAprovado || false  // ✅ ADICIONADO
        };
        
        this.dataNascimento = data.dataNascimento.split('T')[0];
      },
      error: (err) => {
        console.error('Erro ao carregar cliente', err);
        this.errorMessage = 'Erro ao carregar cliente';
      }
    });
  }

  salvar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Converter data para ISO 8601
    const dataISO = new Date(this.dataNascimento + 'T00:00:00').toISOString();
    
    // Preparar o objeto para envio
    const clienteRequest: ClienteRequest = {
      nome: this.cliente.nome,
      cpf: this.cliente.cpf,
      celular: this.cliente.celular,
      dataNascimento: dataISO,
      endereco: this.cliente.endereco || undefined,
      cep: this.cliente.cep || undefined,
      cidade: this.cliente.cidade || undefined,
      estado: this.cliente.estado || undefined,
      empresaId: this.cliente.empresaId || undefined,
      creditoAprovado: this.cliente.creditoAprovado || false  // ✅ ADICIONADO
    };

    console.log('==========================================');
    console.log('🔵 MODO:', this.isEdit ? 'EDITAR' : 'CRIAR');
    console.log('🔵 URL:', this.isEdit ? `${this.clienteId}` : 'novo');
    console.log('🔵 PAYLOAD:', JSON.stringify(clienteRequest, null, 2));
    console.log('🔵 Crédito Aprovado:', clienteRequest.creditoAprovado);  // ✅ LOG
    console.log('==========================================');

    const request = this.isEdit
      ? this.clienteService.update(this.clienteId!, clienteRequest)
      : this.clienteService.create(clienteRequest);

    request.subscribe({
      next: () => {
        console.log('✅ Cliente salvo com sucesso!');
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ ERRO COMPLETO:', err);
        console.error('   Status:', err.status);
        console.error('   Mensagem:', err.error);
        console.error('   Headers:', err.headers);
        
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Acesso não autorizado. Verifique suas permissões.';
        } else {
          this.errorMessage = err.error?.message || 'Erro ao salvar cliente';
        }
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.cliente.nome || !this.cliente.cpf || !this.cliente.celular || !this.dataNascimento) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return false;
    }
    return true;
  }

  formatarCep(): void {
    if (!this.cliente.cep) return;
    
    let cep = this.cliente.cep.replace(/\D/g, '');
    
    if (cep.length > 5) {
      cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
    }
    
    this.cliente.cep = cep;
  }

  formatarCpf(): void {
    if (!this.cliente.cpf) return;
    
    let cpf = this.cliente.cpf.replace(/\D/g, '');
    
    if (cpf.length > 3) {
      cpf = cpf.substring(0, 3) + '.' + cpf.substring(3);
    }
    if (cpf.length > 7) {
      cpf = cpf.substring(0, 7) + '.' + cpf.substring(7);
    }
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11) + '-' + cpf.substring(11, 13);
    }
    
    this.cliente.cpf = cpf;
  }

  formatarCelular(): void {
    if (!this.cliente.celular) return;
    
    let celular = this.cliente.celular.replace(/\D/g, '');
    
    if (celular.length > 0) {
      celular = '(' + celular;
    }
    if (celular.length > 3) {
      celular = celular.substring(0, 3) + ') ' + celular.substring(3);
    }
    if (celular.length > 10) {
      celular = celular.substring(0, 10) + '-' + celular.substring(10, 14);
    }
    
    this.cliente.celular = celular;
  }

  voltar(): void {
    this.router.navigate(['/clientes']);
  }
}