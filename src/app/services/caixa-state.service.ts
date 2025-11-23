import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaixaStateService {
  private caixaAtualizadoSubject = new BehaviorSubject<boolean>(false);
  public caixaAtualizado$: Observable<boolean> = this.caixaAtualizadoSubject.asObservable();

  notificarAtualizacao(): void {
    console.log('🔔 Notificando atualização do caixa');
    this.caixaAtualizadoSubject.next(true);
  }

   resetarNotificacao(): void {
    this.caixaAtualizadoSubject.next(false);
  }

}