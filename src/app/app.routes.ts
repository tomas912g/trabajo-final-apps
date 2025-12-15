import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { RestaurantList } from './pages/restaurant-list/restaurant-list';
import { Menu } from './pages/menu/menu';
import { Register } from './pages/register/register';
import { publicCostumerGuard } from './guard/only-public-customer-guard-guard';
import { AccountSettingsComponent } from './pages/account-settings/account-settings';
import { onlyLoggedCostumerGuard } from './guard/only-logged-customer-guard-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'restaurantList',
        pathMatch: 'full'
    },
    {
        path: "login",
        component: LoginPage,
    },
    {
        path: "register",
        component: Register,
    },
    {
        path: "menu/:userId",
        component: Menu,
    },
    {
        path: "restaurantList",
        component: RestaurantList,
    },
    {
        path: "perfil",
        component: AccountSettingsComponent,
        canActivate: [onlyLoggedCostumerGuard]
    }
];