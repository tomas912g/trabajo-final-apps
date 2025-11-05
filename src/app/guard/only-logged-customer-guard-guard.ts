import { inject } from '@angular/core';
import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const onlyLoggedCostumerGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(!authService.token){
    const newPath = router.parseUrl("/login");
    return new RedirectCommand(newPath, {
      skipLocationChange: true,
    });
  }
  return true;

};