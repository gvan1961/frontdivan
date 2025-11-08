import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { ReservaDetalhesTeste } from './pages/reservas/reserva-detalhes-teste.app';

// IMPORTS
import { ReservaEditApp } from './pages/reservas/reserva-edit.app';
import { LoginApp } from './pages/login/login.app';
import { LayoutComponent } from './components/layout.component';
import { DashboardApp } from './pages/dashboard/dashboard.app';
import { ClienteListaApp } from './pages/clientes/cliente-lista.app';
import { ClienteFormApp } from './pages/clientes/cliente-form.app';
import { ApartamentoListaApp } from './pages/apartamentos/apartamento-lista.app';
import { ApartamentoFormApp } from './pages/apartamentos/apartamento-form.app';
import { TipoApartamentoListaApp } from './pages/tipos-apartamento/tipo-apartamento-lista.app';
import { TipoApartamentoFormApp } from './pages/tipos-apartamento/tipo-apartamento-form.app';
import { CategoriaListaApp } from './pages/categorias/categoria-lista.app';
import { CategoriaFormApp } from './pages/categorias/categoria-form.app';
import { EmpresaListaApp } from './pages/empresas/empresa-lista.app';
import { EmpresaFormApp } from './pages/empresas/empresa-form.app';
import { DiariaListaApp } from './pages/diarias/diaria-lista.app';
import { DiariaFormApp } from './pages/diarias/diaria-form.app';
import { ProdutoListaApp } from './pages/produtos/produto-lista.app';
import { ProdutoFormApp } from './pages/produtos/produto-form.app';
import { ReservaListaApp } from './pages/reservas/reserva-lista.app';
import { ReservaFormApp } from './pages/reservas/reserva-form.app';
import { ReservaDetalhesApp } from './pages/reservas/reserva-detalhes.app';
import { ApartamentosGestaoApp } from './pages/apartamentos/apartamentos-gestao.app';
import { ApartamentosLimpezaApp } from './pages/apartamentos/apartamentos-limpeza.app';
import { ContasReceberListaApp } from './pages/contas-receber/contas-receber-lista.app';
import { ComandasRapidasComponent } from './pages/comandas/comandas-rapidas.component';
import { MapaReservasApp } from './pages/reservas/mapa-reservas.app';

export const routes: Routes = [
  // LOGIN (sem layout)
  { path: 'login', component: LoginApp },
  
  // TODAS AS OUTRAS ROTAS COM LAYOUT + SIDEBAR
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

      { path: 'teste-reserva/:id', component: ReservaDetalhesTeste },
      
      // ===== DASHBOARD =====
      { path: 'dashboard', component: DashboardApp },

         // ===== CLIENTES =====
      { path: 'clientes', component: ClienteListaApp },
      { path: 'clientes/novo', component: ClienteFormApp },
      { path: 'clientes/editar/:id', component: ClienteFormApp },

      // ===== PRODUTOS =====
      { path: 'produtos', component: ProdutoListaApp },
      { path: 'produtos/novo', component: ProdutoFormApp },
      { path: 'produtos/editar/:id', component: ProdutoFormApp },

      // ===== APARTAMENTOS =====
      { path: 'apartamentos/limpeza', component: ApartamentosLimpezaApp },
      { path: 'apartamentos/gestao', component: ApartamentosGestaoApp },
      { path: 'apartamentos/novo', component: ApartamentoFormApp },
      { path: 'apartamentos/editar/:id', component: ApartamentoFormApp },
      { path: 'apartamentos', component: ApartamentoListaApp },

      // ===== TIPOS DE APARTAMENTO =====
      { path: 'tipos-apartamento/novo', component: TipoApartamentoFormApp },
      { path: 'tipos-apartamento/editar/:id', component: TipoApartamentoFormApp },
      { path: 'tipos-apartamento', component: TipoApartamentoListaApp },

      // ===== DIÁRIAS =====
      { path: 'diarias/novo', component: DiariaFormApp },
      { path: 'diarias/editar/:id', component: DiariaFormApp },
      { path: 'diarias', component: DiariaListaApp },

      // ===== RESERVAS (ORDEM IMPORTANTE!) =====
      { path: 'reservas/mapa', component: MapaReservasApp },
      { path: 'reservas/novo', component: ReservaFormApp },
      { path: 'reservas/:id/editar', component: ReservaEditApp },
      { path: 'reservas/:id', component: ReservaDetalhesApp },
      { path: 'reservas', component: ReservaListaApp },

      // ===== CATEGORIAS =====
      { path: 'categorias/novo', component: CategoriaFormApp },
      { path: 'categorias/editar/:id', component: CategoriaFormApp },
      { path: 'categorias', component: CategoriaListaApp },

      // ===== CONTAS A RECEBER =====
      { path: 'contas-receber', component: ContasReceberListaApp },
      
      // ===== EMPRESAS =====
      { path: 'empresas/nova', component: EmpresaFormApp },
      { path: 'empresas/editar/:id', component: EmpresaFormApp },
      { path: 'empresas', component: EmpresaListaApp },

      // ===== COMANDAS RÁPIDAS =====
      { path: 'comandas-rapidas', component: ComandasRapidasComponent }
    ]
  },

  // REDIRECT PARA DASHBOARD
  { path: '**', redirectTo: '/dashboard' }
];