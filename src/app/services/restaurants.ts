import { inject, Injectable } from '@angular/core';
import { Restaurant } from '../interfaces/restaurants';
import { AuthService } from './auth-service';
//servicio que vaya a la API y traiga la lista
@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  authService = inject(AuthService);
  readonly URL_BASE = "https://w370351.ferozo.com/api/users"; //obtiene los restaurantes registrados

  getAuthHeaders(): { [key: string]: string } {
        const token = this.authService.token || localStorage.getItem("token");
        if (!token) {
          throw new Error('No hay sesión activa para realizar esta operación.');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` //
        };
    }
  async getRestaurants(): Promise<Restaurant[]> { 
    const res = await fetch(this.URL_BASE);

    if(!res.ok) throw new Error("Error al cargar los restaurantes");
    
    return await res.json();
  }

  async toggleRestaurantFavorite(restaurantId: number): Promise<void> {
    const url = `${this.URL_BASE.replace('/users/', '/restaurants/')}/${restaurantId}/favorite`;
    const headers = this.getAuthHeaders();

    const res = await fetch(url, {
        method: "PUT", // para alternar el estado
        headers: headers,
    });
    
    if (!res.ok) {
        throw new Error("Error al cambiar el estado de favorito del restaurante.");
    }
}
}