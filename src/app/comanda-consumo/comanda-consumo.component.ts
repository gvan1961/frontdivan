import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

interface Produto {
  id: number;
  nomeProduto: string;
  valorVenda: number;
  quantidade: number;
}

interface Reserva {
  id: number;
  cliente: {
    nome: string;
    cpf: string;
  };
  apartamento: {
    numeroApartamento: string;
  };
  dataCheckin: string;
  dataCheckout: string;
  quantidadeHospede: number;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

@Component({
  selector: 'app-comanda-consumo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-comanda">
      <!-- HEADER -->
      <div class="header">
        <h1>🏨 Comanda de Consumo - Apartamento</h1>
        <button class="btn-voltar" (click)="voltar()">← Voltar</button>
      </div>

      <!-- INFO RESERVA -->
      <div class="info-reserva" *ngIf="reserva">
        <div class="info-item">
          <span class="label">🏨 Apartamento:</span>
          <span class="valor">{{ reserva.apartamento.numeroApartamento }}</span>
        </div>
        <div class="info-item">
          <span class="label">👤 Hóspede:</span>
          <span class="valor">{{ reserva.cliente.nome }}</span>
        </div>
        <div class="info-item">
          <span class="label">👥 Hospedados:</span>
          <span class="valor">{{ reserva?.quantidadeHospede }} pessoa(s)</span>
        </div>
        <div class="info-item">
          <span class="label">📋 Reserva:</span>
          <span class="valor">#{{ reserva.id }}</span>
        </div>
      </div>

      <div class="grid-comanda">
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
          <h2>🛒 Itens da Comanda</h2>
          
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
              <p>Nenhum item adicionado</p>
              <p>Clique nos produtos para adicionar</p>
            </div>
          </div>

          <div class="carrinho-total">
            <span>TOTAL:</span>
            <span class="valor-total">R$ {{ formatarMoeda(totalCarrinho) }}</span>
          </div>

          <div class="campo-obs">
            <label>Observação (opcional)</label>
            <textarea [(ngModel)]="observacao" rows="2" placeholder="Ex: Pedido para o quarto"></textarea>
          </div>

          <div class="carrinho-acoes">
            <button class="btn-limpar" (click)="limparCarrinho()" [disabled]="carrinho.length === 0">
              🗑️ Limpar
            </button>
            <button class="btn-finalizar" (click)="finalizarComanda()" [disabled]="carrinho.length === 0">
              ✅ Finalizar e Imprimir
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL SUCESSO -->
      <div class="modal-overlay" *ngIf="modalSucesso" (click)="fecharModalSucesso()">
        <div class="modal-content modal-sucesso" (click)="$event.stopPropagation()">
          <h2>✅ Comanda Registrada!</h2>
          
          <div class="info-sucesso">
            <p><strong>Comanda:</strong> #{{ notaVendaId }}</p>
           <p><strong>Apartamento:</strong> {{ reserva?.apartamento?.numeroApartamento }}</p>
           <p><strong>Hóspede:</strong> {{ reserva?.cliente?.nome }}</p>
            <p><strong>Total:</strong> R$ {{ formatarMoeda(ultimoTotal) }}</p>
            <p class="aviso-assinatura">📝 Comanda impressa para assinatura do hóspede</p>
          </div>

          <div class="modal-footer">
            <button class="btn-imprimir" (click)="imprimirComanda()">
              🖨️ Reimprimir Comanda
            </button>
            <button class="btn-confirmar" (click)="novaComanda()">
              ➕ Nova Comanda
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
    .container-comanda {
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
      font-size: 1.5em;
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

    .info-reserva {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 30px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .info-item .label {
      font-size: 0.9em;
      opacity: 0.9;
    }

    .info-item .valor {
      font-size: 1.3em;
      font-weight: 700;
    }

    .grid-comanda {
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
      max-height: 450px;
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
      min-height: 300px;
      max-height: 300px;
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

    .campo-obs {
      margin-bottom: 15px;
    }

    .campo-obs label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
    }

    .campo-obs textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1em;
      box-sizing: border-box;
      resize: vertical;
    }

    .campo-obs textarea:focus {
      outline: none;
      border-color: #667eea;
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

    .modal-sucesso {
      text-align: center;
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
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

    .aviso-assinatura {
      margin-top: 15px !important;
      padding-top: 15px;
      border-top: 2px dashed #28a745;
      font-weight: 700 !important;
      color: #0c5460 !important;
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      flex-wrap: wrap;
    }

    .btn-imprimir,
    .btn-confirmar {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-imprimir {
      background: #3498db;
      color: white;
    }

    .btn-imprimir:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn-confirmar {
      background: #667eea;
      color: white;
    }

    .btn-confirmar:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    @media (max-width: 1024px) {
      .grid-comanda {
        grid-template-columns: 1fr;
      }

      .info-reserva {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class ComandaConsumoComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservaId: number = 0;
  reserva: Reserva | null = null;

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  termoBusca = '';

  carrinho: ItemCarrinho[] = [];
  totalCarrinho = 0;
  observacao = '';

  modalSucesso = false;
  notaVendaId = 0;
  
  ultimosItens: ItemCarrinho[] = [];
  ultimoTotal = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.reservaId = +params['id'];
      if (this.reservaId) {
        this.carregarReserva();
        this.carregarProdutos();
      }
    });
  }

  carregarReserva(): void {
    this.http.get<Reserva>(`http://localhost:8080/api/reservas/${this.reservaId}`).subscribe({
      next: (data) => {
        this.reserva = data;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar reserva:', err);
        alert('Erro ao carregar reserva');
        this.voltar();
      }
    });
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

  finalizarComanda(): void {
    if (this.carrinho.length === 0) {
      alert('⚠️ Adicione itens ao carrinho');
      return;
    }

    const request = {
      reservaId: this.reservaId,
      observacao: this.observacao,
      itens: this.carrinho.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario
      }))
    };

    this.http.post<any>('http://localhost:8080/api/vendas/comanda-consumo', request).subscribe({
      next: (response) => {
        this.notaVendaId = response.notaVendaId;
        
        this.ultimosItens = [...this.carrinho];
        this.ultimoTotal = this.totalCarrinho;
        
        this.modalSucesso = true;
        
        this.carrinho = [];
        this.observacao = '';
        this.calcularTotal();
        this.carregarProdutos();
        
        setTimeout(() => {
          this.imprimirComanda();
        }, 500);
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        alert('❌ Erro: ' + (err.error?.erro || err.message));
      }
    });
  }

  imprimirComanda(): void {
    if (!this.notaVendaId || !this.reserva) {
      alert('⚠️ Erro ao imprimir comanda');
      return;
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    
    let htmlComanda = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comanda #${this.notaVendaId}</title>
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
          .assinatura {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #000;
          }
          .assinatura-linha {
            margin-top: 40px;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 5px;
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
        
        <div class="separador">COMANDA DE CONSUMO</div>
        
        <div class="info">
          <strong>Comanda:</strong> #${this.notaVendaId}<br>
          <strong>Data/Hora:</strong> ${dataHora}<br>
          <strong>Apartamento:</strong> ${this.reserva.apartamento.numeroApartamento}<br>
          <strong>Hóspede:</strong> ${this.reserva.cliente.nome}<br>
          <strong>Reserva:</strong> #${this.reserva.id}
        </div>
        
        <div class="separador">ITENS CONSUMIDOS</div>
    `;

    this.ultimosItens.forEach(item => {
      htmlComanda += `
        <div class="item">
          <span class="item-nome">${item.produto.nomeProduto}</span>
          <span class="item-qtd-preco">${item.quantidade}x R$ ${this.formatarMoeda(item.valorUnitario)} = R$ ${this.formatarMoeda(item.total)}</span>
        </div>
      `;
    });

    htmlComanda += `
        <div class="total">
          <div class="total-linha">
            <span>TOTAL:</span>
            <span class="destaque">R$ ${this.formatarMoeda(this.ultimoTotal)}</span>
          </div>
        </div>
        
        <div class="assinatura">
          <p style="text-align: center; font-weight: bold;">CONFERÊNCIA E ASSINATURA</p>
          <p style="font-size: 10px; text-align: center; margin: 10px 0;">Declaro estar de acordo com os itens acima</p>
          <div class="assinatura-linha">
            Assinatura do Hóspede
          </div>
        </div>
        
        <div class="rodape">
          <p>Este consumo será lançado na conta do apartamento</p>
          <p>Obrigado pela preferência!</p>
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
      janelaImpressao.document.write(htmlComanda);
      janelaImpressao.document.close();
    } else {
      alert('⚠️ Erro ao abrir janela de impressão. Verifique se o popup não foi bloqueado.');
    }
  }

  novaComanda(): void {
    this.modalSucesso = false;
    this.notaVendaId = 0;
    this.ultimosItens = [];
    this.ultimoTotal = 0;
    this.carrinho = [];
    this.observacao = '';
    this.calcularTotal();
  }

  fecharModalSucesso(): void {
    this.modalSucesso = false;
    this.voltar();
  }

  formatarMoeda(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }

  voltar(): void {
    this.router.navigate(['/reservas', this.reservaId]);
  }
}