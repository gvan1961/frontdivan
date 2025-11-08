import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  private http = inject(HttpClient);
  
  private caixaAbertoSubject = new BehaviorSubject<any>(null);
  public caixaAberto$ = this.caixaAbertoSubject.asObservable();

  constructor() {
    // Verificar se tem caixa aberto ao inicializar
    this.verificarCaixaAberto();
  }

  verificarCaixaAberto(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);
    
    this.http.get<any>(`http://localhost:8080/api/caixa/usuario/${usuario.id}/aberto`).subscribe({
      next: (response) => {
        if (response.id) {
          this.caixaAbertoSubject.next(response);
          console.log('✅ Caixa aberto detectado:', response.id);
        } else {
          this.caixaAbertoSubject.next(null);
        }
      },
      error: (err) => {
        console.error('❌ Erro ao verificar caixa:', err);
        this.caixaAbertoSubject.next(null);
      }
    });
  }

  setCaixaAberto(caixa: any): void {
    this.caixaAbertoSubject.next(caixa);
  }

  limparCaixaAberto(): void {
    this.caixaAbertoSubject.next(null);
  }

  getCaixaAberto(): any {
    return this.caixaAbertoSubject.value;
  }
}