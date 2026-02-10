import { inject, Injectable } from '@angular/core';
import { Restaurant } from '../interfaces/restaurants';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  authService = inject(AuthService);
  readonly URL_BASE = "https://w370351.ferozo.com/api/users"; // definimos una constante para ver los usuarios (restaurantes)

    
  async getRestaurants(): Promise<Restaurant[]> { // devuelve una promesa de un array de restaurantes 
    const res = await fetch(this.URL_BASE); // hace una peticion get publica y simple a la url definida
    if(!res.ok) throw new Error("Error al cargar los restaurantes"); // si falla la peticion lanzamos error
    return await res.json(); // Convertimos el array JSON en un objeto js
  }

async toggleRestaurantFavorite(restaurantId: number): Promise<void> { // Recibe el id del restaurante a marcar fav como parametro
    const url = `https://w370351.ferozo.com/api/restaurants/${restaurantId}/favorite`; // construimos la URL para los restaurants

    const res = await fetch(url, { // hacemos la peticion al servidor
        method: "PUT", 
        headers: this.authService.getAuthHeaders(),
    });
    
    if (!res.ok) {
        throw new Error("Error al cambiar el estado de favorito del restaurante.");
    }
  }
}