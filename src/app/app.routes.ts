import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RestaurantList } from './pages/restaurant-list/restaurant-list';
import { Menu } from './pages/menu/menu';
import { Register } from './pages/register/register';
import { publicCostumerGuard } from './guard/only-public-costumer-guard';


export const routes: Routes = [
    {
        path: "login",
        component: Login,
        canActivate: [publicCostumerGuard]
    },
    {
        path: "register",
        component: Register,
        canActivate: [publicCostumerGuard]
    },
    {
        path: "menu",
        component: Menu,
        canActivate: [publicCostumerGuard]
    },
    {
        path: "restaurantList",
        component: RestaurantList,
        canActivate: [publicCostumerGuard]
    }
];