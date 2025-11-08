export interface Produto {
  id?: number;
  nomeProduto: string;
  quantidade: number;
  valorVenda: number;
  valorCompra: number;
  categoria?: {
    id: number;
    nome: string;
    descricao?: string;
  };
}

export interface ProdutoRequest {
  nomeProduto: string;
  quantidade: number;
  valorVenda: number;
  valorCompra: number;
  categoriaId?: number;
}

