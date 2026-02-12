import { inject } from '@angular/core';
import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

// es un canactivatechild, lo que significa que se usa para proteger rutas hijas poniendolo en el padre
export const onlyLoggedCostumerGuard: CanActivateChildFn = (childRoute, state) => { 
  const authService = inject(AuthService);
  const router = inject(Router);

  if(!authService.token){ // se ejecuta si no tiene token
    const newPath = router.parseUrl("/login"); // si no esta logueadp lo mandamos al login
    return new RedirectCommand(newPath, { // Hacemos la redireccion
      replaceUrl: true, 
    });
  }
  return true; // si hay token lo dejamos pasar a la ruta

};