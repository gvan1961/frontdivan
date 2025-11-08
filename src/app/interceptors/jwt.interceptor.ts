import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Pega o token do localStorage
  const token = localStorage.getItem('token');
  
  console.log('🔐 Interceptor executado para:', req.url);
  console.log('📝 Token completo:', token);
  
  // Se tiver token, adiciona no header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Authorization Header:', req.headers.get('Authorization'));
  } else {
    console.log('❌ Token não encontrado no localStorage!');
  }
  
  return next(req);
};