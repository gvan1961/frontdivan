export interface TipoApartamento {
  id?: number;
  tipo: string;
  descricao?: string;
}

export interface TipoApartamentoRequest {
  tipo: string;
  descricao?: string;
}