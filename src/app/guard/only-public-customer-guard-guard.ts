import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const publicCostumerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if(authService.token){
      const newPath = router.parseUrl("/restaurantList");
      return new RedirectCommand(newPath, {
        skipLocationChange: true,
      });
    }
    return true;
};