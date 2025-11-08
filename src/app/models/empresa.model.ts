export interface Empresa {
  id?: number;
  nomeEmpresa: string;
  cnpj: string;
  contato: string;
  celular: string;
}

export interface EmpresaRequest {
  nomeEmpresa: string;
  cnpj: string;
  contato: string;
  celular: string;
}