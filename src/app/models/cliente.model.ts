export interface Cliente {
  id?: number;
  nome: string;
  cpf: string;
  celular: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  dataNascimento: string;
  empresaId?: number;
  empresa?: any;
  creditoAprovado?: boolean;
}

export interface ClienteRequest {
  nome: string;
  cpf: string;
  celular: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  dataNascimento: string;
  empresaId?: number;
  creditoAprovado?: boolean; 
}