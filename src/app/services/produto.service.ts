import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto, ProdutoRequest } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/produtos';

  getAll(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  getById(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  getEstoqueBaixo(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/estoque-baixo`);
  }

  create(produto: ProdutoRequest): Observable<Produto> {
    console.log('📤 Criando produto:', JSON.stringify(produto, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<Produto>(this.apiUrl, produto, { headers });
  }

  update(id: number, produto: ProdutoRequest): Observable<Produto> {
    console.log('📤 Atualizando produto:', id, JSON.stringify(produto, null, 2));
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto, { headers });
  }

  atualizarEstoque(id: number, quantidade: number): Observable<Produto> {
    console.log('📦 Atualizando estoque:', id, quantidade);
    return this.http.patch<Produto>(`${this.apiUrl}/${id}/estoque?quantidade=${quantidade}`, {});
  }

  delete(id: number): Observable<void> {
    console.log('🗑️ Deletando produto:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarDisponiveis(): Observable<Produto[]> {
  return this.http.get<Produto[]>(`${this.apiUrl}/disponiveis`);
}

 listarTodos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  
  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}