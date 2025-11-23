import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔐 Interceptor executado para:', req.url);
  
  // ✅ LISTA DE ROTAS QUE NÃO PRECISAM DE TOKEN
  const rotasPublicas = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/public/'
  ];
  
  // Verificar se é rota pública
  const isRotaPublica = rotasPublicas.some(rota => req.url.includes(rota));
  
  if (isRotaPublica) {
    console.log('⚠️ Rota pública detectada, pulando interceptor');
    return next(req);
  }
  
  // Pegar token do localStorage
  const token = localStorage.getItem('token');
  console.log('📝 Token encontrado:', token ? 'SIM' : 'NÃO');
  
  if (token) {
    console.log('✅ Adicionando token ao header Authorization');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  } else {
    console.log('⚠️ Sem token, enviando requisição sem autenticação');
    return next(req);
  }
}; // <-- ESTAVA FALTANDO FECHAR AQUI