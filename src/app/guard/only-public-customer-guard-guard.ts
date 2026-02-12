import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const publicCostumerGuard: CanActivateFn = (route, state) => { // recibe la ruta a la que intentas ir y el estado
    // usamos inject para traer las herramientas porque no es una clase con constructor
    const authService = inject(AuthService); // Para revisar token
    const router = inject(Router); // Para redirigir si es necesario

    if(authService.token){ // Se ejecuta si hay token
      const newPath = router.parseUrl("/restaurantList"); // si esta logueado preparamos su nueva ruta a restaurantList
      return new RedirectCommand(newPath, { // en lugar de devolver false usamos una devolucion de objeto de comando
        replaceUrl: true, // reemplaza la entrada actual por la del nuevo camino al que tiene que ir, evitando que al ir atras vaya al login
      });
    }
    return true; // si no hay token devolvemos true y no hacemos restriccion
};