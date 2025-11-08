export interface NotaVenda {
  id: number;
  dataHora: string;
  valorTotal: number;
  status: 'ABERTA' | 'FECHADA' | 'CANCELADA';
  observacao?: string;
  itens: ItemVenda[];
}

export interface ItemVenda {
  id: number;
  produto: any;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  observacao?: string;
}