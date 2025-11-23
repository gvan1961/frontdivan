import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AberturaCaixaComponent } from './components/abertura-caixa/abertura-caixa.component';
import { FechamentoCaixaComponent } from './components/fechamento-caixa/fechamento-caixa.component';
import { FechamentoCaixaService } from './services/fechamento-caixa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class App {
  title = 'divan';
}