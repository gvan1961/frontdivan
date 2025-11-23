import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

interface Produto {
  id: number;
  nomeProduto: string;
  valorVenda: number;
  quantidade: number;
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  creditoAprovado: boolean;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-pdv">
      <!-- HEADER -->
      <div class="header">
        <h1>🛒 PDV - Ponto de Venda</h1>
        <button class="btn-voltar" (click)="voltar()">← Voltar</button>
      </div>

      <div class="grid-pdv">
        <!-- PRODUTOS -->
        <div class="card produtos-card">
          <h2>📦 Produtos</h2>
          
          <div class="busca">
            <input type="text" 
                   [(ngModel)]="termoBusca" 
                   (input)="filtrarProdutos()"
                   placeholder="🔍 Buscar produto...">
          </div>

          <div class="lista-produtos">
            <div *ngFor="let produto of produtosFiltrados" 
                 class="produto-item"
                 (click)="adicionarAoCarrinho(produto)">
              <div class="produto-info">
                <span class="produto-nome">{{ produto.nomeProduto }}</span>
                <span class="produto-estoque">Estoque: {{ produto.quantidade }}</span>
              </div>
              <span class="produto-preco">R$ {{ formatarMoeda(produto.valorVenda) }}</span>
            </div>
          </div>
        </div>

        <!-- CARRINHO -->
        <div class="card carrinho-card">
          <h2>🛒 Carrinho</h2>
          
          <div class="lista-carrinho">
            <div *ngFor="let item of carrinho; let i = index" class="carrinho-item">
              <div class="item-info">
                <span class="item-nome">{{ item.produto.nomeProduto }}</span>
                <div class="item-qtd">
                  <button class="btn-qtd" (click)="diminuirQuantidade(i)">-</button>
                  <input type="number" 
                         [(ngModel)]="item.quantidade" 
                         (change)="atualizarItem(i)"
                         min="1">
                  <button class="btn-qtd" (click)="aumentarQuantidade(i)">+</button>
                </div>
              </div>
              <div class="item-valores">
                <span class="item-unitario">R$ {{ formatarMoeda(item.valorUnitario) }}</span>
                <span class="item-total">R$ {{ formatarMoeda(item.total) }}</span>
                <button class="btn-remover" (click)="removerItem(i)">🗑️</button>
              </div>
            </div>

            <div *ngIf="carrinho.length === 0" class="carrinho-vazio">
              <p>Carrinho vazio</p>
              <p>Clique nos produtos para adicionar</p>
            </div>
          </div>

          <div class="carrinho-total">
            <span>TOTAL:</span>
            <span class="valor-total">R$ {{ formatarMoeda(totalCarrinho) }}</span>
          </div>

          <div class="carrinho-acoes">
            <button class="btn-limpar" (click)="limparCarrinho()" [disabled]="carrinho.length === 0">
              🗑️ Limpar
            </button>
            <button class="btn-finalizar" (click)="abrirModalFinalizacao()" [disabled]="carrinho.length === 0">
              💰 Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL FINALIZAÇÃO -->
      <div class="modal-overlay" *ngIf="modalFinalizacao" (click)="fecharModalFinalizacao()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>💰 Finalizar Venda</h2>
          
          <div class="resumo-venda">
            <div class="resumo-linha">
              <span>Total:</span>
              <span class="valor-destaque">R$ {{ formatarMoeda(totalCarrinho) }}</span>
            </div>
          </div>

          <div class="tipo-venda">
            <label>
              <input type="radio" 
                     [(ngModel)]="tipoVenda" 
                     value="VISTA"
                     (change)="mudarTipoVenda()">
              💵 À Vista
            </label>
            <label>
              <input type="radio" 
                     [(ngModel)]="tipoVenda" 
                     value="FATURADO"
                     (change)="mudarTipoVenda()">
              💳 Faturado (Crédito)
            </label>
          </div>

          <!-- VENDA À VISTA -->
          <div *ngIf="tipoVenda === 'VISTA'" class="form-vista">
            <div class="campo">
              <label>Forma de Pagamento *</label>
              <select [(ngModel)]="formaPagamento">
                <option value="">Selecione...</option>
                <option value="DINHEIRO">💵 Dinheiro</option>
                <option value="PIX">📱 PIX</option>
                <option value="CARTAO_DEBITO">💳 Cartão Débito</option>
                <option value="CARTAO_CREDITO">💳 Cartão Crédito</option>
              </select>
            </div>

            <div class="campo" *ngIf="formaPagamento === 'DINHEIRO'">
              <label>Valor Pago</label>
              <input type="number" 
                     [(ngModel)]="valorPago" 
                     (input)="calcularTroco()"
                     step="0.01" 
                     min="0">
              <small *ngIf="troco > 0" class="troco-info">
                💰 Troco: R$ {{ formatarMoeda(troco) }}
              </small>
            </div>
          </div>

          <!-- VENDA FATURADA -->
          <div *ngIf="tipoVenda === 'FATURADO'" class="form-faturado">
            <div class="campo">
              <label>Cliente *</label>
              <select [(ngModel)]="clienteSelecionadoId" (change)="selecionarCliente()">
                <option value="0">Selecione um cliente...</option>
                <option *ngFor="let cliente of clientesComCredito" [value]="cliente.id">
                  {{ cliente.nome }} - {{ cliente.cpf }}
                </option>
              </select>
            </div>

            <div class="alerta-credito" *ngIf="clienteSelecionadoId > 0">
              ✅ Cliente com crédito aprovado<br>
              Vencimento em 30 dias
            </div>
          </div>

          <div class="campo">
            <label>Observação</label>
            <textarea [(ngModel)]="observacao" rows="2"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar-modal" (click)="fecharModalFinalizacao()">
              Cancelar
            </button>
            <button class="btn-confirmar" (click)="confirmarVenda()">
              ✅ Confirmar Venda
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL SUCESSO -->
      <div class="modal-overlay" *ngIf="modalSucesso" (click)="fecharModalSucesso()">
        <div class="modal-content modal-sucesso" (click)="$event.stopPropagation()">
          <h2>✅ Venda Realizada!</h2>
          
          <div class="info-sucesso">
            <p><strong>Nota de Venda:</strong> #{{ notaVendaId }}</p>
            <p><strong>Total:</strong> R$ {{ formatarMoeda(totalCarrinho) }}</p>
            
            <div *ngIf="tipoVenda === 'VISTA'">
              <p><strong>Forma de Pagamento:</strong> {{ obterNomeFormaPagamento() }}</p>
              <p *ngIf="troco > 0" class="troco-destaque">
                💰 Troco: R$ {{ formatarMoeda(troco) }}
              </p>
            </div>
            
            <div *ngIf="tipoVenda === 'FATURADO'">
              <p><strong>Cliente:</strong> {{ clienteNomeVenda }}</p>
              <p class="faturado-info">📋 Conta a Receber criada</p>
              <p class="faturado-info">📅 Vencimento: {{ obterDataVencimento() }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-imprimir" (click)="imprimirCupom()">
              🖨️ Imprimir Cupom
            </button>
            <button class="btn-confirmar" (click)="fecharModalSucesso()">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-pdv {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-voltar {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-voltar:hover {
      background: #7f8c8d;
      transform: translateY(-2px);
    }

    .grid-pdv {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.3em;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .busca {
      margin-bottom: 15px;
    }

    .busca input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      box-sizing: border-box;
    }

    .busca input:focus {
      outline: none;
      border-color: #667eea;
    }

    .lista-produtos {
      max-height: 500px;
      overflow-y: auto;
    }

    .produto-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .produto-item:hover {
      background: #f8f9fa;
      border-color: #667eea;
      transform: translateX(5px);
    }

    .produto-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .produto-nome {
      font-weight: 600;
      color: #2c3e50;
    }

    .produto-estoque {
      font-size: 0.85em;
      color: #7f8c8d;
    }

    .produto-preco {
      font-size: 1.2em;
      font-weight: 700;
      color: #27ae60;
    }

    .lista-carrinho {
      min-height: 400px;
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 20px;
    }

    .carrinho-item {
      padding: 15px;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      margin-bottom: 10px;
      background: #f8f9fa;
    }

    .item-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .item-nome {
      font-weight: 600;
      color: #2c3e50;
    }

    .item-qtd {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .btn-qtd {
      background: #667eea;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.2em;
      transition: all 0.3s;
    }

    .btn-qtd:hover {
      background: #5568d3;
    }

    .item-qtd input {
      width: 60px;
      text-align: center;
      padding: 5px;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
    }

    .item-valores {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-unitario {
      color: #7f8c8d;
      font-size: 0.9em;
    }

    .item-total {
      font-weight: 700;
      color: #27ae60;
      font-size: 1.1em;
    }

    .btn-remover {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-remover:hover {
      background: #c0392b;
    }

    .carrinho-vazio {
      text-align: center;
      padding: 60px 20px;
      color: #95a5a6;
    }

    .carrinho-vazio p {
      margin: 5px 0;
    }

    .carrinho-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #667eea;
      color: white;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .carrinho-total span:first-child {
      font-size: 1.2em;
      font-weight: 600;
    }

    .valor-total {
      font-size: 2em;
      font-weight: 700;
    }

    .carrinho-acoes {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 10px;
    }

    .btn-limpar,
    .btn-finalizar {
      padding: 15px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1em;
      transition: all 0.3s;
    }

    .btn-limpar {
      background: #e74c3c;
      color: white;
    }

    .btn-limpar:hover:not(:disabled) {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .btn-finalizar {
      background: #27ae60;
      color: white;
    }

    .btn-finalizar:hover:not(:disabled) {
      background: #229954;
      transform: translateY(-2px);
    }

    .btn-limpar:disabled,
    .btn-finalizar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .resumo-venda {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      font-size: 1.2em;
      font-weight: 600;
    }

    .valor-destaque {
      color: #27ae60;
      font-size: 1.5em;
    }

    .tipo-venda {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .tipo-venda label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .campo {
      margin-bottom: 20px;
    }

    .campo label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
    }

    .campo input,
    .campo select,
    .campo textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      box-sizing: border-box;
    }

    .campo input:focus,
    .campo select:focus,
    .campo textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .campo small {
      display: block;
      margin-top: 5px;
      color: #7f8c8d;
      font-size: 0.9em;
    }

    .troco-info {
      color: #27ae60;
      font-weight: 600;
      font-size: 1.1em !important;
    }

    .alerta-credito {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 12px;
      border-radius: 6px;
      color: #155724;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }

    .btn-cancelar-modal,
    .btn-confirmar,
    .btn-imprimir {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-cancelar-modal {
      background: #95a5a6;
      color: white;
    }

    .btn-cancelar-modal:hover {
      background: #7f8c8d;
    }

    .btn-confirmar {
      background: #667eea;
      color: white;
    }

    .btn-confirmar:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-imprimir {
      background: #3498db;
      color: white;
    }

    .btn-imprimir:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .modal-sucesso {
      text-align: center;
    }

    .info-sucesso {
      background: #d4edda;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .info-sucesso p {
      margin: 10px 0;
      color: #155724;
      font-size: 1.1em;
    }

    .troco-destaque {
      font-size: 1.5em !important;
      font-weight: 700 !important;
      color: #27ae60 !important;
    }

    .btn-imprimir {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-imprimir:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

    .faturado-info {
      color: #0c5460 !important;
      font-weight: 600 !important;
    }

    @media (max-width: 1024px) {
      .grid-pdv {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PDVComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  termoBusca = '';

  carrinho: ItemCarrinho[] = [];
  totalCarrinho = 0;

  // ✅ VARIÁVEIS PARA IMPRESSÃO
  ultimosItensVendidos: ItemCarrinho[] = [];
  ultimoTotalVenda = 0;

  modalFinalizacao = false;
  tipoVenda: 'VISTA' | 'FATURADO' = 'VISTA';
  formaPagamento = '';
  valorPago = 0;
  troco = 0;
  observacao = '';

  clientesComCredito: Cliente[] = [];
  clienteSelecionadoId = 0;
  clienteNomeVenda = '';

  modalSucesso = false;
  notaVendaId = 0;

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarClientesComCredito();
  }

  carregarProdutos(): void {
    this.http.get<Produto[]>('http://localhost:8080/api/produtos').subscribe({
      next: (data) => {
        this.produtos = data.filter(p => p.quantidade > 0);
        this.produtosFiltrados = this.produtos;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar produtos:', err);
        alert('Erro ao carregar produtos');
      }
    });
  }

  carregarClientesComCredito(): void {
    this.http.get<Cliente[]>('http://localhost:8080/api/clientes').subscribe({
      next: (data) => {
        this.clientesComCredito = data.filter(c => c.creditoAprovado === true);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar clientes:', err);
      }
    });
  }

  filtrarProdutos(): void {
    const termo = this.termoBusca.toLowerCase();
    this.produtosFiltrados = this.produtos.filter(p => 
      p.nomeProduto.toLowerCase().includes(termo)
    );
  }

  adicionarAoCarrinho(produto: Produto): void {
    const itemExistente = this.carrinho.find(i => i.produto.id === produto.id);

    if (itemExistente) {
      if (itemExistente.quantidade < produto.quantidade) {
        itemExistente.quantidade++;
        itemExistente.total = itemExistente.quantidade * itemExistente.valorUnitario;
      } else {
        alert('⚠️ Estoque insuficiente');
      }
    } else {
      this.carrinho.push({
        produto: produto,
        quantidade: 1,
        valorUnitario: produto.valorVenda,
        total: produto.valorVenda
      });
    }

    this.calcularTotal();
  }

  aumentarQuantidade(index: number): void {
    const item = this.carrinho[index];
    if (item.quantidade < item.produto.quantidade) {
      item.quantidade++;
      item.total = item.quantidade * item.valorUnitario;
      this.calcularTotal();
    } else {
      alert('⚠️ Estoque insuficiente');
    }
  }

  diminuirQuantidade(index: number): void {
    const item = this.carrinho[index];
    if (item.quantidade > 1) {
      item.quantidade--;
      item.total = item.quantidade * item.valorUnitario;
      this.calcularTotal();
    }
  }

  atualizarItem(index: number): void {
    const item = this.carrinho[index];
    if (item.quantidade > item.produto.quantidade) {
      alert('⚠️ Estoque insuficiente');
      item.quantidade = item.produto.quantidade;
    }
    if (item.quantidade < 1) {
      item.quantidade = 1;
    }
    item.total = item.quantidade * item.valorUnitario;
    this.calcularTotal();
  }

  removerItem(index: number): void {
    this.carrinho.splice(index, 1);
    this.calcularTotal();
  }

  limparCarrinho(): void {
    if (confirm('⚠️ Confirma limpar o carrinho?')) {
      this.carrinho = [];
      this.calcularTotal();
    }
  }

  calcularTotal(): void {
    this.totalCarrinho = this.carrinho.reduce((sum, item) => sum + item.total, 0);
  }

  abrirModalFinalizacao(): void {
    this.tipoVenda = 'VISTA';
    this.formaPagamento = '';
    this.valorPago = this.totalCarrinho;
    this.troco = 0;
    this.clienteSelecionadoId = 0;
    this.observacao = '';
    this.modalFinalizacao = true;
  }

  fecharModalFinalizacao(): void {
    this.modalFinalizacao = false;
  }

  mudarTipoVenda(): void {
    this.formaPagamento = '';
    this.valorPago = this.totalCarrinho;
    this.troco = 0;
    this.clienteSelecionadoId = 0;
  }

  calcularTroco(): void {
    this.troco = this.valorPago > this.totalCarrinho ? 
                 this.valorPago - this.totalCarrinho : 0;
  }

  selecionarCliente(): void {
    const cliente = this.clientesComCredito.find(c => c.id === Number(this.clienteSelecionadoId));
    if (cliente) {
      this.clienteNomeVenda = cliente.nome;
    }
  }

  confirmarVenda(): void {
    if (this.tipoVenda === 'VISTA') {
      if (!this.formaPagamento) {
        alert('⚠️ Selecione a forma de pagamento');
        return;
      }
      this.realizarVendaAVista();
    } else {
      if (this.clienteSelecionadoId === 0) {
        alert('⚠️ Selecione um cliente');
        return;
      }
      this.realizarVendaFaturada();
    }
  }

  realizarVendaAVista(): void {
    const request = {
      formaPagamento: this.formaPagamento,
      valorPago: this.valorPago,
      observacao: this.observacao,
      itens: this.carrinho.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario
      }))
    };

    this.http.post<any>('http://localhost:8080/api/vendas/a-vista', request).subscribe({
      next: (response) => {
        this.notaVendaId = response.notaVendaId;
        
        // ✅ SALVAR DADOS PARA IMPRESSÃO
        this.ultimosItensVendidos = [...this.carrinho];
        this.ultimoTotalVenda = this.totalCarrinho;
        const totalVenda = this.totalCarrinho;
        const trocoVenda = this.troco;
        
        this.fecharModalFinalizacao();
        
        this.totalCarrinho = totalVenda;
        this.troco = trocoVenda;
        
        this.modalSucesso = true;
        
        this.carrinho = [];
        this.carregarProdutos();
      },
      error: (err) => {
        console.error('❌ Erro completo:', err);
        console.error('❌ Erro do backend:', err.error);
        alert('❌ Erro: ' + (err.error?.erro || err.message));
      }
    });
  }

  realizarVendaFaturada(): void {
  // ✅ BUSCAR O ID DO USUÁRIO LOGADO
  const usuarioId = this.authService.getUsuarioId();
  
  const request = {
    clienteId: Number(this.clienteSelecionadoId),
    observacao: this.observacao,
    itens: this.carrinho.map(item => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario
    }))
  };

  // ✅ ADICIONAR usuarioId COMO QUERY PARAMETER
  this.http.post<any>(
    `http://localhost:8080/api/vendas/faturada?usuarioId=${usuarioId}`,
    request
  ).subscribe({
    next: (response) => {
      this.notaVendaId = response.notaVendaId;
      this.clienteNomeVenda = response.clienteNome;
      
      // ✅ SALVAR DADOS PARA IMPRESSÃO
      this.ultimosItensVendidos = [...this.carrinho];
      this.ultimoTotalVenda = this.totalCarrinho;
      const totalVenda = this.totalCarrinho;
      
      this.fecharModalFinalizacao();
      
      this.totalCarrinho = totalVenda;
      
      this.modalSucesso = true;
      
      this.carrinho = [];
      this.carregarProdutos();
    },
    error: (err) => {
      console.error('❌ Erro completo:', err);
      console.error('❌ Erro do backend:', err.error);
      alert('❌ Erro: ' + (err.error?.erro || err.message));
    }
  });
}

  fecharModalSucesso(): void {
    this.modalSucesso = false;
    this.carrinho = [];
    this.calcularTotal();
    this.notaVendaId = 0;
    this.clienteNomeVenda = '';
    this.troco = 0;
    this.valorPago = 0;
  }

  obterNomeFormaPagamento(): string {
    const formas: any = {
      'DINHEIRO': 'Dinheiro',
      'PIX': 'PIX',
      'CARTAO_DEBITO': 'Cartão Débito',
      'CARTAO_CREDITO': 'Cartão Crédito'
    };
    return formas[this.formaPagamento] || this.formaPagamento;
  }

  obterDataVencimento(): string {
    const hoje = new Date();
    const vencimento = new Date(hoje);
    vencimento.setDate(hoje.getDate() + 30);
    return vencimento.toLocaleDateString('pt-BR');
  }

  imprimirCupom(): void {
    if (!this.notaVendaId) {
      alert('⚠️ Nenhuma venda para imprimir');
      return;
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    
    let htmlCupom = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cupom de Venda #${this.notaVendaId}</title>
        <style>
          @page { 
            size: 80mm auto; 
            margin: 0; 
          }
          @media print {
            body { margin: 0; }
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 5mm;
            background: white;
          }
          .cabecalho { 
            text-align: center; 
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .cabecalho h1 { 
            font-size: 18px; 
            margin: 5px 0;
            font-weight: bold;
          }
          .cabecalho p { 
            margin: 2px 0;
            font-size: 11px;
          }
          .separador { 
            text-align: center; 
            margin: 8px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            font-weight: bold;
          }
          .info { 
            margin: 5px 0;
            font-size: 11px;
          }
          .item { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0;
            font-size: 11px;
          }
          .item-nome {
            flex: 1;
            padding-right: 10px;
          }
          .item-qtd-preco {
            text-align: right;
            white-space: nowrap;
          }
          .total { 
            font-size: 14px; 
            font-weight: bold; 
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #000;
          }
          .total-linha {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .rodape {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 11px;
          }
          .destaque {
            font-size: 16px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <h1>🏨 HOTEL DI VAN</h1>
          <p>Arapiraca - AL</p>
          <p>CNPJ: 07.757.726/0001-12</p>
        </div>
        
        <div class="separador">CUPOM DE VENDA</div>
        
        <div class="info">
          <strong>Nota:</strong> #${this.notaVendaId}<br>
          <strong>Data/Hora:</strong> ${dataHora}
    `;

    if (this.tipoVenda === 'VISTA') {
      htmlCupom += `<br><strong>Tipo:</strong> À VISTA`;
      htmlCupom += `<br><strong>Pagamento:</strong> ${this.obterNomeFormaPagamento()}`;
    } else {
      htmlCupom += `<br><strong>Tipo:</strong> FATURADO (A PRAZO)`;
      htmlCupom += `<br><strong>Cliente:</strong> ${this.clienteNomeVenda}`;
      htmlCupom += `<br><strong>Vencimento:</strong> ${this.obterDataVencimento()}`;
    }

    htmlCupom += `
        </div>
        
        <div class="separador">ITENS</div>
    `;

    const itensVenda = this.ultimosItensVendidos;
    const totalVenda = this.ultimoTotalVenda;

    itensVenda.forEach(item => {
      htmlCupom += `
        <div class="item">
          <span class="item-nome">${item.produto.nomeProduto}</span>
          <span class="item-qtd-preco">${item.quantidade}x R$ ${this.formatarMoeda(item.valorUnitario)} = R$ ${this.formatarMoeda(item.total)}</span>
        </div>
      `;
    });

    htmlCupom += `
        <div class="total">
          <div class="total-linha">
            <span>TOTAL:</span>
            <span class="destaque">R$ ${this.formatarMoeda(totalVenda)}</span>
          </div>
    `;

    if (this.tipoVenda === 'VISTA') {
      htmlCupom += `
          <div class="total-linha">
            <span>Valor Pago:</span>
            <span>R$ ${this.formatarMoeda(this.valorPago)}</span>
          </div>
      `;
      
      if (this.troco > 0) {
        htmlCupom += `
          <div class="total-linha">
            <span>Troco:</span>
            <span class="destaque">R$ ${this.formatarMoeda(this.troco)}</span>
          </div>
        `;
      }
    } else {
      htmlCupom += `
          <div class="total-linha" style="margin-top: 10px; font-size: 12px;">
            <span>💳 A PAGAR EM 30 DIAS</span>
          </div>
      `;
    }

    htmlCupom += `
        </div>
        
        <div class="rodape">
          <p>Obrigado pela preferência!</p>
          <p>Volte sempre! 😊</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
    if (janelaImpressao) {
      janelaImpressao.document.write(htmlCupom);
      janelaImpressao.document.close();
    } else {
      alert('⚠️ Erro ao abrir janela de impressão. Verifique se o popup não foi bloqueado.');
    }
  }

  formatarMoeda(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }

  voltar(): void {
    this.router.navigate(['/']);
  }
}