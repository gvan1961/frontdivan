export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  totalProdutos?: number;
}

export interface CategoriaRequest {
  nome: string;
  descricao?: string;
}