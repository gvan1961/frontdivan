export interface Reserva {
  id: number;
  cliente: {
    id: number;
    nome: string;
    cpf: string;
    telefone?: string;
  };
  apartamento: {
    id: number;
    numeroApartamento: string;
    capacidade: number;
    tipoApartamentoNome?: string;
  };
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria: number;
  valorDiaria: number;
  totalDiaria: number;
  totalHospedagem: number;
  totalRecebido: number;
  totalApagar: number;
  totalProduto?: number;
  status: string;
  extratos?: any[];
  historicos?: any[];
}

export interface ReservaRequest {
  clienteId: number;
  apartamentoId: number;
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  observacoes?: string;
}

export interface ReservaResponse {
  id: number;
  clienteNome: string;
  apartamentoNumero: string;
  quantidadeHospede: number;
  dataCheckin: string;
  dataCheckout: string;
  quantidadeDiaria: number;
  totalDiaria: number;
  totalHospedagem: number;
  totalRecebido: number;
  totalApagar: number;
  status: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  celular?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface Apartamento {
  id: number;
  numeroApartamento: string;
  capacidade: number;
  camasDoApartamento?: string;
  tv?: string;
  status: string;
  tipoApartamentoId?: number;
  tipoApartamentoNome?: string;
  tipoApartamentoDescricao?: string;
}

export enum StatusReserva {
  ATIVA = 'ATIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}