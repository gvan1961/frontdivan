import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Produto {
  id: number;
  nomeProduto: string;
  valorVenda: number;
  quantidade: number;
  categoria?: {           // ✅ MUDOU: agora é um objeto
    id: number;
    nome: string;
    descricao?: string;
  };
}

interface Categoria {
  id: number;
  nome: string;
}

interface ReservaAtiva {
  id: number;
  apartamentoNumero: string;
  clienteNome: string;
  quantidadeHospede: number;
  itensAdicionados: ItemComanda[];
}

interface ItemComanda {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
}

@Component({
  selector: 'app-comandas-rapidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1 style="color: white; font-weight: 800; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px 25px; border-radius: 10px;">
           🍽️ COMANDA RÁPIDA
        </h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="limparTudo()" [disabled]="getTotalItens() === 0">
            🗑️ Limpar Tudo
          </button>
          <button class="btn-voltar" (click)="voltar()">← Voltar</button>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando dados...</p>
      </div>

      <!-- ✅✅✅ SELEÇÃO DE CATEGORIA - SEMPRE VISÍVEL ✅✅✅ -->
      <div *ngIf="!loading" class="categoria-selector">
        <div class="categoria-card">
          <div class="categoria-header">
            <span class="categoria-icon">🏷️</span>
            <h2>Escolha a Categoria dos Produtos</h2>
          </div>
          
          <select [(ngModel)]="categoriaSelecionada" 
                  (change)="filtrarProdutosPorCategoria()"
                  name="categoriaSelecionada"
                  class="select-categoria">
            <option [value]="0">📋 Todas as Categorias</option>
            <option *ngFor="let cat of categorias" [value]="cat.id">
              {{ cat.nome }}
            </option>
          </select>
          
          <p class="categoria-help">
            ⚡ Esta categoria será aplicada em TODOS os apartamentos abaixo
          </p>
        </div>
      </div>

      <!-- RESUMO -->
      <div *ngIf="!loading && reservas.length > 0" class="resumo">
        <div class="resumo-item">
          <span class="resumo-label">📍 Apartamentos:</span>
          <span class="resumo-valor">{{ reservas.length }}</span>
        </div>
        <div class="resumo-item">
          <span class="resumo-label">🏷️ Categoria:</span>
          <span class="resumo-valor categoria-nome">{{ getCategoriaNome() }}</span>
        </div>
        <div class="resumo-item">
          <span class="resumo-label">📦 Produtos:</span>
          <span class="resumo-valor">{{ produtosFiltrados.length }}</span>
        </div>
        <div class="resumo-item">
          <span class="resumo-label">✅ Itens:</span>
          <span class="resumo-valor destaque">{{ getTotalItens() }}</span>
        </div>
      </div>

      <!-- ALERTA SE NÃO HÁ PRODUTOS -->
      <div *ngIf="!loading && produtosFiltrados.length === 0 && categoriaSelecionada !== 0" class="alerta-produtos">
        <p>⚠️ Nenhum produto encontrado na categoria "{{ getCategoriaNome() }}"</p>
        <button class="btn-voltar-categorias" (click)="voltarTodasCategorias()">
          📋 Ver Todas as Categorias
        </button>
      </div>

      <!-- LISTA DE RESERVAS -->
      <div *ngIf="!loading && reservas.length > 0 && produtosFiltrados.length > 0" class="reservas-list">
        <div *ngFor="let reserva of reservas; let i = index" class="reserva-card">
          <div class="reserva-header">
            <div class="reserva-info">
              <h3>Apt {{ reserva.apartamentoNumero }}</h3>
              <span class="hospede-nome">{{ reserva.clienteNome }}</span>
              <span class="hospede-qtd">{{ reserva.quantidadeHospede }} hóspede(s)</span>
            </div>
          </div>

          <div class="add-item-form">
            <select [(ngModel)]="produtoSelecionado[i]" 
        [name]="'produto' + i"
        class="select-produto">
  <option [value]="0">Selecione o produto...</option>
  <option *ngFor="let produto of produtosFiltrados" [value]="produto.id">
    {{ produto.nomeProduto }} 
    <span *ngIf="produto.categoria">({{ produto.categoria.nome }})</span>
    - R$ {{ produto.valorVenda.toFixed(2) }}
    (Estoque: {{ produto.quantidade }})
  </option>
</select>

            <input type="number" 
                   [(ngModel)]="quantidadeSelecionada[i]"
                   [name]="'quantidade' + i"
                   min="1"
                   class="input-quantidade"
                   placeholder="Qtd">

            <button class="btn-add" 
                    (click)="adicionarItem(i)"
                    [disabled]="!produtoSelecionado[i] || produtoSelecionado[i] === 0">
              ➕ Adicionar
            </button>
          </div>

          <!-- ITENS ADICIONADOS -->
          <div *ngIf="reserva.itensAdicionados.length > 0" class="itens-lista">
            <div *ngFor="let item of reserva.itensAdicionados; let j = index" class="item-row">
              <span class="item-check">✅</span>
              <span class="item-nome">{{ item.nomeProduto }}</span>
              <span class="item-qtd">x{{ item.quantidade }}</span>
              <span class="item-valor">R$ {{ (item.valorUnitario * item.quantidade).toFixed(2) }}</span>
              <button class="btn-remove" (click)="removerItem(i, j)">
                🗑️
              </button>
            </div>
          </div>

          <div *ngIf="reserva.itensAdicionados.length === 0" class="sem-itens">
            (Nenhum item adicionado)
          </div>
        </div>
      </div>

      <!-- VAZIO -->
      <div *ngIf="!loading && reservas.length === 0" class="vazio">
        <p>📭 Nenhum apartamento ocupado no momento</p>
      </div>

      <!-- BOTÃO SALVAR -->
      <div *ngIf="!loading && getTotalItens() > 0" class="footer-actions">
        <button class="btn-salvar-grande" (click)="salvarTodas()" [disabled]="salvando">
          {{ salvando ? '⏳ Salvando...' : '💾 Salvar Todas as Comandas (' + getTotalItens() + ' itens)' }}
        </button>
      </div>

      <!-- MENSAGENS -->
      <div *ngIf="mensagemSucesso" class="mensagem-sucesso">
        {{ mensagemSucesso }}
      </div>
      <div *ngIf="mensagemErro" class="mensagem-erro">
        {{ mensagemErro }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f5f7fa;
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

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn-voltar, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-voltar {
      background: #95a5a6;
      color: white;
    }

    .btn-voltar:hover {
      background: #7f8c8d;
    }

    .btn-secondary {
      background: #e74c3c;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #c0392b;
    }

    .btn-secondary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
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

    /* ✅✅✅ SELEÇÃO DE CATEGORIA - DESTAQUE MÁXIMO ✅✅✅ */
    .categoria-selector {
      margin-bottom: 25px;
    }

    .categoria-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }

    .categoria-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .categoria-icon {
      font-size: 2.5em;
    }

    .categoria-header h2 {
      margin: 0;
      color: white;
      font-size: 1.5em;
      font-weight: 700;
    }

    .select-categoria {
      width: 100%;
      padding: 18px 20px;
      border: 4px solid white;
      border-radius: 12px;
      font-size: 1.3em;
      font-weight: 700;
      background: white;
      color: #2c3e50;
      cursor: pointer;
      transition: all 0.3s;
    }

    .select-categoria:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .select-categoria:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.5);
    }

    .categoria-help {
      color: white;
      margin: 15px 0 0 0;
      font-size: 1.1em;
      font-weight: 500;
      opacity: 0.95;
    }

    .resumo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .resumo-item {
      background: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .resumo-label {
      font-size: 0.85em;
      color: #7f8c8d;
      font-weight: 500;
    }

    .resumo-valor {
      font-size: 1.3em;
      font-weight: 700;
      color: #2c3e50;
    }

    .resumo-valor.categoria-nome {
      color: #667eea;
    }

    .resumo-valor.destaque {
      color: #27ae60;
    }

    .alerta-produtos {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .alerta-produtos p {
      margin: 0 0 15px 0;
      color: #856404;
      font-weight: 600;
      font-size: 1.1em;
    }

    .btn-voltar-categorias {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1em;
      transition: all 0.3s;
    }

    .btn-voltar-categorias:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .reservas-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .reserva-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .reserva-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .reserva-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #ecf0f1;
    }

    .reserva-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .reserva-info h3 {
      margin: 0;
      color: #667eea;
      font-size: 1.3em;
    }

    .hospede-nome {
      color: #2c3e50;
      font-weight: 600;
    }

    .hospede-qtd {
      color: #7f8c8d;
      font-size: 0.9em;
    }

    .add-item-form {
      display: grid;
      grid-template-columns: 1fr 100px 140px;
      gap: 10px;
      margin-bottom: 15px;
    }

    .select-produto {
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .select-produto:focus {
      outline: none;
      border-color: #667eea;
    }

    .input-quantidade {
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
    }

    .input-quantidade:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-add {
      background: #27ae60;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-add:hover:not(:disabled) {
      background: #229954;
    }

    .btn-add:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .itens-lista {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
    }

    .item-row {
      display: grid;
      grid-template-columns: 30px 1fr 80px 100px 50px;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .item-row:last-child {
      margin-bottom: 0;
    }

    .item-check {
      font-size: 1.2em;
    }

    .item-nome {
      font-weight: 600;
      color: #2c3e50;
    }

    .item-qtd {
      text-align: center;
      font-weight: 600;
      color: #7f8c8d;
    }

    .item-valor {
      text-align: right;
      font-weight: 600;
      color: #27ae60;
    }

    .btn-remove {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.3s;
    }

    .btn-remove:hover {
      background: #c0392b;
    }

    .sem-itens {
      padding: 15px;
      text-align: center;
      color: #95a5a6;
      font-style: italic;
    }

    .vazio {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      color: #7f8c8d;
      font-size: 1.2em;
    }

    .footer-actions {
      position: sticky;
      bottom: 20px;
      margin-top: 30px;
      text-align: center;
    }

    .btn-salvar-grande {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 20px 40px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.2em;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: all 0.3s;
    }

    .btn-salvar-grande:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .btn-salvar-grande:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .mensagem-sucesso {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      color: #155724;
      padding: 15px 25px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    }

    .mensagem-erro {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      padding: 15px 25px;
      border-radius: 8px;
      border-left: 4px solid #dc3545;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .resumo {
        grid-template-columns: repeat(2, 1fr);
      }

      .add-item-form {
        grid-template-columns: 1fr;
      }

      .item-row {
        grid-template-columns: 30px 1fr 50px;
      }

      .item-qtd, .item-valor {
        display: none;
      }
    }
  `]
})
export class ComandasRapidasComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  reservas: ReservaAtiva[] = [];
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  categorias: Categoria[] = [];
  
  categoriaSelecionada = 0;
  produtoSelecionado: number[] = [];
  quantidadeSelecionada: number[] = [];
  
  loading = false;
  salvando = false;
  mensagemSucesso = '';
  mensagemErro = '';

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    
    // Carregar categorias
    this.http.get<Categoria[]>('http://localhost:8080/api/categorias').subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log('✅ Categorias carregadas:', categorias.length);
        this.carregarReservas();
      },
      error: (err) => {
        console.error('❌ Erro ao carregar categorias:', err);
        this.carregarReservas(); // Continua mesmo sem categorias
      }
    });
  }

  carregarReservas(): void {
    this.http.get<any[]>('http://localhost:8080/api/reservas/ativas').subscribe({
      next: (reservas) => {
        this.reservas = reservas
  .map(r => ({
    id: r.id,
    apartamentoNumero: r.apartamento?.numeroApartamento || 'N/A',
    clienteNome: r.cliente?.nome || 'Sem nome',
    quantidadeHospede: r.quantidadeHospede || 0,
    itensAdicionados: []
  }))
  .sort((a, b) => {
    const numA = parseInt(a.apartamentoNumero) || 0;
    const numB = parseInt(b.apartamentoNumero) || 0;
    return numA - numB;
  });
        
        this.produtoSelecionado = new Array(this.reservas.length).fill(0);
        this.quantidadeSelecionada = new Array(this.reservas.length).fill(1);
        
        console.log('✅ Reservas carregadas:', this.reservas.length);
        this.carregarProdutos();
      },
      error: (err) => {
        console.error('❌ Erro ao carregar reservas:', err);
        this.loading = false;
        this.mostrarErro('Erro ao carregar reservas');
      }
    });
  }

  carregarProdutos(): void {
    this.http.get<Produto[]>('http://localhost:8080/api/produtos').subscribe({
      next: (produtos) => {
        this.produtos = produtos.filter(p => p.quantidade > 0);
        this.produtosFiltrados = this.produtos;
        console.log('✅ Produtos carregados:', this.produtos.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar produtos:', err);
        this.loading = false;
        this.mostrarErro('Erro ao carregar produtos');
      }
    });
  }

 filtrarProdutosPorCategoria(): void {
    console.log('🔍 Filtrando por categoria:', this.categoriaSelecionada);
    
    if (this.categoriaSelecionada === 0) {
      this.produtosFiltrados = this.produtos;
      console.log('📦 Mostrando TODOS os produtos:', this.produtosFiltrados.length);
    } else {
      // ✅ FILTRAR USANDO p.categoria.id
      this.produtosFiltrados = this.produtos.filter(p => {
        if (!p.categoria) {
          return false;
        }
        return Number(p.categoria.id) === Number(this.categoriaSelecionada);
      });
      
      console.log('📦 Produtos filtrados:', this.produtosFiltrados.length);
      
      // Debug se não encontrar nenhum
      if (this.produtosFiltrados.length === 0) {
        console.warn('⚠️ Nenhum produto encontrado. Categorias nos produtos:');
        const categoriasEncontradas = [...new Set(
          this.produtos
            .filter(p => p.categoria)
            .map(p => `${p.categoria!.id} - ${p.categoria!.nome}`)
        )];
        console.warn(categoriasEncontradas);
      }
    }
}

  voltarTodasCategorias(): void {
    this.categoriaSelecionada = 0;
    this.filtrarProdutosPorCategoria();
  }

  getCategoriaNome(): string {
    if (this.categoriaSelecionada === 0) {
      return 'Todas';
    }
    
    const categoria = this.categorias.find(c => Number(c.id) === Number(this.categoriaSelecionada));
    return categoria ? categoria.nome : 'N/A';
  }

  adicionarItem(index: number): void {
    const produtoId = Number(this.produtoSelecionado[index]);
    const quantidade = this.quantidadeSelecionada[index];

    if (!produtoId || produtoId === 0) {
      this.mostrarErro('Selecione um produto');
      return;
    }

    if (!quantidade || quantidade < 1) {
      this.mostrarErro('Quantidade inválida');
      return;
    }

    let produto = this.produtosFiltrados.find(p => Number(p.id) === produtoId);
    
    if (!produto) {
      produto = this.produtos.find(p => Number(p.id) === produtoId);
    }

    if (!produto) {
      this.mostrarErro('Produto não encontrado');
      return;
    }

    if (quantidade > produto.quantidade) {
      this.mostrarErro(`Estoque insuficiente. Disponível: ${produto.quantidade}`);
      return;
    }

    const itemExistente = this.reservas[index].itensAdicionados.find(
      i => Number(i.produtoId) === produtoId
    );
    
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      this.reservas[index].itensAdicionados.push({
        produtoId: produto.id,
        nomeProduto: produto.nomeProduto,
        quantidade: quantidade,
        valorUnitario: produto.valorVenda
      });
    }

    this.produtoSelecionado[index] = 0;
    this.quantidadeSelecionada[index] = 1;

    console.log(`✅ Item adicionado: ${produto.nomeProduto} x${quantidade}`);
  }

  removerItem(reservaIndex: number, itemIndex: number): void {
    const item = this.reservas[reservaIndex].itensAdicionados[itemIndex];
    
    if (confirm(`Remover ${item.nomeProduto}?`)) {
      this.reservas[reservaIndex].itensAdicionados.splice(itemIndex, 1);
    }
  }

  getTotalItens(): number {
  return this.reservas.reduce((total, reserva) => {
    const quantidadeReserva = reserva.itensAdicionados.reduce((sum, item) => 
      sum + item.quantidade, 0
    );
    return total + quantidadeReserva;
  }, 0);
}

  limparTudo(): void {
    if (!confirm('⚠️ Limpar TODOS os itens adicionados?')) {
      return;
    }

    this.reservas.forEach(r => r.itensAdicionados = []);
  }

  salvarTodas(): void {
    const totalItens = this.getTotalItens();
    
    if (totalItens === 0) {
      this.mostrarErro('Nenhum item para salvar');
      return;
    }

    const confirmacao = confirm(
      `💾 Confirma o lançamento de ${totalItens} item(ns)?`
    );

    if (!confirmacao) return;

    this.salvando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const comandas = this.reservas
      .filter(r => r.itensAdicionados.length > 0)
      .map(r => ({
        reservaId: r.id,
        itens: r.itensAdicionados.map(i => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade
        }))
      }));

    const payload = { comandas };

    this.http.post<any>('http://localhost:8080/api/reservas/comandas-rapidas', payload)
      .subscribe({
        next: (resultado) => {
          this.salvando = false;

          if (resultado.sucesso) {
            this.mostrarSucesso(
              `✅ ${resultado.itensProcessados} item(ns) lançado(s) com sucesso!`
            );

            setTimeout(() => {
              this.reservas.forEach(r => r.itensAdicionados = []);
              this.carregarProdutos();
            }, 1500);

          } else {
            this.mostrarErro(
              `⚠️ Processado ${resultado.itensProcessados}/${resultado.totalItens}`
            );
          }
        },
        error: (err) => {
          this.salvando = false;
          this.mostrarErro('Erro ao salvar: ' + (err.error?.message || err.message));
        }
      });
  }

  mostrarSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = '', 5000);
  }

  mostrarErro(mensagem: string): void {
    this.mensagemErro = mensagem;
    setTimeout(() => this.mensagemErro = '', 5000);
  }

  voltar(): void {
    this.router.navigate(['/reservas']);
  }
}