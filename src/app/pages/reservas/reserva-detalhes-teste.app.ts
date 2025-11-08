import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reserva-detalhes-teste',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 40px; background: #f0f0f0; min-height: 100vh;">
      <h1 style="color: green;">✅ COMPONENTE DE DETALHES FUNCIONANDO!</h1>
      
      <div style="background: white; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <h2>ID da Reserva: {{ reservaId }}</h2>
        <p><strong>URL Completa:</strong> {{ urlCompleta }}</p>
        <p><strong>Params:</strong> {{ paramsJson }}</p>
        
        <button 
          routerLink="/reservas"
          style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Voltar para Lista
        </button>
      </div>
    </div>
  `
})
export class ReservaDetalhesTeste implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  reservaId: string = '';
  urlCompleta: string = '';
  paramsJson: string = '';

  ngOnInit() {
    console.log('🎯 COMPONENTE DE TESTE CARREGADO!');
    
    this.urlCompleta = window.location.href;
    
    this.route.params.subscribe(params => {
      console.log('📋 Params:', params);
      this.reservaId = params['id'] || 'NENHUM';
      this.paramsJson = JSON.stringify(params);
    });
  }
}