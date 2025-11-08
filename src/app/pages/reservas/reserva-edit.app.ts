import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Apartamento {
  id: number;
  numeroApartamento: string;
  capacidade: number;
  tipoApartamento?: {
    tipo: string;
  };
  tipoApartamentoNome?: string;
  status: string;
}

interface Reserva {
  id: number;
  clienteId: number;
  apartamentoId: number;  // ← Vamos preencher este campo manualmente
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  status: string;
  cliente?: {
    id: number;
    nome: string;
    cpf: string;
  };
  apartamento?: {
    id: number;  // ✅ ADICIONAR ID DO APARTAMENTO
    numeroApartamento: string;
    capacidade: number;
    tipoApartamentoNome?: string;
  };
}

@Component({
  selector: 'app-reserva-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>✏️ Editar Pré-Reserva #{{ reservaId }}</h1>
        <button class="btn-back" (click)="voltar()">← Voltar</button>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>

      <!-- FORMULÁRIO -->
      <div *ngIf="!loading && reserva" class="form-card">
        <!-- AVISO -->
        <div class="aviso-info">
          <strong>ℹ️ Editando Pré-Reserva</strong>
          <p>Você pode alterar apartamento, datas e quantidade de hóspedes.</p>
          <p><strong>Cliente:</strong> {{ reserva.cliente?.nome }}</p>
        </div>

        <form (ngSubmit)="salvar()">
          <!-- APARTAMENTO -->
          <div class="form-group">
            <label>Apartamento *</label>
            <select [(ngModel)]="reserva.apartamentoId" 
          name="apartamentoId" 
          required
          (change)="onApartamentoChange()">
    <option [ngValue]="0">Selecione o apartamento</option>
    <option *ngFor="let apt of apartamentos" [ngValue]="apt.id">
      {{ apt.numeroApartamento }} - 
      {{ apt.tipoApartamento?.tipo || apt.tipoApartamentoNome || 'Sem tipo' }} 
      (Cap: {{ apt.capacidade }})
    </option>
  </select>
            <small class="field-help" *ngIf="apartamentoSelecionado">
    ✅ Selecionado: Apt {{ apartamentoSelecionado.numeroApartamento }} - 
    Capacidade: {{ apartamentoSelecionado.capacidade }} pessoa(s)
  </small>

           <small class="field-help debug" *ngIf="reserva">
              Debug: apartamentoId = {{ reserva.apartamentoId }}
           </small>
          </div>

          <!-- QUANTIDADE DE HÓSPEDES -->
          <div class="form-group">
            <label>Quantidade de Hóspedes *</label>
            <input type="number" 
                   [(ngModel)]="reserva.quantidadeHospede" 
                   name="quantidadeHospede" 
                   required 
                   min="1" 
                   [max]="apartamentoSelecionado?.capacidade || 10">
            <small class="field-help">
              Número de pessoas que ocuparão o apartamento
            </small>
          </div>

          <!-- DATAS -->
          <div class="form-row">
            <div class="form-group">
              <label>Data e Hora de Check-in *</label>
              <input type="datetime-local" 
                     [(ngModel)]="reserva.dataCheckin" 
                     name="dataCheckin" 
                     required>
              <small class="field-help">
                {{ formatarDataHora(reserva.dataCheckin) }}
              </small>
            </div>

            <div class="form-group">
              <label>Data e Hora de Check-out *</label>
              <input type="datetime-local" 
                     [(ngModel)]="reserva.dataCheckout" 
                     name="dataCheckout" 
                     required>
              <small class="field-help">
                {{ formatarDataHora(reserva.dataCheckout) }}
              </small>
            </div>
          </div>

          <!-- ERRO -->
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- AÇÕES -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="voltar()">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="loadingSave">
              {{ loadingSave ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 900px;
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
      background: #95a5a6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-back:hover {
      background: #7f8c8d;
    }

    .loading {
      text-align: center;
      padding: 60px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .aviso-info {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 25px;
    }

    .aviso-info strong {
      display: block;
      margin-bottom: 8px;
      color: #1976d2;
    }

    .aviso-info p {
      margin: 4px 0;
      color: #1976d2;
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

    .field-help.debug {
  color: #e67e22;
  background: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
  font-weight: 600;
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

    .field-help {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 4px;
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
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-save {
      background: #28a745;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #218838;
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
export class ReservaEditApp implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservaId = 0;
  reserva: Reserva | null = null;
  apartamentos: Apartamento[] = [];
  apartamentoSelecionado: Apartamento | null = null;
  
  loading = false;
  loadingSave = false;
  errorMessage = '';

  formatarParaInput(dataISO: string): string {
  // Converter de ISO para formato datetime-local (YYYY-MM-DDTHH:mm)
  const data = new Date(dataISO);
  
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.reservaId = Number(id);
    
    console.log('═══════════════════════════════════════');
    console.log('🚀 INICIANDO EDIÇÃO DA PRÉ-RESERVA #' + this.reservaId);
    console.log('═══════════════════════════════════════');
    
    // ✅ CARREGAR APARTAMENTOS PRIMEIRO
    this.carregarApartamentos();
    
    // ✅ DEPOIS CARREGAR RESERVA (com delay para garantir que apartamentos já carregaram)
    setTimeout(() => {
      this.carregarReserva();
    }, 300);
    
  } else {
    this.errorMessage = 'ID da reserva não fornecido';
  }
}

  carregarReserva(): void {
  this.loading = true;
  this.http.get<any>(`http://localhost:8080/api/reservas/${this.reservaId}`).subscribe({
    next: (data) => {
      console.log('📋 Dados recebidos da API:', data);
      
      // Validar se é PRE_RESERVA
      if (data.status !== 'PRE_RESERVA') {
        alert('⚠️ Apenas pré-reservas podem ser editadas desta forma');
        this.router.navigate(['/reservas', this.reservaId]);
        return;
      }

      // ✅ MAPEAR DADOS CORRETAMENTE
      this.reserva = {
        id: data.id,
        clienteId: data.cliente?.id || 0,
        apartamentoId: data.apartamento?.id || 0,  // ✅ PEGAR ID DO OBJETO APARTAMENTO
        quantidadeHospede: data.quantidadeHospede,
        dataCheckin: this.formatarParaInput(data.dataCheckin),
        dataCheckout: this.formatarParaInput(data.dataCheckout),
        status: data.status,
        cliente: data.cliente,
        apartamento: data.apartamento
      };
      
      this.loading = false;
      
      console.log('✅ Reserva mapeada:', this.reserva);
      console.log('   Cliente ID:', this.reserva.clienteId);
      console.log('   Apartamento ID:', this.reserva.apartamentoId);
      console.log('   Apartamento Número:', this.reserva.apartamento?.numeroApartamento);
      console.log('   Quantidade Hóspedes:', this.reserva.quantidadeHospede);
      console.log('   Check-in:', this.reserva.dataCheckin);
      console.log('   Check-out:', this.reserva.dataCheckout);
      
      // ✅ AGUARDAR APARTAMENTOS CARREGAREM E SELECIONAR
      setTimeout(() => {
        this.onApartamentoChange();
        console.log('🏢 Apartamento selecionado no select:', this.reserva?.apartamentoId);
      }, 600);
    },
    error: (err) => {
      console.error('❌ Erro ao carregar reserva:', err);
      this.errorMessage = 'Erro ao carregar reserva';
      this.loading = false;
    }
  });
}

  carregarApartamentos(): void {
  console.log('📋 Carregando apartamentos disponíveis...');
  
  this.http.get<Apartamento[]>('http://localhost:8080/api/apartamentos').subscribe({
    next: (data) => {
      this.apartamentos = data;
      console.log('✅ Apartamentos carregados:', data.length);
      console.log('   IDs disponíveis:', data.map(a => a.id));
      
      // ✅ TENTAR SELECIONAR APARTAMENTO SE JÁ CARREGOU A RESERVA
      if (this.reserva?.apartamentoId) {
        setTimeout(() => {
          this.onApartamentoChange();
          console.log('🔄 Tentando selecionar apartamento:', this.reserva?.apartamentoId);
        }, 100);
      }
    },
    error: (err) => {
      console.error('❌ Erro ao carregar apartamentos:', err);
    }
  });
}

  onApartamentoChange(): void {
    if (!this.reserva) return;
    this.apartamentoSelecionado = this.apartamentos.find(a => a.id === this.reserva!.apartamentoId) || null;
  }

  formatarDataHora(dataHora: string): string {
    if (!dataHora) return '';
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR');
  }

 salvar(): void {
  if (!this.reserva) return;

  if (!this.validar()) {
    return;
  }

  this.loadingSave = true;
  this.errorMessage = '';

  // ✅ FORMATAR DATAS PARA O FORMATO QUE O BACKEND ACEITA
  const dataCheckin = new Date(this.reserva.dataCheckin);
  const dataCheckout = new Date(this.reserva.dataCheckout);
  
  // Formato: YYYY-MM-DDTHH:mm:ss (sem milissegundos e sem Z)
  const formatarParaBackend = (data: Date): string => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  };

  const dto = {
    apartamentoId: this.reserva.apartamentoId,
    quantidadeHospede: this.reserva.quantidadeHospede,
    dataCheckin: formatarParaBackend(dataCheckin),
    dataCheckout: formatarParaBackend(dataCheckout)
  };

  console.log('💾 Salvando alterações:', dto);

  this.http.patch(`http://localhost:8080/api/reservas/${this.reservaId}/editar-pre-reserva`, dto).subscribe({
    next: (response) => {
      console.log('✅ Pré-reserva atualizada:', response);
      alert('✅ Pré-reserva atualizada com sucesso!');
      this.router.navigate(['/reservas/mapa']);
    },
    error: (err) => {
      console.error('❌ Erro:', err);
      this.errorMessage = err.error?.message || err.error || 'Erro ao atualizar';
      this.loadingSave = false;
    }
  });
}

  validar(): boolean {
    if (!this.reserva) return false;

    if (!this.reserva.apartamentoId || this.reserva.apartamentoId === 0) {
      this.errorMessage = 'Selecione o apartamento';
      return false;
    }

    if (this.reserva.quantidadeHospede < 1) {
      this.errorMessage = 'Quantidade de hóspedes inválida';
      return false;
    }

    if (this.apartamentoSelecionado && this.reserva.quantidadeHospede > this.apartamentoSelecionado.capacidade) {
      this.errorMessage = `Quantidade excede capacidade (${this.apartamentoSelecionado.capacidade})`;
      return false;
    }

    const checkin = new Date(this.reserva.dataCheckin);
    const checkout = new Date(this.reserva.dataCheckout);

    if (checkout <= checkin) {
      this.errorMessage = 'Check-out deve ser posterior ao check-in';
      return false;
    }

    return true;
  }

  voltar(): void {
    this.router.navigate(['/reservas/mapa']);
  }
}