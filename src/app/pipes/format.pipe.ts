import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cnpj',
  standalone: true
})
export class CnpjPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cnpj = value.replace(/\D/g, '');
    
    // Formata: 00.000.000/0000-00
    if (cnpj.length === 14) {
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  }
}

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cpf = value.replace(/\D/g, '');
    
    // Formata: 000.000.000-00
    if (cpf.length === 11) {
      return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    
    return value;
  }
}

@Pipe({
  name: 'celular',
  standalone: true
})
export class CelularPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const celular = value.replace(/\D/g, '');
    
    // Formata: (00) 00000-0000 ou (00) 0000-0000
    if (celular.length === 11) {
      return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (celular.length === 10) {
      return celular.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    
    return value;
  }
}

@Pipe({
  name: 'cep',
  standalone: true
})
export class CepPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cep = value.replace(/\D/g, '');
    
    // Formata: 00000-000
    if (cep.length === 8) {
      return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }
    
    return value;
  }
}