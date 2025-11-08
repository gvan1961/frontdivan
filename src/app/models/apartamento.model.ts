import { StatusApartamento } from './enums';

export interface Apartamento {
  id?: number;
  numeroApartamento: string;
  tipoApartamentoId: number;
  tipoApartamentoNome?: string; // ✅ ADICIONAR
  tipoApartamentoDescricao?: string; // ✅ ADICIONAR
  tipoApartamento?: any; // Manter para compatibilidade
  capacidade: number;
  camasDoApartamento: string;
  tv?: string;
  status?: StatusApartamento;  

  reservaAtiva?: {
    reservaId: number;
    nomeHospede: string;
    quantidadeHospede: number;
    dataCheckin: string;
    dataCheckout: string;
  };
}

export interface ApartamentoRequest {
  numeroApartamento: string;
  tipoApartamentoId: number;
  capacidade: number;
  camasDoApartamento: string;
  tv?: string;
}