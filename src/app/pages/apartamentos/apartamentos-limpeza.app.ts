import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface ApartamentoRelatorio {
  numeroApartamento: string;
  dataCheckout: string;
  horaCheckout: string;
  quantidadeHospedes: number;
  status: string;
  prioridade: number;
  concluido?: boolean;        // ✅ NOVO
  apartamentoId?: number;     // ✅ NOVO
}

@Component({
  selector: 'app-apartamentos-limpeza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- CABEÇALHO (não imprime) -->
      <div class="header no-print">
        <h1>🧹 Relatório de Limpeza</h1>
        <div class="acoes">
          <button class="btn" (click)="carregarDados()">🔄 Atualizar</button>
          <button class="btn btn-imprimir" (click)="imprimir()">🖨️ Imprimir</button>
          <button class="btn" (click)="voltar()">← Voltar</button>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading no-print">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>

      <!-- RELATÓRIO PARA IMPRESSÃO -->
      <div *ngIf="!loading" class="relatorio">
        <!-- CABEÇALHO DO RELATÓRIO -->
        <div class="relatorio-header">
          <h1>🏨 HOTEL DI VAN</h1>
          <h2>Relatório de Limpeza</h2>
          <p class="data">{{ dataHoraAtual }}</p>
        </div>

        <!-- MENSAGEM SE VAZIO -->
        <div *ngIf="apartamentos.length === 0" class="vazio">
          <p>✅ Não há apartamentos para limpeza no momento</p>
        </div>

        <!-- TABELA -->
        <table *ngIf="apartamentos.length > 0">
          <thead>
            <tr>
              <th>PRIORIDADE</th>
              <th>APARTAMENTO</th>
              <th>DATA CHECKOUT</th>
              <th>HORA CHECKOUT</th>
              <th>HÓSPEDES</th>
              <th>STATUS</th>
              <th class="no-print">CONCLUÍDO</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let apt of apartamentos" [class]="'prioridade-' + apt.prioridade">
              <td class="prioridade">
                <span *ngIf="apt.prioridade === 1" class="badge urgente">1 - URGENTE</span>
                <span *ngIf="apt.prioridade === 2" class="badge normal">2 - NORMAL</span>
              </td>
              <td class="apartamento">{{ apt.numeroApartamento }}</td>
              <td>{{ apt.dataCheckout }}</td>
              <td>{{ apt.horaCheckout }}</td>
              <td class="center">{{ apt.quantidadeHospedes }}</td>
              <td>
                <span *ngIf="apt.status === 'LIMPEZA'" class="status limpeza">LIMPEZA</span>
                <span *ngIf="apt.status === 'OCUPADO'" class="status ocupado">OCUPADO</span>
              </td>
              <td class="checkbox-cell no-print">
                 <input type="checkbox" 
                 class="checkbox-limpeza"
                 [(ngModel)]="apt.concluido"
                 (change)="marcarConcluido(apt)">
              </td>
            </tr>
          </tbody>
        </table>

        <!-- RODAPÉ -->
        <div class="rodape">
          <p><strong>TOTAL DE APARTAMENTOS:</strong> {{ apartamentos.length }}</p>
          <p><strong>URGENTES (Prioridade 1):</strong> {{ contarUrgentes() }}</p>
          <p><strong>NORMAIS (Prioridade 2):</strong> {{ contarNormais() }}</p>
          <div class="assinatura">
            <p>__________________________________</p>
            <p>Assinatura da Camareira</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: white;
    }

    /* CABEÇALHO (tela) */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h1 {
      color: #2c3e50;
    }

    .acoes {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn:hover {
      background: #2980b9;
    }

    .btn-imprimir {
      background: #27ae60;
    }

    .btn-imprimir:hover {
      background: #229954;
    }

    /* LOADING */
    .loading {
      text-align: center;
      padding: 60px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
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

    /* RELATÓRIO */
    .relatorio {
      background: white;
    }

    .relatorio-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2c3e50;
    }

    .relatorio-header h1 {
      font-size: 2em;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .relatorio-header h2 {
      font-size: 1.5em;
      color: #7f8c8d;
      margin-bottom: 10px;
    }

    .relatorio-header .data {
      font-size: 1em;
      color: #95a5a6;
    }

    .vazio {
      text-align: center;
      padding: 60px;
      font-size: 1.2em;
      color: #27ae60;
    }

    /* TABELA */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th {
      background: #2c3e50;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 700;
      font-size: 0.9em;
      border: 1px solid #34495e;
    }

    td {
      padding: 12px;
      border: 1px solid #e0e0e0;
      font-size: 0.95em;
    }

    tr:nth-child(even) {
      background: #f9f9f9;
    }

    /* PRIORIDADES */
    .prioridade-1 {
      background: #ffebee !important;
    }

    .prioridade-2 {
      background: #fff3e0 !important;
    }

    .prioridade {
      font-weight: 700;
    }

    .badge {
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.85em;
      display: inline-block;
    }

    .badge.urgente {
      background: #e74c3c;
      color: white;
    }

    .badge.normal {
      background: #f39c12;
      color: white;
    }

    .apartamento {
      font-weight: 700;
      font-size: 1.1em;
      color: #2c3e50;
    }

    .center {
      text-align: center;
    }

    .status {
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.85em;
      display: inline-block;
    }

    .status.limpeza {
      background: #e74c3c;
      color: white;
    }

    .status.ocupado {
      background: #f39c12;
      color: white;
    }

    .checkbox {
      font-size: 1.5em;
      text-align: center;
    }

    .checkbox-cell {
  text-align: center;
  padding: 8px;
}

.checkbox-limpeza {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transform: scale(1.5);
  accent-color: #27ae60;
}

.checkbox-limpeza:hover {
  transform: scale(1.7);
}

    /* RODAPÉ */
    .rodape {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }

    .rodape p {
      margin-bottom: 10px;
      font-size: 1em;
    }

    .assinatura {
      margin-top: 60px;
      text-align: center;
    }

    .assinatura p:first-child {
      margin-bottom: 5px;
      font-size: 0.9em;
    }

    .assinatura p:last-child {
      font-size: 0.85em;
      color: #7f8c8d;
    }

    /* IMPRESSÃO */
    @media print {
      body {
        background: white;
      }

      .container {
        padding: 0;
        max-width: 100%;
      }

      .no-print {
        display: none !important;
      }

      .relatorio-header {
        margin-bottom: 20px;
      }

      table {
        font-size: 10pt;
      }

      th, td {
        padding: 8px;
      }

      tr {
        page-break-inside: avoid;
      }

      .rodape {
        page-break-inside: avoid;
      }

      /* Garantir cores na impressão */
      * {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }

      .badge.urgente,
      .status.limpeza {
        background: #e74c3c !important;
        color: white !important;
      }

      .badge.normal,
      .status.ocupado {
        background: #f39c12 !important;
        color: white !important;
      }

      .prioridade-1 {
        background: #ffebee !important;
      }

      .prioridade-2 {
        background: #fff3e0 !important;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }

      .acoes {
        width: 100%;
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      table {
        font-size: 0.8em;
      }

      th, td {
        padding: 8px 4px;
      }
    }
  `]
})
export class ApartamentosLimpezaApp implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  apartamentos: ApartamentoRelatorio[] = [];
  dataHoraAtual = '';

  ngOnInit(): void {
    this.atualizarDataHora();
    this.carregarDados();
  }

  atualizarDataHora(): void {
    const agora = new Date();
    this.dataHoraAtual = agora.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' - ' + agora.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  carregarDados(): void {
  this.loading = true;
  this.atualizarDataHora();
  this.apartamentos = [];

  // Buscar apartamentos
  this.http.get<any[]>('http://localhost:8080/api/apartamentos').subscribe({
    next: (apartamentos) => {
      // Buscar TODAS as reservas (ativas e finalizadas)
      this.http.get<any[]>('http://localhost:8080/api/reservas').subscribe({
        next: (todasReservas) => {
          console.log('📋 Total de reservas:', todasReservas.length);
          
          // Processar apartamentos
          apartamentos.forEach(apt => {
            console.log(`🏨 Apartamento ${apt.numeroApartamento} - Status: ${apt.status}`);
            
            // ===== APARTAMENTOS EM LIMPEZA (Prioridade 1) =====
            if (apt.status === 'LIMPEZA') {
              // Buscar a ÚLTIMA reserva FINALIZADA deste apartamento
              const reservasFinalizadas = todasReservas.filter(r => 
                r.apartamento?.id === apt.id && 
                r.status === 'FINALIZADA'
              );

              if (reservasFinalizadas.length > 0) {
                // Pegar a mais recente
                const ultimaReserva = reservasFinalizadas.sort((a, b) => 
                  new Date(b.dataCheckout).getTime() - new Date(a.dataCheckout).getTime()
                )[0];

                const dataCheckout = ultimaReserva.dataCheckoutReal 
                      ? new Date(ultimaReserva.dataCheckoutReal) 
                        : new Date();
                
                console.log(`  ✅ LIMPEZA - Checkout: ${dataCheckout.toLocaleString('pt-BR')}`);
                
                this.apartamentos.push({
                  numeroApartamento: apt.numeroApartamento,
                  dataCheckout: dataCheckout.toLocaleDateString('pt-BR'),
                  horaCheckout: dataCheckout.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  quantidadeHospedes: ultimaReserva.quantidadeHospede || 0,
                  status: 'LIMPEZA',
                  prioridade: 1,
                  concluido: false,       // ✅ ADICIONE
                  apartamentoId: apt.id   // ✅ ADICIONE
                });
              } else {
                console.log(`  ⚠️ Apartamento em LIMPEZA mas sem reserva finalizada!`);
                
                // Adicionar mesmo sem reserva (com dados vazios)
                this.apartamentos.push({
                  numeroApartamento: apt.numeroApartamento,
                  dataCheckout: '-',
                  horaCheckout: '-',
                  quantidadeHospedes: 0,
                  status: 'LIMPEZA',
                  prioridade: 1
                });
              }
            }
            
            // ===== APARTAMENTOS OCUPADOS (Prioridade 2) =====
            if (apt.status === 'OCUPADO') {
              // Buscar reserva ATIVA deste apartamento
              const reservaAtiva = todasReservas.find(r => 
                r.apartamento?.id === apt.id && 
                r.status === 'ATIVA'
              );

              if (reservaAtiva) {
                const dataCheckout = new Date(reservaAtiva.dataCheckout);
                
                console.log(`  ✅ OCUPADO - Checkout previsto: ${dataCheckout.toLocaleString('pt-BR')}`);
                
                this.apartamentos.push({
                  numeroApartamento: apt.numeroApartamento,
                  dataCheckout: dataCheckout.toLocaleDateString('pt-BR'),
                  horaCheckout: dataCheckout.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  quantidadeHospedes: reservaAtiva.quantidadeHospede || 0,
                  status: 'OCUPADO',
                  prioridade: 2,
                   concluido: false,       // ✅ ADICIONE
                   apartamentoId: apt.id   // ✅ ADICIONE
                });
              } else {
                console.log(`  ⚠️ Apartamento OCUPADO mas sem reserva ativa!`);
              }
            }
          });

          // Ordenar: LIMPEZA primeiro, depois OCUPADO, depois por número
          this.apartamentos.sort((a, b) => {
            if (a.prioridade !== b.prioridade) {
              return a.prioridade - b.prioridade;
            }
            return a.numeroApartamento.localeCompare(b.numeroApartamento, undefined, { numeric: true });
          });

          this.loading = false;
          
          console.log('✅ RELATÓRIO FINAL:');
          console.log(`   🔴 LIMPEZA (Urgente): ${this.contarUrgentes()} apartamentos`);
          console.log(`   🟡 OCUPADO (Normal): ${this.contarNormais()} apartamentos`);
          console.log(`   📊 TOTAL: ${this.apartamentos.length} apartamentos`);
        },
        error: (err) => {
          console.error('❌ Erro ao carregar reservas:', err);
          this.loading = false;
          alert('Erro ao carregar reservas: ' + (err.message || 'Erro desconhecido'));
        }
      });
    },
    error: (err) => {
      console.error('❌ Erro ao carregar apartamentos:', err);
      this.loading = false;
      alert('Erro ao carregar apartamentos: ' + (err.message || 'Erro desconhecido'));
    }
  });
}

  contarUrgentes(): number {
    return this.apartamentos.filter(a => a.prioridade === 1).length;
  }

  contarNormais(): number {
    return this.apartamentos.filter(a => a.prioridade === 2).length;
  }

  imprimir(): void {
    if (this.loading) {
      alert('⚠️ Aguarde o carregamento dos dados!');
      return;
    }

    setTimeout(() => {
      window.print();
    }, 100);
  }

  voltar(): void {
    this.router.navigate(['/apartamentos']);
  }

  marcarConcluido(apt: ApartamentoRelatorio): void {
  console.log(`${apt.concluido ? '✅' : '❌'} Limpeza ${apt.numeroApartamento}: ${apt.concluido ? 'CONCLUÍDA' : 'PENDENTE'}`);
  
  // Se marcou como concluído E é apartamento em LIMPEZA
  if (apt.concluido && apt.status === 'LIMPEZA' && apt.apartamentoId) {
    const confirmacao = confirm(`✅ Confirmar conclusão da limpeza do apartamento ${apt.numeroApartamento}?\n\n(O apartamento será liberado automaticamente)`);
    
    if (confirmacao) {
      // Chamar endpoint para liberar limpeza
      this.http.patch(`http://localhost:8080/api/apartamentos/${apt.apartamentoId}/liberar-limpeza`, {})
        .subscribe({
          next: () => {
            console.log('✅ Limpeza liberada no backend!');
            alert(`✅ Apartamento ${apt.numeroApartamento} liberado com sucesso!`);
            
            // Remover da lista após 1 segundo
            setTimeout(() => {
              this.apartamentos = this.apartamentos.filter(a => a.numeroApartamento !== apt.numeroApartamento);
              console.log(`🗑️ Apartamento ${apt.numeroApartamento} removido da lista`);
            }, 1000);
          },
          error: (err) => {
            console.error('❌ Erro ao liberar limpeza:', err);
            alert('❌ Erro ao salvar: ' + (err.error?.message || err.message));
            // Desmarcar o checkbox em caso de erro
            apt.concluido = false;
          }
        });
    } else {
      // Cancelou, desmarcar
      apt.concluido = false;
    }
  }
  
  // Se é apartamento OCUPADO, apenas marca como "visto" sem salvar
  if (apt.concluido && apt.status === 'OCUPADO') {
    console.log(`📋 Apartamento ${apt.numeroApartamento} marcado como conferido`);
  }
}
}