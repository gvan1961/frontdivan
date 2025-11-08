export interface Diaria {
  id?: number;
  tipoApartamentoId: number;
  tipoApartamento?: string; // A, B, C, D
  descricaoTipoApartamento?: string;
  quantidade: number;
  valor: number;
}

export interface DiariaRequest {
  tipoApartamentoId: number;
  quantidade: number;
  valor: number;
}

export interface DiariaResponse {
  id: number;
  tipoApartamentoId: number;
  tipoApartamento: string;
  descricaoTipoApartamento: string;
  quantidade: number;
  valor: number;
}