import { Injectable } from '@angular/core';
import { Restaurant } from '../interfaces/restaurants';
//servicio que vaya a la API y traiga la lista
@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  readonly URL_BASE = "https://w370351.ferozo.com/api/users"; //obtiene los restaurantes registrados

  async getRestaurants(): Promise<Restaurant[]> { 
    const res = await fetch(this.URL_BASE);

    if(!res.ok) throw new Error("Error al cargar los restaurantes");
    
    return await res.json();
  }
}