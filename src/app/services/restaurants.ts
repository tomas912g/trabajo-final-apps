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
        const token = this.authService.token || localStorage.getItem("token"); //busca el token. Primero en en authService y sino en localStorage
        if (!token) {
          throw new Error('No hay sesión activa para realizar esta operación.');// si no se encuentra el token lanza este error
        }
        return {// si existe el token devuelve el token en formato bearer
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` //
        };
    }
  async getRestaurants(): Promise<Restaurant[]> { // promete devolver una array de restaurantes
    const res = await fetch(this.URL_BASE);// peticion para obtener todos los restaurantes

    if(!res.ok) throw new Error("Error al cargar los restaurantes");
    
    return await res.json();// si la respuesta fue exitosa, devuelve la lista de restaurantes
  }

  async toggleRestaurantFavorite(restaurantId: number): Promise<void> {//acepta el restaurantId
    const url = `${this.URL_BASE.replace('/users/', '/restaurants/')}/${restaurantId}/favorite`;// se construye la url
    const headers = this.getAuthHeaders();// obtiene el token

    const res = await fetch(url, {// hace una peticion PUT a la URL construida
        method: "PUT", // para alternar el estado
        headers: headers,
    });
    
    if (!res.ok) {
        throw new Error("Error al cambiar el estado de favorito del restaurante.");
    }
  }
}